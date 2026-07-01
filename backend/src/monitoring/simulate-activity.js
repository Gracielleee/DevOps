// // NOTE: Untested. Using Postman for traffic simulation in the meantime

// /**
//  * Activity Simulator for Monitoring Dashboard
//  * Run directly: node simulate-activity.js
//  * 
//  * Features:
//  * - Continuous mode (background intervals)
//  * - Manual trigger mode (call functions directly)
//  * - Message clustering for realistic patterns
//  */

// // Configuration
// const CONFIG = {
//   BASE_URL: process.env.API_BASE_URL || 'http://localhost:3000',
//   ACTIVITY_INTERVAL: 5000, // 5 seconds
//   AI_REQUEST_INTERVAL: 15000, // 15 seconds
//   VARIABILITY: 0.3, // ±30% randomness
  
//   SUBJECTS: ['Math', 'History', 'General', 'Science'],
//   AUTH_RATIO: 0.8, // 80% authenticated, 20% guest
  
//   //Populated with actual valid tokens via fetch at startup
//   REAL_TOKENS: [],
// };

// // Mock question data
// const MOCK_QUESTIONS = [
//   'What is the capital of France?',
//   'How does photosynthesis work?',
//   'Explain the Pythagorean theorem',
//   'What caused World War I?',
//   'Define mitochondria',
//   'How do I solve quadratic equations?',
//   'What is gravity?',
//   'Who was Napoleon Bonaparte?',
//   'What is the periodic table?',
//   'How does DNA replication work?',
//   'What is the greenhouse effect?',
//   'Explain the water cycle',
//   'What is calculus?',
//   'How do ecosystems work?',
//   'Define photosynthesis briefly',
//   'What is evolution?',
//   'How do I calculate percentages?',
//   'What is renewable energy?',
//   'Explain osmosis',
//   'What is the Renaissance?',
// ];

// // Simulation state
// let simulationActive = false;
// let intervalIds = [];

// /**
//  * 🔐 Bootstrap Auth Task: Logs users in and populates the dynamic token pool
//  */
// async function fetchRealTokens() {
//   if (CONFIG.REAL_TOKENS.length > 0) return; // Tokens already cached

//   console.log('🔑 Authenticating simulation test users against API...');
//   try {
//     const users = JSON.parse(process.env.SIM_USERS || '[]');
    
//     for (const user of users) {
//       const res = await fetch(`${CONFIG.BASE_URL}/api/login`, { 
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email: user.email, password: user.pass })
//       });

//       if (res.ok) {
//         const data = await res.json();
//         if (data.token) {
//           CONFIG.REAL_TOKENS.push(data.token);
//           console.log(` Token acquired for: ${user.email}`);
//         }
//       } else {
//         console.error(`Login failed for ${user.email} (Status: ${res.status})`);
//       }
//     }
//   } catch (err) {
//     console.error('Critical: Failed to bootstrap active tokens pool:', err.message);
//   }
// }

// /**
//  * Generate random string of specified length
//  */
// function generateRandomString(minLength, maxLength) {
//   const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
//   const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,!?;:\'"';
//   let result = '';
//   for (let i = 0; i < length; i++) {
//     result += chars.charAt(Math.floor(Math.random() * chars.length));
//   }
//   return result;
// }

// /**
//  * Get random element from array
//  */
// function randomChoice(arr) {
//   return arr[Math.floor(Math.random() * arr.length)];
// }

// /**
//  * Get random JWT token from the list(80% auth, 20% null for guests)
//  */
// function getRandomToken() {
//   if (CONFIG.REAL_TOKENS.length === 0) return null;
//   return Math.random() < CONFIG.AUTH_RATIO ? randomChoice(CONFIG.REAL_TOKENS) : null;
// }

// /**
//  * Add variability to interval (±30%)
//  */
// function applyVariability(baseInterval) {
//   const variance = baseInterval * CONFIG.VARIABILITY;
//   return baseInterval + (Math.random() * variance * 2 - variance);
// }

// /**
//  * Simulate HTTP requests across endpoints
//  */
// async function simulateHttpRequest() {
//   try {
//     const endpoints = [
//       {
//         method: 'GET',
//         path: '/subjects/',
//         weight: 0.15, // 15% of requests
//       },
//       {
//         method: 'POST',
//         path: '/messages/',
//         weight: 0.55, // 55% of requests
//         body: () => ({
//           text: randomChoice(MOCK_QUESTIONS),
//           isUser: true,
//           subject: randomChoice(CONFIG.SUBJECTS),
//         }),
//       },
//       {
//         method: 'GET',
//         path: '/messages/',
//         weight: 0.15,
//       },
//       {
//         method: 'POST',
//         path: '/materials/',
//         weight: 0.10,
//         body: () => ({
//           subject: randomChoice(CONFIG.SUBJECTS),
//           topic: `Topic: ${generateRandomString(10, 30)}`,
//           content: generateRandomString(49, 3210),
//         }),
//       },
//       {
//         method: 'GET',
//         path: '/materials/',
//         weight: 0.05,
//       },
//     ];

//     // Choose endpoint weighted by probability
//     const random = Math.random();
//     let cumWeight = 0;
//     let chosenEndpoint = endpoints[0];

//     for (const endpoint of endpoints) {
//       cumWeight += endpoint.weight;
//       if (random <= cumWeight) {
//         chosenEndpoint = endpoint;
//         break;
//       }
//     }

//     const token = getRandomToken();
//     const headers = {
//       'Content-Type': 'application/json',
//     };

//     if (token) {
//       headers['Authorization'] = `Bearer ${token}`;
//     }

//     const fetchOptions = {
//       method: chosenEndpoint.method,
//       headers,
//       timeout: 5000,
//     };

//     if (chosenEndpoint.body) {
//       fetchOptions.body = JSON.stringify(chosenEndpoint.body());
//     }

//     const response = await fetch(`${CONFIG.BASE_URL}${chosenEndpoint.path}`, fetchOptions);

//     console.log(
//       `✓ ${chosenEndpoint.method} ${chosenEndpoint.path} - ${response.status}`,
//       token ? '(Auth)' : '(Guest)'
//     );
//   } catch (error) {
//     console.error(`✗ HTTP Request failed: ${error.message}`);
//   }
// }

// /**
//  * Simulate message clustering (burst of messages)
//  */
// async function simulateMessageCluster() {
//   console.log('\n📊 Simulating message cluster...');
//   const clusterSize = Math.floor(Math.random() * 3) + 2; // 2-4 messages

//   for (let i = 0; i < clusterSize; i++) {
//     await simulateHttpRequest();
//     await new Promise(resolve => setTimeout(resolve, 500)); // 500ms between cluster messages
//   }
// }

// /**
//  * Simulate AI response (lower frequency to preserve API quota)
//  */
// async function simulateAiResponse() {
//   try {
//     const token = randomChoice(CONFIG.MOCK_TOKENS); // Auth only

//     const response = await fetch(`${CONFIG.BASE_URL}/messages/`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${token}`,
//       },
//       body: JSON.stringify({
//         text: randomChoice(MOCK_QUESTIONS),
//         isUser: true,
//         subject: randomChoice(CONFIG.SUBJECTS),
//       }),
//       timeout: 10000,
//     });

//     console.log(`✓ AI Request - ${response.status} (Real API response time captured)`);
//   } catch (error) {
//     console.error(`✗ AI Request failed: ${error.message}`);
//   }
// }

// /**
//  * Main activity loop
//  */
// async function runActivityLoop() {
//   if (!simulationActive) return;

//   // Decide if this is a clustering moment (20% chance)
//   if (Math.random() < 0.2) {
//     await simulateMessageCluster();
//   } else {
//     await simulateHttpRequest();
//   }

//   // Schedule next activity with variability
//   const nextInterval = applyVariability(CONFIG.ACTIVITY_INTERVAL);
//   const id = setTimeout(() => runActivityLoop(), nextInterval);
//   intervalIds.push(id);
// }

// /**
//  * Start continuous simulation
//  */
// export async function startSimulation() {
//   if (simulationActive) {
//     console.log('ℹ️  Simulation already running');
//     return;
//   }

//   await fetchRealTokens();

//   if (CONFIG.REAL_TOKENS.length === 0) {
//     console.error('❌ Aborting: Cannot start simulation because zero tokens were verified.');
//     return;
//   }

//   simulationActive = true;
//   console.log('\n🚀 Starting activity simulation...');
//   console.log(`   - Activity interval: ${CONFIG.ACTIVITY_INTERVAL}ms (±${Math.round(CONFIG.VARIABILITY * 100)}%)`);
//   console.log(`   - AI requests every: ${CONFIG.AI_REQUEST_INTERVAL}ms`);
//   console.log(`   - Auth/Guest ratio: ${Math.round(CONFIG.AUTH_RATIO * 100)}/${Math.round((1 - CONFIG.AUTH_RATIO) * 100)}`);
//   console.log(`   - Subjects: ${CONFIG.SUBJECTS.join(', ')}`);
//   console.log(`   - Base URL: ${CONFIG.BASE_URL}\n`);

//   // Start activity loop
//   runActivityLoop();

//   // Start AI request loop (less frequent)
//   const aiIntervalId = setInterval(() => {
//     if (simulationActive) {
//       simulateAiResponse();
//     }
//   }, applyVariability(CONFIG.AI_REQUEST_INTERVAL));

//   intervalIds.push(aiIntervalId);
// }

// /**
//  * Stop continuous simulation
//  */
// export function stopSimulation() {
//   if (!simulationActive) {
//     console.log('ℹ️  Simulation not running');
//     return;
//   }

//   simulationActive = false;
//   intervalIds.forEach(id => clearTimeout(id) || clearInterval(id));
//   intervalIds = [];

//   console.log('⏹️  Activity simulation stopped\n');
// }

// /**
//  * Trigger a single activity manually
//  */
// export async function triggerActivity(type = 'general') {
//   switch (type) {
//     case 'message':
//       await simulateHttpRequest();
//       break;
//     case 'cluster':
//       await simulateMessageCluster();
//       break;
//     case 'ai':
//       await simulateAiResponse();
//       break;
//     case 'general':
//     default:
//       await simulateHttpRequest();
//       break;
//   }
// }

// /**
//  * Trigger multiple activities at once
//  */
// export async function triggerActivityBurst(count = 5) {
//   console.log(`\n⚡ Triggering activity burst (${count} requests)...\n`);
//   for (let i = 0; i < count; i++) {
//     await triggerActivity('general');
//     await new Promise(resolve => setTimeout(resolve, 200)); // 200ms spacing
//   }
// }

// /**
//  * Get simulation status
//  */
// export function getSimulationStatus() {
//   return {
//     isActive: simulationActive,
//     activityInterval: CONFIG.ACTIVITY_INTERVAL,
//     aiInterval: CONFIG.AI_REQUEST_INTERVAL,
//     subjects: CONFIG.SUBJECTS,
//     authRatio: CONFIG.AUTH_RATIO,
//     variability: CONFIG.VARIABILITY,
//   };
// }

// /**
//  * Update configuration
//  */
// export function updateConfig(updates) {
//   Object.assign(CONFIG, updates);
//   console.log('✓ Configuration updated:', updates);
// }

// // ============================================
// // CLI MODE - Run directly with: node simulate-activity.js
// // ============================================
// if (import.meta.url === `file://${process.argv[1]}`) {
//   const command = process.argv[2];

//   if (['start', 'burst', 'trigger'].includes(command)) {
//     await fetchRealTokens();
//   }

//   switch (command) {
//     case 'stop':
//       stopSimulation();
//       process.exit(0);
//       break;
//     case 'burst':
//       const count = parseInt(process.argv[3]) || 10;
//       triggerActivityBurst(count).then(() => process.exit(0));
//       break;
//     case 'trigger':
//       const type = process.argv[3] || 'general';
//       triggerActivity(type).then(() => process.exit(0));
//       break;
//     case 'status':
//       console.log('Status:', getSimulationStatus());
//       process.exit(0);
//       break;
//     case 'start':
//     default:
//       if (CONFIG.REAL_TOKENS.length === 0) {
//         console.error('❌ Direct initialization stopped: Missing credentials configuration mapping.');
//         process.exit(1);
//       }
//   }
// }

// export default {
//   startSimulation,
//   stopSimulation,
//   triggerActivity,
//   triggerActivityBurst,
//   getSimulationStatus,
//   updateConfig,
// };
