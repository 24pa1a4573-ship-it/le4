import { Router, type IRouter } from "express";
import { eq, ilike, or, desc, avg, count } from "drizzle-orm";
import {
  db,
  customersTable,
  ticketsTable,
  agentsTable,
  feedbackTable,
} from "@workspace/db";
import {
  ListCustomersQueryParams,
  CreateCustomerBody,
  GetCustomerParams,
  UpdateCustomerParams,
  UpdateCustomerBody,
  DeleteCustomerParams,
  ListCustomersResponse,
  CreateCustomerResponse,
  GetCustomerResponse,
  UpdateCustomerResponse,
} from "@workspace/api-zod";
import { fetchTicketsWithCustomer } from "../lib/tickets";

const router: IRouter = Router();

router.get("/customers", async (req, res): Promise<void> => {
  const query = ListCustomersQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const { search } = query.data;

  const customers = await db
    .select()
    .from(customersTable)
    .where(
      search
        ? or(
            ilike(customersTable.name, `%${search}%`),
            ilike(customersTable.email, `%${search}%`),
            ilike(customersTable.company, `%${search}%`),
          )
        : undefined,
    )
    .orderBy(desc(customersTable.createdAt));

  res.json(ListCustomersResponse.parse(customers));
});

router.post("/customers", async (req, res): Promise<void> => {
  const parsed = CreateCustomerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [customer] = await db
    .insert(customersTable)
    .values(parsed.data)
    .returning();

  res.status(201).json(CreateCustomerResponse.parse(customer));
});

router.get("/customers/:id", async (req, res): Promise<void> => {
  const params = GetCustomerParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [customer] = await db
    .select()
    .from(customersTable)
    .where(eq(customersTable.id, params.data.id));

  if (!customer) {
    res.status(404).json({ error: "Customer not found" });
    return;
  }

  const tickets = await fetchTicketsWithCustomer({
    customerId: customer.id,
  });

  const [feedbackStats] = await db
    .select({
      feedbackCount: count(feedbackTable.id),
      averageRating: avg(feedbackTable.rating),
    })
    .from(feedbackTable)
    .where(eq(feedbackTable.customerId, customer.id));

  res.json(
    GetCustomerResponse.parse({
      ...customer,
      tickets,
      feedbackCount: feedbackStats?.feedbackCount ?? 0,
      averageRating: feedbackStats?.averageRating
        ? Number(feedbackStats.averageRating)
        : null,
    }),
  );
});

router.patch("/customers/:id", async (req, res): Promise<void> => {
  const params = UpdateCustomerParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateCustomerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [customer] = await db
    .update(customersTable)
    .set(parsed.data)
    .where(eq(customersTable.id, params.data.id))
    .returning();

  if (!customer) {
    res.status(404).json({ error: "Customer not found" });
    return;
  }

  res.json(UpdateCustomerResponse.parse(customer));
});

router.delete("/customers/:id", async (req, res): Promise<void> => {
  const params = DeleteCustomerParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [customer] = await db
    .delete(customersTable)
    .where(eq(customersTable.id, params.data.id))
    .returning();

  if (!customer) {
    res.status(404).json({ error: "Customer not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
