# k6 Performance Test Metrics Documentation

## Overview
This document explains every metric that k6 reports after running a performance test, using our simple test as an example.

---

## 🎯 THRESHOLDS SECTION
Thresholds are **pass/fail criteria** you define. They determine whether your test succeeds or fails.

### Example from our test:
```
█ THRESHOLDS 

checks
✗ 'rate>0.9' rate=50.00%

http_req_duration  
✓ 'p(95)<500' p(95)=247.54ms

http_req_failed
✓ 'rate<0.1' rate=0.00%
```

**What each means:**
- ✗ **checks**: 50% passed, but we required >90% (FAILED)
- ✓ **http_req_duration**: 95th percentile was 247ms, under our 500ms limit (PASSED)  
- ✓ **http_req_failed**: 0% failed, under our 10% limit (PASSED)

---

## 📊 TOTAL RESULTS SECTION
This shows **all metrics collected** during the test, regardless of thresholds.

### 1. CHECK METRICS
```
checks_total.......................: 204    4.029821/s
checks_succeeded...................: 50.00% 102 out of 204
checks_failed......................: 50.00% 102 out of 204

✓ status is 200
✗ page contains k6.io
  ↳  0% — ✓ 0 / ✗ 102
```

**Explanation:**
- **checks_total**: Total number of check evaluations (204 checks at 4.03/second)
- **checks_succeeded**: Percentage and count of passed checks (50% = 102 passed)
- **checks_failed**: Percentage and count of failed checks (50% = 102 failed)
- **Individual check breakdown**: Shows which specific checks passed/failed

**How it's calculated:**
- Each iteration runs 2 checks × 102 iterations = 204 total checks
- "status is 200" check: 102 passed (all HTTP requests succeeded)
- "page contains k6.io" check: 0 passed (text not found on page)

### 2. HTTP METRICS
```
http_req_duration.......................................................: avg=127.3ms min=4.81ms med=227.02ms max=343.28ms p(90)=246.26ms p(95)=247.54ms
  { expected_response:true }............................................: avg=127.3ms min=4.81ms med=227.02ms max=343.28ms p(90)=246.26ms p(95)=247.54ms
http_req_failed.........................................................: 0.00%  0 out of 204
http_reqs...............................................................: 204    4.029821/s
```

**Explanation:**
- **http_req_duration**: Response time statistics
  - **avg**: Average response time (127.3ms)
  - **min**: Fastest response (4.81ms)
  - **med**: Median response time (227.02ms) - 50th percentile
  - **max**: Slowest response (343.28ms)
  - **p(90)**: 90% of requests were faster than this (246.26ms)
  - **p(95)**: 95% of requests were faster than this (247.54ms)

- **expected_response:true**: Same metrics but only for successful responses (status 200-399)

- **http_req_failed**: Percentage of failed HTTP requests (0% = no failures)

- **http_reqs**: Total HTTP requests made (204 requests at 4.03/second)

**How it's calculated:**
- 102 iterations × 1 HTTP request per iteration = 204 total requests
- Rate = 204 requests ÷ 50.6 seconds = 4.03 requests/second

### 3. EXECUTION METRICS
```
iteration_duration......................................................: avg=1.3s    min=1.24s  med=1.25s    max=4.27s    p(90)=1.27s    p(95)=1.45s   
iterations..............................................................: 102    2.01491/s
vus.....................................................................: 1      min=1        max=5
vus_max.................................................................: 5      min=5        max=5
```

**Explanation:**
- **iteration_duration**: Time for one complete iteration (HTTP request + checks + sleep)
  - **avg**: Average time per iteration (1.3s)
  - Our code has sleep(1), so minimum time is ~1 second + request time

- **iterations**: Total completed iterations (102 at 2.01/second)

- **vus**: Virtual Users currently running (1 at end, peaked at 5)

- **vus_max**: Maximum VUs configured (5)

**How it's calculated:**
- Each iteration = HTTP request + 2 checks + sleep(1) ≈ 1.3 seconds
- 102 iterations ÷ 50.6 seconds = 2.01 iterations/second

### 4. NETWORK METRICS
```
data_received...........................................................: 365 kB 7.2 kB/s
data_sent...............................................................: 14 kB  279 B/s
```

**Explanation:**
- **data_received**: Total data downloaded (365 KB at 7.2 KB/second)
- **data_sent**: Total data uploaded (14 KB at 279 bytes/second)

**How it's calculated:**
- 204 HTTP requests × ~1.8 KB per response = ~365 KB received
- 204 HTTP requests × ~70 bytes per request = ~14 KB sent

---

## 📈 KEY PERFORMANCE INDICATORS

### Response Time Percentiles
- **p(50) [median]**: 50% of users experienced this response time or better
- **p(90)**: 90% of users experienced this response time or better  
- **p(95)**: 95% of users experienced this response time or better
- **p(99)**: 99% of users experienced this response time or better (not shown in our simple test)

### Load Generation Metrics
- **Throughput**: Requests per second (RPS) = http_reqs rate
- **Concurrency**: Number of simultaneous virtual users (vus)
- **Test Duration**: Total time the test ran

### Error Metrics
- **Error Rate**: Percentage of failed requests (http_req_failed)
- **Check Success Rate**: Percentage of passed validations (checks_succeeded)

---

## 🎓 Teaching Points for Students

### 1. **Why Median vs Average?**
- **Average (127.3ms)**: Can be skewed by a few slow requests
- **Median (227.02ms)**: Better represents typical user experience
- In our test: median > average suggests some very fast requests (likely cached)

### 2. **Understanding Percentiles**
- **p(95) = 247.54ms**: Means 95% of users waited less than 248ms
- Only 5% of users experienced slower response times
- Industry standard: p(95) < 500ms for good user experience

### 3. **Iteration vs Request Rates**
- **Request rate** (4.03/s): How fast we hit the server
- **Iteration rate** (2.01/s): How fast we complete user journeys
- Iteration rate < Request rate because of sleep() and processing time

### 4. **Virtual Users Behavior**
- Started with 1 VU, ramped to 5 VUs, then back to 1
- Each VU runs independently, creating concurrent load
- More VUs = more concurrent requests = higher load

---

## 🔍 How to Analyze Results

### ✅ Good Performance Indicators:
- Low error rates (< 1%)
- Consistent response times (small gap between avg and p(95))
- High check success rates (> 95%)
- Stable throughput throughout test

### ⚠️ Performance Issues:
- High error rates (> 5%)
- Large gaps between median and p(95) (indicates inconsistency)
- Failed thresholds
- Decreasing throughput over time

---

## 💡 Next Steps for Learning

1. **Fix the failing check** by updating the search text
2. **Experiment with stages** to see how metrics change
3. **Add response time thresholds** for different percentiles
4. **Try different load patterns** (steady, spike, stress tests)

This documentation serves as a reference for understanding what each number means and how k6 calculates them!
