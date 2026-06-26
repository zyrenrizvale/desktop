const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');

puppeteer.use(StealthPlugin());

console.log('====================================');
console.log('  🎬 ZYREN\'S MOVIE BOT - RAILWAY MODE  ');
console.log('====================================\n');

// Ambil link dari Environment Variable Railway (Atau hardcode sementara kalau mau test)
const meetUrl = process.env.MEET_URL || 'MASUKIN_LINK_MEET_DI_SINI_KALAU_MALES_Pake_ENV';
const videoLink = process.env.VIDEO_URL || 'MASUKIN_LINK_FILM_DI_SINI';

(async () => {
  console.log('\n🚀 Menyalakan mesin Chrome di dalam Docker Railway...');
  
  try {
    // Launch Chrome Lokal (Bawaan Docker)
    const browser = await puppeteer.launch({
      executablePath: '/usr/bin/google-chrome', // Path dari instalasi Dockerfile
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage', // Wajib biar RAM Railway gak langsung bocor
        '--disable-accelerated-2d-canvas',
        '--disable-gpu'
      ]
    });

    const context = browser.defaultBrowserContext();
    await context.overridePermissions('https://meet.google.com', ['camera', 'microphone', 'notifications']);

    // 1. INJEKSI COOKIES
    console.log('[SISTEM] Membaca file cookies.json...');
    if (fs.existsSync('./cookies.json')) {
        const cookiesString = fs.readFileSync('./cookies.json', 'utf8');
        try {
            const cookies = JSON.parse(cookiesString);
            const page = await browser.newPage();
            await page.setCookie(...cookies);
            console.log('[SISTEM] ✅ Cookies disuntikkan!');
            await page.close();
        } catch (err) {
            console.log('[ERROR] Format cookies salah.');
            return;
        }
    } else {
        console.log('[FATAL ERROR] File cookies.json tidak ditemukan!');
        return;
    }

    // 2. BUKA MEET DULUAN
    const meetPage = await browser.newPage();
    console.log(`[SISTEM] Menuju ke room: ${meetUrl}`);
    await meetPage.goto(meetUrl, { waitUntil: 'networkidle2', timeout: 60000 });

    try {
      console.log('[SISTEM] Menunggu loading (8 detik)...');
      await new Promise(resolve => setTimeout(resolve, 8000));

      console.log('[SISTEM] Klik Join...');
      await meetPage.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const joinButton = buttons.find(b => 
          b.innerText.includes('Join now') || b.innerText.includes('Gabung sekarang') || 
          b.innerText.includes('Ask to join') || b.innerText.includes('Join')
        );
        if (joinButton) joinButton.click();
      });

      console.log('[SISTEM] Menunggu masuk ke dalam room...');
      await meetPage.waitForSelector('button[aria-label="Present now"]', { timeout: 45000 });
      console.log('[SISTEM] ✅ Berhasil masuk room!');

      // 3. BUKA FILM
      const filmPage = await browser.newPage();
      console.log('[SISTEM] Membuka film...');
      await filmPage.goto(videoLink, { waitUntil: 'networkidle2' });
      await filmPage.evaluate(() => {
          const video = document.querySelector('video');
          if (video) video.play();
      });

      // 4. SHARE SCREEN
      await meetPage.bringToFront();
      console.log('[SISTEM] Memulai Share Screen...');
      await meetPage.click('button[aria-label="Present now"]');
      
      await meetPage.waitForSelector('span', { timeout: 5000 });
      await meetPage.evaluate(() => {
        const spans = Array.from(document.querySelectorAll('span'));
        const tab = spans.find(s => s.innerText.includes('A tab') || s.innerText.includes('Tab'));
        if (tab) tab.click();
      });

      console.log('🎉 BOOYAH! Bot sedang mempresentasikan layar.');
      jalankanAntiAFK(meetPage);

    } catch (error) {
      console.log('[ERROR] Proses macet.', error.message);
    }

  } catch (error) {
    console.log('\n[FATAL ERROR] Chrome gagal dijalankan.');
    console.log(error.message);
  }
})();

// FUNGSI ANTI-AFK
async function jalankanAntiAFK(page) {
  setInterval(async () => {
    try {
      const popUpHandled = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const stayBtn = buttons.find(b => b.innerText.includes('Stay in call') || b.innerText.includes('Tetap di panggilan'));
        if (stayBtn) { stayBtn.click(); return true; }
        return false;
      });
      if (popUpHandled) return;
      await page.keyboard.down('Control');
      await page.keyboard.down('Alt');
      await page.keyboard.press('c');
      await page.keyboard.up('Alt');
      await page.keyboard.up('Control');
      await new Promise(r => setTimeout(r, 1000));
      await page.keyboard.type('.');
      await page.keyboard.press('Enter');
      await page.keyboard.down('Control');
      await page.keyboard.down('Alt');
      await page.keyboard.press('c');
      await page.keyboard.up('Alt');
      await page.keyboard.up('Control');
    } catch (err) {}
  }, 180000); 
}
