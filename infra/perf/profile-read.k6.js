import http from 'k6/http';
import { check } from 'k6';

export const options = {
  thresholds: {
    http_req_duration: ['p(95)<400'],
  },
};

export default function () {
  const response = http.get('http://localhost:3000/v1/profiles/dev-account-id', {
    headers: {
      Authorization: 'Bearer dev-token',
    },
  });

  check(response, {
    'profile visibility read status tracked': (r) => [200, 401, 403, 404].includes(r.status),
  });
}
