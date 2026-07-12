import { useParams, Link } from "wouter";
import { useGetCustomer, useUpdateCustomer } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Building2, Phone, Mail, Star, Ticket } from "lucide-react";

export default function CustomerDetail() {
  const { id } = useParams();
  const { data: customer, isLoading } = useGetCustomer(Number(id));

  if (isLoading) return <div className="animate-pulse p-4">Loading customer profile...</div>;
  if (!customer) return <div>Customer not found.</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{customer.name}</h1>
          <p className="text-muted-foreground mt-1">Customer Profile & History</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{customer.email}</span>
            </div>
            {customer.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{customer.phone}</span>
              </div>
            )}
            {customer.company && (
              <div className="flex items-center gap-3 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>{customer.company}</span>
              </div>
            )}
            
            <div className="pt-4 border-t mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total Tickets</p>
                <p className="text-xl font-semibold flex items-center gap-2"><Ticket className="h-4 w-4 text-primary"/> {customer.tickets.length}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Avg Rating</p>
                <p className="text-xl font-semibold flex items-center gap-2"><Star className="h-4 w-4 text-accent"/> {customer.averageRating ? customer.averageRating.toFixed(1) : '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Ticket History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customer.tickets.length === 0 ? (
                  <TableRow><TableCell colSpan={3} className="text-center py-6 text-muted-foreground">No tickets in history.</TableCell></TableRow>
                ) : (
                  customer.tickets.map(t => (
                    <TableRow key={t.id}>
                      <TableCell className="pl-6 font-medium">
                        <Link href={`/tickets/${t.id}`} className="hover:underline">
                          {t.subject}
                        </Link>
                      </TableCell>
                      <TableCell><Badge variant={t.status as any}>{t.status.replace('_', ' ')}</Badge></TableCell>
                      <TableCell className="text-muted-foreground text-sm">{formatDate(t.createdAt)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
