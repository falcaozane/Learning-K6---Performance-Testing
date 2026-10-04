// Import the http module to make HTTP requests. From this point, you can use `http` methods to make HTTP requests.
import http from 'k6/http';

// Import the sleep function to introduce delays. From this point, you can use the `sleep` function to introduce delays in your test script.
import { sleep } from 'k6';

export const options = {
    // Define the number of iterations for the test
    iterations: 10,
    // Define the duration of the test
    duration: '10s',
    // Define the VUs (Virtual Users) for the test
    vus: 3,

    thresholds: {
      // Define thresholds for the test
      http_req_duration: ['p(95)<250'], // 95% of requests should be below 250ms
      http_req_failed: ['rate<0.5'], // Less than 50% of requests should fail
    }  
};

    

// The default exported function is gonna be picked up by k6 as the entry point for the test script. It will be executed repeatedly in "iterations" for the whole duration of the test.
export default function () {
  // Make a GET request to the target URL
  http.get('https://quickpizza.grafana.com');

  // Sleep for 1 second to simulate real-world usage
  sleep(1);
}