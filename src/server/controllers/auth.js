import * as argon2 from "argon2";
import { Op } from "sequelize";
import { Customer, Admin } from "../models/model.js";
import { createAccessToken, createRefreshToken } from "./jwt.js";

export const login = async (req, res) => {
  const { email, password, numberPhone } = req.body;
  let role = "customer";
  let accessToken, refreshToken;

  try {
    let user = email ? await Admin.findAll({ where: { email } }) : [];

    if (user.length !== 0) {
      role = "admin";
    } else {
      user = email
        ? await Customer.findAll({ where: { email } })
        : await Customer.findAll({ where: { numberPhone } });

      if (user.length === 0) {
        return res.status(400).json({ message: "User does not exist." });
      }
    }
    console.log(role);
    const passwordHash =
      role === "customer"
        ? user[0].password
        : await argon2.hash(user[0].password);

    if (!(await argon2.verify(passwordHash, password))) {
      throw new Error("Wrong password or username");
    }

    if (role === "customer") {
      accessToken = createAccessToken({
        idCustomer: `${user[0].idCustomer}`,
        role: `${role}`,
        username: `${user[0].username}`,
        createAt: new Date(),
      });
      refreshToken = createRefreshToken({
        idCustomer: `${user[0].idCustomer}`,
        role: `${role}`,
        username: `${user[0].username}`,
      });
    } else {
      accessToken = createAccessToken({
        idAdmin: `${user[0].idAdmin}`,
        role: `${role}`,
        username: `${user[0].username}`,
        createAt: new Date(),
      });
      refreshToken = createRefreshToken({
        idAdmin: `${user[0].idAdmin}`,
        role: `${role}`,
        username: `${user[0].username}`,
      });
    }

    res.cookie("access", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });
    res.cookie("refresh", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    console.log(`accessToken: ${accessToken}\n refreshToken: ${refreshToken}`);
    res.send({ role, username: user[0].username });
  } catch (e) {
    res.status(500).send(e.message);
    console.log(e);
  }
};

export const register = async (req, res) => {
  const { email, password, numberPhone, username } = req.body;
  try {
    const existingUser = email
      ? await Customer.findAll({ where: { email } })
      : await Customer.findAll({ where: { numberPhone } });
    console.log(existingUser);

    if (existingUser.length > 0) {
      return res.status(400).json({ message: "User already exists." });
    }
    var passwordHash = await argon2.hash(password);

    await Customer.create({
      username,
      email,
      password: passwordHash,
      numberPhone,
    });
  } catch (e) {
    res.status(500).send(e.message);
    console.log(e);
  }
  res.send(username);
};

export const logout = async (req, res) => {
  try {
    // Xóa cookie chứa token access và refresh
    res.clearCookie("access", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });
    res.clearCookie("refresh", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });
    // Trả về phản hồi thành công sau khi logout
    res.status(200).json({ message: "Logged out successfully" });
  } catch (e) {    
    res.status(500).send(e.message);
    console.log(e);
  }
};

export const sendUserInfo = async (req, res) => {
  const user = req.user;
  try {
    if (user.role === 'admin') {
      const admin = await Admin.findOne({
        where: {
          idAdmin: user.idAdmin,
        }
      })
      res.status(200).json({
        role: 'admin',
        username: admin.username,
        email: admin.email,
        phoneNumber: admin.phoneNumber,
      })
    } else {
      const customer = await Customer.findOne({
        where: {
          idCustomer: user.idCustomer,
        }
      })
      res.status(200).json({
        role: 'customer',
        username: customer.username,
        email: customer.email,
        phoneNumber: customer.phoneNumber,
      })
    }
  } catch (err) {
    res.status(500).send(err.message);
    console.log(err);
  }
};

