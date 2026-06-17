/* eslint-disable */
/**
 * 起動時クラッシュ検出のスモークテスト。
 *
 *  - ビルド済みの build/ を `vite preview` で配信し、ヘッドレス Chromium で実アクセスする
 *  - 「白画面（root が空）」「未捕捉例外」「自前アセットのロード失敗」を失敗として検出する
 *  - カメラ無し環境で getUserMedia が例外で落ちずに reject されることも確認する（情報表示）
 *
 * 使い方: `yarn build` 後に `yarn smoke`（このスクリプトが preview を自動起動・停止する）
 */
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import path from 'node:path';

const PORT = Number(process.env.SMOKE_PORT || 4173);
const BASE = `http://localhost:${PORT}/`;

const viteBin = path.resolve('node_modules/.bin/vite');
const server = spawn(viteBin, ['preview', '--port', String(PORT), '--strictPort'], {
  stdio: 'inherit',
});

let exitCode = 1;
try {
  // サーバ起動待ち
  let up = false;
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(BASE);
      if (r.ok) {
        up = true;
        break;
      }
    } catch {
      /* not up yet */
    }
    await sleep(500);
  }
  if (!up) throw new Error(`preview server did not start on ${BASE}`);

  const consoleErrors = [];
  const pageErrors = [];
  const badResponses = [];

  const browser = await chromium.launch();
  const context = await browser.newContext();
  // カメラ許可は与えるが、ヘッドレスにデバイスは無い = 「許可済みだがカメラ無し」を再現
  await context.grantPermissions(['camera'], { origin: BASE });
  const page = await context.newPage();

  page.on('console', (msg) => msg.type() === 'error' && consoleErrors.push(msg.text()));
  page.on('pageerror', (err) => pageErrors.push(String(err)));
  page.on('response', (res) => res.status() >= 400 && badResponses.push({ url: res.url(), status: res.status() }));

  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(4000); // saga 初期化・SW プリキャッシュ待ち

  const rootHtmlLen = await page.evaluate(() => document.getElementById('root')?.innerHTML.length ?? 0);

  const cameraProbe = await page.evaluate(async () => {
    const out = { hasMediaDevices: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) };
    try {
      const stream = await Promise.race([
        navigator.mediaDevices.getUserMedia({ video: true }),
        new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 5000)),
      ]);
      stream.getTracks().forEach((t) => t.stop());
      out.getUserMedia = 'unexpectedly-succeeded';
    } catch (e) {
      out.getUserMedia = 'rejected:' + (e.name || e.message);
    }
    return out;
  });

  await browser.close();

  // 自前アセット（同一オリジン、ただし外部APIの config.json と favicon は想定内）の失敗のみ致命
  const sameOrigin = (u) => u.startsWith(BASE);
  const expectedExternal = (u) => u.includes('/config.json') || u.endsWith('/favicon.ico');
  const fatalBad = badResponses.filter((r) => sameOrigin(r.url) && !expectedExternal(r.url));

  console.log('\n================ SMOKE TEST RESULT ================');
  console.log('root innerHTML length:', rootHtmlLen);
  console.log('camera probe         :', JSON.stringify(cameraProbe));
  console.log('--- uncaught page errors ---');
  console.log(pageErrors.length ? pageErrors.join('\n') : '(none)');
  console.log('--- HTTP >=400 responses ---');
  console.log(badResponses.length ? badResponses.map((r) => `${r.status} ${r.url}`).join('\n') : '(none)');
  console.log('--- console.error (informational) ---');
  console.log(consoleErrors.length ? consoleErrors.join('\n') : '(none)');
  console.log('===================================================');

  const problems = [];
  if (rootHtmlLen < 50) problems.push('app did not render (root nearly empty = 起動時クラッシュの疑い)');
  if (pageErrors.length) problems.push('uncaught page errors present');
  if (!cameraProbe.hasMediaDevices) problems.push('navigator.mediaDevices missing');
  if (fatalBad.length) problems.push('fatal asset load failures: ' + JSON.stringify(fatalBad));

  if (problems.length) {
    console.log('RESULT: FAIL');
    for (const p of problems) console.log(' - ' + p);
    exitCode = 1;
  } else {
    console.log('RESULT: PASS (アプリ起動OK / 未捕捉例外なし / アセット取得OK / カメラ無しも安全)');
    exitCode = 0;
  }
} catch (e) {
  console.error('SMOKE ERROR:', e);
  exitCode = 1;
} finally {
  server.kill('SIGTERM');
}

process.exit(exitCode);
