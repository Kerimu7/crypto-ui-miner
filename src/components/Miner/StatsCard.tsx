import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  trend?: {
    value: number;
    isUp: boolean;
  };
}

export const StatsCard = ({ title, value, icon, description, trend }: StatsCardProps) => {
  return (
    <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:bg-card/80">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
            {description && (
              <p className="text-xs text-muted-foreground">
                {description}
                {trend && (
                  <span className={`ml-1 ${trend.isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {trend.isUp ? '↑' : '↓'} {trend.value}%
                  </span>
                )}
              </p>
            )}
          </div>
          <div className="rounded-xl bg-primary/10 p-3 text-primary">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};