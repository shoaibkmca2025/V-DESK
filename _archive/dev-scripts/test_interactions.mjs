import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = path.resolve('./.chrome_cdp_tmp2');

if (!fs.existsSync(userDataDir)) {
  fs.mkdirSync(userDataDir, { recursive: true });
}

const chrome = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=9223',
  `--user-data-dir=${userDataDir}`,
  '--disable-gpu',
  '--window-size=1440,900',
  'about:blank'
]);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getWsUrl() {
  for (let i = 0; i < 30; i++) {
    try {
      const res = await new Promise((resolve, reject) => {
        http.get('http://127.0.0.1:9223/json/list', (r) => {
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
    } catch (e) {}
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
    if (res.exceptionDetails) {
      console.error('Browser JS Exception:', res.exceptionDetails);
    }
    return res.result?.value;
  }

  async capture(name) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(name, Buffer.from(res.data, 'base64'));
    console.log(`Saved ${name} (${fs.statSync(name).size} bytes)`);
  }
}

async function run() {
  try {
    const wsUrl = await getWsUrl();
    const client = new CDPClient(wsUrl);
    await client.connect();
    await client.send('Page.enable');
    await client.send('Runtime.enable');

    // Listen to console API calls
    client.ws.addEventListener('message', (e) => {
      const d = JSON.parse(e.data);
      if (d.method === 'Runtime.consoleAPICalled') {
        console.log('[Browser Console]', d.params.type, d.params.args.map(a => a.value || a.description).join(' '));
      }
    });

    console.log('Navigating...');
    await client.send('Page.navigate', { url: 'http://localhost:8080/index.html' });
    await sleep(3000);

    // Check meetingRoomsSection existence & position
    const mrInfo = await client.evaluate(`
      const mr = document.getElementById('meetingRoomsSection');
      if (!mr) return 'NOT FOUND';
      const rect = mr.getBoundingClientRect();
      return { top: rect.top, pageYOffset: window.pageYOffset, offsetTop: mr.offsetTop };
    `);
    console.log('meetingRoomsSection info:', mrInfo);

    // Scroll to meeting rooms using scrollToSection
    console.log('Scrolling to #meetingRoomsSection via scrollToSection...');
    await client.evaluate(`
      if (typeof scrollToSection === 'function') {
        scrollToSection('#meetingRoomsSection');
      } else {
        const mr = document.getElementById('meetingRoomsSection');
        if (mr) mr.scrollIntoView();
      }
    `);
    await sleep(1500);

    const posAfterScroll = await client.evaluate(`window.pageYOffset`);
    console.log('PageYOffset after scroll to MR:', posAfterScroll);
    await client.capture('test_mr_scrolled.png');

    // Open booking modal
    console.log('Calling openMeetingBookingModal("MR-MUM-01")...');
    const modalRes = await client.evaluate(`
      try {
        openMeetingBookingModal('MR-MUM-01');
        const m = document.getElementById('meetingRoomBookingModal');
        return {
          isOpen: m ? m.classList.contains('active') : false,
          display: m ? window.getComputedStyle(m).display : 'no element',
          opacity: m ? window.getComputedStyle(m).opacity : 'no element',
          zIndex: m ? window.getComputedStyle(m).zIndex : 'no element'
        };
      } catch(e) {
        return { error: e.toString() };
      }
    `);
    console.log('Modal status:', modalRes);
    await sleep(1000);
    await client.capture('test_booking_modal_open.png');

    // Close booking modal
    await client.evaluate(`
      const m = document.getElementById('meetingRoomBookingModal');
      if (m) m.classList.remove('active');
    `);

    // Open Portal Modal
    console.log('Testing openCustomerPortal()...');
    const portalRes = await client.evaluate(`
      try {
        openCustomerPortal();
        const m = document.getElementById('customerPortalModal');
        return {
          isOpen: m ? m.classList.contains('active') : false,
          display: m ? window.getComputedStyle(m).display : 'no element',
          opacity: m ? window.getComputedStyle(m).opacity : 'no element'
        };
      } catch(e) {
        return { error: e.toString() };
      }
    `);
    console.log('Customer portal modal status:', portalRes);
    await sleep(1000);
    await client.capture('test_customer_portal.png');

    // Close Portal Modal
    await client.evaluate(`
      const m = document.getElementById('customerPortalModal');
      if (m) m.classList.remove('active');
    `);

    // Open Admin Suite
    console.log('Testing openAdminSuite()...');
    const adminRes = await client.evaluate(`
      try {
        openAdminSuite();
        const m = document.getElementById('adminSuiteModal');
        return {
          isOpen: m ? m.classList.contains('active') : false,
          display: m ? window.getComputedStyle(m).display : 'no element',
          opacity: m ? window.getComputedStyle(m).opacity : 'no element'
        };
      } catch(e) {
        return { error: e.toString() };
      }
    `);
    console.log('Admin suite status:', adminRes);
    await sleep(1000);
    await client.capture('test_admin_suite.png');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    chrome.kill();
    process.exit(0);
  }
}

run();
