import { eq, and, ilike, or, desc, type SQL } from "drizzle-orm";
import { db, ticketsTable, customersTable, agentsTable } from "@workspace/db";

export interface TicketFilters {
  status?: string;
  priority?: string;
  category?: string;
  assignedAgentId?: number;
  customerId?: number;
  search?: string;
}

export async function fetchTicketsWithCustomer(filters: TicketFilters = {}) {
  const conditions: SQL[] = [];

  if (filters.status) {
    conditions.push(eq(ticketsTable.status, filters.status));
  }
  if (filters.priority) {
    conditions.push(eq(ticketsTable.priority, filters.priority));
  }
  if (filters.category) {
    conditions.push(eq(ticketsTable.category, filters.category));
  }
  if (filters.assignedAgentId !== undefined) {
    conditions.push(eq(ticketsTable.assignedAgentId, filters.assignedAgentId));
  }
  if (filters.customerId !== undefined) {
    conditions.push(eq(ticketsTable.customerId, filters.customerId));
  }
  if (filters.search) {
    const term = `%${filters.search}%`;
    const searchCondition = or(
      ilike(ticketsTable.subject, term),
      ilike(ticketsTable.description, term),
      ilike(customersTable.name, term),
    );
    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  const rows = await db
    .select({
      id: ticketsTable.id,
      customerId: ticketsTable.customerId,
      customerName: customersTable.name,
      subject: ticketsTable.subject,
      description: ticketsTable.description,
      channel: ticketsTable.channel,
      status: ticketsTable.status,
      priority: ticketsTable.priority,
      category: ticketsTable.category,
      assignedAgentId: ticketsTable.assignedAgentId,
      assignedAgentName: agentsTable.name,
      createdAt: ticketsTable.createdAt,
      updatedAt: ticketsTable.updatedAt,
      resolvedAt: ticketsTable.resolvedAt,
    })
    .from(ticketsTable)
    .innerJoin(customersTable, eq(ticketsTable.customerId, customersTable.id))
    .leftJoin(agentsTable, eq(ticketsTable.assignedAgentId, agentsTable.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(ticketsTable.createdAt));

  return rows;
}
