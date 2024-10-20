import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = "http://localhost:8080";

export const options = {
  vus: 10, // Number of virtual users
  duration: '30s', // Duration of the test
};

export default function () {
  // Test the /rolldice endpoint
  const rollsResponse = http.get(`${BASE_URL}/rolldice?rolls=3`);
  console.log("HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH");
  console.log(rollsResponse);

  sleep(1); // Wait for 1 second between iterations
}
