# 2026-11-23：在 GX10-B 實際跑一張 AI 繪圖，存下每一步的真實預覽圖（P19「從雜訊畫出圖」用）
import json, sys, time, base64, urllib.request
B = "http://163.21.13.18:8000/imagine/api/"; OUT = sys.argv[1]
def post(p, d): return json.load(urllib.request.urlopen(urllib.request.Request(B + p, json.dumps(d).encode(), {"content-type": "application/json"}), timeout=120))
def get(p): return json.load(urllib.request.urlopen(B + p, timeout=60))
pr = post("prepare", {"text": "月亮上的一隻貓", "style": "童書插畫"}); print("prompt:", pr.get("prompt_en"))
g = post("generate", {"text": "月亮上的一隻貓", "title": "簡報示範", "prompt_en": pr["prompt_en"], "negative_en": pr.get("negative_en", ""),
                      "model": "sdxl", "steps": 25, "guidance": 6.5, "size": "square", "seed": 20261210, "author": "簡報示範"}); print(g)
jid, prev = g["id"], []
while True:
    j = get(f"x/jobs/{jid}?since={len(prev)}"); prev += j["previews"]
    if j["state"] in ("done", "blocked", "error"): break
    time.sleep(1)
print(j["state"], j.get("sec"), j.get("url"), len(prev), [p["step"] for p in prev])
for p in prev: open(f"{OUT}/step{p['step']:02d}.jpg", "wb").write(base64.b64decode(p["img"].split(",", 1)[1]))
if j.get("url"):
    open(f"{OUT}/final.jpg", "wb").write(urllib.request.urlopen(B + "x/" + j["url"].lstrip("/"), timeout=60).read()); print("final ok")
