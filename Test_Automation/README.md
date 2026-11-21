# Test automation

Re-run the tests:
1. `docker build -t donation-env env` (PHP 8.2 + Apache + MariaDB + Xdebug coverage)
2. `docker run -d --name donation -p 8080:80 -v <path to this repo>/DONATION:/var/www/html/DONATION:ro donation-env`
3. `npm install playwright && npx playwright install chromium`
4. `node run.js` (optional argument: test id prefix, e.g. `EP-H`). Writes results.json, cov.json and shots/.

Assumed: all helpinfo columns are VARCHAR(50) (the setup guide shows the types only as a screenshot).
