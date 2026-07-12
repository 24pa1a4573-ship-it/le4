import { Router, type IRouter } from "express";
import { eq, gte, desc } from "drizzle-orm";
import {
  db,
  feedbackTable,
  ticketsTable,
  customersTable,
} from "@workspace/db";
import {
  ListFeedbackQueryParams,
  CreateFeedbackBody,
  ListFeedbackResponse,
  CreateFeedbackResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/feedback", async (req, res): Promise<void> => {
  const query = ListFeedbackQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const rows = await db
    .select({
      id: feedbackTable.id,
      ticketId: feedbackTable.ticketId,
      ticketSubject: ticketsTable.subject,
      customerId: feedbackTable.customerId,
      customerName: customersTable.name,
      rating: feedbackTable.rating,
      comment: feedbackTable.comment,
      createdAt: feedbackTable.createdAt,
    })
    .from(feedbackTable)
    .innerJoin(ticketsTable, eq(feedbackTable.ticketId, ticketsTable.id))
    .innerJoin(
      customersTable,
      eq(feedbackTable.customerId, customersTable.id),
    )
    .where(
      query.data.minRating !== undefined
        ? gte(feedbackTable.rating, query.data.minRating)
        : undefined,
    )
    .orderBy(desc(feedbackTable.createdAt));

  res.json(ListFeedbackResponse.parse(rows));
});

router.post("/feedback", async (req, res): Promise<void> => {
  const parsed = CreateFeedbackBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [ticket] = await db
    .select()
    .from(ticketsTable)
    .where(eq(ticketsTable.id, parsed.data.ticketId));

  if (!ticket) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }

  const [feedback] = await db
    .insert(feedbackTable)
    .values({ ...parsed.data, customerId: ticket.customerId })
    .returning();

  res.status(201).json(CreateFeedbackResponse.parse(feedback));
});

export default router;
