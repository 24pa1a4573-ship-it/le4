import { useGetDashboardSummary, useGetRecentActivity, useGetCategoryBreakdown } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket, Users, AlertCircle, Clock, Star, Activity } from "lucide-react";
import { formatTimeAgo } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

function StatCard({ title, value, icon: Icon, valueClass }: any) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${valueClass || ''}`}>{value !== undefined ? value : '--'}</div>
      </CardContent>
    </Card>
  )
}

export default function Dashboard() {
  const { data: summary, isLoading: sumLoading } = useGetDashboardSummary();
  const { data: activity, isLoading: actLoading } = useGetRecentActivity({ limit: 10 });
  const { data: categories, isLoading: catLoading } = useGetCategoryBreakdown();

  if (sumLoading || actLoading || catLoading) {
    return <div className="text-muted-foreground animate-pulse">Loading dashboard...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Overview</h1>
        <p className="text-muted-foreground mt-1">Real-time status of your support operations.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Open Tickets" value={summary?.openTickets} icon={Ticket} />
        <StatCard title="Urgent Tickets" value={summary?.urgentTickets} icon={AlertCircle} valueClass="text-destructive" />
        <StatCard title="Avg Resolution" value={summary?.avgResolutionHours ? `${summary.avgResolutionHours}h` : '--'} icon={Clock} />
        <StatCard title="Satisfaction" value={summary?.averageRating ? `${summary.averageRating.toFixed(1)} / 5` : '--'} icon={Star} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Recent Activity
          </h2>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {activity?.map((item) => (
                  <div key={`${item.type}-${item.id}-${item.timestamp}`} className="p-4 flex items-start gap-4 hover:bg-muted/30 transition-colors">
                    <div className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{item.title}</p>
                      <p className="text-sm text-muted-foreground truncate">{item.subtitle}</p>
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatTimeAgo(item.timestamp)}
                    </div>
                  </div>
                ))}
                {!activity?.length && (
                  <div className="p-8 text-center text-muted-foreground">No recent activity</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-4">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <Ticket className="w-5 h-5 text-primary" />
            Categories
          </h2>
          <Card>
            <CardContent className="p-4 space-y-4">
              {categories?.map(cat => (
                <div key={cat.category} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{cat.category}</span>
                  <Badge variant="secondary">{cat.count}</Badge>
                </div>
              ))}
              {!categories?.length && (
                <div className="text-sm text-muted-foreground text-center py-4">No data available</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
