import express from "express";
import {
  bookTicket,
  deleteTicket,
  getAllTickets,
  getTicketByCode,
} from "../controllers/booking.js";
import {
  authenticateAdmin,
  authenticateToken,
} from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", authenticateToken, bookTicket);
router.get("/getTicketByCode", getTicketByCode);
router.get("/", authenticateAdmin, getAllTickets);
router.delete("/", authenticateToken, deleteTicket);

export default router;
