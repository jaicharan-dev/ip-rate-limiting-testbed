const axios = require('axios');

const URL = "https://lushly-uneffused-carli.ngrok-free.dev/test";

// CONFIG
const REQUESTS = 50;
const DELAY = 200; // aggressive

async function attack(label, attackType) {
  console.log(`\n=== ${label} STARTED ===\n`);

  let success = 0;
  let blocked = 0;

  for (let i = 0; i < REQUESTS; i++) {
    try {
      await axios.get(URL, {
        headers: {
          "x-attack-type": attackType,
          "x-session-label": label,
          "x-request-number": i
        }
      });

      success++;
    } catch (err) {
      blocked++;
    }

    await new Promise(r => setTimeout(r, DELAY));
  }

  console.log(`\n=== ${label} RESULTS ===`);
  console.log(`Success: ${success}`);
  console.log(`Blocked: ${blocked}`);
  console.log(`Block Rate: ${((blocked / (success + blocked)) * 100).toFixed(2)}%`);
}

// -----------------------------------------------------------------

// // CASE 1: Single IP Attack
// (async () => {
//   await attack("SINGLE_IP_ATTACK", "single-ip");
// })();

// -----------------------------------------------------------------

// // Case 2: Distributed Attack
// async function distributedAttack() {
//   const attackers = [];

//   for (let i = 1; i <= 5; i++) {
//     attackers.push(
//       attack(`ATTACKER_${i}`, "distributed")
//     );
//   }

//   await Promise.all(attackers);
// }

// distributedAttack();

// ---------------------------------------------------------------

// // CASE 3: VPN Attack
// (async () => {

//   await attack("NO_VPN_ATTACK", "rotation");

//   console.log("\n CONNECT VPN NOW...");
//   await new Promise(r => setTimeout(r, 20000));

//   await attack("VPN_1", "rotation");

//   console.log("\n SWITCH VPN SERVER...");
//   await new Promise(r => setTimeout(r, 20000));

//   await attack("VPN_2", "rotation");

// })();