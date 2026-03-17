import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 5,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<400'],
  },
};

export default function authScenario() {
  const response = http.post('http://localhost:3000/v1/auth/sign-in', JSON.stringify({
    email: 'demo@example.com',
    password: 'password123',
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  check(response, {
    'auth request status ok': (r) => r.status === 200 || r.status === 201 || r.status === 401,
  });

  sleep(1);
}
