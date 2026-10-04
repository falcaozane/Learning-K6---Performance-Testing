import http from 'k6/http';
import { sleep, check, group } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js';

// ============================================================================
// 1. CONFIGURATION & ENVIRONMENT SETUP
// ============================================================================
const BASE_URL = __ENV.BASE_URL || 'https://falcaozane.vercel.app';

// Modern browser headers to ensure realistic Vercel CDN / Edge processing
const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
  'Accept-Encoding': 'gzip, deflate, br',
};

// Custom metrics
const homepageDuration = new Trend('homepage_req_duration', true);
const projectsDuration = new Trend('projects_req_duration', true);
const successfulChecksRate = new Rate('successful_checks_rate');
const totalRequestsCounter = new Counter('total_http_requests');

export const options = {
  stages: [
    { duration: '5s', target: 2 },  // Ramp-up to 2 VUs
    { duration: '10s', target: 5 }, // Steady state with 5 VUs
    { duration: '3s', target: 0 },  // Ramp-down to 0 VUs
  ],

  thresholds: {
    // Global SLAs
    'http_req_duration': ['p(95)<500'],
    'http_req_failed': ['rate<0.05'], // Failure rate strictly under 5%
    'checks': ['rate>0.95'],          // Assertions pass rate above 95%
    
    // Custom metrics SLAs
    'homepage_req_duration': ['p(95)<400'],
    'projects_req_duration': ['p(95)<400'],
  },
};

// ============================================================================
// 2. PRE-TEST LIFECYCLE (HEALTH CHECK)
// ============================================================================
export function setup() {
  const res = http.get(BASE_URL, { headers: DEFAULT_HEADERS });
  if (res.status !== 200) {
    throw new Error(`Pre-flight smoke test failed! Target returned HTTP ${res.status}`);
  }
  return { startTime: new Date().toISOString() };
}

// ============================================================================
// 3. MAIN VIRTUAL USER (VU) WORKFLOW
// ============================================================================
export default function () {
  // Step 1: User visits the Homepage
  group('01_Homepage_Navigation', function () {
    const res = http.get(BASE_URL, {
      headers: DEFAULT_HEADERS,
      tags: { name: 'homepage' },
    });

    totalRequestsCounter.add(1);
    homepageDuration.add(res.timings.duration);

    const checksPassed = check(res, {
      'homepage status is 200': (r) => r.status === 200,
      'homepage contains Zane Falcao': (r) => Boolean(r.body && r.body.includes('Zane Falcao')),
    });

    successfulChecksRate.add(checksPassed);
  });

  // Randomized think time (1 to 2 seconds) to avoid rigid thundering-herd traffic
  sleep(randomIntBetween(1, 2));

  // Step 2: User navigates to the Projects page
  group('02_Projects_Navigation', function () {
    const res = http.get(`${BASE_URL}/Projects`, {
      headers: DEFAULT_HEADERS,
      tags: { name: 'projects' },
    });

    totalRequestsCounter.add(1);
    projectsDuration.add(res.timings.duration);

    const checksPassed = check(res, {
      'projects status is 200': (r) => r.status === 200,
    });

    successfulChecksRate.add(checksPassed);
  });

  // Randomized think time before the next iteration
  sleep(randomIntBetween(1, 3));
}

// ============================================================================
// 4. POST-TEST REPORTING & SUMMARY
// ============================================================================
export function handleSummary(data) {
  return {
    'summary.html': htmlReport(data), // Generates a standalone visual HTML report
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}