import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Terminal, Settings2 } from 'lucide-react';
import { MinerConfig, Algorithm } from '@/types/miner';

const formSchema = z.object({
  poolUrl: z.string().min(1, 'Pool URL is required'),
  wallet: z.string().min(1, 'Wallet address is required'),
  password: z.string().optional(),
  threads: z.number().min(1).max(8),
  throttle: z.number().min(0).max(90),
  algorithm: z.enum(['RandomX', 'CryptoNight', 'Argon2id', 'GhostRider']),
});

interface SettingsFormProps {
  onSave: (config: MinerConfig) => void;
  isMining: boolean;
  initialConfig: MinerConfig;
}

export const SettingsForm = ({ onSave, isMining, initialConfig }: SettingsFormProps) => {
  const [bashCommand, setBashCommand] = useState('');
  
  const form = useForm<MinerConfig>({
    resolver: zodResolver(formSchema),
    defaultValues: initialConfig,
  });

  const parseBashCommand = () => {
    if (!bashCommand.trim()) return;

    const algoMatch = bashCommand.match(/(?:-a|--algo)\s+([^\s]+)/);
    const urlMatch = bashCommand.match(/(?:-o|--url)\s+([^\s]+)/);
    const userMatch = bashCommand.match(/(?:-u|--user)\s+([^\s]+)/);
    const passMatch = bashCommand.match(/(?:-p|--pass)\s+([^\s]+)/);
    const threadMatch = bashCommand.match(/(?:-t|--threads)\s+(\d+)/);

    const updates: Partial<MinerConfig> = {};

    if (algoMatch) {
      const algo = algoMatch[1].toLowerCase();
      if (algo.includes('rx') || algo.includes('randomx')) updates.algorithm = 'RandomX';
      else if (algo.includes('cn') || algo.includes('cryptonight')) updates.algorithm = 'CryptoNight';
      else if (algo.includes('argon')) updates.algorithm = 'Argon2id';
      else if (algo.includes('gr') || algo.includes('ghost')) updates.algorithm = 'GhostRider';
    }

    if (urlMatch) updates.poolUrl = urlMatch[1];
    if (userMatch) updates.wallet = userMatch[1];
    if (passMatch) updates.password = passMatch[1];
    if (threadMatch) updates.threads = Math.min(8, Math.max(1, parseInt(threadMatch[1])));

    // Update form fields
    Object.entries(updates).forEach(([key, value]) => {
      form.setValue(key as any, value);
    });
  };

  const onSubmit = (data: MinerConfig) => {
    onSave(data);
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-zinc-900/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center space-x-2">
          <Terminal className="h-5 w-5 text-primary" />
          <CardTitle className="text-sm uppercase tracking-wider">Manual Bash Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea 
            placeholder="./xmrig -a gr -o stratum+ssl://ghostrider.unmineable.com:443 -u Kerimu4321 -p x"
            className="font-mono text-xs h-24 bg-zinc-950 border-white/10"
            value={bashCommand}
            onChange={(e) => setBashCommand(e.target.value)}
            disabled={isMining}
          />
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full text-xs font-bold uppercase border-primary/20 hover:bg-primary/10"
            onClick={parseBashCommand}
            disabled={isMining}
          >
            Parse Command String
          </Button>
          <p className="text-[10px] text-zinc-500 italic">
            Paste your standard XMRig command above to auto-populate the fields below.
          </p>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center space-x-2">
          <Settings2 className="h-5 w-5 text-primary" />
          <CardTitle className="text-sm uppercase tracking-wider">Advanced Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="poolUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-widest text-zinc-400">Pool URL</FormLabel>
                      <FormControl>
                        <Input placeholder="stratum+tcp://..." {...field} disabled={isMining} className="bg-zinc-950/50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="algorithm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-widest text-zinc-400">Algorithm</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        disabled={isMining}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-zinc-950/50">
                            <SelectValue placeholder="Select algorithm" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="RandomX">RandomX (Monero)</SelectItem>
                          <SelectItem value="CryptoNight">CryptoNight</SelectItem>
                          <SelectItem value="Argon2id">Argon2id</SelectItem>
                          <SelectItem value="GhostRider">GhostRider</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="wallet"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-widest text-zinc-400">Wallet / Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Address or Worker Name" {...field} disabled={isMining} className="bg-zinc-950/50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="threads"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex justify-between text-xs uppercase tracking-widest text-zinc-400">
                        <span>CPU Threads</span>
                        <span className="text-primary">{field.value}</span>
                      </FormLabel>
                      <FormControl>
                        <Slider
                          min={1}
                          max={8}
                          step={1}
                          value={[field.value]}
                          onValueChange={(vals) => field.onChange(vals[0])}
                          disabled={isMining}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="throttle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex justify-between text-xs uppercase tracking-widest text-zinc-400">
                        <span>Load Limit</span>
                        <span className="text-amber-500">Throttling: {field.value}%</span>
                      </FormLabel>
                      <FormControl>
                        <Slider
                          min={0}
                          max={90}
                          step={5}
                          value={[field.value]}
                          onValueChange={(vals) => field.onChange(vals[0])}
                        />
                      </FormControl>
                      <FormDescription className="text-[10px]">Adjust throttling to control device temperature.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full font-bold uppercase tracking-widest" variant={isMining ? "secondary" : "default"}>
                {isMining ? 'Update Active Config' : 'Save Configuration'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};