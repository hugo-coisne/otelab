import http from "k6/http";
import { sleep } from "k6";
const BASE_URL = "http://service:8080";

export const options = {
  vus: 10, // Number of virtual users
  duration: "1m", // Duration of the test
};

export default function () {
  // Test the /rolldice endpoint
  const rollsResponse = http.get(`${BASE_URL}/rolldice?rolls=3`);
}
