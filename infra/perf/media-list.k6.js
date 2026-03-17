import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 5,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<300'],
  },
};

export default function mediaListScenario() {
  const response = http.get('http://localhost:3000/v1/media');

  check(response, {
    'media list status ok': (r) => r.status === 200 || r.status === 401,
  });

  sleep(1);
}
