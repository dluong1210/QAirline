import { col } from "sequelize";
import {
  Customer,
  Ticket,
  ClassFlight,
  Flight,
  Airport,
  Notification,
} from "../models/model.js";

export const getInfo = async (req, res) => {
  const { idCustomer } = req.user;

  try {
    const customer = await Customer.findOne({
      attributes: ["username", "email", "numberPhone"],
      where: {
        idCustomer: idCustomer,
      },
    });

    if (!customer) {
      return res.status(404).send("Customer not found");
    }

    res.send(customer);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

export const changeInfo = async (req, res) => {
  const { idCustomer } = req.user;
  const { username, email, numberPhone } = req.body;

  try {
    const [updatedRows] = await Customer.update(
      { username, email, numberPhone },
      {
        where: { idCustomer },
      }
    );

    if (updatedRows === 0) {
      return res.status(404).send("Customer not found");
    }

    res.send("Change info customer success");
  } catch (err) {
    res.status(500).send(err.message);
  }
};

export const getTickets = async (req, res) => {
  const { idCustomer } = req.user;

  try {
    const tickets = await Ticket.findAll({
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
        {
          model: Customer,
          as: "Customer",
          attributes: [],
          where: { idCustomer },
        },
      ],
    });

    if (!tickets || tickets.length === 0) {
      return res.status(404).send("No tickets found");
    }

    res.send(tickets);
  } catch (err) {
    res.status(500).send(err.message);
    console.log(err.message);
  }
};

export const getNotification = async (req, res) => {
  const { idCustomer } = req.user;

  try {
    const notifications = await Notification.findAll({
      where: { idCustomer },
      attributes: ["content", "type", "unRead", "create_at"],
      order: [["create_at", "DESC"]],
    });
    console.log(notifications[0]);
    res.send(notifications);
  } catch (err) {
    res.status(500).send(err.message);
    console.log(err.message);
  }
};
