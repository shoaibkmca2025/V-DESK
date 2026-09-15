import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = path.resolve('./.chrome_cdp_health');

if (!fs.existsSync(userDataDir)) {
  fs.mkdirSync(userDataDir, { recursive: true });
}

const chrome = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=9225',
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
        http.get('http://127.0.0.1:9225/json/list', (r) => {
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
    this.errors = [];
    this.networkErrors = [];
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.method === 'Runtime.exceptionThrown') {
          this.errors.push(msg.params.exceptionDetails);
        }
        if (msg.method === 'Network.responseReceived') {
          const { response } = msg.params;
          if (response.status >= 400 && !response.url.includes('favicon')) {
            this.networkErrors.push({ url: response.url, status: response.status });
          }
        }
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
      this.errors.push(res.exceptionDetails);
    }
    return res.result?.value;
  }
}

const pages = [
  'index.html',
  'virtual-office.html',
  'coworking-spaces.html',
  'meeting-rooms.html',
  'locations.html',
  'pricing.html',
  'company-registration.html',
  'portal.html',
  'admin.html',
  'contact.html',
  '404.html'
];

async function run() {
  let totalIssues = 0;
  try {
    const wsUrl = await getWsUrl();
    const client = new CDPClient(wsUrl);
    await client.connect();
    await client.send('Page.enable');
    await client.send('Runtime.enable');
    await client.send('Network.enable');

    console.log('=== STARTING EXHAUSTIVE BROWSER HEALTH AUDIT ACROSS ALL 11 PAGES ===\n');

    for (const page of pages) {
      client.errors = [];
      client.networkErrors = [];
      const url = `http://localhost:8080/${page}`;
      process.stdout.write(`Checking ${page} ... `);

      await client.send('Page.navigate', { url });
      await sleep(1500);

      // Verify DOM loaded
      const pageTitle = await client.evaluate(`document.title`);
      const bodyChildren = await client.evaluate(`document.body ? document.body.children.length : 0`);

      if (page !== '404.html') {
        // Test Mobile Drawer
        const drawerCheck = await client.evaluate(`(() => {
          const btn = document.getElementById('mobileNavToggle') || document.getElementById('mobileMenuBtn');
          const drawer = document.getElementById('mobileDrawer');
          if (!btn || !drawer) return { ok: false, reason: 'missing elements', btn: !!btn, drawer: !!drawer };
          btn.click();
          const opened = drawer.classList.contains('active');
          const closeBtn = document.getElementById('mobileDrawerClose');
          if (closeBtn) closeBtn.click();
          const closed = !drawer.classList.contains('active');
          return { ok: opened && closed, opened, closed };
        })()`);

        if (!drawerCheck.ok) {
          console.log(`\n  [WARN] Drawer test issue on ${page}:`, drawerCheck);
          totalIssues++;
        }

        // Test Shared Quote Modal
        const quoteCheck = await client.evaluate(`(() => {
          if (typeof openQuoteModal !== 'function') return { ok: false, reason: 'no openQuoteModal' };
          openQuoteModal('Audit Quote');
          const m = document.getElementById('quoteModal');
          const opened = m && m.classList.contains('active');
          if (typeof closeModal === 'function') closeModal('quoteModal');
          const closed = m && !m.classList.contains('active');
          return { ok: opened && closed };
        })()`);

        if (!quoteCheck.ok) {
          console.log(`\n  [WARN] Quote modal issue on ${page}:`, quoteCheck);
          totalIssues++;
        }

        // Test Legal Modal & Tab switching
        const legalCheck = await client.evaluate(`(() => {
          if (typeof openLegalModal !== 'function') return { ok: false, reason: 'no openLegalModal' };
          openLegalModal('privacy');
          const m = document.getElementById('legalModal');
          const opened = m && m.classList.contains('active');
          if (typeof switchLegalTab === 'function') switchLegalTab('terms');
          if (typeof closeModal === 'function') closeModal('legalModal');
          const closed = m && !m.classList.contains('active');
          return { ok: opened && closed };
        })()`);

        if (!legalCheck.ok) {
          console.log(`\n  [WARN] Legal modal issue on ${page}:`, legalCheck);
          totalIssues++;
        }
      }

      if (client.errors.length > 0) {
        console.log(`\n  [FAIL] JS Errors on ${page}:`, client.errors);
        totalIssues += client.errors.length;
      } else if (client.networkErrors.length > 0) {
        console.log(`\n  [WARN] Network 4xx/5xx on ${page}:`, client.networkErrors);
        totalIssues += client.networkErrors.length;
      } else {
        console.log(`PASS (Title: "${pageTitle.slice(0, 35)}...", Elements: ${bodyChildren})`);
      }
    }

    console.log(`\n=============================================================`);
    if (totalIssues === 0) {
      console.log(`AUDIT COMPLETE: ALL 11 PAGES 100% HEALTHY WITH ZERO ERRORS!`);
    } else {
      console.log(`AUDIT FINISHED WITH ${totalIssues} ISSUES DETECTED.`);
    }
    console.log(`=============================================================`);
  } catch (err) {
    console.error('Fatal Error during audit:', err);
  } finally {
    chrome.kill();
    process.exit(0);
  }
}

run();
