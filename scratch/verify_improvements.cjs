const http = require('http');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = '/Users/bigchris/.gemini/antigravity-ide/brain/49d0a1b3-fddc-4eaf-a8a5-9d8947093eba';

function getNewTarget() {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: 9222,
      path: '/json/new?http://localhost:3005',
      method: 'PUT'
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', reject);
    req.end();
  });
}

function sendCDP(ws, method, params = {}, id = 1) {
  return new Promise((resolve) => {
    const msgHandler = (event) => {
      const data = JSON.parse(event.data);
      if (data.id === id) {
        ws.removeEventListener('message', msgHandler);
        resolve(data.result);
      }
    };
    ws.addEventListener('message', msgHandler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function run() {
  const target = await getNewTarget();
  console.log('Opened target:', target.id);

  const ws = new globalThis.WebSocket(target.webSocketDebuggerUrl);
  let cdpId = 1;
  const cdp = (method, params) => sendCDP(ws, method, params, cdpId++);

  await new Promise((res) => ws.addEventListener('open', res));

  // 1. Mobile viewport test (390 x 844, iPhone 14)
  await cdp('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });

  await cdp('Page.navigate', { url: 'http://localhost:3005' });
  await new Promise(r => setTimeout(r, 1200));

  // Check if any onboarding modal is open or exists in DOM
  const onboardingCheck = await cdp('Runtime.evaluate', {
    expression: `(() => {
      const modal = document.getElementById('onboardingModal');
      const openModal = document.querySelector('.modal-backdrop.open');
      return {
        hasOnboardingInDom: !!modal,
        hasAnyOpenModal: !!openModal,
        activeTab: document.querySelector('.tab-btn.active')?.textContent.trim(),
        hasIcons: document.querySelectorAll('.lucide-icon').length
      };
    })()`,
    returnByValue: true
  });
  console.log('Mobile initial launch status:', onboardingCheck.result.value);

  // Take screenshot 10: Mobile direct editor with zero onboarding card filling the screen
  const shot10 = await cdp('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verified-10-no-onboarding-mobile.png'), Buffer.from(shot10.data, 'base64'));
  console.log('Saved verified-10-no-onboarding-mobile.png');

  // 2. Open Profile Settings Modal and verify default template selector
  await cdp('Runtime.evaluate', {
    expression: `(() => {
      document.getElementById('btnProfilePreset').click();
    })()`
  });
  await new Promise(r => setTimeout(r, 600));

  const profileModalCheck = await cdp('Runtime.evaluate', {
    expression: `(() => {
      const modal = document.getElementById('profileSettingsModal');
      const templateSelect = document.getElementById('settingDefaultTemplate');
      const previewBadge = document.getElementById('templatePreviewBadge');
      return {
        isOpen: modal?.classList.contains('open'),
        hasTemplateSelect: !!templateSelect,
        templateOptionsCount: templateSelect?.options.length,
        selectedTemplate: templateSelect?.value,
        previewBadgeText: previewBadge?.textContent.trim()
      };
    })()`,
    returnByValue: true
  });
  console.log('Profile settings modal status:', profileModalCheck.result.value);

  // Take screenshot 11: Profile Settings Modal with Default Template Theme selector
  const shot11 = await cdp('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verified-11-profile-template-picker.png'), Buffer.from(shot11.data, 'base64'));
  console.log('Saved verified-11-profile-template-picker.png');

  // Change default template to dark-obsidian-gold and save
  await cdp('Runtime.evaluate', {
    expression: `(() => {
      const templateSelect = document.getElementById('settingDefaultTemplate');
      templateSelect.value = 'dark-obsidian-gold';
      templateSelect.dispatchEvent(new Event('change'));
      document.getElementById('btnSaveProfileSettings').click();
    })()`
  });
  await new Promise(r => setTimeout(r, 600));

  // Desktop view for full UI icon inspection
  await cdp('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });
  await new Promise(r => setTimeout(r, 600));

  const desktopCheck = await cdp('Runtime.evaluate', {
    expression: `(() => {
      const activeTheme = document.getElementById('themeTitleText')?.textContent.trim();
      const iconCount = document.querySelectorAll('.lucide-icon').length;
      return { activeTheme, iconCount };
    })()`,
    returnByValue: true
  });
  console.log('Desktop view after template change:', desktopCheck.result.value);

  // Take screenshot 12: Desktop view with crisp Lucide vector icons everywhere and updated active template
  const shot12 = await cdp('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verified-12-icons-all-over.png'), Buffer.from(shot12.data, 'base64'));
  console.log('Saved verified-12-icons-all-over.png');

  // Close target
  http.get(`http://127.0.0.1:9222/json/close/${target.id}`);
  ws.close();
  console.log('All verification tasks complete!');
}

run().catch(console.error);
