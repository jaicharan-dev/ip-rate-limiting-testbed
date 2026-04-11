const axios = require('axios');
const fs = require('fs');

const URL = "http://localhost:3000/test";
const TEST_DURATION_MS = 60 * 1000;
const COOLDOWN_MS = 65 * 1000;

// ================================================
// 1. DETERMINISTIC MATRIX GENERATOR
// ================================================
function generateTestMatrix() {
  const matrix = [];
  
  // The Three Traffic Tiers for the paper
  const tiers = [
    { load: 100, limits: [100, 120, 150, 200, 250], normalUsers: 8, burstUsers: 2 },
    { load: 500, limits: [500, 600, 750, 1000, 1250], normalUsers: 40, burstUsers: 10 },
    { load: 1000, limits: [1000, 1200, 1500, 2000, 2500], normalUsers: 80, burstUsers: 20 }
  ];
  
  // The exact burst ratios we want to isolate
  const burstRatios = [0.10, 0.20, 0.30, 0.40, 0.50];

  for (let tier of tiers) {
    for (let ratio of burstRatios) {
      // Calculate exact mathematical loads
      let totalReq = tier.load;
      let burstReq = Math.round(totalReq * ratio);
      let normalReq = totalReq - burstReq;

      // Distribute load among users
      let reqPerNormalUser = Math.round(normalReq / tier.normalUsers);
      let reqPerBurstUser = Math.round(burstReq / tier.burstUsers);

      for (let limit of tier.limits) {
        matrix.push({
          name: `Load_${tier.load}_Burst_${ratio*100}%_Limit_${limit}`,
          targetLoad: tier.load,
          targetBurstRatio: ratio * 100,
          normalUsers: tier.normalUsers,
          burstUsers: tier.burstUsers,
          reqPerNormalUser,
          reqPerBurstUser,
          limit
        });
      }
    }
  }
  return matrix;
}

// ================================================
// 2. TIMELINE GENERATOR (ZERO RANDOMNESS)
// ================================================
function buildEventTimeline(config) {
  let events = [];
  let currentUserId = 1;

  // Schedule Normal Users (Evenly spaced clicks)
  for (let i = 0; i < config.normalUsers; i++) {
    const spacing = TEST_DURATION_MS / (config.reqPerNormalUser + 1);
    for (let r = 1; r <= config.reqPerNormalUser; r++) {
      events.push({ id: currentUserId, type: 'normal', time: Math.floor(r * spacing) });
    }
    currentUserId++;
  }

  // Schedule Burst Users (Base clicks + concentrated bursts)
  for (let i = 0; i < config.burstUsers; i++) {
    // 20% of their requests are normal browsing, 80% happens in a micro-second burst
    let baseReq = Math.max(1, Math.floor(config.reqPerBurstUser * 0.2));
    let burstReq = config.reqPerBurstUser - baseReq;

    // Spread base requests
    const spacing = TEST_DURATION_MS / (baseReq + 1);
    for (let r = 1; r <= baseReq; r++) {
      events.push({ id: currentUserId, type: 'burst', time: Math.floor(r * spacing) });
    }

    // Fire the heavy burst exactly at the 30-second mark
    for (let b = 0; b < burstReq; b++) {
      // Spaced by just 20ms to simulate a bot hammering the server
      events.push({ id: currentUserId, type: 'burst', time: 30000 + (b * 20) });
    }
    currentUserId++;
  }

  // Sort timeline chronologically
  events.sort((a, b) => a.time - b.time);
  return events;
}

// ================================================
// 3. EXECUTION ENGINE
// ================================================
async function runScenario(config) {
  console.log(`\n[Test] ${config.name}`);
  
  let stats = {};
  for (let i = 1; i <= (config.normalUsers + config.burstUsers); i++) {
    stats[i] = { type: i <= config.normalUsers ? "normal" : "burst", sent: 0, blocked: 0 };
  }

  const events = buildEventTimeline(config);
  const startTime = Date.now();

  const sendRequest = async (id, type) => {
    try {
      await axios.get(URL, { headers: { 'x-user-id': `user_${id}`, 'x-user-type': type, 'x-test-limit': config.limit } });
      stats[id].sent++;
    } catch (err) {
      stats[id].sent++;
      if (err.response && err.response.status === 429) stats[id].blocked++;
    }
  };

  // Process the timeline exactly as scheduled
  for (let event of events) {
    const timeElapsed = Date.now() - startTime;
    const timeToWait = event.time - timeElapsed;
    
    if (timeToWait > 0) {
      await new Promise(r => setTimeout(r, timeToWait));
    }
    
    // Fire request without awaiting to prevent bottlenecking the timeline
    sendRequest(event.id, event.type);
  }

  // Wait for the window to finish and network requests to clear
  const remainingTime = TEST_DURATION_MS - (Date.now() - startTime);
  if (remainingTime > 0) await new Promise(r => setTimeout(r, remainingTime));
  await new Promise(r => setTimeout(r, 3000));

  return calculateMetrics(config, stats);
}

function calculateMetrics(config, stats) {
  let totalSent = 0, totalBlocked = 0, burstSent = 0;
  let allowedArray = [];

  for (let id in stats) {
    const s = stats[id];
    totalSent += s.sent;
    totalBlocked += s.blocked;
    allowedArray.push(s.sent - s.blocked);
    if (s.type === 'burst') burstSent += s.sent;
  }

  const n = allowedArray.length;
  const sumXk = allowedArray.reduce((a, b) => a + b, 0);
  const sumXkSquared = allowedArray.reduce((a, b) => a + b * b, 0);
  const jfi = sumXkSquared > 0 ? ((sumXk * sumXk) / (n * sumXkSquared)).toFixed(4) : 1;
  const burstRatio = totalSent > 0 ? ((burstSent / totalSent) * 100).toFixed(2) : 0;
  const blockRate = totalSent > 0 ? ((totalBlocked / totalSent) * 100).toFixed(2) : 0;
  
  return {
    targetLoad: config.targetLoad,
    targetBurst: config.targetBurstRatio,
    limit: config.limit,
    avgReqPerMin: totalSent, 
    burstRatio,
    jfi,
    blockRate
  };
}

async function runAllTests() {
  const TEST_MATRIX = generateTestMatrix();
  console.log(`Starting Overnight Grid Search: ${TEST_MATRIX.length} Scenarios...`);
  
  const csvStream = fs.createWriteStream('research_results_grid_search.csv');
  csvStream.write('Target_Load,Target_Burst_%,Tested_Limit(R_max),Actual_RPM,Actual_Burst_%,JFI(J),Block_Rate_%\n');

  let count = 1;
  for (const config of TEST_MATRIX) {
    console.log(`\n--- Progress: ${count}/${TEST_MATRIX.length} ---`);
    const result = await runScenario(config);
    
    console.log(`> JFI: ${result.jfi} | Block Rate: ${result.blockRate}%`);
    
    csvStream.write(`${result.targetLoad},${result.targetBurst},${result.limit},${result.avgReqPerMin},${result.burstRatio},${result.jfi},${result.blockRate}\n`);
    
    console.log(`Cooling down server bucket for 65s...`);
    await new Promise(resolve => setTimeout(resolve, COOLDOWN_MS)); 
    count++;
  }
  
  csvStream.end();
  console.log("\nGrid Search Complete! File saved as 'research_results_grid_search.csv'");
}

runAllTests();