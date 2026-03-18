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

export default function passwordResetScenario() {
  const response = http.post(
    `${BASE_URL}/v1/auth/password-reset/request`,
    JSON.stringify({
      email: 'demo@example.com',
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    },
  );

  check(response, {
    'password reset request status ok': (r) => r.status === 200 || r.status === 201,
  });

  sleep(1);
}
