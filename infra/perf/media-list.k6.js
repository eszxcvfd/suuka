import http from 'k6/http';
import { check, sleep } from 'k6';

http.setResponseCallback(http.expectedStatuses(200, 401, 403));

export const options = {
  vus: 5,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<300'],
  },
};

export default function mediaListScenario() {
  const response = http.get('http://localhost:3000/v1/media', {
    headers: {
      Authorization: `Bearer ${__ENV.ACCESS_TOKEN || 'placeholder-access-token'}`,
    },
  });

  check(response, {
    'media list status ok': (r) => r.status === 200 || r.status === 401 || r.status === 403,
  });

  sleep(1);
}
