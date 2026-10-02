# Understanding http_req_duration - Deep Dive

## What is http_req_duration?

`http_req_duration` measures the **total time** it takes for an HTTP request to complete, from when k6 starts sending the request until it receives the complete response.

## How is it Calculated?

### Timeline of an HTTP Request:
```
[Request Start] -----> [DNS] -----> [TCP Connect] -----> [TLS Handshake] -----> [Send Request] -----> [Wait] -----> [Receive Response] -----> [Request End]
^                                                                                                                                                    ^
|                                                    http_req_duration                                                                             |
```

### Components of http_req_duration:
1. **DNS Lookup** - Resolving domain name to IP address
2. **TCP Connection** - Establishing network connection  
3. **TLS Handshake** - SSL/HTTPS security setup (if HTTPS)
4. **Request Sending** - Time to send HTTP request data
5. **Server Processing** - Server thinking time
6. **Response Receiving** - Time to download response body

### Formula:
```
http_req_duration = http_req_receiving + http_req_waiting + http_req_sending + http_req_connecting
```

## Real Example from Our Test:

From our test output:
```
http_req_duration: avg=127.3ms min=4.81ms med=227.02ms max=343.28ms p(90)=246.26ms p(95)=247.54ms
```

### What Each Statistic Means:

**avg=127.3ms** - Average Response Time
- Sum of all request durations ÷ number of requests
- Example: (100ms + 150ms + 130ms + ... + 120ms) ÷ 204 requests = 127.3ms

**min=4.81ms** - Fastest Response  
- The quickest request completed in just 4.81ms
- Probably a cached response or very light server load

**med=227.02ms** - Median (50th Percentile)
- When you sort all 204 response times, the middle value is 227ms
- 50% of requests were faster than 227ms, 50% were slower

**max=343.28ms** - Slowest Response
- The worst-case scenario - one request took 343ms
- Could indicate server hiccup or network congestion

**p(90)=246.26ms** - 90th Percentile
- 90% of requests completed within 246ms
- Only 10% of requests were slower than this

**p(95)=247.54ms** - 95th Percentile  
- 95% of requests completed within 247ms
- Only 5% of requests were slower than this

## Step-by-Step Calculation Example:

Let's say we had only 10 requests with these times:
```
Request 1: 50ms
Request 2: 80ms  
Request 3: 120ms
Request 4: 150ms
Request 5: 180ms
Request 6: 200ms
Request 7: 220ms
Request 8: 250ms
Request 9: 300ms
Request 10: 450ms
```

### Calculations:
- **Average**: (50+80+120+150+180+200+220+250+300+450) ÷ 10 = 200ms
- **Min**: 50ms (fastest)
- **Max**: 450ms (slowest)
- **Median**: (180ms + 200ms) ÷ 2 = 190ms (middle values)
- **p(90)**: 90% of 10 = 9th position = 300ms
- **p(95)**: 95% of 10 = 9.5th position = (300ms + 450ms) ÷ 2 = 375ms

## Why These Numbers Matter:

### User Experience Impact:
- **< 100ms**: Feels instant
- **100-300ms**: Slight delay, acceptable  
- **300-1000ms**: Noticeable, but tolerable
- **> 1000ms**: Frustrating for users

### Business Impact:
- **Amazon**: 100ms delay = 1% sales loss
- **Google**: 500ms delay = 20% search drop
- **Page load time**: 3+ seconds = 53% mobile users abandon

## What Affects http_req_duration?

### Network Factors:
- **Latency**: Physical distance to server
- **Bandwidth**: Available connection speed
- **Packet loss**: Network reliability issues

### Server Factors:
- **CPU load**: Server processing power
- **Memory usage**: Available RAM
- **Database queries**: Backend data retrieval
- **External API calls**: Third-party dependencies

### Application Factors:
- **Code efficiency**: Algorithm performance
- **Caching**: Stored response reuse
- **Resource optimization**: Image/file sizes

## Interpreting Our Test Results:

### Why median (227ms) > average (127ms)?
This suggests:
- Some very fast responses (probably cached) bringing average down
- Most responses clustered around 227ms
- A few extremely fast responses (min=4.81ms) skewed the average

### Small gap between p(90) and p(95):
- p(90) = 246ms
- p(95) = 247ms  
- Only 1ms difference means performance is consistent
- No major outliers in the slowest 10% of requests

## Monitoring in Production:

### Key Metrics to Track:
1. **p(50)** - Typical user experience
2. **p(95)** - Worst acceptable experience  
3. **p(99)** - Extreme edge cases
4. **Trend over time** - Performance degradation

### Alert Thresholds:
```javascript
thresholds: {
  'http_req_duration': [
    'p(50)<200',   // 50% under 200ms
    'p(95)<500',   // 95% under 500ms  
    'p(99)<1000',  // 99% under 1 second
  ]
}
```

This is exactly how k6 calculates and reports http_req_duration - it's the most important metric for understanding user experience!
