/* c8 ignore start */

const request = require("supertest");
const mainRoute = "/api/v1";
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { registerUser } = require("../services/auth.service");

exports.accountsTest = (app) => {
  beforeAll(async () => {
    let name = "Ketut";
    let email = "ketut123@gmail.com";
    let password = "ketut123";
    let identity_type = "KTP";
    let identity_number = "98979567";
    let address = "Bonang";

    try {
      const response = await registerUser({ body: { name, email, password, identity_type, identity_number, address } });
      //   console.log("Berhasil membuat user");
    } catch (error) {
      console.log("Gagal membuat user");
    }
  });
  afterAll(async () => {
    await prisma.users.deleteMany({});
    // console.log("menghapus user");
  });
  describe(`POST ${mainRoute}/accounts/`, () => {
    test("return status:201 with body {status:201,message:'Successfully create an account',data:{accounts}} when success create account", async () => {
      try {
        const responseLogin = await request(app).post(`${mainRoute}/auth/login`).send({
          email: "ketut123@gmail.com",
          password: "ketut123",
        });
        const response = await request(app)
          .post(`${mainRoute}/accounts`)
          .send({
            bank_name: "Bank Central Asia",
            bank_account_number: "1234566587",
            balance: 1000,
          })
          .set({ Authorization: `Bearer ${responseLogin.body.data.token}` });
        // console.log(response.body);
        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty("status");
        expect(response.body).toHaveProperty("message");
        expect(response.body).toHaveProperty("data");
        expect(response.body.message).toEqual("Successfully create an account");
        expect(response.body.data).toBeInstanceOf(Object);
      } catch (error) {
        throw error;
      }
    });
    test("return status:400 with body {status:400,message:[validate.details],data:null} when required field missing/not fullfiled", async () => {
      try {
        const responseLogin = await request(app).post(`${mainRoute}/auth/login`).send({
          email: "ketut123@gmail.com",
          password: "ketut123",
        });
        const response = await request(app)
          .post(`${mainRoute}/accounts`)
          .send({
            bank_name: "Bank Central Asia",
            bank_account_number: "1234566587",
            // balance: 1000,
          })
          .set({ Authorization: `Bearer ${responseLogin.body.data.token}` });
        // console.log(response.body);
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("status");
        expect(response.body).toHaveProperty("message");
        expect(response.body).toHaveProperty("data");
        expect(response.body.message).toBeInstanceOf(Array);
      } catch (error) {
        throw error;
      }
    });
  });

  describe(`GET ${mainRoute}/accounts/`, () => {
    beforeEach(async () => {
      try {
        const responseLogin = await request(app).post(`${mainRoute}/auth/login`).send({
          email: "ketut123@gmail.com",
          password: "ketut123",
        });
        const response = await request(app)
          .post(`${mainRoute}/accounts`)
          .send({
            bank_name: "Bank Central Asia",
            bank_account_number: "1234566587",
            balance: 1000,
          })
          .set({ Authorization: `Bearer ${responseLogin.body.data.token}` });
        // console.log("Berhasil membuat akun");
      } catch (error) {
        console.log("Gagal membuat akun");
      }
    });
    afterEach(async () => {
      await prisma.bankAccounts.deleteMany({});
      //   console.log("Berhasil hapus akun");
    });
    test("return status:200 with body {status:200,message:'Sucessfuly get accounts data',data:{accounts,current_page,total_page}}", async () => {
      try {
        const response = await request(app).get(`${mainRoute}/accounts`);
        // console.log("Cari");
        // console.log(response.body);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("status");
        expect(response.body).toHaveProperty("message");
        expect(response.body).toHaveProperty("data");
        expect(response.body.message).toEqual("Sucessfuly get accounts data");
        expect(response.body.status).toBe(response.statusCode);
        expect(response.body.data).toHaveProperty("accounts");
        expect(response.body.data).toHaveProperty("current_page");
        expect(response.body.data).toHaveProperty("total_page");
        expect(response.body.data.accounts).toBeInstanceOf(Array);
        expect(response.body.data.accounts[0]).toBeInstanceOf(Object);
      } catch (error) {
        throw error;
      }
    });
    test("return status:400 with body {status:400,message:'Page exceeded total page',data:null} when page params exceeded total page", async () => {
      try {
        const limit = 5;
        const totalData = await prisma.bankAccounts.count({});
        const totalPage = Math.ceil(totalData / limit);
        const response = await request(app).get(`${mainRoute}/accounts?page=${totalPage + 1}`);
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("status");
        expect(response.body).toHaveProperty("message");
        expect(response.body).toHaveProperty("data");
        expect(response.body.status).toBe(response.statusCode);
        expect(response.body.message).toEqual("Page exceeded total page");
        expect(response.body.data).toEqual(null);
      } catch (error) {
        throw error;
      }
    });
    test("return status:400 with body {status:400,message:'No accounts created yet',data:null} when no accounts is created", async () => {
      try {
        const deleteAccount = await prisma.bankAccounts.deleteMany({});
        const response = await request(app).get(`${mainRoute}/accounts`);
        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
          status: 400,
          message: "No accounts created yet",
          data: null,
        });
      } catch (error) {
        throw error;
      }
    });
    test("return status:400 with body {status:400,message:'Incorrect query value',data:null} when page is not a number", async () => {
      try {
        const response = await request(app).get(`${mainRoute}/accounts?page=a`);
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
  describe(`GET ${mainRoute}/accounts/my`, () => {
    beforeEach(async () => {
      try {
        const responseLogin = await request(app).post(`${mainRoute}/auth/login`).send({
          email: "ketut123@gmail.com",
          password: "ketut123",
        });
        const response = await request(app)
          .post(`${mainRoute}/accounts`)
          .send({
            bank_name: "Bank Central Asia",
            bank_account_number: "1234566587",
            balance: 1000,
          })
          .set({ Authorization: `Bearer ${responseLogin.body.data.token}` });
        // console.log("Berhasil membuat akun");
      } catch (error) {
        console.log("Gagal membuat akun");
      }
    });
    afterEach(async () => {
      await prisma.bankAccounts.deleteMany({});
      //   console.log("Berhasil hapus akun");
    });
    test("return status:200 with body {status:200,message:'Sucessfuly get accounts data',data:{accounts}}", async () => {
      try {
        const responseLogin = await request(app).post(`${mainRoute}/auth/login`).send({
          email: "ketut123@gmail.com",
          password: "ketut123",
        });
        const response = await request(app)
          .get(`${mainRoute}/accounts/my`)
          .set({ Authorization: `Bearer ${responseLogin.body.data.token}` });
        // console.log("Cari");
        // console.log(response.body);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("status");
        expect(response.body).toHaveProperty("message");
        expect(response.body).toHaveProperty("data");
        expect(response.body.message).toEqual("Successfully get accounts data");
        expect(response.body.status).toBe(response.statusCode);
        expect(response.body.data.accounts).toBeInstanceOf(Array);
      } catch (error) {
        throw error;
      }
    });
  });
  describe(`GET ${mainRoute}/accounts/:id`, () => {
    beforeEach(async () => {
      try {
        const responseLogin = await request(app).post(`${mainRoute}/auth/login`).send({
          email: "ketut123@gmail.com",
          password: "ketut123",
        });
        const response = await request(app)
          .post(`${mainRoute}/accounts`)
          .send({
            bank_name: "Bank Central Asia",
            bank_account_number: "1234566587",
            balance: 1000,
          })
          .set({ Authorization: `Bearer ${responseLogin.body.data.token}` });
        // console.log("Berhasil membuat akun");
      } catch (error) {
        console.log("Gagal membuat akun");
      }
    });
    afterEach(async () => {
      await prisma.bankAccounts.deleteMany({});
      //   console.log("Berhasil hapus akun");
    });

    test("return status:200 with body {status:200,message:'Sucessfuly get account data',data:{accounts}}", async () => {
      try {
        const responseLogin = await request(app).post(`${mainRoute}/auth/login`).send({
          email: "ketut123@gmail.com",
          password: "ketut123",
        });
        const responseMyAccount = await request(app)
          .get(`${mainRoute}/accounts/my`)
          .set({ Authorization: `Bearer ${responseLogin.body.data.token}` });
        const response = await request(app).get(`${mainRoute}/accounts/${responseMyAccount.body.data.accounts[0].id}`);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("status");
        expect(response.body).toHaveProperty("message");
        expect(response.body).toHaveProperty("data");
        expect(response.body.message).toEqual("Successfully get account data");
        expect(response.body.status).toBe(response.statusCode);
        expect(response.body.data.accounts).toBeInstanceOf(Object);
      } catch (error) {
        throw error;
      }
    });
    test("return status:404 with body {status:404,message:'Account not found',data:null when account not found", async () => {
      try {
        const response = await request(app).get(`${mainRoute}/accounts/asdasd`);
        expect(response.statusCode).toBe(404);
        expect(response.body).toEqual({
          status: 404,
          message: "Account not found",
          data: null,
        });
      } catch (error) {
        throw error;
      }
    });
  });
};
