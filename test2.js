// Import the http module to make HTTP requests. From this point, you can use `http` methods to make HTTP requests.
import http from 'k6/http';

// Import the sleep function to introduce delays. From this point, you can use the `sleep` function to introduce delays in your test script.
import { sleep, check } from 'k6';

import { Trend } from 'k6/metrics';


const apiResponseTime = new Trend('api_response_time', true); // Create a custom trend metric to track API response times
const apiRequestTime = new Trend('api_request_time', true); // Create a custom trend metric to track API request times

export const options = {
    // // Define the number of iterations for the test
    // iterations: 10,
    // // Define the duration of the test
    // duration: '10s',
    // // Define the VUs (Virtual Users) for the test
    // vus: 3,

    stages: [

        {duration: '4s',target: 2},  // Ramping up to 2 VUs over 4 seconds
        {duration: '5s', target: 5}, // Staying at 5 VUs for 5 seconds
        {duration: '3s', target: 0}, // Ramping down to 0 VUs for 3 seconds
    ],


    thresholds: {
      // Define thresholds for the test
      'http_req_duration': ['p(95)<400'], // 95% of requests should be below 250ms
      'http_req_failed': ['rate<0.1'], // Less than 50% of requests should fail
      'checks': ['rate>0.9'], // 90% of checks should pass
      'http_req_duration{name:main-api}': ['p(95)<400'],
      'http_req_failed{name:main-api}': ['rate<0.1'],
      'http_req_duration{name:menu-api}': ['p(95)<400'],
      'http_req_failed{name:menu-api}': ['rate<0.1'],
      'api_response_time': ['p(95)<400'], // custom metric for API response time in thresholds
      'api_request_time': ['p(95)<400'], // custom metric for API request time in thresholds
    }  
};

    

// The default exported function is gonna be picked up by k6 as the entry point for the test script. It will be executed repeatedly in "iterations" for the whole duration of the test.
export default function () {
  // Make a GET request to the target URL
  const res = http.get('https://quickpizza.grafana.com', {tags:{name: 'main-api'}}); // 200 status , login failed
  apiResponseTime.add(res.timings.waiting); // Record the API response time in the custom trend metric
  apiRequestTime.add(res.timings.sending); // Record the API request time in the custom trend metric

  // Components of http_req_duration:
  // 1. DNS Lookup - Resolving domain name to IP address
  // 2. TCP Connection - Establishing network connection
  // 3. TLS Handshake - SSL/HTTPS security setup (if HTTPS)
  // 4. Request Sending - Time to send HTTP request data
  // 5. Server Processing - Server thinking time
  // 6. Response Receiving - Time to download response body



  check(res,{

    'status is 200': (res)=> res.status === 200,

    'page contains pizza': (res)=>{
        return res.body.includes("pizza")
    }
  })

  http.get('https://quickpizza.grafana.com/menu', {tags:{name: 'menu-api'}}); // 200 status , login failed

  // Sleep for 1 second to simulate real-world usage
  sleep(1);
}