const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.addTransaction = async (req) => {
  try {
    const { source_account_id, destination_account_id, amount } = req.body;

    const sourceAccount = await prisma.bankAccounts.findUnique({
      where: {
        id: source_account_id,
        user_id: req.user_data.id,
      },
    });

    const destinationAccount = await prisma.bankAccounts.findUnique({
      where: {
        id: destination_account_id,
      },
    });

    if (!sourceAccount) {
      return {
        status: 404,
        message: "Source Account not found",
        data: null,
      };
    }

    if (!destinationAccount) {
      return {
        status: 404,
        message: "Destination Account not found",
        data: null,
      };
    }

    if (sourceAccount.balance < amount) {
      return {
        status: 403,
        message: "Not enough balance to proceed transactions",
        data: null,
      };
    }

    const updateAmountSource = await prisma.bankAccounts.update({
      where: {
        id: source_account_id,
        user_id: req.user_data.id,
      },
      data: {
        balance: sourceAccount.balance - amount,
      },
    });

    const updateAmountDestination = await prisma.bankAccounts.update({
      where: {
        id: destination_account_id,
      },
      data: {
        balance: destinationAccount.balance + amount,
      },
    });

    const transaction_response = await prisma.transactions.create({
      data: {
        source_account_id,
        destination_account_id,
        amount,
      },
    });

    return {
      status: 201,
      message: "Transaction success",
      data: {
        transaction_response,
        your_account_status: updateAmountSource,
      },
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.getTransactions = async (req) => {
  try {
    // Pagination setting
    const page = req.query.page || 1;
    const limit = 5;
    const totalData = await prisma.transactions.count({});
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
        message: "No transactions created yet",
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

    const transactionsData = await prisma.transactions.findMany({
      skip: (+page - 1) * limit,
      take: limit,
    });

    return {
      status: 200,
      message: "Sucessfuly get transactions data",
      data: {
        transactions: transactionsData,
        current_page: +page,
        total_page: totalPage,
      },
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.getMyTransactions = async (req) => {
  try {
    const transactionsData = await prisma.transactions.findMany({
      where: {
        OR: [
          {
            source_account: {
              user_id: req.user_data.id,
            },
          },
          {
            destination_account: {
              user_id: req.user_data.id,
            },
          },
        ],
      },
      include: {
        source_account: true,
        destination_account: true,
      },
    });
    return {
      status: 200,
      message: "Successfully get transactions data",
      data: {
        transactions: transactionsData,
      },
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.getTransactionById = async (req) => {
  try {
    const { transactionId } = req.params;

    const transactionData = await prisma.transactions.findUnique({
      where: {
        id: transactionId,
      },
      include: {
        source_account: {
          include: {
            user: true,
          },
        },
        destination_account: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!transactionData) {
      return {
        status: 404,
        message: "Transaction not found",
        data: null,
      };
    }
    return {
      status: 200,
      message: "Successfully get transaction data",
      data: {
        transactions: transactionData,
      },
    };
  } catch (error) {
    throw new Error(error.message);
  }
};
