import http from 'k6/http';
import { check, sleep } from 'k6';

http.setResponseCallback(http.expectedStatuses({ min: 200, max: 201 }, 401, 403));

export const options = {
  vus: 5,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<400'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function authScenario() {
  const response = http.post(
    `${BASE_URL}/v1/auth/sign-in`,
    JSON.stringify({
      email: 'demo@example.com',
      password: 'password123',
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    },
  );

  const staffResponse = http.patch(
    `${BASE_URL}/v1/auth/account-visibility`,
    JSON.stringify({ visibility: 'private' }),
    {
      headers: {
        Authorization: `Bearer ${__ENV.ACCESS_TOKEN || 'placeholder-access-token'}`,
        'Content-Type': 'application/json',
      },
    },
  );

  check(response, {
    'auth request status ok': (r) => r.status === 200 || r.status === 201 || r.status === 401,
  });
  check(staffResponse, {
    'rbac action status ok': (r) => [200, 401, 403].includes(r.status),
  });

  sleep(1);
}
