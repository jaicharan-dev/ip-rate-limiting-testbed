const axios = require('axios');

const URL = "https://lushly-uneffused-carli.ngrok-free.dev/test";

// Experiment config
const TOTAL_USERS = 10;
const NORMAL_USERS = 7;
const BURST_USERS = 3;
const TEST_DURATION = 60 * 1000; // 1 minute

// Helper: random delay between requests
function randomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// Track stats
let stats = {};

function simulateUser(id, type) {
  stats[id] = {
    type,
    sent: 0,
    blocked: 0
  };

  function sendRequest() {
    axios.get(URL)
      .then(() => {
        stats[id].sent++;
      })
      .catch(() => {
        stats[id].sent++;
        stats[id].blocked++;
      });
  }

  // NORMAL USER
  if (type === "normal") {
    const interval = setInterval(() => {
      sendRequest();
    }, randomDelay(5000, 10000)); // 5–10 sec

    setTimeout(() => clearInterval(interval), TEST_DURATION);
  }

  // BURST USER
  if (type === "burst") {
    const interval = setInterval(() => {
      sendRequest();

      // occasional burst
      if (Math.random() < 0.3) {
        console.log(`User ${id} burst started`);
        for (let i = 0; i < randomDelay(20, 30); i++) {
          sendRequest();
        }
      }

    }, randomDelay(3000, 8000)); // 3–8 sec

    setTimeout(() => clearInterval(interval), TEST_DURATION);
  }
}

// Create users
for (let i = 1; i <= TOTAL_USERS; i++) {
  if (i <= NORMAL_USERS) {
    simulateUser(i, "normal");
  } else {
    simulateUser(i, "burst");
  }
}

// Print results after test ends
setTimeout(() => {
  console.log("\n=== FINAL RESULTS ===\n");

  let totalSent = 0;
  let totalBlocked = 0;

  for (let id in stats) {
    const user = stats[id];
    console.log(
      `User ${id} (${user.type}) → Sent: ${user.sent}, Blocked: ${user.blocked}`
    );

    totalSent += user.sent;
    totalBlocked += user.blocked;
  }

  console.log("TOTAL:\n");
  console.log(`Total Requests: ${totalSent}`);
  console.log(`Blocked Requests: ${totalBlocked}`);
  console.log(
    `Block Rate: ${((totalBlocked / totalSent) * 100).toFixed(2)}%`
  );

}, TEST_DURATION + 2000);