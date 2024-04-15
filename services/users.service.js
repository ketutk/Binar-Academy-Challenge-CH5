const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getUsers = async (req) => {
  try {
    // Pagination setting
    const page = req.query.page || 1;
    const limit = 5;
    const totalData = await prisma.users.count({});
    const totalPage = Math.ceil(totalData / limit);
    if (isNaN(page)) {
      return {
        status: 400,
        message: "Incorrect query value",
        data: null,
      };
    }

    if (totalData === 0) {
      return {
        status: 400,
        message: "No users created yet",
        data: null,
      };
    }

    if (+page > totalPage) {
      return {
        status: 400,
        message: "Page exceeded total page",
        data: null,
      };
    }

    const usersData = await prisma.users.findMany({
      skip: (+page - 1) * limit,
      take: limit,
    });

    return {
      status: 200,
      message: "Successfully get users data",
      data: {
        users: usersData,
        current_page: +page,
        total_page: totalPage,
      },
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.getUserById = async (req) => {
  try {
    const { userId } = req.params;

    const userData = await prisma.users.findUnique({
      where: {
        id: userId,
      },
      include: {
        profiles: true,
      },
    });

    if (!userData) {
      return {
        status: 404,
        message: "User not found",
        data: null,
      };
    }

    return {
      status: 200,
      message: "Successfully get user data",
      data: {
        user: userData,
      },
    };
  } catch (error) {
    throw new Error(error.message);
  }
};
