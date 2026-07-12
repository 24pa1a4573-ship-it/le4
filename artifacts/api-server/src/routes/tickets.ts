import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import {
  db,
  ticketsTable,
  customersTable,
  agentsTable,
  ticketNotesTable,
  feedbackTable,
} from "@workspace/db";
import {
  ListTicketsQueryParams,
  CreateTicketBody,
  GetTicketParams,
  UpdateTicketParams,
  UpdateTicketBody,
  DeleteTicketParams,
  ListTicketsResponse,
  CreateTicketResponse,
  GetTicketResponse,
  UpdateTicketResponse,
  ListTicketNotesParams,
  CreateTicketNoteParams,
  CreateTicketNoteBody,
  ListTicketNotesResponse,
  CreateTicketNoteResponse,
} from "@workspace/api-zod";
import { fetchTicketsWithCustomer } from "../lib/tickets";

const router: IRouter = Router();

router.get("/tickets", async (req, res): Promise<void> => {
  const query = ListTicketsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const tickets = await fetchTicketsWithCustomer(query.data);
  res.json(ListTicketsResponse.parse(tickets));
});

router.post("/tickets", async (req, res): Promise<void> => {
  const parsed = CreateTicketBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [ticket] = await db
    .insert(ticketsTable)
    .values({ ...parsed.data, status: "open" })
    .returning();

  if (!ticket) {
    res.status(400).json({ error: "Failed to create ticket" });
    return;
  }

  const [created] = (await fetchTicketsWithCustomer({})).filter(
    (t) => t.id === ticket.id,
  );

  res.status(201).json(CreateTicketResponse.parse(created));
});

router.get("/tickets/:id", async (req, res): Promise<void> => {
  const params = GetTicketParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db
    .select({
      id: ticketsTable.id,
      customerId: ticketsTable.customerId,
      customerName: customersTable.name,
      customerEmail: customersTable.email,
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
    .where(eq(ticketsTable.id, params.data.id));

  if (!row) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }

  const notes = await db
    .select()
    .from(ticketNotesTable)
    .where(eq(ticketNotesTable.ticketId, params.data.id))
    .orderBy(ticketNotesTable.createdAt);

  const [feedback] = await db
    .select()
    .from(feedbackTable)
    .where(eq(feedbackTable.ticketId, params.data.id));

  res.json(
    GetTicketResponse.parse({
      ...row,
      notes,
      feedback: feedback ?? null,
    }),
  );
});

router.patch("/tickets/:id", async (req, res): Promise<void> => {
  const params = UpdateTicketParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateTicketBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateValues: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.status === "resolved" || parsed.data.status === "closed") {
    const [existing] = await db
      .select()
      .from(ticketsTable)
      .where(eq(ticketsTable.id, params.data.id));
    if (existing && !existing.resolvedAt) {
      updateValues.resolvedAt = new Date();
    }
  }

  const [updated] = await db
    .update(ticketsTable)
    .set(updateValues)
    .where(eq(ticketsTable.id, params.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }

  const [withCustomer] = (await fetchTicketsWithCustomer({})).filter(
    (t) => t.id === updated.id,
  );

  res.json(UpdateTicketResponse.parse(withCustomer));
});

router.delete("/tickets/:id", async (req, res): Promise<void> => {
  const params = DeleteTicketParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [ticket] = await db
    .delete(ticketsTable)
    .where(eq(ticketsTable.id, params.data.id))
    .returning();

  if (!ticket) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }

  res.sendStatus(204);
});

router.get("/tickets/:id/notes", async (req, res): Promise<void> => {
  const params = ListTicketNotesParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const notes = await db
    .select()
    .from(ticketNotesTable)
    .where(eq(ticketNotesTable.ticketId, params.data.id))
    .orderBy(ticketNotesTable.createdAt);

  res.json(ListTicketNotesResponse.parse(notes));
});

router.post("/tickets/:id/notes", async (req, res): Promise<void> => {
  const params = CreateTicketNoteParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = CreateTicketNoteBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [ticket] = await db
    .select()
    .from(ticketsTable)
    .where(eq(ticketsTable.id, params.data.id));

  if (!ticket) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }

  const [note] = await db
    .insert(ticketNotesTable)
    .values({ ...parsed.data, ticketId: params.data.id })
    .returning();

  res.status(201).json(CreateTicketNoteResponse.parse(note));
});

export default router;
