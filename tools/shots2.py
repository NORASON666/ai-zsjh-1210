# 2026-11-23：擷取網站新版畫面（首頁滾動敘事、三個神經網路動畫、原理教室新頁）
import sys
from playwright.sync_api import sync_playwright
BASE = "http://163.21.13.18:8000/"; OUT = sys.argv[1]
with sync_playwright() as p:
    b = p.chromium.launch(args=["--use-gl=angle", "--use-angle=swiftshader"])
    pg = b.new_page(viewport={"width": 1600, "height": 900})
    def snap(name, sel=None, full=False):
        (pg.locator(sel).screenshot if sel else pg.screenshot)(path=f"{OUT}/zs_{name}.jpg", quality=86, type="jpeg"); print(name)
    pg.goto(BASE, wait_until="networkidle"); pg.wait_for_timeout(2500)
    H = pg.evaluate("document.getElementById('stage').offsetHeight - innerHeight")
    for n, f in [("hero0", 0), ("hero1", .25), ("hero2", .45), ("hero3", .63), ("hero4", .82)]:
        pg.evaluate(f"scrollTo(0,{int(H*f)})"); pg.wait_for_timeout(2200); snap(n)
    pg.evaluate("scrollTo(0, document.getElementById('create').offsetTop - 80)"); pg.wait_for_timeout(1500); snap("cats")
    pg.goto(BASE + "gpt/", wait_until="networkidle"); pg.wait_for_timeout(1500)
    pg.click("#p-go"); pg.wait_for_timeout(5500); snap("anim_pred", ".nn-card.pred")
    pg.click("#w-head")
    for _ in range(40):
        pg.wait_for_timeout(500)
        if "第 9 個字" in (pg.text_content("#nn-write-st") or ""): break
    pg.wait_for_timeout(700); snap("anim_write", ".nn-card.write")
    pg.goto(BASE + "learn/inside.html", wait_until="networkidle"); pg.wait_for_timeout(800)
    snap("inside_top")
    pg.click("#fp-go"); pg.wait_for_timeout(2500); snap("inside_tf", "#c4b")
    pg.goto(BASE + "learn/gpt.html", wait_until="networkidle"); pg.wait_for_timeout(800); snap("lesson_top")
    pg.locator(".flowcard").scroll_into_view_if_needed(); pg.wait_for_timeout(5000); snap("lesson_flow", ".flowcard")
    pg.goto(BASE + "gpt/submit.html", wait_until="networkidle"); pg.wait_for_timeout(600)
    for k in ["school", "tech", "food"]: pg.click(f'button[data-k="{k}"]')
    snap("submit")
    pg.goto(BASE + "animate/", wait_until="networkidle"); pg.wait_for_timeout(800); pg.click(".zs-menu"); pg.wait_for_timeout(500); snap("menu")
    b.close()
