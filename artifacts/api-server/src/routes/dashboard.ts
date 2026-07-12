import { Router, type IRouter } from "express";
import { sql, eq, desc } from "drizzle-orm";
import {
  db,
  customersTable,
  ticketsTable,
  ticketNotesTable,
  feedbackTable,
} from "@workspace/db";
import {
  GetDashboardSummaryResponse,
  GetRecentActivityQueryParams,
  GetRecentActivityResponse,
  GetCategoryBreakdownResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const [customerCount] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(customersTable);

  const [statusCounts] = await db
    .select({
      total: sql<number>`count(*)::int`,
      open: sql<number>`count(*) filter (where ${ticketsTable.status} = 'open')::int`,
      inProgress: sql<number>`count(*) filter (where ${ticketsTable.status} = 'in_progress')::int`,
      resolved: sql<number>`count(*) filter (where ${ticketsTable.status} = 'resolved')::int`,
      closed: sql<number>`count(*) filter (where ${ticketsTable.status} = 'closed')::int`,
      urgent: sql<number>`count(*) filter (where ${ticketsTable.priority} = 'urgent')::int`,
    })
    .from(ticketsTable);

  const [feedbackStats] = await db
    .select({
      averageRating: sql<number | null>`avg(${feedbackTable.rating})`,
      feedbackCount: sql<number>`count(*)::int`,
    })
    .from(feedbackTable);

  const [resolutionStats] = await db
    .select({
      avgResolutionHours: sql<number | null>`avg(extract(epoch from (${ticketsTable.resolvedAt} - ${ticketsTable.createdAt})) / 3600)`,
    })
    .from(ticketsTable)
    .where(sql`${ticketsTable.resolvedAt} is not null`);

  res.json(
    GetDashboardSummaryResponse.parse({
      totalCustomers: customerCount?.total ?? 0,
      totalTickets: statusCounts?.total ?? 0,
      openTickets: statusCounts?.open ?? 0,
      inProgressTickets: statusCounts?.inProgress ?? 0,
      resolvedTickets: statusCounts?.resolved ?? 0,
      closedTickets: statusCounts?.closed ?? 0,
      urgentTickets: statusCounts?.urgent ?? 0,
      averageRating: feedbackStats?.averageRating
        ? Number(feedbackStats.averageRating)
        : null,
      feedbackCount: feedbackStats?.feedbackCount ?? 0,
      avgResolutionHours: resolutionStats?.avgResolutionHours
        ? Number(resolutionStats.avgResolutionHours)
        : null,
    }),
  );
});

router.get("/dashboard/activity", async (req, res): Promise<void> => {
  const query = GetRecentActivityQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  const limit = query.data.limit ?? 20;

  const ticketsCreated = await db
    .select({
      id: ticketsTable.id,
      subject: ticketsTable.subject,
      customerId: ticketsTable.customerId,
      createdAt: ticketsTable.createdAt,
      resolvedAt: ticketsTable.resolvedAt,
    })
    .from(ticketsTable)
    .orderBy(desc(ticketsTable.createdAt))
    .limit(limit);

  const notes = await db
    .select({
      id: ticketNotesTable.id,
      ticketId: ticketNotesTable.ticketId,
      author: ticketNotesTable.author,
      note: ticketNotesTable.note,
      createdAt: ticketNotesTable.createdAt,
    })
    .from(ticketNotesTable)
    .orderBy(desc(ticketNotesTable.createdAt))
    .limit(limit);

  const feedbackEntries = await db
    .select({
      id: feedbackTable.id,
      ticketId: feedbackTable.ticketId,
      rating: feedbackTable.rating,
      createdAt: feedbackTable.createdAt,
    })
    .from(feedbackTable)
    .orderBy(desc(feedbackTable.createdAt))
    .limit(limit);

  const items = [
    ...ticketsCreated.map((t) => ({
      type: "ticket_created" as const,
      id: t.id,
      title: `New ticket: ${t.subject}`,
      subtitle: `Ticket #${t.id}`,
      timestamp: t.createdAt,
    })),
    ...ticketsCreated
      .filter((t) => t.resolvedAt)
      .map((t) => ({
        type: "ticket_resolved" as const,
        id: t.id,
        title: `Resolved: ${t.subject}`,
        subtitle: `Ticket #${t.id}`,
        timestamp: t.resolvedAt as Date,
      })),
    ...notes.map((n) => ({
      type: "note_added" as const,
      id: n.id,
      title: `Note by ${n.author}`,
      subtitle: n.note.slice(0, 80),
      timestamp: n.createdAt,
    })),
    ...feedbackEntries.map((f) => ({
      type: "feedback_submitted" as const,
      id: f.id,
      title: `Feedback: ${f.rating}/5`,
      subtitle: `Ticket #${f.ticketId}`,
      timestamp: f.createdAt,
    })),
  ]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit);

  res.json(GetRecentActivityResponse.parse(items));
});

router.get("/dashboard/categories", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      category: ticketsTable.category,
      count: sql<number>`count(*)::int`,
    })
    .from(ticketsTable)
    .groupBy(ticketsTable.category)
    .orderBy(desc(sql`count(*)`));

  res.json(GetCategoryBreakdownResponse.parse(rows));
});

export default router;
