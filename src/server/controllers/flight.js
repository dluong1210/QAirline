import { Op } from "sequelize";

import {
  Flight,
  Airport,
  ClassFlight,
  Customer,
  Ticket,
  Notification,
  Airplane,
} from "../models/model.js";

import { sequelize } from "../models/config.model.js";

export const getAllFlights = async (req, res) => {
  try {
    const flights = await Flight.findAll({
      include: [
        {
          model: Airport,
          as: "beginAirport",
          attributes: ["idairport", "name"],
        },
        {
          model: Airport,
          as: "endAirport",
          attributes: ["idairport", "name"],
        },
        {
          model: ClassFlight,
          as: "ClassFlights",
        },
        {
          model: Airplane,
          attributes: ["type"],
        },
      ],
    });

    if (flights.length > 0) {
      const flightData = flights.map((flight) => {
        const flightClasses = {};

        flight.ClassFlights.forEach((classFlight) => {
          flightClasses[classFlight.class] = {
            idClassFlight: classFlight.idClassFlight,
            seatAmount: classFlight.seatAmount,
            seatBooked: classFlight.seatBooked,
            currentPrice: classFlight.currentPrice,
          };
        });

        return {
          idFlight: flight.idFlight,
          timeStart: flight.timeStart,
          timeEnd: flight.timeEnd,
          beginAirport: {
            id: flight.beginAirport.idairport,
            name: flight.beginAirport.name,
          },
          endAirport: {
            id: flight.endAirport.idairport,
            name: flight.endAirport.name,
          },
          idAirplane: flight.idAirplane,
          codeAirplane: flight.Airplane.type,
          classes: flightClasses,
        };
      });

      res.send(flightData);
    } else {
      res.status(404).json({ message: "No flight found." });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
};

export const getFlightByTimeAndAirport = async (req, res) => {
  const { day, month, year, idBeginAirport, idEndAirport } = req.query;

  try {
    const date = new Date(year, month - 1, day);

    const flights = await Flight.findAll({
      where: {
        idbeginAirport: idBeginAirport,
        idendAirport: idEndAirport,
        timeStart: {
          [Op.between]: [
            new Date(date.setHours(0, 0, 0, 0)),
            new Date(date.setHours(23, 59, 59, 999)),
          ],
        },
      },
      include: [
        {
          model: Airport,
          as: "beginAirport",
          attributes: ["idairport", "name"],
        },
        {
          model: Airport,
          as: "endAirport",
          attributes: ["idairport", "name"],
        },
        {
          model: ClassFlight,
          as: "ClassFlights",
        },
        {
          model: Airplane,
          attributes: ["type"],
        },
      ],
    });

    if (flights.length > 0) {
      const flightData = flights.map((flight) => {
        const flightClasses = {};

        flight.ClassFlights.forEach((classFlight) => {
          flightClasses[classFlight.class] = {
            idClassFlight: classFlight.idClassFlight,
            seatAmount: classFlight.seatAmount,
            seatBooked: classFlight.seatBooked,
            currentPrice: classFlight.currentPrice,
          };
        });

        return {
          idFlight: flight.idFlight,
          timeStart: flight.timeStart,
          timeEnd: flight.timeEnd,
          beginAirport: {
            id: flight.beginAirport.idairport,
            name: flight.beginAirport.name,
          },
          endAirport: {
            id: flight.endAirport.idairport,
            name: flight.endAirport.name,
          },
          idAirplane: flight.idAirplane,
          codeAirplane: flight.Airplane.type,
          classes: flightClasses,
        };
      });

      res.send(flightData);
    } else {
      res.status(404).json({ message: "No flight found with the given id." });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
};

export const getInfoFlight = async (req, res) => {
  const { idFlight } = req.query;
  try {
    const flight = await Flight.findOne({
      where: {
        idFlight,
      },
      include: [
        {
          model: Airport,
          as: "beginAirport",
          attributes: ["idairport", "name"],
        },
        {
          model: Airport,
          as: "endAirport",
          attributes: ["idairport", "name"],
        },
        {
          model: ClassFlight,
        },
        {
          model: Airplane,
          attributes: ["type"],
        },
      ],
    });
    if (flight) {
      const flightData = {
        idFlight: flight.idFlight,
        timeStart: flight.timeStart,
        timeEnd: flight.timeEnd,
        beginAirport: {
          id: flight.beginAirport.idairport,
          name: flight.beginAirport.name,
        },
        endAirport: {
          id: flight.endAirport.idairport,
          name: flight.endAirport.name,
        },
        idAirplane: flight.idAirplane,
        codeAirplane: flight.Airplane.type,
        classes: {},
      };

      flight.ClassFlights.forEach((classFlight) => {
        flightData.classes[classFlight.class] = {
          idClassFlight: classFlight.idClassFlight,
          seatAmount: classFlight.seatAmount,
          seatBooked: classFlight.seatBooked,
          currentPrice: classFlight.currentPrice,
        };
      });

      res.send(flightData);
    } else {
      res.status(404).json({ message: "No flight found with the given id." });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
};

export const createFlight = async (req, res) => {
  const { idAdmin } = req.user;
  const {
    timeStart,
    timeEnd,
    idBeginAirport,
    idEndAirport,
    classes,
    idAirplane,
  } = req.body;

  const transaction = await sequelize.transaction();

  try {
    const flight = await Flight.create(
      {
        timeStart,
        timeEnd,
        idbeginAirport: idBeginAirport,
        idendAirport: idEndAirport,
        idAirplane,
        idAdmin_created: idAdmin,
      },
      { transaction }
    );

    const idFlight = flight.idFlight;

    console.log(classes);

    for (const classType in classes) {
      console.log(classType);
      if (classes.hasOwnProperty(classType)) {
        const { seatAmount, currentPrice } = classes[classType];

        await ClassFlight.create(
          {
            class: classType,
            seatAmount,
            seatBooked: 0,
            currentPrice,
            idFlight,
          },
          { transaction }
        );
      }
    }

    await transaction.commit();
    res.send({ idFlight: `${idFlight}` });
  } catch (err) {
    await transaction.rollback();
    console.error(err);
    res.status(500).send(err.message);
  }
};

const sendNotification = async (idFlight, content) => {
  try {
    const customers = await Customer.findAll({
      attributes: ["idCustomer"],
      include: [
        {
          model: Ticket,
          attributes: [],
          include: [
            {
              model: ClassFlight,
              as: "ClassFlight",
              attributes: [],
              where: { idFlight },
            },
          ],
        },
      ],
      where: { "$Tickets.ClassFlight.idFlight$": idFlight },
    });

    content = `Chuyến bay mang số hiệu QA${idFlight} của bạn:\n${content}`;
    const notifications = customers.map(async (customer) => {
      await Notification.create({
        content,
        type: "flight",
        idCustomer: customer.idCustomer,
      });
    });

    await Promise.all(notifications);

    console.log("Notifications sent successfully!");
  } catch (error) {
    console.error("Error sending notifications:", error);
  }
};

export const changeInfoFlight = async (req, res) => {
  const { idAdmin } = req.user;
  const { idFlight, timeStart, timeEnd, classes, idAirplane } = req.body;

  if (!idFlight) {
    return res.status(400).json({ message: "idFlight is required." });
  }

  const transaction = await sequelize.transaction();

  try {
    let flightUpdateData = {
      idAdmin_created: idAdmin,
    };

    if (timeStart) flightUpdateData.timeStart = timeStart;
    if (timeEnd) flightUpdateData.timeEnd = timeEnd;
    if (idAirplane) flightUpdateData.idAirplane = idAirplane;

    const [updatedRows] = await Flight.update(flightUpdateData, {
      where: { idFlight },
      transaction,
    });

    if (updatedRows === 0) {
      await transaction.rollback();
      return res.status(404).json({ message: "Update failed." });
    }

    if (classes) {
      for (const classType in classes) {
        if (classes.hasOwnProperty(classType)) {
          const { seatAmount, currentPrice } = classes[classType];

          // Kiểm tra xem giá trị có thực sự thay đổi hay không
          const classFlight = await ClassFlight.findOne({
            where: { idFlight, class: classType },
            transaction,
          });

          if (classFlight !== null) {
            // Kiểm tra sự thay đổi giữa dữ liệu mới và dữ liệu cũ
            const seatAmountChanged = classFlight.seatAmount !== seatAmount;
            const currentPriceChanged =
              classFlight.currentPrice !== currentPrice;

            console.log(seatAmountChanged);

            if (seatAmountChanged || currentPriceChanged) {
              const [classUpdateRows] = await ClassFlight.update(
                {
                  seatAmount: seatAmount,
                  currentPrice: currentPrice,
                },
                {
                  where: { idFlight, class: classType },
                  transaction,
                }
              );

              // console.log(classFlight);

              // if (classUpdateRows === 0) {
              //   await transaction.rollback();
              //   return res.status(404).json({
              //     message: `Class ${classType} not found for the flight.`,
              //   });
              // }
            }
          } else {
            await transaction.rollback();
            return res.status(404).json({
              message: `Class ${classType} not found for the flight.`,
            });
          }
        }
      }
    }

    await transaction.commit();

    let content = "";
    if (timeStart)
      content += `Đã thay đổi thời gian khởi hành: ${timeStart}.\n`;
    if (timeEnd) content += `Đã thay đổi thời gian kết thúc: ${timeStart}.\n`;
    if (idAirplane) content += `Đã thay đổi thông tin của máy bay.\n`;
    if (classes) content += `Đã thay đổi thông tin về các hạng ghế.\n`;

    sendNotification(idFlight, content);
    res.json({ message: "Flight information updated successfully." });
  } catch (err) {
    await transaction.rollback();
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

export const deleteFlight = async (req, res) => {
  const { idFlight } = req.query;

  if (!idFlight) {
    return res.status(400).json({ message: "idFlight is required." });
  }

  const transaction = await sequelize.transaction();

  try {
    await ClassFlight.destroy({
      where: { idFlight },
      transaction,
    });

    const deletedRows = await Flight.destroy({
      where: { idFlight },
      transaction,
    });

    if (deletedRows === 0) {
      await transaction.rollback();
      return res.status(404).json({
        message: `Flight not found`,
      });
    }

    await transaction.commit();
    res.send("Delete successfully");
  } catch (err) {
    await transaction.rollback();
    console.error(err);
    res.status(500).send(err.message);
  }
};

export const getAllFlightsAdmin = async (req, res) => {
  try {
    const flights = await Flight.findAll({
      include: [
        {
          model: Airplane,
          required: true,
        },
        {
          model: Airport,
          as: "beginAirport",
          required: true,
        },
        {
          model: Airport,
          as: "endAirport",
          required: true,
        },
        {
          model: ClassFlight,
          required: true,
        },
      ],
      indexHints: [{ type: 'USE', values: ['PRIMARY'] }],
    });
    res.send(flights);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
};

export const getFlightsPaged = async (req, res) => {
  const { pageSize, pageNumber } = req.body;
  try {
    const flights = await Flight.findAll({
      include: [
        {
          model: Airplane,
          required: true,
        },
        {
          model: Airport,
          as: "beginAirport",
          required: true,
        },
        {
          model: Airport,
          as: "endAirport",
          required: true,
        },
        {
          model: ClassFlight,
          required: true,
        },
      ],
      indexHints: [{ type: 'USE', values: ['PRIMARY'] }],
      offset: pageSize*(pageNumber-1),
      limit: pageSize,
    });
    res.send(flights);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
}

export const getInfoFlightAdmin = async (req, res) => {
  const { idFlight } = req.query;
  try {
    const flight = await Flight.findOne({
      where: {
        idFlight,
      },
      include: [
        {
          model: Airplane,
          required: true,
        },
        {
          model: Airport,
          as: "beginAirport",
          attributes: ["idairport", "name", "city", "code"],
        },
        {
          model: Airport,
          as: "endAirport",
          attributes: ["idairport", "name", "city", "code"],
        },
        {
          model: ClassFlight,
        },
      ],
    });
    if (flight === null) {
      res.status(404).json({ message: "No flight found with the given id." });
      return;
    }
    res.status(200).send(flight);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
};