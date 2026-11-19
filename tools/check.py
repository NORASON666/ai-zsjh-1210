# 逐頁截圖並檢查內容是否超出投影片
import sys
from playwright.sync_api import sync_playwright
idx, out = sys.argv[1], sys.argv[2]
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={"width": 1600, "height": 900})
    pg.goto("file://" + idx, wait_until="load"); pg.wait_for_timeout(1500)
    n = pg.locator("section.slide").count()
    for i in range(n):
        lab = pg.locator("section.slide").nth(i).get_attribute("data-label")
        r = pg.evaluate("""(i)=>{const s=document.querySelectorAll('section.slide')[i];const inn=s.querySelector('.inner');
          return [s.scrollHeight,s.clientHeight,inn.scrollHeight,inn.clientHeight,getComputedStyle(s).display]}""", i)
        pg.screenshot(path=f"{out}/s{i+1:02d}.jpg", type="jpeg", quality=60)
        print(i+1, lab, r)
        pg.keyboard.press("ArrowRight"); pg.wait_for_timeout(900)
    b.close()
