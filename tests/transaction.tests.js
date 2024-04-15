/* c8 ignore start */

const request = require("supertest");
const mainRoute = "/api/v1";
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { registerUser } = require("../services/auth.service");

exports.transactionsTests = (app) => {
  describe(`POST ${mainRoute}/transactions`, () => {
    afterEach(async () => {
      await prisma.users.deleteMany({});
      //   console.log("after each : hapus");
    });
    test("return status:201 with body {status:201,message:'Transaction success',data:{transaction_response,your_account_status}} when success add transaction", async () => {
      try {
        const user1 = await addUser(1, app);
        const user2 = await addUser(2, app);

        // TRANSAKSI DARI USER 1 KE USER 2
        const response = await request(app)
          .post(`${mainRoute}/transactions`)
          .send({
            source_account_id: user1.account.body.data.accounts.id,
            destination_account_id: user2.account.body.data.accounts.id,
            amount: 2000,
          })
          .set({ Authorization: `Bearer ${user1.user.data.token}` });

        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty("status");
        expect(response.body).toHaveProperty("message");
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toBeInstanceOf(Object);
        expect(response.body.data).toHaveProperty("transaction_response");
        expect(response.body.data).toHaveProperty("your_account_status");
        expect(response.body.message).toEqual("Transaction success");
      } catch (error) {
        throw error;
      }
    });
    test("return status:400 with body {status:400,message:[validate.details],data:null} when required field missing/not fullfiled", async () => {
      try {
        const user1 = await addUser(1, app);
        const user2 = await addUser(2, app);

        // TRANSAKSI DARI USER 1 KE USER 2
        const response = await request(app)
          .post(`${mainRoute}/transactions`)
          .send({
            source_account_id: user1.account.body.data.accounts.id,
            destination_account_id: user2.account.body.data.accounts.id,
            // amount: 2000,
          })
          .set({ Authorization: `Bearer ${user1.user.data.token}` });
        // console.log(response.body);
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("status");
        expect(response.body).toHaveProperty("message");
        expect(response.body).toHaveProperty("data");
        expect(response.body.message).toBeInstanceOf(Array);
        expect(response.body.data).toBe(null);
      } catch (error) {
        throw error;
      }
    });
    test("return status:403 with body {status:403,message:'Not enough balance to proceed transactions',data:null} when balance is not enough", async () => {
      try {
        const user1 = await addUser(1, app);
        const user2 = await addUser(2, app);

        // TRANSAKSI DARI USER 1 KE USER 2
        const response = await request(app)
          .post(`${mainRoute}/transactions`)
          .send({
            source_account_id: user1.account.body.data.accounts.id,
            destination_account_id: user2.account.body.data.accounts.id,
            amount: 7000,
          })
          .set({ Authorization: `Bearer ${user1.user.data.token}` });

        expect(response.statusCode).toBe(403);
        expect(response.body).toEqual({
          status: 403,
          message: "Not enough balance to proceed transactions",
          data: null,
        });
      } catch (error) {
        throw error;
      }
    });
    test("return status:404 with body {status:404,message:'Destination/Source account not found',data:null} when one account not found", async () => {
      try {
        const user1 = await addUser(1, app);
        const user2 = await addUser(2, app);

        // TRANSAKSI DARI USER 1 KE USER 2
        const response = await request(app)
          .post(`${mainRoute}/transactions`)
          .send({
            source_account_id: "asda",
            destination_account_id: user2.account.body.data.accounts.id,
            amount: 2000,
          })
          .set({ Authorization: `Bearer ${user1.user.data.token}` });

        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty("status");
        expect(response.body).toHaveProperty("message");
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toBe(null);
      } catch (error) {
        throw error;
      }
    });
  });

  describe(`GET ${mainRoute}/transactions`, () => {
    beforeAll(async () => {
      const user1 = await addUser(1, app);
      const user2 = await addUser(2, app);

      // TRANSAKSI DARI USER 1 KE USER 2
      const createTransaction = await request(app)
        .post(`${mainRoute}/transactions`)
        .send({
          source_account_id: user1.account.body.data.accounts.id,
          destination_account_id: user2.account.body.data.accounts.id,
          amount: 2000,
        })
        .set({ Authorization: `Bearer ${user1.user.data.token}` });
      //   console.log("before all : create");
    });
    afterAll(async () => {
      await prisma.users.deleteMany({});
      //   console.log("after all : hapus");
    });
    test("return status:200 with body {status:200,message:'Sucessfuly get transactions data',data:{transactions,current_page,total_page}}", async () => {
      try {
        const response = await request(app).get(`${mainRoute}/transactions`);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("status");
        expect(response.body).toHaveProperty("message");
        expect(response.body).toHaveProperty("data");
        expect(response.body.message).toEqual("Sucessfuly get transactions data");
        expect(response.body.status).toBe(response.statusCode);
        expect(response.body.data).toHaveProperty("transactions");
        expect(response.body.data).toHaveProperty("current_page");
        expect(response.body.data).toHaveProperty("total_page");
        expect(response.body.data.transactions).toBeInstanceOf(Array);
        expect(response.body.data.transactions[0]).toBeInstanceOf(Object);
      } catch (error) {
        throw error;
      }
    });
    test("return status:400 with body {status:400,message:'Page exceeded total page',data:null} when page params exceeded total page", async () => {
      try {
        const limit = 5;
        const totalData = await prisma.transactions.count({});
        const totalPage = Math.ceil(totalData / limit);

        const response = await request(app).get(`${mainRoute}/transactions?page=${totalPage + 1}`);
        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
          status: 400,
          message: "Page exceeded total page",
          data: null,
        });
      } catch (error) {
        throw error;
      }
    });
    test("return status:400 with body {status:400,message:'No transactions created yet',data:null} when no transactions is created", async () => {
      try {
        const deleteTransaction = await prisma.transactions.deleteMany({});
        const response = await request(app).get(`${mainRoute}/transactions`);
        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
          status: 400,
          message: "No transactions created yet",
          data: null,
        });
      } catch (error) {
        throw error;
      }
    });
    test("return status:400 with body {status:400,message:'Incorrect query value',data:null} when page is not a number", async () => {
      try {
        const response = await request(app).get(`${mainRoute}/transactions?page=a`);
        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
          status: 400,
          message: "Incorrect query value",
          data: null,
        });
      } catch (error) {
        throw error;
      }
    });
  });

  describe(`GET ${mainRoute}/transactions/my`, () => {
    beforeAll(async () => {
      const user1 = await addUser(1, app);
      const user2 = await addUser(2, app);

      // TRANSAKSI DARI USER 1 KE USER 2
      const createTransaction = await request(app)
        .post(`${mainRoute}/transactions`)
        .send({
          source_account_id: user1.account.body.data.accounts.id,
          destination_account_id: user2.account.body.data.accounts.id,
          amount: 2000,
        })
        .set({ Authorization: `Bearer ${user1.user.data.token}` });
      // console.log("before all : create");
    });
    afterAll(async () => {
      await prisma.users.deleteMany({});
      // console.log("after all : hapus");
    });
    test("return status:200 with body {status:200,message:'Successfully get transactions data',data:[transactions]}", async () => {
      try {
        const responseLogin = await request(app).post(`${mainRoute}/auth/login`).send({
          email: "ketut1@gmail.com",
          password: "ketut123",
        });
        const response = await request(app)
          .get(`${mainRoute}/transactions/my`)
          .set({ Authorization: `Bearer ${responseLogin.body.data.token}` });
        // console.log("Cari");
        // console.log(response.body);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("status");
        expect(response.body).toHaveProperty("message");
        expect(response.body).toHaveProperty("data");
        expect(response.body.message).toEqual("Successfully get transactions data");
        expect(response.body.status).toBe(response.statusCode);
        expect(response.body.data.transactions).toBeInstanceOf(Array);
      } catch (error) {
        throw error;
      }
    });
  });
  describe(`GET ${mainRoute}/transactions/:id`, () => {
    beforeAll(async () => {
      const user1 = await addUser(1, app);
      const user2 = await addUser(2, app);

      // TRANSAKSI DARI USER 1 KE USER 2
      const createTransaction = await request(app)
        .post(`${mainRoute}/transactions`)
        .send({
          source_account_id: user1.account.body.data.accounts.id,
          destination_account_id: user2.account.body.data.accounts.id,
          amount: 2000,
        })
        .set({ Authorization: `Bearer ${user1.user.data.token}` });
      // console.log("before all : create");
    });
    afterAll(async () => {
      await prisma.users.deleteMany({});
      // console.log("after all : hapus");
    });
    test("return status:200 with body {status:200,message:'Successfully get transaction data',data:{transactions}}", async () => {
      try {
        const responseTransaction = await request(app).get(`${mainRoute}/transactions`);
        const response = await request(app).get(`${mainRoute}/transactions/${responseTransaction.body.data.transactions[0].id}`);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("status");
        expect(response.body).toHaveProperty("message");
        expect(response.body).toHaveProperty("data");
        expect(response.body.message).toEqual("Successfully get transaction data");
        expect(response.body.status).toBe(response.statusCode);
        expect(response.body.data.transactions).toBeInstanceOf(Object);
      } catch (error) {
        throw error;
      }
    });
    test("return status:404 with body {status:404,message:'Transaction not found',data:null} when transaction not found", async () => {
      try {
        const response = await request(app).get(`${mainRoute}/transactions/asdasd`);
        expect(response.statusCode).toBe(404);
        expect(response.body).toEqual({
          status: 404,
          message: "Transaction not found",
          data: null,
        });
      } catch (error) {
        throw error;
      }
    });
  });
};

async function addUser(num, app) {
  let name = "Ketut";
  let email = `ketut${num}@gmail.com`;
  let password = "ketut123";
  let identity_type = "KTP";
  let identity_number = "98979567";
  let address = "Bonang";

  try {
    const responseUser = await registerUser({ body: { name, email, password, identity_type, identity_number, address } });
    const responseAccount = await request(app)
      .post(`${mainRoute}/accounts`)
      .send({
        bank_name: "Bank Central Asia",
        bank_account_number: "1234566587",
        balance: 5000,
      })
      .set({ Authorization: `Bearer ${responseUser.data.token}` });
    //   console.log("Berhasil membuat user");
    return {
      user: responseUser,
      account: responseAccount,
    };
  } catch (error) {
    console.log("Gagal membuat user dan akun");
    console.log(error);
  }
}
