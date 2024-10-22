import http from "k6/http";
import { sleep } from "k6";
const BASE_URL_A = "http://service-a:8080";
const BASE_URL_B = "http://service-b:8081";

export const options = {
  // define thresholds
  thresholds: {
    http_req_failed: ['rate<0.01'], // http errors should be less than 1%
    http_req_duration: ['p(99)<1000'], // 99% of requests should be below 1s
  },
  // define scenarios
  scenarios: {
    // arbitrary name of scenario
    average_load: {
      executor: 'ramping-vus',
      stages: [
        // ramp up to average load of 20 virtual users
        { duration: '10s', target: 20 },
        // maintain load
        { duration: '50s', target: 20 },
        // ramp down to zero
        { duration: '5s', target: 0 },
      ],
    },
  },
};

function getUsers() {
  http.get(`${BASE_URL_A}/users`);
}

function postUser(){
  const payload = JSON.stringify({
    name: 'test_case',
    surname: '1234',
  });
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // send a post request and save response as a variable
  http.post(BASE_URL_A+"/users", payload, params);
}

function putUser() {
  const payload = JSON.stringify({
    name: 'test_case',
    surname: '1234',
  });
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  http.put(BASE_URL_A+"/users/4", payload, params);
}

function patchUser() {
  const payload = JSON.stringify({
    name: 'test_case',
  });
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  http.patch(BASE_URL_A+"/users/4", payload, params);
}

function deleteUser() {
  http.del(BASE_URL_A+"/users/4");
}

function getUsersError() {
  http.get(BASE_URL_A+"/error");
}

function getStatements() {
  http.get(`${BASE_URL_B}/statements`);
}

function postStatement(){
  const payload = JSON.stringify({
    UserId: 1,
    value: 'test_case',
  });
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // send a post request and save response as a variable
  http.post(BASE_URL_B+"/statements", payload, params);
}

function putStatement() {
  const payload = JSON.stringify({
    UserId: 1,
    value: 'test_case',
  });
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  http.put(BASE_URL_B+"/statements/4", payload, params);
}

function patchStatement() {
  const payload = JSON.stringify({
    UserId: 1,
    value: 'test_case',
  });
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  http.patch(BASE_URL_B+"/statements/4", payload, params);
}

function deleteStatement() {
  http.del(BASE_URL_B+"/statements/4");
}

function getStatementsError() {
  http.get(BASE_URL_B+"/error");
}

function basicEndpointsTests() {
  getUsers();
  postUser();
  putUser();
  patchUser();
  deleteUser();
  getUsersError();

  getStatements()
  postStatement();
  putStatement();
  patchStatement();
  deleteStatement();
  getStatementsError();
}

export default function () {
  basicEndpointsTests()

  sleep(.1)
}
