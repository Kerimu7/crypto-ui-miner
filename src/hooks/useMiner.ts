import { useState, useEffect, useCallback, useRef } from 'react';
import { MinerConfig, MinerStats } from '../types/miner';

export const useMiner = () => {
  const [stats, setStats] = useState<MinerStats>({
    hashrate: 0,
    totalHashes: 0,
    acceptedShares: 0,
    rejectedShares: 0,
    uptime: 0,
    status: 'idle',
    temperature: 32
  });
  const [logs, setLogs] = useState<string[]>([]);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    // Initialize worker
    workerRef.current = new Worker(new URL('../workers/miner.worker.ts', import.meta.url), {
      type: 'module'
    });

    workerRef.current.onmessage = (e) => {
      const { type, payload } = e.data;
      if (type === 'STATS') {
        setStats(payload);
      } else if (type === 'LOG') {
        setLogs((prev) => [...prev.slice(-99), payload]);
      } else if (type === 'ERROR') {
        console.error('Miner Error:', payload);
      }
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const start = useCallback((config: MinerConfig) => {
    workerRef.current?.postMessage({ type: 'START', payload: config });
  }, []);

  const stop = useCallback(() => {
    workerRef.current?.postMessage({ type: 'STOP' });
  }, []);

  const updateConfig = useCallback((config: Partial<MinerConfig>) => {
    workerRef.current?.postMessage({ type: 'UPDATE_CONFIG', payload: config });
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  return {
    stats,
    logs,
    start,
    stop,
    updateConfig,
    clearLogs
  };
};