import { useState } from "react";
import { useListAgents, useCreateAgent, useDeleteAgent } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { formatDate } from "@/lib/utils";

export default function Agents() {
  const queryClient = useQueryClient();
  const { data: agents, isLoading } = useListAgents();
  const createAgent = useCreateAgent();
  const deleteAgent = useDeleteAgent();
  const [isOpen, setIsOpen] = useState(false);

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createAgent.mutate({
      data: {
        name: fd.get("name") as string,
        email: fd.get("email") as string,
        role: fd.get("role") as string,
      }
    }, {
      onSuccess: () => {
        toast.success("Agent added successfully");
        setIsOpen(false);
        queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      },
      onError: () => toast.error("Failed to add agent")
    });
  };

  const handleDelete = (id: number) => {
    if(!confirm("Are you sure you want to remove this agent?")) return;
    deleteAgent.mutate({ id }, {
      onSuccess: () => {
        toast.success("Agent removed");
        queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      }
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Agents</h1>
          <p className="text-muted-foreground mt-1">Manage support team members.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Agent
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Agent</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input name="name" required placeholder="John Smith" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input name="email" type="email" required placeholder="john@company.com" />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select name="role" required defaultValue="Agent">
                  <option value="Agent">Agent</option>
                  <option value="Senior Agent">Senior Agent</option>
                  <option value="Manager">Manager</option>
                  <option value="Admin">Admin</option>
                </Select>
              </div>
              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={createAgent.isPending}>
                  {createAgent.isPending ? "Adding..." : "Add Agent"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading agents...</TableCell></TableRow>
            ) : agents?.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No agents found.</TableCell></TableRow>
            ) : (
              agents?.map(a => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.name}</TableCell>
                  <TableCell className="text-muted-foreground">{a.email}</TableCell>
                  <TableCell><Badge variant="outline">{a.role}</Badge></TableCell>
                  <TableCell className="text-muted-foreground text-sm">{formatDate(a.createdAt)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(a.id)} title="Remove Agent">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
