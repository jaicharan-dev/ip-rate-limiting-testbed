const axios = require('axios');

const URL = "https://lushly-uneffused-carli.ngrok-free.dev/test";

// send request
async function sendRequest(label) {
  try {
    const res = await axios.get(URL);

    console.log(`[${label}] SUCCESS`);
    console.log(res.data.data); // your server log object

  } catch (err) {
    console.log(`[${label}] BLOCKED`);
  }
}

// run phase
async function runPhase(label, count, delay) {
  console.log(`\n=== ${label} STARTED ===\n`);

  for (let i = 0; i < count; i++) {
    await sendRequest(label);
    await new Promise(r => setTimeout(r, delay));
  }

  console.log(`\n=== ${label} COMPLETED ===\n`);
}

// MAIN FLOW
(async () => {

  // Phase 1 → WiFi
  await runPhase("WIFI", 10, 2000);

  console.log("\n SWITCH NETWORK NOW (WiFi → Hotspot)\n");
  console.log("Waiting 20 seconds...\n");

  await new Promise(r => setTimeout(r, 20000));

  // Phase 2 → Hotspot
  await runPhase("HOTSPOT", 10, 2000);

})();