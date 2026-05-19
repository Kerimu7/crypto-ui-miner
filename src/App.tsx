import { useState, useEffect } from 'react';
import { 
  Activity, 
  Cpu, 
  Database, 
  Play, 
  Square, 
  Settings, 
  Terminal as TerminalIcon, 
  Zap, 
  ShieldCheck,
  RefreshCw,
  Thermometer
} from 'lucide-react';
import { Toaster, toast } from 'sonner';

import { useMiner } from './hooks/useMiner';
import { StatsCard } from './components/Miner/StatsCard';
import { HashChart } from './components/Miner/HashChart';
import { Console } from './components/Miner/Console';
import { SettingsForm } from './components/Miner/SettingsForm';
import { Button } from './components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card';
import { MinerConfig } from './types/miner';

function App() {
  const { stats, logs, start, stop, clearLogs } = useMiner();
  const [hashHistory, setHashHistory] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [config, setConfig] = useState<MinerConfig>({
    poolUrl: 'stratum+ssl://ghostrider.unmineable.com:443',
    wallet: 'Kerimu4321',
    threads: 4,
    throttle: 0,
    algorithm: 'GhostRider'
  });

  const isMining = stats.status === 'mining' || stats.status === 'connecting';

  useEffect(() => {
    if (isMining) {
      setHashHistory((prev) => [...prev.slice(-59), Math.floor(stats.hashrate)]);
    } else {
      setHashHistory((prev) => [...prev.slice(-59), 0]);
    }
  }, [stats.hashrate, isMining]);

  const handleStartStop = () => {
    if (isMining) {
      stop();
      toast.info('Mining session stopped');
    } else {
      start(config);
      toast.success('Miner starting...');
    }
  };

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const getTempColor = (temp: number) => {
    if (temp < 60) return 'text-emerald-500';
    if (temp < 80) return 'text-amber-500';
    return 'text-rose-500';
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-primary/30">
      <Toaster position="top-right" theme="dark" richColors />
      
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <img 
          src="https://storage.googleapis.com/dala-prod-public-storage/generated-images/1cf61ea5-ffd5-4a2a-bd1d-5945a924e345/mining-hero-bg-44df60e0-1779223533763.webp" 
          alt="" 
          className="w-full h-full object-cover filter blur-3xl scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/50 via-zinc-950 to-zinc-950" />
      </div>

      <div className="relative flex flex-col h-screen">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 backdrop-blur-md bg-zinc-950/30">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Cpu className="h-8 w-8 text-primary animate-pulse" />
              <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-500 animate-ping opacity-75" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter uppercase italic">
                XMRig <span className="text-primary">App</span>
              </h1>
              <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">
                Portable Hashing Core v3.1.0-APK
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="text-xs text-zinc-500 font-mono">Status</span>
              <span className={`text-xs font-bold uppercase tracking-widest ${
                stats.status === 'mining' ? 'text-emerald-500' : 
                stats.status === 'connecting' ? 'text-amber-500' : 'text-zinc-500'
              }`}>
                {stats.status}
              </span>
            </div>
            <Button 
              size="lg" 
              className={`font-bold transition-all duration-300 ${
                isMining 
                ? 'bg-rose-600 hover:bg-rose-700 shadow-[0_0_20px_rgba(225,29,72,0.4)]' 
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-[0_0_20px_rgba(5,150,105,0.4)]'
              }`}
              onClick={handleStartStop}
            >
              {isMining ? (
                <><Square className="mr-2 h-4 w-4 fill-current" /> Stop</>
              ) : (
                <><Play className="mr-2 h-4 w-4 fill-current" /> Mine</>
              )}
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-hidden p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <TabsList className="bg-zinc-900/50 border border-white/5">
                <TabsTrigger value="dashboard" className="data-[state=active]:bg-zinc-800">
                  <Activity className="mr-2 h-4 w-4" /> Monitor
                </TabsTrigger>
                <TabsTrigger value="settings" className="data-[state=active]:bg-zinc-800">
                  <Settings className="mr-2 h-4 w-4" /> Config
                </TabsTrigger>
                <TabsTrigger value="logs" className="data-[state=active]:bg-zinc-800">
                  <TerminalIcon className="mr-2 h-4 w-4" /> Logs
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center space-x-3 text-xs font-mono text-zinc-400 bg-zinc-900/30 px-3 py-1.5 rounded-full border border-white/5">
                <Thermometer className={`h-3 w-3 ${getTempColor(stats.temperature)}`} />
                <span className={getTempColor(stats.temperature)}>{stats.temperature}°C</span>
                <span className="text-zinc-600">|</span>
                <Zap className="h-3 w-3 text-amber-500" />
                <span className="truncate max-w-[150px]">{config.poolUrl.replace(/^stratum\+(ssl|tcp):\/\//, '')}</span>
              </div>
            </div>

            <TabsContent value="dashboard" className="flex-1 space-y-6 mt-0">
              <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                <StatsCard 
                  title="Hashrate" 
                  value={`${Math.floor(stats.hashrate)} H/s`} 
                  icon={<Activity className="h-5 w-5" />} 
                  description={`${config.threads} Threads active`}
                />
                <StatsCard 
                  title="Thermal" 
                  value={`${stats.temperature}°C`} 
                  icon={<Thermometer className={`h-5 w-5 ${getTempColor(stats.temperature)}`} />} 
                  description={stats.temperature > 80 ? "Critical Temp!" : "Stable Operation"}
                />
                <StatsCard 
                  title="Shares" 
                  value={stats.acceptedShares} 
                  icon={<ShieldCheck className="h-5 w-5 text-emerald-500" />} 
                  description="Confirmed on pool"
                />
                <StatsCard 
                  title="Session" 
                  value={formatUptime(stats.uptime)} 
                  icon={<RefreshCw className="h-5 w-5" />} 
                  description="Uptime duration"
                />
              </div>

              <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4 h-[calc(100vh-420px)] min-h-[400px]">
                <div className="md:col-span-2 lg:col-span-3 flex flex-col gap-6">
                  <HashChart history={hashHistory} />
                  <div className="flex-1 overflow-hidden">
                    <Console logs={logs} />
                  </div>
                </div>
                
                <div className="space-y-6">
                  <Card className="bg-primary/5 border-primary/20">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-xs font-bold uppercase tracking-wider flex items-center">
                        <Cpu className="h-4 w-4 mr-2 text-primary" /> Core Diagnostics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-3">
                      <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                        <span className="text-[10px] text-zinc-500 uppercase">Algorithm</span>
                        <span className="text-[10px] font-mono font-bold text-primary">{config.algorithm}</span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                        <span className="text-[10px] text-zinc-500 uppercase">Core Load</span>
                        <span className="text-[10px] font-mono">{(100 - config.throttle)}%</span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                        <span className="text-[10px] text-zinc-500 uppercase">Total Hashes</span>
                        <span className="text-[10px] font-mono">{stats.totalHashes.toLocaleString()}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="p-4 rounded-xl bg-zinc-900/50 border border-white/5 space-y-3">
                    <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Build Info</h4>
                    <p className="text-[9px] text-zinc-400 leading-relaxed italic">
                      This build is optimized for mobile/desktop distribution. Thermal detection is simulated based on real CPU thread load and intensity.
                    </p>
                    <div className="flex gap-2">
                       <div className="h-1 flex-1 bg-emerald-500/20 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 transition-all duration-1000" 
                            style={{ width: `${Math.min(100, stats.temperature)}%` }}
                          />
                       </div>
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full border-white/10 hover:bg-white/5 text-xs font-bold uppercase"
                    onClick={clearLogs}
                  >
                    Clear Terminal
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="mt-0 overflow-y-auto pr-2">
              <div className="max-w-4xl mx-auto pb-10">
                <SettingsForm 
                  initialConfig={config}
                  onSave={(newConfig) => {
                    setConfig(newConfig);
                    toast.success('Configuration updated successfully');
                  }} 
                  isMining={isMining}
                />
              </div>
            </TabsContent>

            <TabsContent value="logs" className="mt-0 flex-1 flex flex-col">
              <div className="flex-1 overflow-hidden">
                <Console logs={logs} />
              </div>
            </TabsContent>
          </Tabs>
        </main>

        <footer className="px-6 py-3 border-t border-white/5 bg-zinc-950/50 backdrop-blur-sm flex justify-between items-center">
          <div className="flex items-center space-x-6 text-[9px] font-mono text-zinc-500 tracking-widest uppercase">
            <span className="flex items-center">
              <div className={`h-1.5 w-1.5 rounded-full mr-2 ${stats.status === 'mining' ? 'bg-emerald-500' : 'bg-zinc-600'}`} />
              WASM Engine: Active
            </span>
            <span className="flex items-center">
              <div className="h-1.5 w-1.5 rounded-full mr-2 bg-primary" />
              API Bridge: Secure
            </span>
          </div>
          <div className="text-[9px] font-mono text-zinc-600">
            PLATFORM: ARM64-V8A
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;