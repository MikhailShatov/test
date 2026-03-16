import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 30 },
    { duration: '30s', target: 0 },
  ],
};

export default function () {

  let res = http.get('http://webtours.load-test.ru:1080/WebTours/');

  check(res, {
    'status is 200': (r) => r.status === 200,
  });

  sleep(1);
}