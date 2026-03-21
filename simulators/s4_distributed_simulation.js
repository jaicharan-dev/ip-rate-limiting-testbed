const axios = require('axios');

const URL = "https://lushly-uneffused-carli.ngrok-free.dev/test";

const ATTACKERS = 5;
const REQUESTS_PER_ATTACKER = 20;
const DELAY = 500;

// generate unique IP per attacker
function generateIP(attackerId, reqId) {
  return `10.${attackerId}.0.${reqId}`;
}

async function attacker(attackerId) {
  console.log(`\n=== ATTACKER_${attackerId} STARTED ===\n`);

  let success = 0;
  let blocked = 0;

  for (let i = 0; i < REQUESTS_PER_ATTACKER; i++) {
    const fakeIP = generateIP(attackerId, i);

    try {
      await axios.get(URL, {
        headers: {
          "x-attack-type": "distributed-rotation",
          "x-session-label": `ATTACKER_${attackerId}`,
          "x-request-number": i,
          "x-forwarded-for": fakeIP
        }
      });

      success++;
    } catch (err) {
      blocked++;
    }

    await new Promise(r => setTimeout(r, DELAY));
  }

  console.log(`ATTACKER_${attackerId} → Success: ${success}, Blocked: ${blocked}`);
}

async function runDistributedAttack() {
  const all = [];

  for (let i = 1; i <= ATTACKERS; i++) {
    all.push(attacker(i));
  }

  await Promise.all(all);

  console.log("\n=== DISTRIBUTED ATTACK COMPLETE ===");
}

runDistributedAttack();