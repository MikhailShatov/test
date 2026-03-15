import http from "k6/http";
import { check, sleep } from "k6";
// test
const WT_HOST = __ENV.WT_HOST || "http://webtours.load-test.ru:1080";
const WT_WEB = `${WT_HOST}/webtours`;
const WT_CGI = `${WT_HOST}/cgi-bin`;

const WT_USER = __ENV.WT_USER || "jojo";
const WT_PASS = __ENV.WT_PASS || "bean";

export const options = {
  scenarios: {
    webtours_load: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "1m", target: 10 },
        { duration: "8m", target: 10 },
        { duration: "1m", target: 0 },
      ],
      gracefulRampDown: "30s",
      exec: "webtours",
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<2000"],
  },
};

const CITIES = [
  "Denver",
  "Frankfurt",
  "London",
  "Los Angeles",
  "Paris",
  "Portland",
  "San Francisco",
  "Seattle",
  "Sydney",
  "Zurich",
];

function pickTwoDifferent(arr) {
  const a = arr[Math.floor(Math.random() * arr.length)];
  let b = arr[Math.floor(Math.random() * arr.length)];
  while (b === a) {
    b = arr[Math.floor(Math.random() * arr.length)];
  }
  return [a, b];
}

function extractUserSession(html) {
  const match = (html || "").match(/name="userSession"\s+value="([^"]+)"/i);
  return match ? match[1] : null;
}

function extractOutboundFlight(html) {
  const match = (html || "").match(/name="outboundFlight"\s+value="([^"]+)"/i);
  return match ? match[1] : null;
}

export function webtours() {
  // 1. Открыть главную страницу
  let res = http.get(`${WT_WEB}/`, { tags: { name: "open webtours" } });
  check(res, {
    "open web ok": (r) => r.status === 200,
  });

  // 2. Открыть навигацию и получите userSession.
  res = http.get(`${WT_CGI}/nav.pl?in=home`, { tags: { name: "nav home" } });
  check(res, {
    "nav home ok": (r) => r.status === 200,
  });

  const userSession = extractUserSession(res.body);
  check(userSession, {
    "userSession extracted": (v) => !!v,
  });

  // 3. Логин
  const loginPayload = {
    userSession: userSession || "",
    username: WT_USER,
    password: WT_PASS,
    "login.x": "50",
    "login.y": "10",
    JSFormSubmit: "off",
  };

  res = http.post(`${WT_CGI}/login.pl`, loginPayload, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    tags: { name: "login" },
  });
  check(res, {
    "login ok": (r) => r.status === 200,
  });

  // 4. Открыть страницу поиска
  res = http.get(`${WT_CGI}/welcome.pl?page=search`, {
    tags: { name: "welcome search" },
  });
  check(res, {
    "welcome search ok": (r) => r.status === 200,
  });

  // 5. Найти рейсы
  const [depart, arrive] = pickTwoDifferent(CITIES);

  const findFlightsPayload = {
    advanceDiscount: "0",
    depart,
    departDate: "03/10/2026",
    arrive,
    returnDate: "03/11/2026",
    numPassengers: "1",
    seatPref: "None",
    seatType: "Coach",
    "findFlights.x": "50",
    "findFlights.y": "10",
  };

  res = http.post(`${WT_CGI}/reservations.pl`, findFlightsPayload, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    tags: { name: "find flights" },
  });
  check(res, {
    "find flights ok": (r) => r.status === 200,
  });

  // 6. Уточнить информацию о вылетающем рейсе и забронируйте билет.
  const outboundFlight = extractOutboundFlight(res.body);
  check(outboundFlight, {
    "outboundFlight extracted": (v) => !!v,
  });

  const reservePayload = {
    outboundFlight: outboundFlight || "",
    numPassengers: "1",
    advanceDiscount: "0",
    seatType: "Coach",
    seatPref: "None",
    "reserveFlights.x": "50",
    "reserveFlights.y": "10",
  };

  res = http.post(`${WT_CGI}/reservations.pl`, reservePayload, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    tags: { name: "reserve" },
  });
  check(res, {
    "reserve ok": (r) => r.status === 200,
  });

  // 7. Купить билет
  const buyPayload = {
    firstName: "Jo",
    lastName: "Jo",
    address1: "Berlin",
    address2: "",
    pass1: "Jo Jo",
    creditCard: "4111111111111111",
    expDate: "12/26",
    oldCCOption: "",
    numPassengers: "1",
    seatType: "Coach",
    seatPref: "None",
    outboundFlight: outboundFlight || "",
    "buyFlights.x": "50",
    "buyFlights.y": "10",
  };

  res = http.post(`${WT_CGI}/reservations.pl`, buyPayload, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    tags: { name: "buy" },
  });
  check(res, {
    "buy ok": (r) => r.status === 200,
  });

  sleep(1);
}

export default function () {}