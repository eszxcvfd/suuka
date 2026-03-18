import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 5,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<400'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function refreshScenario() {
  const response = http.post(
    `${BASE_URL}/v1/auth/refresh`,
    JSON.stringify({
      refreshToken: 'dummy-refresh-token',
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    },
  );

  check(response, {
    'refresh request status ok': (r) => r.status === 200 || r.status === 401,
  });

  sleep(1);
}
