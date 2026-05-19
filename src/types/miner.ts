export type Algorithm = 'RandomX' | 'CryptoNight' | 'Argon2id' | 'GhostRider';

export interface MinerConfig {
  poolUrl: string;
  wallet: string;
  password?: string;
  threads: number;
  throttle: number; // 0-100%
  algorithm: Algorithm;
}

export interface MinerStats {
  hashrate: number;
  totalHashes: number;
  acceptedShares: number;
  rejectedShares: number;
  uptime: number;
  status: 'idle' | 'connecting' | 'mining' | 'error';
  temperature: number; // Simulated Celsius
  lastLog?: string;
}

export interface MinerMessage {
  type: 'STATS' | 'LOG' | 'ERROR';
  payload: any;
}

export interface UICommand {
  type: 'START' | 'STOP' | 'UPDATE_CONFIG';
  payload?: any;
}