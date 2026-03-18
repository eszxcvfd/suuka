import http from 'k6/http';
import { check, sleep } from 'k6';

http.setResponseCallback(http.expectedStatuses(200, 401, 403));

export const options = {
  vus: 5,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<200'],
    checks: ['rate>0.95'],
    http_req_failed: ['rate<0.2'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function authorizationPolicyScenario() {
  const response = http.get(`${BASE_URL}/v1/internal/moderation/review-queue`, {
    headers: {
      Authorization: `Bearer ${__ENV.INTERNAL_TOKEN || 'placeholder-internal-token'}`,
    },
  });

  check(response, {
    'authorization policy status is gated': (r) => [200, 401, 403].includes(r.status),
    'authorization scope denial stays non-destructive': (r) => r.status !== 500,
  });

  sleep(1);
}
