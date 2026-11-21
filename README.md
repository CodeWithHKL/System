# DONATION System: Test Project (CSEB4313)

Dynamic testing of the DONATION web application for the CSEB4313 Software Testing assignment: black-box testing (Equivalence Partitioning, Boundary Value Analysis, Use Case Testing) and white-box testing (statement coverage).

## About the application

DONATION is a small PHP and MySQL web app that connects people offering help (food, clothing, shelter, other) with people who need it.

| Function | Files |
|---|---|
| Main page with the helper form and the search form | `DONATION/main.php` |
| Offer help (insert into the database) | `DONATION/inserthelp.php` |
| Search for help | `DONATION/gethelpload.php`, `DONATION/gethelp.php` |
| Delete an offer (phone, product type and one-time number) | `DONATION/deleteform.php`, `DONATION/delete.php` |

Data is stored in database `donationdb`, table `helpinfo` (9 columns: helper name, phone, product type, product name, one-time number, date, time, country, specific location). The original setup guide is `DONATION/System configuration-w.pdf`.

## Repository layout

```
System/
├── DONATION/            Application source code under test
├── Test_Automation/     Automated test run, evidence and results
│   ├── run.js           Playwright script: 39 test cases + per-test coverage collection
│   ├── env/             Docker environment (PHP 8.2, Apache, MariaDB, Xdebug)
│   ├── results.json     Raw results (expected vs observed, pass/fail)
│   ├── cov.json         Per-test Xdebug line coverage
│   └── screenshots/     One screenshot per test case
├── .gitattributes       Forces LF endings so start.sh works in Docker
└── README.md
```

## Results summary

| Technique | Test cases | Passed |
|---|---|---|
| Equivalence Partitioning | 14 | 10 |
| Boundary Value Analysis | 12 | 9 |
| Use Case Testing | 5 | 4 |
| White-box (statement coverage) | 8 | 8 |
| **Total** | **39** | **31** |

Statement coverage of the 8 white-box tests, measured with Xdebug: **100%** (73 of 73 executable statements).

Defects found (the 8 failed cases):

1. SQL injection in the INSERT and DELETE queries; a quote character crashes the page and discloses SQL text, file path and DB user.
2. The search keyword is used unescaped in `preg_match`, causing PHP warnings.
3. Text longer than the column length is silently truncated.
4. The contact number has no validation.
5. Search ignores the product type.
6. Minor: undefined-key warnings in `gethelp.php`, malformed HTML in `main.php`.

## Running the application

### Option A: XAMPP (as in the assignment guide)

1. Install XAMPP and start Apache and MySQL.
2. Copy the `DONATION` folder into `xampp/htdocs`.
3. In phpMyAdmin create database `donationdb` and table `helpinfo` with 9 columns, all text types (the tests assume `VARCHAR(50)`; date and time can be shorter).
4. Open `http://localhost/DONATION/main.php` (or `localhost:8080` if you changed the Apache port).

### Option B: Docker (used for the automated run)

From `Test_Automation/`:

```bash
docker build -t donation-env env
docker run -d --name donation -p 8080:80 \
  -v "<absolute path to this repo>/DONATION:/var/www/html/DONATION:ro" donation-env
```

The container creates the database and table automatically. Open `http://localhost:8080/DONATION/main.php`.

The environment copies `php.ini-development` and sets MariaDB to a non-strict SQL mode to match XAMPP's defaults.

## Running the automated tests

Requires Docker (Option B above is running) and Node.js.

```bash
cd Test_Automation
npm install playwright
npx playwright install chromium
node run.js          # all 39 test cases
node run.js EP-H     # only test IDs starting with EP-H
```

Each test case starts from an empty `helpinfo` table. The run writes `results.json`, `cov.json` and `shots/` (copy `shots/` over `screenshots/` to keep them). Exit output lists each test as PASS or FAIL.

Test ID prefixes: `EP-H` (helper form), `EP-S` (search), `EP-D` (delete), `BV-T/P/O` (boundaries for text, phone, one-time number), `UC1-3` (use cases), `WB-01..08` (white-box).

## Assumptions

- There is no written specification. Form placeholders (for example `+60123456789`, `e.g. Beras`) define the expected input, and expected results follow normal donation-board behaviour.
- BVA ranges are assumed: text fields 1 to 50 characters, phone 8 to 15 characters, one-time number 0 to 1,000,000.
- All `helpinfo` columns are assumed to be `VARCHAR(50)`; the setup guide gives the types only as an image.
- The automated run used Docker (PHP 8.2 and MariaDB), not XAMPP itself.
