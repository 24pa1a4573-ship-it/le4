import { useState } from "react";
import { Link } from "wouter";
import { useListFeedback } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Star, MessageSquare } from "lucide-react";
import { formatTimeAgo } from "@/lib/utils";

export default function Feedback() {
  const [minRating, setMinRating] = useState<number>(0);
  
  const { data: feedback, isLoading } = useListFeedback({ 
    minRating: minRating > 0 ? minRating : undefined 
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Customer Feedback</h1>
          <p className="text-muted-foreground mt-1">Review satisfaction ratings and comments.</p>
        </div>
        
        <div className="w-48">
          <Select 
            value={minRating.toString()} 
            onChange={(e) => setMinRating(Number(e.target.value))}
          >
            <option value="0">All Ratings</option>
            <option value="5">5 Stars Only</option>
            <option value="4">4+ Stars</option>
            <option value="3">3+ Stars</option>
          </Select>
        </div>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground animate-pulse">Loading feedback...</div>
        ) : feedback?.length === 0 ? (
          <div className="text-center py-12 bg-card border rounded-lg shadow-sm text-muted-foreground">
            <MessageSquare className="h-8 w-8 mx-auto mb-3 opacity-20" />
            No feedback found matching the filters.
          </div>
        ) : (
          feedback?.map(f => (
            <Card key={f.id} className="overflow-hidden">
              <div className="flex border-l-4" style={{ borderColor: f.rating >= 4 ? 'hsl(var(--primary))' : f.rating === 3 ? 'hsl(var(--accent))' : 'hsl(var(--destructive))'}}>
                <CardContent className="p-5 flex-1 flex flex-col sm:flex-row gap-4">
                  <div className="sm:w-48 flex-shrink-0 border-r pr-4">
                    <div className="flex items-center gap-1 text-accent mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < f.rating ? 'fill-current' : 'text-muted opacity-30'}`} />
                      ))}
                    </div>
                    <div className="text-sm font-medium">{f.customerName}</div>
                    <div className="text-xs text-muted-foreground">{formatTimeAgo(f.createdAt)}</div>
                  </div>
                  <div className="flex-1">
                    <Link href={`/tickets/${f.ticketId}`} className="text-sm font-semibold hover:underline text-foreground block mb-2">
                      Ticket #{f.ticketId}: {f.ticketSubject}
                    </Link>
                    <p className="text-sm text-muted-foreground italic">
                      {f.comment ? `"${f.comment}"` : "No comment provided."}
                    </p>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
