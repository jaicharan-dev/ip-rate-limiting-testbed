const axios = require('axios');

const URL = "https://lushly-uneffused-carli.ngrok-free.dev/test";

const REQUESTS = 50;
const DELAY = 200;

// generate fake IPs
function generateIP(i) {
  return `192.168.1.${i}`;
}

async function rotationAttack() {
  console.log("\n=== ROTATION ATTACK STARTED ===\n");

  let success = 0;
  let blocked = 0;

  for (let i = 0; i < REQUESTS; i++) {
    const fakeIP = generateIP(i);

    try {
      await axios.get(URL, {
        headers: {
          "x-attack-type": "rotation",
          "x-session-label": `ROTATION_${i}`,
          "x-request-number": i,
          "x-forwarded-for": fakeIP
        }
      });

      console.log(`SUCCESS → ${fakeIP}`);
      success++;
    } catch (err) {
      console.log(`BLOCKED → ${fakeIP}`);
      blocked++;
    }

    await new Promise(r => setTimeout(r, DELAY));
  }

  console.log("\n=== ROTATION ATTACK RESULTS ===");
  console.log(`Success: ${success}`);
  console.log(`Blocked: ${blocked}`);
  console.log(`Block Rate: ${((blocked / (success + blocked)) * 100).toFixed(2)}%`);
}

rotationAttack();