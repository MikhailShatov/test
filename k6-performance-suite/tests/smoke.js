import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 1,
  iterations: 1,
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<1000'],
  },
};

const BASE_URL = 'http://localhost:3005'; // пока костыли 

export default function () {
  // 1. Health
  let res = http.get(`${BASE_URL}/health`);
  check(res, {
    'health status 200': (r) => r.status === 200,
  });

  // 2. Login
  const loginPayload = JSON.stringify({
    email: 'mihail1@example.com',
    password: 'pass123',
  });

  res = http.post(`${BASE_URL}/auth/login`, loginPayload, {
    headers: { 'Content-Type': 'application/json' },
  });

  check(res, {
    'login status 200': (r) => r.status === 200,
    'login token exists': (r) => !!r.json('token'),
  });

  const token = res.json('token');

  // 3. Get products
  res = http.get(`${BASE_URL}/products?limit=5&offset=0`);
  check(res, {
    'products status 200': (r) => r.status === 200,
    'products not empty': (r) => Array.isArray(r.json('items')) && r.json('items').length > 0,
  });

  const items = res.json('items');
  const productId = items[0].id;
  console.log(`Selected productId: ${productId}`);

  // 4. Add to cart
  const cartPayload = JSON.stringify({
    productId,
    quantity: 1,
  });

  res = http.post(`${BASE_URL}/cart/add`, cartPayload, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  check(res, {
    'cart add status 200': (r) => r.status === 200,
  });

  // 5. Get cart
  res = http.get(`${BASE_URL}/cart`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  check(res, {
    'cart status 200': (r) => r.status === 200,
    'cart has items': (r) => Array.isArray(r.json('items')) && r.json('items').length > 0,
  });

  // 6. Create order
  res = http.post(`${BASE_URL}/orders/create`, null, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  check(res, {
    'order create status is 200 or 201': (r) => r.status === 200 || r.status === 201,
    'order id exists': (r) => !!r.json('id'),
  });

  const orderId = res.json('id');

  // 7. Get order
  res = http.get(`${BASE_URL}/orders/${orderId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  check(res, {
    'order get status 200': (r) => r.status === 200,
    'order items exist': (r) => Array.isArray(r.json('items')) && r.json('items').length > 0,
  });

  sleep(1);
}