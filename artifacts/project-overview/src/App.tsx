import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { 
  CheckCircle2, 
  Users, 
  ShieldCheck, 
  Headset, 
  ListChecks, 
  BarChart3, 
  MessageSquare,
  Lock,
  Mail,
  Search,
  LayoutDashboard,
  Smartphone,
  Database,
  Code2
} from 'lucide-react';

const queryClient = new QueryClient();

function Synopsis() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <div className="max-w-4xl mx-auto px-6 py-16 md:py-24">
        
        {/* Cover Block */}
        <header className="mb-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-block mb-4 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium tracking-wide">
            Project Synopsis
          </div>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight mb-6">
            Customer Care Registry
            <span className="block text-2xl md:text-3xl text-muted-foreground mt-4 font-medium">
              Smart Customer Support Management System
            </span>
          </h1>
          <div className="w-24 h-1 bg-primary mx-auto rounded-full mt-10"></div>
        </header>

        <main className="space-y-24">
          
          {/* Project Description */}
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-both">
            <h2 className="font-heading text-3xl font-semibold mb-6 flex items-center gap-3">
              <span className="text-primary"><ListChecks size={28} /></span>
              Project Description
            </h2>
            <div className="prose prose-lg prose-slate dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
              <p>
                A Customer Care Registry is a centralized system that records and manages customer interactions, issues, and feedback. It enables businesses to streamline support processes, track inquiries, and analyze trends to enhance service quality. By maintaining a comprehensive history of customer interactions, the registry ensures consistency in responses, identifies recurring pain points, and aids in proactive issue resolution.
              </p>
              <p>
                With data-driven insights, businesses can refine training programs, optimize service protocols, and offer personalized support, ultimately improving customer satisfaction and loyalty. In a competitive landscape, a Customer Care Registry serves as a crucial tool for fostering trust, efficiency, and long-term customer relationships.
              </p>
            </div>
          </section>

          {/* Objectives */}
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both">
            <h2 className="font-heading text-3xl font-semibold mb-8 flex items-center gap-3">
              <span className="text-primary"><CheckCircle2 size={28} /></span>
              Objectives
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "Register customer complaints and feedback.",
                "Track complaint status in real time.",
                "Assign complaints to support agents.",
                "Maintain customer interaction history.",
                "Generate reports and analytics.",
                "Improve customer satisfaction through faster resolutions."
              ].map((objective, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border/50 shadow-sm transition-all hover:shadow-md hover:border-border">
                  <div className="mt-1 text-primary shrink-0">
                    <CheckCircle2 size={20} />
                  </div>
                  <p className="text-card-foreground font-medium">{objective}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Modules */}
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500 fill-mode-both">
            <h2 className="font-heading text-3xl font-semibold mb-10 flex items-center gap-3">
              <span className="text-primary"><Database size={28} /></span>
              System Modules
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Module 1 */}
              <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm flex flex-col h-full">
                <div className="bg-primary/5 p-6 border-b border-border">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
                    <Users size={24} />
                  </div>
                  <h3 className="font-heading text-xl font-semibold">1. Customer Module</h3>
                </div>
                <div className="p-6 flex-1">
                  <ul className="space-y-3">
                    {["Customer Registration & Login", "Submit Complaint", "Track Complaint Status", "View Complaint History", "Provide Feedback"].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Module 2 */}
              <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm flex flex-col h-full relative">
                <div className="bg-primary/5 p-6 border-b border-border">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
                    <ShieldCheck size={24} />
                  </div>
                  <h3 className="font-heading text-xl font-semibold">2. Admin Module</h3>
                </div>
                <div className="p-6 flex-1">
                  <ul className="space-y-3">
                    {["Secure Login", "Dashboard", "View All Complaints", "Assign Complaints", "Update Complaint Status", "Manage Customers", "View Reports"].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Module 3 */}
              <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm flex flex-col h-full">
                <div className="bg-primary/5 p-6 border-b border-border">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
                    <Headset size={24} />
                  </div>
                  <h3 className="font-heading text-xl font-semibold">3. Support Agent Module</h3>
                </div>
                <div className="p-6 flex-1">
                  <ul className="space-y-3">
                    {["Login", "View Assigned Tickets", "Update Ticket Progress", "Close Complaint", "Respond to Customers"].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-700 fill-mode-both">
            <h2 className="font-heading text-3xl font-semibold mb-8 flex items-center gap-3">
              <span className="text-primary"><LayoutDashboard size={28} /></span>
              Key Features
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { name: "User Auth", icon: <Lock size={20} /> },
                { name: "Complaint Registration", icon: <MessageSquare size={20} /> },
                { name: "Ticket Management", icon: <ListChecks size={20} /> },
                { name: "Complaint Tracking", icon: <BarChart3 size={20} /> },
                { name: "Customer Feedback", icon: <Users size={20} /> },
                { name: "Email Notifications (Optional)", icon: <Mail size={20} /> },
                { name: "Search & Filter", icon: <Search size={20} /> },
                { name: "Dashboard Analytics", icon: <LayoutDashboard size={20} /> },
                { name: "Responsive UI", icon: <Smartphone size={20} /> },
                { name: "Secure Database", icon: <Database size={20} /> },
              ].map((feature, i) => (
                <div key={i} className="bg-card border border-border/60 rounded-xl p-5 flex flex-col items-center justify-center text-center gap-3 transition-colors hover:bg-primary/5 hover:border-primary/20">
                  <div className="text-primary/70">{feature.icon}</div>
                  <span className="text-sm font-medium text-foreground">{feature.name}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Skills Required */}
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-900 fill-mode-both pb-12">
            <h2 className="font-heading text-3xl font-semibold mb-3 flex items-center gap-3">
              <span className="text-primary"><Code2 size={28} /></span>
              Skills Required
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl">
              This project was built as part of a SmartBridge internship using the MERN-style skill set below.
            </p>
            <div className="flex flex-wrap gap-3">
              {[
                "HTML",
                "CSS",
                "JavaScript",
                "React.js",
                "Node.js",
                "Express.js",
                "MongoDB",
              ].map((skill, i) => (
                <span
                  key={i}
                  className="px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm border border-primary/20"
                >
                  {skill}
                </span>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-6 max-w-2xl italic">
              Note: this build uses the Replit-managed PostgreSQL database with Drizzle ORM in place of MongoDB, since that is the data layer provisioned in this environment. It fulfills the same role as the database layer in the required skill set.
            </p>
          </section>

        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <Switch>
          <Route path="/" component={Synopsis} />
          {/* Catch-all to redirect to main document just in case */}
          <Route component={Synopsis} />
        </Switch>
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
