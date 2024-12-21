import { col } from "sequelize";
import { sequelize } from "../models/config.model.js";

import {
  Customer,
  ClassFlight,
  Ticket,
  Flight,
  Airport,
  Notification,
  Customer,
} from "../models/model.js";

const sendNotification = async (
  idCustomer,
  className,
  idFlight,
  amount,
  tickets
) => {
  try {
    const ticketCodes = tickets.map((ticket) => ticket.code).join(", ");

    const content = `Bạn đã đặt thành công chuyến bay có số hiệu QA${idFlight} hạng vé ${className} với tổng số ${amount} vé. Mã vé của bạn: ${ticketCodes}`;

    await Notification.create({
      content,
      type: "ticket",
      idCustomer,
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({
      message: "Đặt vé thành công nhưng không thể gửi thông báo.",
    });
  }
};
export const bookTicket = async (req, res) => {
  const { idCustomer } = req.user;
  let { idClassFlight, amount } = req.body;

  if (!idClassFlight) {
    return res.status(400).json({ message: "idClassFlight is required." });
  }

  amount = amount || 1;

  const transaction = await sequelize.transaction();

  try {
    const classFlight = await ClassFlight.findOne({
      where: { idClassFlight },
      attributes: [
        "class",
        "seatBooked",
        "seatAmount",
        "currentPrice",
        "idFlight",
      ],
      transaction,
    });

    if (!classFlight) {
      throw new Error("Hạng vé không tồn tại.");
    }

    const {
      class: className,
      seatBooked,
      seatAmount,
      currentPrice,
      idFlight,
    } = classFlight;

    if (seatBooked === seatAmount) {
      await transaction.rollback();
      return res
        .status(409)
        .send({ message: "Không còn ghế trống trong hạng vé này." });
    } else if (seatBooked + amount > seatAmount) {
      await transaction.rollback();
      return res.status(409).send({ message: "Số ghế còn lại không đủ." });
    }

    const [updateResult] = await ClassFlight.update(
      {
        seatBooked: seatBooked + amount,
      },
      {
        where: { idClassFlight },
        transaction,
      }
    );

    if (updateResult === 0) {
      throw new Error("Không thể cập nhật số lượng ghế.");
    }

    const ticketsData = Array.from({ length: amount }, (_, i) => ({
      idClassFlight,
      idCustomer,
      price: classFlight.currentPrice,
      code: `QA${classFlight.idFlight}-C${idClassFlight}-S${
        classFlight.seatBooked + i + 1
      }`,
    }));

    // Tạo tất cả vé trong một lần
    const tickets = await Ticket.bulkCreate(ticketsData, {
      transaction,
      returning: true,
    });

    const ticketId = tickets.map((ticket) => ticket.idTicket);

    await transaction.commit();

    sendNotification(idCustomer, className, idFlight, amount, tickets);
    res.status(201).json({
      message: "Đặt vé thành công.",
      ticketId: ticketId,
    });
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    res.status(500).json({
      message: error.message || "Đã xảy ra lỗi, vui lòng thử lại sau.",
    });
  }
};

export const getTicketByCode = async (req, res) => {
  const { code } = req.query;

  try {
    const infoTicket = await Ticket.findOne({
      where: { code },
      attributes: ["idTicket", "code", "status", "price"], // Chỉ lấy các thuộc tính cần thiết
      include: [
        {
          model: ClassFlight,
          attributes: ["class", "seatAmount", "seatBooked", "currentPrice"], // Chỉ lấy các trường cần thiết
          include: [
            {
              model: Flight,
              attributes: ["idFlight", "timeStart", "timeEnd"], // Chỉ lấy thời gian bắt đầu và kết thúc
              include: [
                {
                  model: Airport,
                  as: "beginAirport",
                  attributes: ["name", "country", "city", "code"], // Chỉ lấy thông tin cần thiết
                },
                {
                  model: Airport,
                  as: "endAirport",
                  attributes: ["name", "country", "city", "code"], // Chỉ lấy thông tin cần thiết
                },
              ],
            },
          ],
        },
      ],
    });
    if (!infoTicket || infoTicket.length === 0) {
      return res.status(404).send("Don't find any booking flights with code.");
    }
    res.send(infoTicket);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

export const getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.findAll({
      include: [
        {
          model: ClassFlight,
          required: true,
          attributes: ["class"],
          include: [
            {
              model: Flight,
              required: true,
              attributes: ["idFlight", "timeStart"],
              include: [
                {
                  model: Airport,
                  as: "beginAirport",
                  attributes: ["city"],
                },
                {
                  model: Airport,
                  as: "endAirport",
                  attributes: ["city"],
                },
              ],
            },
          ],
        },
        {
          model: Customer,
          required: true,
          attributes: ["username"],
        },
      ],
    }).then((ticket) => ticket.flat(1));
    res.send(tickets);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

export const deleteTicket = async (req, res) => {
  const { idCustomer } = req.user;
  const { idTicket } = req.query;
  if (!idTicket) {
    return res.status(400).json({ message: "idFlight is required." });
  }
  const transaction = await sequelize.transaction();
  try {
    const ticket = await Ticket.findOne({
      where: { idTicket },
      include: {
        model: ClassFlight,
      },
      transaction,
    });

    if (!ticket || !ticket.ClassFlight) {
      await transaction.rollback();
      return res.status(404).json({
        message: `ClassFlight not found for the given ticket.`,
      });
    }

    const [updateRows] = await ClassFlight.update(
      {
        seatBooked: ticket.ClassFlight.seatBooked - 1,
      },
      {
        where: { idClassFlight: ticket.ClassFlight.idClassFlight },
        transaction,
      }
    );

    if (updateRows === 0) {
      await transaction.rollback();
      return res.status(400).json({
        message: `Failed to update ClassFlight.`,
      });
    }
    const deletedRows = await Ticket.destroy({
      where: { idTicket, idCustomer },
      transaction,
    });

    if (deletedRows === 0) {
      await transaction.rollback();
      return res.status(404).json({
        message: `Ticket not found`,
      });
    }
    await transaction.commit();
    res.send(`Ticket deleted and ClassFlight updated successfully.`);
  } catch (err) {
    await transaction.rollback();
    res.status(500).json({
      message: err.message,
    });
  }
};
