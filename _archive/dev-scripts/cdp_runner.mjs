import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = path.resolve('./.chrome_cdp_tmp');

// Ensure tmp dir exists
if (!fs.existsSync(userDataDir)) {
  fs.mkdirSync(userDataDir, { recursive: true });
}

console.log('Launching headless Chrome with CDP on port 9222...');
const chrome = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=9222',
  `--user-data-dir=${userDataDir}`,
  '--disable-gpu',
  '--window-size=1440,900',
  'about:blank'
]);

chrome.stderr.on('data', (d) => {
  const str = d.toString();
  if (str.includes('DevTools listening on')) {
    console.log('Chrome CDP ready:', str.trim());
  }
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getWsUrl() {
  for (let i = 0; i < 30; i++) {
    try {
      const res = await new Promise((resolve, reject) => {
        http.get('http://127.0.0.1:9222/json/list', (r) => {
          let data = '';
          r.on('data', (chunk) => (data += chunk));
          r.on('end', () => resolve(JSON.parse(data)));
        }).on('error', reject);
      });
      if (Array.isArray(res) && res.length > 0) {
        const page = res.find(t => t.type === 'page') || res[0];
        if (page && page.webSocketDebuggerUrl) {
          return page.webSocketDebuggerUrl;
        }
      }
    } catch (e) {
      // wait
    }
    await sleep(300);
  }
  throw new Error('Timeout connecting to Chrome CDP');
}

class CDPClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 1;
    this.callbacks = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && this.callbacks.has(msg.id)) {
          const { resolve, reject } = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) reject(new Error(msg.error.message));
          else resolve(msg.result);
        }
      };
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    return res.result?.value;
  }

  async captureScreenshot(filepath, clip = null) {
    const params = { format: 'png' };
    if (clip) params.clip = clip;
    const res = await this.send('Page.captureScreenshot', params);
    fs.writeFileSync(filepath, Buffer.from(res.data, 'base64'));
    console.log(`Saved screenshot: ${filepath} (${fs.statSync(filepath).size} bytes)`);
  }
}

async function run() {
  try {
    const wsUrl = await getWsUrl();
    console.log('Connected to CDP at:', wsUrl);

    const client = new CDPClient(wsUrl);
    await client.connect();

    await client.send('Page.enable');
    await client.send('Runtime.enable');

    console.log('Navigating to http://localhost:8080/index.html ...');
    await client.send('Page.navigate', { url: 'http://localhost:8080/index.html' });
    await sleep(2500);

    // 1. Capture Hero with Autocomplete test
    console.log('Testing Universal Search Input...');
    await client.evaluate(`
      const input = document.getElementById('universalHeroInput');
      if (input) {
        input.value = 'mumbai';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    `);
    await sleep(600);
    await client.captureScreenshot('snap_01_hero_search_active.png');

    // 2. Open Search Results Modal
    console.log('Opening Search Results Modal...');
    await client.evaluate(`
      if (typeof openUniversalSearchResults === 'function') {
        openUniversalSearchResults('Mumbai Virtual Office');
      }
    `);
    await sleep(800);
    await client.captureScreenshot('snap_02_search_results_modal.png');

    // Close modal
    await client.evaluate(`
      const m = document.getElementById('universalSearchResultsModal');
      if (m) m.classList.remove('active');
    `);
    await sleep(400);

    // 3. Scroll to Virtual Office Configurator
    console.log('Scrolling to VO Configurator...');
    await client.evaluate(`
      const el = document.getElementById('voConfigurator');
      if (el) {
        el.scrollIntoView({ behavior: 'instant', block: 'start' });
      }
    `);
    await sleep(1000);
    await client.captureScreenshot('snap_03_vo_configurator.png');

    // 4. Scroll to Meeting Rooms & Boardroom Scheduler
    console.log('Scrolling to Meeting Rooms...');
    await client.evaluate(`
      const el = document.getElementById('meetingRoomsSection');
      if (el) {
        el.scrollIntoView({ behavior: 'instant', block: 'start' });
      }
    `);
    await sleep(1000);
    await client.captureScreenshot('snap_04_meeting_rooms.png');

    // 5. Open Meeting Room 6-Stage Booking Engine Modal
    console.log('Testing Meeting Room Booking Engine Modal...');
    await client.evaluate(`
      if (typeof openMeetingBookingModal === 'function') {
        openMeetingBookingModal('MR-MUM-01');
      }
    `);
    await sleep(800);
    await client.captureScreenshot('snap_05_meeting_room_booking_modal.png');

    // Close booking modal
    await client.evaluate(`
      const m = document.getElementById('meetingRoomBookingModal');
      if (m) m.classList.remove('active');
    `);
    await sleep(400);

    // 6. Scroll to GST Tracker
    console.log('Scrolling to GST SLA Tracker...');
    await client.evaluate(`
      const el = document.getElementById('gstTrackerSection');
      if (el) {
        el.scrollIntoView({ behavior: 'instant', block: 'start' });
      }
    `);
    await sleep(1000);
    await client.captureScreenshot('snap_06_gst_tracker.png');

    // 7. Open Customer Self-Service Portal Modal
    console.log('Testing Customer Portal Modal...');
    await client.evaluate(`
      if (typeof openCustomerPortal === 'function') {
        openCustomerPortal();
      }
    `);
    await sleep(800);
    await client.captureScreenshot('snap_07_customer_portal_modal.png');

    // Close Customer Portal
    await client.evaluate(`
      const m = document.getElementById('customerPortalModal');
      if (m) m.classList.remove('active');
    `);
    await sleep(400);

    // 8. Open Digital KYC Engine Modal
    console.log('Testing Digital KYC Modal...');
    await client.evaluate(`
      if (typeof openDigitalKycModal === 'function') {
        openDigitalKycModal();
      }
    `);
    await sleep(800);
    await client.captureScreenshot('snap_08_digital_kyc_modal.png');

    // Close KYC modal
    await client.evaluate(`
      const m = document.getElementById('digitalKycModal');
      if (m) m.classList.remove('active');
    `);
    await sleep(400);

    // 9. Open Admin CRM Suite (8 Modules)
    console.log('Testing Admin Suite Modal...');
    await client.evaluate(`
      if (typeof openAdminSuite === 'function') {
        openAdminSuite();
      }
    `);
    await sleep(800);
    await client.captureScreenshot('snap_09_admin_suite_modal.png');

    console.log('ALL TESTS AND SCREENSHOTS COMPLETED SUCCESSFULLY!');
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    chrome.kill();
    process.exit(0);
  }
}

run();
