import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Users, Eye, MousePointerClick } from "lucide-react";

export default function AnalyticsPage() {
  const metrics = [
    { title: "Total Views", value: "45.2K", icon: Eye, trend: "+12.5%", isPositive: true },
    { title: "Total Applicants", value: "1,204", icon: Users, trend: "+8.2%", isPositive: true },
    { title: "Click-through Rate", value: "14.3%", icon: MousePointerClick, trend: "-2.1%", isPositive: false },
    { title: "Avg. Time to Hire", value: "18 Days", icon: BarChart3, trend: "-4 Days", isPositive: true },
  ];

  const jobsData = [
    { title: "Senior Frontend Developer", views: 12040, applies: 340, rate: "2.8%" },
    { title: "Product Designer", views: 8430, applies: 180, rate: "2.1%" },
    { title: "Backend Engineer", views: 15200, applies: 420, rate: "2.7%" },
    { title: "Marketing Manager", views: 9600, applies: 264, rate: "2.75%" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-1">Detailed performance metrics for your job listings.</p>
        </div>
        <Button variant="outline">
          Download Report
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metric.value}</div>
              <p className={`text-xs mt-1 flex items-center font-medium ${metric.isPositive ? 'text-success' : 'text-destructive'}`}>
                {metric.isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingUp className="h-3 w-3 mr-1 rotate-180" />}
                {metric.trend} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Views & Applications Trends</CardTitle>
            <CardDescription>Performance over the last 30 days.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-end justify-between gap-2 pt-4">
            {/* Simple CSS simulated bar chart */}
            {[40, 60, 45, 80, 55, 90, 75, 100, 85, 120, 105, 95].map((height, i) => (
              <div key={i} className="relative w-full group flex flex-col justify-end h-full">
                <div 
                  className="bg-brand/80 group-hover:bg-brand transition-colors rounded-t-sm w-full" 
                  style={{ height: `${(height / 120) * 100}%` }}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Applicant Sources</CardTitle>
            <CardDescription>Where your candidates are coming from.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex flex-col justify-center gap-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>JobHub Internal Search</span>
                <span className="font-semibold">45%</span>
              </div>
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-brand w-[45%]" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Direct Link (Social Media)</span>
                <span className="font-semibold">30%</span>
              </div>
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-info w-[30%]" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Google Search</span>
                <span className="font-semibold">15%</span>
              </div>
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-success w-[15%]" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Other Referrals</span>
                <span className="font-semibold">10%</span>
              </div>
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-chart-2 w-[10%]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job Listing Performance</CardTitle>
          <CardDescription>Detailed stats for your active jobs.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="grid grid-cols-4 p-4 font-medium text-sm text-muted-foreground border-b bg-secondary/30">
              <div>Job Title</div>
              <div className="text-right">Total Views</div>
              <div className="text-right">Applications</div>
              <div className="text-right">Conversion Rate</div>
            </div>
            <div className="divide-y">
              {jobsData.map((job, i) => (
                <div key={i} className="grid grid-cols-4 p-4 text-sm items-center hover:bg-secondary/10 transition-colors">
                  <div className="font-medium text-foreground">{job.title}</div>
                  <div className="text-right">{job.views.toLocaleString()}</div>
                  <div className="text-right">{job.applies.toLocaleString()}</div>
                  <div className="text-right text-success font-medium">{job.rate}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
