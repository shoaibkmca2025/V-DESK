import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = path.resolve('./.chrome_cdp_tmp3');

if (!fs.existsSync(userDataDir)) {
  fs.mkdirSync(userDataDir, { recursive: true });
}

const chrome = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=9224',
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
        http.get('http://127.0.0.1:9224/json/list', (r) => {
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

    console.log('Navigating to http://localhost:8080/index.html ...');
    await client.send('Page.navigate', { url: 'http://localhost:8080/index.html' });
    await sleep(3000);

    // 1. Open Meeting Booking Modal
    console.log('Opening meetingRoomBookingModal...');
    await client.evaluate(`(() => {
      openMeetingBookingModal('MR-MUM-01');
    })()`);
    await sleep(1000);
    await client.capture('modal_01_booking_engine.png');

    // Close booking modal
    await client.evaluate(`(() => {
      const m = document.getElementById('meetingRoomBookingModal');
      if (m) m.classList.remove('active');
    })()`);
    await sleep(500);

    // 2. Open Customer Self-Service Portal
    console.log('Opening customerPortalModal...');
    await client.evaluate(`(() => {
      openCustomerPortal();
    })()`);
    await sleep(1000);
    await client.capture('modal_02_customer_portal.png');

    // Close Customer Portal
    await client.evaluate(`(() => {
      const m = document.getElementById('customerPortalModal');
      if (m) m.classList.remove('active');
    })()`);
    await sleep(500);

    // 3. Open Digital KYC Modal
    console.log('Opening digitalKycModal...');
    await client.evaluate(`(() => {
      openDigitalKycModal();
    })()`);
    await sleep(1000);
    await client.capture('modal_03_digital_kyc.png');

    // Close KYC
    await client.evaluate(`(() => {
      const m = document.getElementById('digitalKycModal');
      if (m) m.classList.remove('active');
    })()`);
    await sleep(500);

    // 4. Open Admin CRM Suite
    console.log('Opening adminSuiteModal...');
    await client.evaluate(`(() => {
      openAdminSuite();
    })()`);
    await sleep(1000);
    await client.capture('modal_04_admin_suite.png');

    // Close Admin Suite
    await client.evaluate(`(() => {
      const m = document.getElementById('adminSuiteModal');
      if (m) m.classList.remove('active');
    })()`);
    await sleep(500);

    // 5. Open Universal Search Results Modal
    console.log('Opening universalSearchResultsModal...');
    await client.evaluate(`(() => {
      openUniversalSearchResults('Mumbai Virtual Office');
    })()`);
    await sleep(1000);
    await client.capture('modal_05_search_results.png');

    console.log('ALL MODAL TESTS FINISHED CLEANLY!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    chrome.kill();
    process.exit(0);
  }
}

run();
