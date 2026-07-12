// // simulate-activity.js
// const CONFIG = {
//   BASE_URL: process.env.API_BASE_URL || 'http://localhost:3000',
//   ACTIVITY_INTERVAL: 5000,
//   AI_REQUEST_INTERVAL: 15000,
//   VARIABILITY: 0.3,
//   TOKEN_REFRESH_INTERVAL: 55 * 60 * 1000, // Refresh tokens every 55 min (before JWT exp)
  
//   SUBJECTS: ['Math', 'History', 'General', 'Science'],
//   AUTH_RATIO: 0.8,
  
//   REAL_TOKENS: [],
//   MOCK_USERS: [
//     { email: 'test1@example.com', password: 'password123' },
//     { email: 'test2@example.com', password: 'password123' },
//     // Add more test users
//   ],
// };

// // Platform distribution
// const PLATFORMS = {
//   desktop: 0.20,
//   ios: 0.10,
//   android: 0.55,
// };

// const NETWORK_TYPES = {
//   wifi: 0.50,
//   '4g': 0.35,
//   '5g': 0.10,
//   '3g': 0.05,
// };

// let simulationActive = false;
// let intervalIds = [];

// /**
//  * 🔐 Fetch real tokens from API
//  */
// async function fetchRealTokens() {
//   if (CONFIG.REAL_TOKENS.length > 0) return;

//   console.log('🔑 Authenticating test users...');
  
//   for (const user of CONFIG.MOCK_USERS) {
//     try {
//       const res = await fetch(`${CONFIG.BASE_URL}/api/login`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(user),
//       });

//       if (res.ok) {
//         const data = await res.json();
//         if (data.token) {
//           CONFIG.REAL_TOKENS.push({
//             token: data.token,
//             email: user.email,
//             password: user.password,
//             obtainedAt: Date.now(),
//           });
//           console.log(`  ✓ Token acquired: ${user.email}`);
//         }
//       }
//     } catch (err) {
//       console.error(`  ✗ Login failed for ${user.email}: ${err.message}`);
//     }
//   }
// }

// /**
//  * Refresh expired tokens
//  */
// async function refreshTokens() {
//   const now = Date.now();
  
//   for (let i = 0; i < CONFIG.REAL_TOKENS.length; i++) {
//     const tokenObj = CONFIG.REAL_TOKENS[i];
//     if (now - tokenObj.obtainedAt > 50 * 60 * 1000) { // Older than 50 min
//       try {
//         const res = await fetch(`${CONFIG.BASE_URL}/api/login`, {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({
//             email: tokenObj.email,
//             password: tokenObj.password,
//           }),
//         });

//         if (res.ok) {
//           const data = await res.json();
//           CONFIG.REAL_TOKENS[i].token = data.token;
//           CONFIG.REAL_TOKENS[i].obtainedAt = now;
//           console.log(`  🔄 Token refreshed: ${tokenObj.email}`);
//         }
//       } catch (err) {
//         console.error(`  ✗ Token refresh failed: ${err.message}`);
//       }
//     }
//   }
// }

// function randomChoice(arr) {
//   return arr[Math.floor(Math.random() * arr.length)];
// }

// function randomPlatform() {
//   const rand = Math.random();
//   let cumulative = 0;
//   for (const [platform, weight] of Object.entries(PLATFORMS)) {
//     cumulative += weight;
//     if (rand <= cumulative) return platform;
//   }
//   return 'desktop';
// }

// function randomNetworkType() {
//   const rand = Math.random();
//   let cumulative = 0;
//   for (const [type, weight] of Object.entries(NETWORK_TYPES)) {
//     cumulative += weight;
//     if (rand <= cumulative) return type;
//   }
//   return 'wifi';
// }

// function getRandomToken() {
//   if (CONFIG.REAL_TOKENS.length === 0) return null;
//   return Math.random() < CONFIG.AUTH_RATIO 
//     ? randomChoice(CONFIG.REAL_TOKENS).token 
//     : null;
// }

// function applyVariability(baseInterval) {
//   const variance = baseInterval * CONFIG.VARIABILITY;
//   return baseInterval + (Math.random() * variance * 2 - variance);
// }

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
//  * Make HTTP request with platform headers
//  */
// async function makeRequest(method, path, body = null, token = null) {
//   const headers = {
//     'Content-Type': 'application/json',
//     'X-Client-Platform': randomPlatform(),
//     'X-Network-Type': randomNetworkType(),
//   };

//   if (token) {
//     headers['Authorization'] = `Bearer ${token}`;
//   }

//   const fetchOptions = { method, headers };
//   if (body) {
//     fetchOptions.body = JSON.stringify(body);
//   }

//   try {
//     const startTime = Date.now();
//     const response = await fetch(`${CONFIG.BASE_URL}${path}`, fetchOptions);
//     const duration = Date.now() - startTime;

//     const isAuth = !!token;
//     const status = response.status;
//     console.log(
//       `✓ ${method.padEnd(4)} ${path.padEnd(20)} ${status} (${duration}ms) ${isAuth ? '[Auth]' : '[Guest]'}`
//     );

//     return response;
//   } catch (error) {
//     console.error(`✗ ${method} ${path} - ${error.message}`);
//     return null;
//   }
// }

// const MOCK_QUESTIONS = [
//   'What is the capital of the Philippines?',
//   'How does photosynthesis work?',
//   'Explain the Pythagorean theorem',
//   'What caused World War I?',
//   'Define mitochondria',
//   'How do I solve quadratic equations?',
//   'What is gravity?',
//   'Who was Heneral Luna?',
//   'What is the periodic table?',
//   'How does DNA replication work?',
// ];

// /**
//  * Simulate realistic HTTP traffic
//  */
// async function simulateHttpRequest() {
//   const endpoints = [
//     { method: 'GET', path: '/api/subjects', weight: 0.10 },
//     {
//       method: 'POST',
//       path: '/api/messages',
//       weight: 0.50,
//       body: () => ({
//         text: randomChoice(MOCK_QUESTIONS),
//         isUser: true,
//         subject: randomChoice(CONFIG.SUBJECTS),
//       }),
//     },
//     { method: 'GET', path: '/api/messages', weight: 0.15 },
//     {
//       method: 'POST',
//       path: '/api/materials',
//       weight: 0.15,
//       body: () => ({
//         subject: randomChoice(CONFIG.SUBJECTS),
//         topic: generateRandomString(10, 50),
//         content: generateRandomString(100, 500),
//       }),
//     },
//     { method: 'GET', path: '/api/materials', weight: 0.10 },
//   ];

//   // Weighted selection
//   const rand = Math.random();
//   let cumWeight = 0;
//   let chosen = endpoints[0];
//   for (const ep of endpoints) {
//     cumWeight += ep.weight;
//     if (rand <= cumWeight) {
//       chosen = ep;
//       break;
//     }
//   }

//   const token = getRandomToken();
//   await makeRequest(
//     chosen.method,
//     chosen.path,
//     chosen.body ? chosen.body() : null,
//     token
//   );
// }

// /**
//  * Message clustering (burst of messages)
//  */
// async function simulateMessageCluster() {
//   console.log('\n📊 Simulating message cluster...');
//   const clusterSize = Math.floor(Math.random() * 3) + 2;

//   for (let i = 0; i < clusterSize; i++) {
//     const token = getRandomToken();
//     await makeRequest('POST', '/api/messages', {
//       text: randomChoice(MOCK_QUESTIONS),
//       isUser: true,
//       subject: randomChoice(CONFIG.SUBJECTS),
//     }, token);
    
//     await new Promise(resolve => setTimeout(resolve, 500));
//   }
// }

// /**
//  * Simulate user profile interaction
//  */
// async function simulateProfileActivity() {
//   const token = CONFIG.REAL_TOKENS.length > 0 ? randomChoice(CONFIG.REAL_TOKENS).token : null;
//   if (!token) return;

//   // Alternate between GET and POST profile updates
//   if (Math.random() < 0.6) {
//     await makeRequest('GET', '/api/profile', null, token);
//   } else {
//     await makeRequest('POST', '/api/profile', {
//       preferences: { theme: 'dark', notifications: true },
//     }, token);
//   }
// }

// /**
//  * Main activity loop
//  */
// async function runActivityLoop() {
//   if (!simulationActive) return;

//   const rand = Math.random();
  
//   if (rand < 0.15) {
//     await simulateMessageCluster();
//   } else if (rand < 0.20) {
//     await simulateProfileActivity();
//   } else {
//     await simulateHttpRequest();
//   }

//   const nextInterval = applyVariability(CONFIG.ACTIVITY_INTERVAL);
//   const id = setTimeout(() => runActivityLoop(), nextInterval);
//   intervalIds.push(id);
// }

// /**
//  * Start simulation
//  */
// export async function startSimulation() {
//   if (simulationActive) {
//     console.log('ℹ️  Simulation already running');
//     return;
//   }

//   await fetchRealTokens();

//   if (CONFIG.REAL_TOKENS.length === 0) {
//     console.error('❌ No valid tokens. Check SIM_USERS config.');
//     return;
//   }

//   simulationActive = true;
//   console.log('\n🚀 Starting activity simulation...\n');
//   console.log(`   Auth Token Count: ${CONFIG.REAL_TOKENS.length}`);
//   console.log(`   Activity Interval: ${CONFIG.ACTIVITY_INTERVAL}ms (±${Math.round(CONFIG.VARIABILITY * 100)}%)`);
//   console.log(`   Base URL: ${CONFIG.BASE_URL}\n`);

//   runActivityLoop();

//   // Refresh tokens periodically
//   const refreshId = setInterval(refreshTokens, CONFIG.TOKEN_REFRESH_INTERVAL);
//   intervalIds.push(refreshId);
// }

// export function stopSimulation() {
//   if (!simulationActive) {
//     console.log('ℹ️  Simulation not running');
//     return;
//   }

//   simulationActive = false;
//   intervalIds.forEach(id => clearTimeout(id) || clearInterval(id));
//   intervalIds = [];
//   console.log('⏹️  Simulation stopped\n');
// }

// export async function triggerActivity(type = 'general') {
//   switch (type) {
//     case 'message':
//       await simulateHttpRequest();
//       break;
//     case 'cluster':
//       await simulateMessageCluster();
//       break;
//     case 'profile':
//       await simulateProfileActivity();
//       break;
//     default:
//       await simulateHttpRequest();
//   }
// }

// export async function triggerActivityBurst(count = 10) {
//   console.log(`\n⚡ Triggering burst (${count} requests)...\n`);
//   for (let i = 0; i < count; i++) {
//     await triggerActivity('general');
//     await new Promise(resolve => setTimeout(resolve, 300));
//   }
//   console.log('');
// }
