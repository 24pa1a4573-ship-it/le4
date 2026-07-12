import { useState } from "react";
import { useParams } from "wouter";
import { 
  useGetTicket, useUpdateTicket, useListTicketNotes, useCreateTicketNote, 
  useCreateFeedback, useListAgents, TicketStatus, TicketPriority 
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { formatDate, formatTimeAgo } from "@/lib/utils";
import { Send, UserCircle, Clock, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function TicketDetail() {
  const { id } = useParams();
  const ticketId = Number(id);
  const queryClient = useQueryClient();
  
  const { data: ticket, isLoading } = useGetTicket(ticketId);
  const { data: notes } = useListTicketNotes(ticketId);
  const { data: agents } = useListAgents();
  
  const updateTicket = useUpdateTicket();
  const createNote = useCreateTicketNote();
  const createFeedback = useCreateFeedback();
  
  const [newNote, setNewNote] = useState("");
  const [feedbackRating, setFeedbackRating] = useState("5");
  const [feedbackComment, setFeedbackComment] = useState("");

  if (isLoading) return <div className="animate-pulse p-4">Loading ticket details...</div>;
  if (!ticket) return <div>Ticket not found.</div>;

  const handleUpdate = (field: keyof typeof ticket, value: any) => {
    updateTicket.mutate({
      id: ticketId,
      data: { [field]: value }
    }, {
      onSuccess: () => {
        toast.success(`Ticket ${field} updated`);
        queryClient.invalidateQueries({ queryKey: [`/api/tickets/${ticketId}`] });
      },
      onError: () => toast.error(`Failed to update ${field}`)
    });
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    
    createNote.mutate({
      id: ticketId,
      data: { author: "Current Agent", note: newNote }
    }, {
      onSuccess: () => {
        toast.success("Note added");
        setNewNote("");
        queryClient.invalidateQueries({ queryKey: [`/api/tickets/${ticketId}/notes`] });
      }
    });
  };

  const handleFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    createFeedback.mutate({
      data: { ticketId, rating: Number(feedbackRating), comment: feedbackComment }
    }, {
      onSuccess: () => {
        toast.success("Feedback submitted");
        queryClient.invalidateQueries({ queryKey: [`/api/tickets/${ticketId}`] });
      }
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold tracking-tight">{ticket.subject}</h1>
            <Badge variant={ticket.status as any}>{ticket.status.replace('_', ' ').toUpperCase()}</Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            #{ticket.id} &middot; Opened by <span className="font-medium text-foreground">{ticket.customerName}</span> via {ticket.channel}
          </p>
        </div>
        
        <div className="flex items-center gap-2 bg-card p-2 rounded-md border shadow-sm">
          <Select 
            value={ticket.status} 
            onChange={(e) => handleUpdate("status", e.target.value)}
            disabled={updateTicket.isPending}
            className="w-36 h-8 text-sm"
          >
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </Select>
          <Select 
            value={ticket.priority} 
            onChange={(e) => handleUpdate("priority", e.target.value)}
            disabled={updateTicket.isPending}
            className="w-32 h-8 text-sm"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <UserCircle className="h-4 w-4" /> Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{ticket.description}</p>
            </CardContent>
          </Card>

          {/* Timeline / Notes */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Timeline</h3>
            <div className="space-y-4">
              {notes?.map(note => (
                <div key={note.id} className="bg-card border rounded-lg p-4 shadow-sm flex gap-4">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <UserCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{note.author}</span>
                      <span className="text-xs text-muted-foreground">{formatTimeAgo(note.createdAt)}</span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{note.note}</p>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddNote} className="mt-6 bg-card border rounded-lg p-4 shadow-sm space-y-3">
              <Textarea 
                placeholder="Type an internal note or reply..." 
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                className="bg-transparent border-none focus-visible:ring-0 shadow-none resize-none px-0"
                rows={3}
              />
              <div className="flex justify-between items-center border-t pt-3">
                <span className="text-xs text-muted-foreground">Notes are visible to agents only.</span>
                <Button type="submit" disabled={!newNote.trim() || createNote.isPending} size="sm">
                  <Send className="h-4 w-4 mr-2" /> Add Note
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Assignment</CardTitle>
            </CardHeader>
            <CardContent>
              <Select 
                value={ticket.assignedAgentId?.toString() || ""}
                onChange={e => handleUpdate("assignedAgentId", e.target.value ? Number(e.target.value) : null)}
                disabled={updateTicket.isPending}
              >
                <option value="">Unassigned</option>
                {agents?.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium">{ticket.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span className="font-medium">{formatDate(ticket.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Updated</span>
                <span className="font-medium">{formatTimeAgo(ticket.updatedAt)}</span>
              </div>
            </CardContent>
          </Card>

          {ticket.status === 'resolved' && !ticket.feedback && (
            <Card className="border-accent">
              <CardHeader className="bg-accent/5 pb-4">
                <CardTitle className="text-sm font-medium text-accent-foreground flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" /> Collect Feedback
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <form onSubmit={handleFeedback} className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <label className="font-medium">Customer Rating (1-5)</label>
                    <Select value={feedbackRating} onChange={e => setFeedbackRating(e.target.value)}>
                      {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Stars</option>)}
                    </Select>
                  </div>
                  <div className="space-y-2 text-sm">
                    <label className="font-medium">Comment</label>
                    <Textarea 
                      value={feedbackComment} 
                      onChange={e => setFeedbackComment(e.target.value)} 
                      placeholder="Customer comment..."
                      rows={2}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={createFeedback.isPending}>Submit Feedback</Button>
                </form>
              </CardContent>
            </Card>
          )}

          {ticket.feedback && (
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-sm font-medium flex justify-between">
                  <span>Customer Feedback</span>
                  <span className="text-primary font-bold">{ticket.feedback.rating}/5 Stars</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm italic">"{ticket.feedback.comment || 'No comment provided'}"</p>
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  )
}
