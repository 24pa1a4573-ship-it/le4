import { Link } from "wouter";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center space-y-4 py-20 animate-in fade-in duration-500">
      <AlertCircle className="h-12 w-12 text-destructive" />
      <h1 className="text-2xl font-bold">404 - Page Not Found</h1>
      <p className="text-muted-foreground">The page you are looking for does not exist.</p>
      <Link href="/" className="text-primary hover:underline font-medium">Return to Dashboard</Link>
    </div>
  );
}
