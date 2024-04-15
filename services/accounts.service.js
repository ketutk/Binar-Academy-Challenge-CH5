const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.createAccount = async (req) => {
  try {
    const { bank_name, bank_account_number, balance } = req.body;

    const response = await prisma.bankAccounts.create({
      data: {
        user_id: req.user_data.id,
        bank_name,
        bank_account_number,
        balance,
      },
    });

    return {
      status: 201,
      message: "Successfully create an account",
      data: {
        accounts: response,
      },
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.getMyAccounts = async (req) => {
  try {
    const accountsData = await prisma.bankAccounts.findMany({
      where: {
        user_id: req.user_data.id,
      },
    });
    return {
      status: 200,
      message: "Successfully get accounts data",
      data: {
        accounts: accountsData,
      },
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.getAccounts = async (req) => {
  try {
    // Pagination setting
    const page = req.query.page || 1;
    const limit = 5;
    const totalData = await prisma.bankAccounts.count({});
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
        message: "No accounts created yet",
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

    const accountsData = await prisma.bankAccounts.findMany({
      skip: (+page - 1) * limit,
      take: limit,
    });

    return {
      status: 200,
      message: "Sucessfuly get accounts data",
      data: {
        accounts: accountsData,
        current_page: +page,
        total_page: totalPage,
      },
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.getAccountById = async (req) => {
  try {
    const { accountId } = req.params;

    const accountsData = await prisma.bankAccounts.findUnique({
      where: {
        id: accountId,
      },
      include: {
        user: true,
        payment_sent: true,
        payment_received: true,
      },
    });

    if (!accountsData) {
      return {
        status: 404,
        message: "Account not found",
        data: null,
      };
    }

    return {
      status: 200,
      message: "Successfully get account data",
      data: {
        accounts: accountsData,
      },
    };
  } catch (error) {
    throw new Error(error.message);
  }
};
