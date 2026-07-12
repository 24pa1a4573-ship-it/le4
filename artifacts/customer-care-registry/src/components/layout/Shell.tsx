import { Link, useLocation } from "wouter";
import { LayoutDashboard, Ticket, Users, UserCircle, Star, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tickets", label: "Tickets", icon: Ticket },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/agents", label: "Agents", icon: UserCircle },
  { href: "/feedback", label: "Feedback", icon: Star },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="flex min-h-screen w-full bg-background flex-col md:flex-row">
      <aside className="w-full md:w-64 border-r bg-card flex-shrink-0 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b text-primary font-semibold tracking-tight gap-2">
          <ShieldCheck className="h-6 w-6" />
          <span>Care Registry</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = location.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t text-xs text-muted-foreground flex items-center justify-between">
          <span>System Online</span>
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
        </div>
      </aside>
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 border-b bg-card flex items-center px-8 shrink-0 shadow-sm z-10">
           <h2 className="font-medium text-foreground tracking-tight">
              {NAV_ITEMS.find(i => location.startsWith(i.href))?.label || "Workspace"}
           </h2>
        </header>
        <div className="flex-1 overflow-auto bg-muted/10 p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
