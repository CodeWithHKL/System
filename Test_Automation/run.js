const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:8080/DONATION/';
const OUT = __dirname;
const SHOTS = path.join(OUT, 'shots');
fs.mkdirSync(SHOTS, { recursive: true });
const SQLI = `')" OR 1=1; --`;
const N = 50;

function sql(q) {
  return execFileSync('docker', ['exec', 'donation', 'mysql', '-N', '-B', '-e', 'USE donationdb; ' + q]).toString().trim();
}
const count = () => parseInt(sql('SELECT COUNT(*) FROM helpinfo'), 10);
const reset = () => sql('TRUNCATE helpinfo');
function seed(rows) {
  rows.forEach(r => {
    const v = [r.name, r.phone, r.type, r.product, r.no, '20261121', '10:00:00', r.country || 'Malaysia', r.loc || 'Serdang'];
    sql(`INSERT INTO helpinfo VALUES (${v.map(x => `'${x}'`).join(',')})`);
  });
}
const SEED1 = { name: 'nizam', phone: '+60123456789', type: 'Food', product: 'beras', no: '111111' };

const GOOD = { helpername: 'Nizam', phoneno: '+60123456789', producttype: 'Food', productname: 'Beras', country: 'Malaysia', specificlocation: 'Serdang' };
const rep = (c, n) => c.repeat(n);

async function snap(page, id, resp) {
  const text = (await page.evaluate(() => document.body ? document.body.innerText : '')).replace(/\s+/g, ' ').trim();
  await page.screenshot({ path: path.join(SHOTS, id + '.png'), clip: { x: 0, y: 0, width: 700, height: 260 } }).catch(() => {});
  const hdr = resp ? (await resp.allHeaders())['refresh'] || '' : '';
  return { text: text.slice(0, 400), refresh: hdr, url: page.url() };
}
async function fillForm(page, action, fields, selectOverride) {
  await page.goto(action === 'inserthelp.php' || action === 'gethelpload.php' ? BASE + 'main.php' : BASE + 'deleteform.php');
  // main.php has malformed HTML (<form> inside <tr>), so inputs are not DOM descendants of the form: select by position instead
  const idx = action === 'gethelpload.php' ? -1 : 0;
  for (const [k, v] of Object.entries(fields)) {
    if (k === 'producttype') {
      await page.locator('select[name=producttype]').nth(idx).evaluate((s, v) => {
        if (!Array.from(s.options).some(o => o.value === v)) { s.options[0].value = v; s.options[0].text = v; s.selectedIndex = 0; }
        else s.value = v;
      }, v);
    } else await page.locator(`input[name=${k}]`).nth(idx).fill(v);
  }
  const [resp] = await Promise.all([page.waitForNavigation({ waitUntil: 'load' }), page.locator('input[type=submit]').nth(idx).click()]);
  return resp;
}
const insert = async (page, id, fields) => snap(page, id, await fillForm(page, 'inserthelp.php', { ...GOOD, ...fields }));
async function search(page, id, fields) {
  const r1 = await fillForm(page, 'gethelpload.php', { beneficiary: 'Azli', producttype: 'Food', productname: 'beras', ...fields });
  try { await page.waitForURL(/gethelp\.php/, { timeout: 5000 }); } catch (e) {}
  return snap(page, id, null);
}
const del = async (page, id, fields) => snap(page, id, await fillForm(page, 'delete.php', { phoneno: '+60123456789', producttype: 'Food', onetimeno: '111111', ...fields }));

const noErr = t => !/Fatal error|Warning:|Notice:|Parse error|Deprecated:/i.test(t);
const T = [];
const t = (id, group, desc, input, expected, run, check, setup) => T.push({ id, group, desc, input, expected, run, check, setup });

// ---------- EP helper form ----------
// All text fields go through the same non-empty condition and the same string-built SQL, so one representative text field
// (helper name) and the single dropdown (product type) represent the empty and error-inducing partitions.
t('EP-H01', 'EP', 'All fields valid (one valid value per field)', 'Nizam, +60123456789, Food, Beras, Malaysia, Serdang', 'Record saved, one-time no. shown', (p, id) => insert(p, id, {}), (r, b, a) => /done\.\.\./.test(r.text) && a === b + 1 && sql('SELECT productname FROM helpinfo') === 'beras');
t('EP-H02', 'EP', 'Helper name (text field) empty', '(empty)', 'Fill-in-all-fields message, no insert', (p, id) => insert(p, id, { helpername: '' }), (r, b, a) => /Please fill in all fields/.test(r.text) && a === b);
t('EP-H03', 'EP', 'Product type (dropdown) empty, inspect element', '(empty value)', 'Fill-in-all-fields message, no insert', (p, id) => insert(p, id, { producttype: '' }), (r, b, a) => /Please fill in all fields/.test(r.text) && a === b);
t('EP-H04', 'EP', 'Helper name (text field) error-inducing', SQLI, 'Handled safely: no SQL error, no insert', (p, id) => insert(p, id, { helpername: SQLI }), (r, b, a) => noErr(r.text) && a === b);
t('EP-H05', 'EP', 'Product type (dropdown) error-inducing, inspect element', SQLI, 'Handled safely: no SQL error, no insert', (p, id) => insert(p, id, { producttype: SQLI }), (r, b, a) => noErr(r.text) && a === b);

// ---------- EP search ----------
const S1 = [SEED1];
t('EP-S01', 'EP', 'All fields valid, match exists', 'Azli, Food, beras', 'Matching row listed', (p, id) => search(p, id, {}), r => /nizam/.test(r.text), S1);
t('EP-S02', 'EP', 'Valid input, no match', 'zzzz', 'No rows, Find again link', (p, id) => search(p, id, { productname: 'zzzz' }), r => !/nizam/.test(r.text) && /Find again/.test(r.text), S1);
t('EP-S03', 'EP', 'Product name empty', '(empty)', 'Please fill all fields message', (p, id) => search(p, id, { productname: '' }), r => /fill all fields/i.test(r.text), S1);
t('EP-S04', 'EP', 'Product name error-inducing (SQL string)', SQLI, 'Handled safely, no error output', (p, id) => search(p, id, { productname: SQLI }), r => noErr(r.text), S1);
t('EP-S05', 'EP', 'Product name regex metacharacter', '(', 'Handled safely, no PHP warning', (p, id) => search(p, id, { productname: '(' }), r => noErr(r.text), S1);

// ---------- EP delete ----------
t('EP-D01', 'EP', 'All fields valid', '+60123456789, Food, 111111', 'Record deleted', (p, id) => del(p, id, {}), (r, b, a) => /product deleted/.test(r.text) && a === b - 1, S1);
t('EP-D02', 'EP', 'Phone no empty', '(empty)', 'Please fill in all fields', (p, id) => del(p, id, { phoneno: '' }), (r, b, a) => /Please fill in all fields/.test(r.text) && a === b, S1);
t('EP-D03', 'EP', 'One-time no wrong', 'abc', 'information given not match', (p, id) => del(p, id, { onetimeno: 'abc' }), (r, b, a) => /not match/.test(r.text) && a === b, S1);
t('EP-D04', 'EP', 'Phone no error-inducing', SQLI, 'Not matched, nothing deleted, no error', (p, id) => del(p, id, { phoneno: SQLI }), (r, b, a) => noErr(r.text) && a === b, S1);

// ---------- BVA ----------
[['BV-T01', 'LB-1', 0, false], ['BV-T02', 'LB', 1, true], ['BV-T03', 'RB', N, true], ['BV-T04', 'RB+1', N + 1, false]].forEach(([id, bd, len, ok]) =>
  t(id, 'BVA', `Helper name length, ${bd}`, `${len} chars`, ok ? 'Accepted, stored in full' : 'Rejected or clear error (no silent change)',
    (p, i) => insert(p, i, { helpername: rep('a', len) }),
    (r, b, a) => ok ? (/done\.\.\./.test(r.text) && a === b + 1 && sql('SELECT helpername FROM helpinfo').length === len)
      : (len === 0 ? /Please fill in all fields/.test(r.text) && a === b : a === b && noErr(r.text))));
[['BV-P01', 'LB-1', 7, false], ['BV-P02', 'LB', 8, true], ['BV-P03', 'RB', 15, true], ['BV-P04', 'RB+1', 16, false]].forEach(([id, bd, len, ok]) =>
  t(id, 'BVA', `Contact number length, ${bd}`, `${len} digits`, ok ? 'Accepted' : 'Rejected', (p, i) => insert(p, i, { phoneno: rep('1', len) }),
    (r, b, a) => ok ? (/done\.\.\./.test(r.text) && a === b + 1) : (a === b)));
[['BV-O01', 'LB-1', '-1', false], ['BV-O02', 'LB', '0', true], ['BV-O03', 'RB', '1000000', true], ['BV-O04', 'RB+1', '1000001', false]].forEach(([id, bd, v, ok]) =>
  t(id, 'BVA', `One-time no, ${bd}`, v, ok ? 'Row deleted' : 'Not matched', (p, i) => del(p, i, { onetimeno: v }),
    (r, b, a) => ok ? (/product deleted/.test(r.text) && a === b - 1) : (/not match/.test(r.text) && a === b), [SEED1]));

// ---------- Use cases (alternate flows already covered by EP or white-box cases are not repeated) ----------
t('UC1-01', 'UC', 'Offer help, main flow', 'valid data in all 6 fields', 'Saved, number shown, row in DB, refresh to main.php after 10 s',
  (p, id) => insert(p, id, {}), (r, b, a) => /done\.\.\./.test(r.text) && /\d+/.test(r.text) && a === b + 1 && /10/.test(r.refresh) && /main\.php/.test(r.refresh));
t('UC2-01', 'UC', 'Search, main flow', 'beras', 'Rows with name, contact, type, item, date, time, country, location', (p, id) => search(p, id, {}), r => /nizam/.test(r.text) && /Serdang/.test(r.text) && /Malaysia/.test(r.text) && /20261121/.test(r.text), S1);
t('UC2-02', 'UC', 'Search, different product type', 'Cloth for a Food item', 'Food item NOT returned', (p, id) => search(p, id, { producttype: 'Cloth' }), r => !/nizam/.test(r.text), S1);
t('UC3-01', 'UC', 'Delete, main flow', 'correct phone/type/number', 'Deleted, redirect 3 s, gone from search', async (p, id) => { const r = await del(p, id, {}); r.after = (await search(p, id + 's', {})).text; return r; }, (r, b, a) => /product deleted/.test(r.text) && a === b - 1 && !/nizam/.test(r.after) && /3/.test(r.refresh), S1);
t('UC3-02', 'UC', 'Delete twice', 'repeat delete', '2nd attempt: not match', async (p, id) => { await del(p, id + 'a', {}); return del(p, id, {}); }, (r, b, a) => /not match/.test(r.text) && a === 0, S1);

// ---------- White-box (statement coverage suite). main.php and deleteform.php are loaded by every flow that uses them. ----------
t('WB-01', 'WB', 'inserthelp: empty field', 'country empty', 'I1 false, I6', (p, id) => insert(p, id, { country: '' }), r => /Please fill in all fields/.test(r.text));
t('WB-02', 'WB', 'inserthelp: valid, table empty', 'valid', 'I1, I2, I3 (no iteration), I5', (p, id) => insert(p, id, {}), (r, b, a) => /done/.test(r.text) && a === b + 1);
t('WB-03', 'WB', 'inserthelp: duplicate of existing row', 'same as existing', 'I3 iterates, I4 true, exit', (p, id) => insert(p, id, { helpername: 'Nizam', productname: 'Beras' }), r => /already exist/.test(r.text), S1);
t('WB-04', 'WB', 'search via gethelpload and gethelp, matching keyword', 'beras', 'L1, G1 to G6', (p, id) => search(p, id, {}), r => /nizam/.test(r.text), S1);
t('WB-05', 'WB', 'gethelp: direct URL, no session', 'GET gethelp.php', 'G1, G2 false, G7', async (p, id) => { const r = await p.goto(BASE + 'gethelp.php'); return snap(p, id, r); }, r => /fill all fields/i.test(r.text), S1);
t('WB-06', 'WB', 'delete: empty field', 'phone empty', 'D1 false, D6', (p, id) => del(p, id, { phoneno: '' }), r => /Please fill in all fields/.test(r.text), S1);
t('WB-07', 'WB', 'delete: wrong one-time no', 'wrong number', 'D1 to D3, D4 false, D5', (p, id) => del(p, id, { onetimeno: '999' }), r => /not match/.test(r.text), S1);
t('WB-08', 'WB', 'delete: correct data', 'correct', 'D4 true, exit', (p, id) => del(p, id, {}), r => /product deleted/.test(r.text), S1);

function readCov() {
  const raw = execFileSync('docker', ['exec', 'donation', 'sh', '-c', 'for f in /cov/*.json; do [ -f "$f" ] && cat "$f" && echo; done; rm -f /cov/*.json; true']).toString();
  const cov = {};
  raw.split('\n').filter(Boolean).forEach(l => {
    let o; try { o = JSON.parse(l); } catch (e) { return; }
    for (const [f, lines] of Object.entries(o)) {
      cov[f] = cov[f] || {};
      for (const [ln, v] of Object.entries(lines)) {
        if (v === 1) cov[f][ln] = 1; else if (cov[f][ln] === undefined) cov[f][ln] = v;
      }
    }
  });
  return cov;
}

(async () => {
  const only = process.argv[2];
  const browser = await chromium.launch();
  const results = [];
  const covBy = {};
  for (const tc of T) {
    if (only && !tc.id.startsWith(only)) continue;
    reset();
    if (tc.setup) {
      if (tc.id.startsWith('BV-O')) seed([{ ...SEED1, no: '0' }, { ...SEED1, no: '1000000', name: 'x2' }]); // two rows, only the match is deleted
      else seed(tc.setup);
    }
    readCov();
    const before = count();
    const ctx = await browser.newContext({ viewport: { width: 700, height: 600 } });
    const page = await ctx.newPage();
    let r, err = null;
    try { r = await tc.run(page, tc.id); } catch (e) { err = String(e).slice(0, 200); r = { text: 'RUNNER ERROR ' + err, refresh: '', url: '' }; }
    await page.close(); await ctx.close();
    await new Promise(x => setTimeout(x, 250));
    const after = count();
    let pass = false;
    try { pass = !err && !!tc.check(r, before, after); } catch (e) { err = String(e); }
    covBy[tc.id] = readCov();
    results.push({ id: tc.id, group: tc.group, desc: tc.desc, input: tc.input, expected: tc.expected, observed: r.text.slice(0, 300), refresh: r.refresh, rowsBefore: before, rowsAfter: after, pass, err });
    console.log(tc.id, pass ? 'PASS' : 'FAIL', '|', r.text.slice(0, 110));
  }
  await browser.close();
  fs.writeFileSync(path.join(OUT, 'results.json'), JSON.stringify(results, null, 1));
  fs.writeFileSync(path.join(OUT, 'cov.json'), JSON.stringify(covBy));
})();
