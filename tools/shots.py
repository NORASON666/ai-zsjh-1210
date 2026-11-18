# 擷取中山國中 AI 算力中心（GX10-B）各頁畫面，供簡報使用
import sys
from playwright.sync_api import sync_playwright
BASE = "http://163.21.13.18:8000/"
OUT = sys.argv[1]
PAGES = {"home": "", "arch": "arch/", "stats": "stats/", "learn": "learn/", "train": "train/",
         "lab1": "train/lab1/", "gpt": "gpt/", "imagine": "imagine/", "sketch": "sketch/",
         "battle": "battle/", "game": "game/", "animate": "animate/", "eco": "eco/"}
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 1440, "height": 810})
    for name, path in PAGES.items():
        try:
            pg.goto(BASE + path, wait_until="networkidle", timeout=30000)
        except Exception as ex:
            print(name, "goto", type(ex).__name__)
        pg.wait_for_timeout(2500)
        pg.screenshot(path=f"{OUT}/zs_{name}.jpg", quality=82, type="jpeg")
        print(name, pg.title())
    b.close()
