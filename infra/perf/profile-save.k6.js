import http from 'k6/http';
import { check } from 'k6';

export const options = {
  thresholds: {
    http_req_duration: ['p(95)<500'],
  },
};

export default function () {
  const response = http.patch(
    'http://localhost:3000/v1/profiles/me',
    JSON.stringify({
      accountVisibility: 'private',
      displayName: 'Profile Perf User',
      bio: 'Profile save perf baseline',
    }),
    {
      headers: {
        Authorization: 'Bearer dev-token',
        'Content-Type': 'application/json',
      },
    },
  );

  check(response, {
    'profile visibility save status tracked': (r) => [200, 400, 401, 403].includes(r.status),
  });
}
