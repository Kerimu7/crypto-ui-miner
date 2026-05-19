import { MinerConfig, MinerStats } from '../types/miner';

let config: MinerConfig = {
  poolUrl: '',
  wallet: '',
  threads: 1,
  throttle: 0,
  algorithm: 'RandomX'
};

let stats: MinerStats = {
  hashrate: 0,
  totalHashes: 0,
  acceptedShares: 0,
  rejectedShares: 0,
  uptime: 0,
  status: 'idle',
  temperature: 32 // Starting at ambient
};

let mining = false;
let startTime = 0;
let lastHashUpdate = 0;
let hashesSinceUpdate = 0;
let currentTemperature = 32;
const ambientTemp = 32;

const log = (message: string) => {
  self.postMessage({ type: 'LOG', payload: `[${new Date().toLocaleTimeString()}] ${message}` });
};

const updateStats = () => {
  const now = Date.now();
  
  // Simulated Thermal Logic
  // Heat builds up based on threads and intensity
  // Dissipates towards ambient when idle or low load
  const loadFactor = mining ? (config.threads / 8) * (1 - config.throttle / 100) : 0;
  const targetTemp = ambientTemp + (loadFactor * 55); // Max ~87C at full load
  
  // Smooth temperature transition
  if (currentTemperature < targetTemp) {
    currentTemperature += 0.2;
  } else if (currentTemperature > targetTemp) {
    currentTemperature -= 0.1;
  }
  
  stats.temperature = Math.round(currentTemperature * 10) / 10;

  if (mining) {
    const elapsed = (now - lastHashUpdate) / 1000;
    if (elapsed >= 1) {
      stats.hashrate = (hashesSinceUpdate / elapsed) * config.threads;
      stats.uptime = Math.floor((now - startTime) / 1000);
      hashesSinceUpdate = 0;
      lastHashUpdate = now;
      self.postMessage({ type: 'STATS', payload: { ...stats } });
    }
  } else {
    self.postMessage({ type: 'STATS', payload: { ...stats } });
  }
};

const hashLoop = async () => {
  if (!mining) return;

  // Real CPU usage simulation
  const data = new Uint8Array(32);
  crypto.getRandomValues(data);
  
  try {
    // Perform multiple hashes per loop based on requested threads to increase load
    for (let i = 0; i < config.threads; i++) {
       await crypto.subtle.digest('SHA-256', data);
    }
    hashesSinceUpdate++;
    stats.totalHashes += config.threads;
  } catch (e) {
    // Ignore hashing errors
  }

  // Handle throttling
  if (config.throttle > 0) {
    await new Promise(resolve => setTimeout(resolve, config.throttle));
  }

  // Schedule next hash
  if (mining) {
    setTimeout(hashLoop, 10);
  }
};

const connectToPool = () => {
  if (!config.poolUrl) {
    log('Error: No pool URL provided');
    stats.status = 'error';
    updateStats();
    return;
  }

  log(`Connecting to pool: ${config.poolUrl}...`);
  stats.status = 'connecting';
  updateStats();

  setTimeout(() => {
    log('Connected to Stratum proxy (WSS)');
    log(`Authorized wallet: ${config.wallet.substring(0, 12)}...`);
    log(`Algorithm: ${config.algorithm} | Threads: ${config.threads}`);
    stats.status = 'mining';
    startTime = Date.now();
    lastHashUpdate = startTime;
    mining = true;
    hashLoop();
    updateStats();
    
    // Simulate share acceptance
    const shareInterval = setInterval(() => {
      if (!mining) {
        clearInterval(shareInterval);
        return;
      }
      if (Math.random() > 0.8) {
        stats.acceptedShares++;
        log(`Accepted share from ${config.poolUrl}`);
        updateStats();
      }
    }, 12000);
  }, 1500);
};

self.onmessage = (e: MessageEvent) => {
  const { type, payload } = e.data;

  switch (type) {
    case 'START':
      if (mining) return;
      config = payload;
      connectToPool();
      break;
    case 'STOP':
      mining = false;
      stats.status = 'idle';
      stats.hashrate = 0;
      log('Mining stopped by user');
      updateStats();
      break;
    case 'UPDATE_CONFIG':
      config = { ...config, ...payload };
      log(`Configuration updated: Threads=${config.threads}, Throttle=${config.throttle}%`);
      break;
  }
};

// Periodic stat reporting
setInterval(updateStats, 1000);