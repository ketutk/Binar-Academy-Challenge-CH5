const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const bcryptjs = require("bcryptjs");
const jsonwebtoken = require("jsonwebtoken");

exports.registerUser = async (req) => {
  try {
    // Ambil data dari body
    const { name, email, password, identity_type, identity_number, address } = req.body;

    // Cek Duplikat
    const duplicate = await prisma.users.findUnique({
      where: {
        email: email,
      },
    });

    if (duplicate) {
      return {
        status: 403,
        message: "This email is already used",
        data: null,
      };
    }

    // Buat user beserta profile
    const createUser = await prisma.users.create({
      data: {
        name: name,
        email: email,
        password: await bcryptjs.hash(password, 10),
        profiles: {
          create: {
            identity_type,
            identity_number,
            address,
          },
        },
      },
      include: {
        profiles: true,
      },
    });

    // Buat token untuk akses
    const token = jsonwebtoken.sign(
      {
        id: createUser.id,
        name: createUser.name,
        email: createUser.email,
      },
      process.env.JWT_KEY,
      {
        expiresIn: process.env.TIMEEXPIRES,
      }
    );
    delete createUser.password;
    // Return
    return {
      status: 201,
      message: "Successfully register",
      data: {
        user: createUser,
        token,
      },
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.loginUser = async (req) => {
  try {
    // Ambil data dari body
    const { email, password } = req.body;

    // Cek ketersediaan user
    const user = await prisma.users.findUnique({
      where: {
        email: email,
      },
    });

    // Return jika tidak ada
    if (!user) {
      return {
        status: 403,
        message: "Incorrect email or password",
        data: null,
      };
    }

    // Compare password
    const validPassword = await bcryptjs.compare(password, user.password);
    // Return jika tidak valid
    if (!validPassword) {
      return {
        status: 403,
        message: "Incorrect email or password",
        data: null,
      };
    }

    const token = jsonwebtoken.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      process.env.JWT_KEY,
      {
        expiresIn: process.env.TIMEEXPIRES,
      }
    );

    // Return token
    return {
      status: 200,
      message: "Successfully login",
      data: {
        token,
      },
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.authenticate = async (req) => {
  try {
    if (req.headers && req.headers.authorization) {
      const token = req.headers.authorization.split(" ")[1];
      try {
        const decoded = jsonwebtoken.verify(token, process.env.JWT_KEY);
        return {
          status: 200,
          message: "Authentication success",
          data: decoded,
        };
      } catch (err) {
        return {
          status: 401,
          message: "Authentication failed, jwt invalid.",
          data: null,
        };
      }
    } else {
      return {
        status: 401,
        message: "Authentication failed, please login.",
        data: null,
      };
    }
  } catch (error) {
    throw new Error(error.message);
  }
};
