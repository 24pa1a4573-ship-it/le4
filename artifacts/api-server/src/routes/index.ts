import { Router, type IRouter } from "express";
import healthRouter from "./health";
import agentsRouter from "./agents";
import customersRouter from "./customers";
import ticketsRouter from "./tickets";
import feedbackRouter from "./feedback";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(agentsRouter);
router.use(customersRouter);
router.use(ticketsRouter);
router.use(feedbackRouter);
router.use(dashboardRouter);

export default router;
