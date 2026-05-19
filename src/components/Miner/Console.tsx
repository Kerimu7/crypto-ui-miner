import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Terminal } from 'lucide-react';

interface ConsoleProps {
  logs: string[];
}

export const Console = ({ logs }: ConsoleProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <Card className="border-border/50 bg-zinc-950 text-zinc-50">
      <CardHeader className="flex flex-row items-center space-x-2 border-b border-zinc-800 bg-zinc-900/50 p-3">
        <Terminal className="h-4 w-4 text-emerald-500" />
        <CardTitle className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
          Miner Output Console
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div 
          ref={scrollRef}
          className="h-[300px] overflow-y-auto p-4 font-mono text-xs leading-relaxed scrollbar-thin scrollbar-thumb-zinc-800"
        >
          {logs.length === 0 ? (
            <div className="text-zinc-600 italic">Waiting for miner to start...</div>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="mb-1">
                <span className="text-zinc-500 mr-2"></span>
                <span className={
                  log.includes('Error') ? 'text-rose-400' : 
                  log.includes('accepted') ? 'text-emerald-400 font-bold' : 
                  'text-zinc-300'
                }>
                  {log}
                </span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};