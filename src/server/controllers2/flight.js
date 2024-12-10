import { Op } from "sequelize";

import { Flight, Airport, ClassFlight } from "../models/model.js";
import { sequelize } from "../models/config.model.js";

export const getFlightByTimeAndAirport = async (req, res) => {
  const { day, month, year, idBeginAirport, idEndAirport } = req.query;

  try {
    // Xây dựng ngày từ tham số query
    const date = new Date(year, month - 1, day);

    // Truy vấn dữ liệu bằng Sequelize
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
      ],
    });

    if (flights.length > 0) {
      const flightData = flights.map((flight) => ({
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
        classes: flight.ClassFlights.map((classFlight) => ({
          id: classFlight.idclassFlight,
          class: classFlight.class,
          seatAmount: classFlight.seatAmount,
          seatBooked: classFlight.seatBooked,
          currentPrice: classFlight.currentPrice,
        })),
      }));

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
    // Truy vấn dữ liệu bằng Sequelize
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
          //   as: "ClassFlight",
        },
      ],
    });
    // console.log(flight);
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
        classes: {},
      };

      flight.ClassFlights.forEach((classFlight) => {
        flightData.classes[classFlight.class] = {
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
    // Tạo chuyến bay mới
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

    // Tạo các lớp cho chuyến bay
    for (const classType in classes) {
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

export const changeInfoFlight = async (req, res) => {
  const { idAdmin } = req.user;
  const { idFlight, timeStart, timeEnd, classes, idAirplane } = req.body;

  if (!idFlight) {
    return res.status(400).json({ message: "idFlight is required." });
  }

  const transaction = await sequelize.transaction();

  try {
    // Update the flight information
    const flightUpdateData = {
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
      return res.status(404).json({ message: "Flight not found." });
    }

    // Update classes if provided
    if (classes) {
      for (const classType in classes) {
        if (classes.hasOwnProperty(classType)) {
          const { seatAmount, currentPrice } = classes[classType];

          const [classUpdateRows] = await ClassFlight.update(
            {
              seatAmount,
              currentPrice,
            },
            {
              where: { idFlight, class: classType },
              transaction,
            }
          );

          if (classUpdateRows === 0) {
            await transaction.rollback();
            return res.status(404).json({
              message: `Class ${classType} not found for the flight.`,
            });
          }
        }
      }
    }

    await transaction.commit();
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
    // Delete all classflight entries related to the flight
    await ClassFlight.destroy({
      where: { idFlight },
      transaction,
    });

    // Delete the flight entry
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

    // Commit the transaction only if everything succeeds
    await transaction.commit();
    res.send("Delete successfully");
  } catch (err) {
    // Rollback transaction in case of an error
    await transaction.rollback();
    console.error(err);
    res.status(500).send(err.message);
  }
};
