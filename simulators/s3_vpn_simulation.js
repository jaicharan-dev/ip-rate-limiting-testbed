const axios = require('axios');

const URL = "https://lushly-uneffused-carli.ngrok-free.dev/test";

async function sendRequests(label, count, delay) {
  console.log(`\n=== ${label} ===\n`);

  let lastIP = null;

  for (let i = 0; i < count; i++) {
    try {
      const res = await axios.get(URL, {
        headers: {
          "x-session-label": label,
          "x-request-number": i
        }
      }); 

      const currentIP = res.data.data.ip;

      if (currentIP !== lastIP) {
        console.log(`IP CHANGED → ${currentIP}`);
        lastIP = currentIP;
      }

      console.log(`[${label}] SUCCESS`);
    } catch (err) {
      console.log(`[${label}] BLOCKED`);
    }

    await new Promise(r => setTimeout(r, delay));
  }
}

(async () => {

  await sendRequests("NO VPN", 10, 2000);

  console.log("\n CONNECT VPN NOW");
  await new Promise(r => setTimeout(r, 20000));

  await sendRequests("VPN SESSION 1", 10, 2000);

  console.log("\n RECONNECT VPN (NEW SERVER)");
  await new Promise(r => setTimeout(r, 20000));

  await sendRequests("VPN SESSION 2", 10, 2000);

  console.log("\n RECONNECT VPN AGAIN");
  await new Promise(r => setTimeout(r, 20000));

  await sendRequests("VPN SESSION 3", 10, 2000);

})();