import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useListTickets, useCreateTicket, useListCustomers, useListAgents, TicketStatus, TicketPriority } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function Tickets() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all");
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  const { data: tickets, isLoading } = useListTickets({ 
    search: search || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined
  });
  
  const createTicket = useCreateTicket();
  
  // For the create form
  const { data: customers } = useListCustomers();
  const { data: agents } = useListAgents();
  const [isOpen, setIsOpen] = useState(false);

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createTicket.mutate({
      data: {
        customerId: Number(fd.get("customerId")),
        subject: fd.get("subject") as string,
        description: fd.get("description") as string,
        channel: fd.get("channel") as string,
        priority: fd.get("priority") as TicketPriority,
        category: fd.get("category") as string,
        assignedAgentId: fd.get("assignedAgentId") ? Number(fd.get("assignedAgentId")) : undefined
      }
    }, {
      onSuccess: (t) => {
        toast.success("Ticket created successfully");
        setIsOpen(false);
        queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
        setLocation(`/tickets/${t.id}`);
      },
      onError: () => toast.error("Failed to create ticket")
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Tickets</h1>
          <p className="text-muted-foreground mt-1">Manage and track customer issues.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Ticket</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Customer</Label>
                <Select name="customerId" required>
                  <option value="">Select a customer...</option>
                  {customers?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input name="subject" required placeholder="Brief description of the issue" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select name="category" required>
                    <option value="Billing">Billing</option>
                    <option value="Technical">Technical</option>
                    <option value="Account">Account</option>
                    <option value="General">General</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Channel</Label>
                  <Select name="channel" required>
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="chat">Chat</option>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select name="priority" required defaultValue="medium">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Assignee (Optional)</Label>
                  <Select name="assignedAgentId">
                    <option value="">Unassigned</option>
                    {agents?.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea name="description" required rows={4} placeholder="Full details of the customer issue..." />
              </div>
              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={createTicket.isPending}>
                  {createTicket.isPending ? "Creating..." : "Create Ticket"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4 bg-card p-4 rounded-lg border shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search tickets by subject..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select 
          className="w-48"
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value as any)}
        >
          <option value="all">All Statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </Select>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading tickets...</TableCell></TableRow>
            ) : tickets?.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No tickets match your filters.</TableCell></TableRow>
            ) : (
              tickets?.map(t => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium max-w-xs truncate">
                    <Link href={`/tickets/${t.id}`} className="hover:underline text-foreground block truncate">
                      {t.subject}
                    </Link>
                    <div className="text-xs text-muted-foreground mt-0.5 font-normal">#{t.id} &middot; {t.category}</div>
                  </TableCell>
                  <TableCell>
                    <Link href={`/customers/${t.customerId}`} className="hover:underline">
                      {t.customerName}
                    </Link>
                  </TableCell>
                  <TableCell><Badge variant={t.status as any}>{t.status.replace('_', ' ').toUpperCase()}</Badge></TableCell>
                  <TableCell><Badge variant={t.priority as any}>{t.priority.toUpperCase()}</Badge></TableCell>
                  <TableCell className="text-muted-foreground text-xs whitespace-nowrap">{formatDate(t.createdAt)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
