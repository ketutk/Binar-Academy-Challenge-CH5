/* c8 ignore start */

const request = require("supertest");
const mainRoute = "/api/v1";
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { registerUser } = require("../services/auth.service");

exports.authTests = (app) => {
  beforeEach(async () => {
    let name = "Ketut";
    let email = "ketut123@gmail.com";
    let password = "ketut123";
    let identity_type = "KTP";
    let identity_number = "98979567";
    let address = "Bonang";

    try {
      const response = await registerUser({ body: { name, email, password, identity_type, identity_number, address } });
      // console.log("Berhasil membuat user");
    } catch (error) {
      console.log("Gagal membuat user");
    }
  });
  afterEach(async () => {
    await prisma.users.deleteMany({});
    // console.log("Mengapus data user");
  });
  // CREATE USERS AND USERS PROFILE
  describe(`POST ${mainRoute}/auth/register`, () => {
    test("return status:201 with body {status:201,message:'Successfully register',data:{user:userdata,token:token}}", async () => {
      try {
        const responseRegister = await request(app).post(`${mainRoute}/auth/register`).send({
          name: "Ketut",
          email: "ketut@gmail.com",
          password: "ketut123",
          identity_type: "KTP",
          identity_number: "98979567",
          address: "Bonang",
        });
        expect(responseRegister.statusCode).toBe(201);
        expect(responseRegister.body).toHaveProperty("status");
        expect(responseRegister.body).toHaveProperty("message");
        expect(responseRegister.body).toHaveProperty("data");
        expect(responseRegister.body.message).toEqual("Successfully register");
        expect(responseRegister.body.status).toEqual(responseRegister.statusCode);
        expect(responseRegister.body.data).toHaveProperty("user");
        expect(responseRegister.body.data).toHaveProperty("token");
        expect(responseRegister.body.data.user).toBeInstanceOf(Object);
      } catch (error) {
        throw error;
      }
    });
    test("return status:400 with body {status:400,message:[{validate detail}],data:null} when required field is missing", async () => {
      try {
        const responseRegister = await request(app).post(`${mainRoute}/auth/register`).send({
          name: "Ketut",
          email: "ketut@gmail.com",
          password: "ketut123",
          identity_type: "KTP",
          identity_number: "98979567",
        });
        // console.log("Membuat user duplikat");
        expect(responseRegister.statusCode).toBe(400);
        expect(responseRegister.body).toHaveProperty("status");
        expect(responseRegister.body).toHaveProperty("message");
        expect(responseRegister.body).toHaveProperty("data");
        expect(responseRegister.body.message).toBeInstanceOf(Array);
        expect(responseRegister.body.data).toEqual(null);
      } catch (error) {
        throw error;
      }
    });
    test("return status:400 with body {status:400,message:'Please input valid email',data:null} when email not valid", async () => {
      try {
        const responseRegister = await request(app).post(`${mainRoute}/auth/register`).send({
          name: "Ketut",
          email: "ketutgmailcom",
          password: "ketut123",
          identity_type: "KTP",
          identity_number: "98979567",
          address: "Bonang",
        });
        // console.log("Membuat user duplikat");
        expect(responseRegister.statusCode).toBe(400);
        expect(responseRegister.body).toEqual({
          status: 400,
          message: "Please input valid email",
          data: null,
        });
      } catch (error) {
        throw error;
      }
    });
    test("return status:403 with body {status:403,message:'This email is already used',data:null} when email is already used", async () => {
      try {
        const responseRegister = await request(app).post(`${mainRoute}/auth/register`).send({
          name: "Ketut",
          email: "ketut123@gmail.com",
          password: "ketut123",
          identity_type: "KTP",
          identity_number: "98979567",
          address: "Bonang",
        });
        // console.log("Membuat user duplikat");
        expect(responseRegister.statusCode).toBe(403);
        expect(responseRegister.body).toEqual({
          status: 403,
          message: "This email is already used",
          data: null,
        });
      } catch (error) {
        throw error;
      }
    });
  });

  // LOGIN USERS
  describe(`POST ${mainRoute}/auth/login`, () => {
    test("return status:200 with body {status:200,message:'Successfully login',data:{token:token}}", async () => {
      try {
        const responseLogin = await request(app).post(`${mainRoute}/auth/login`).send({
          email: "ketut123@gmail.com",
          password: "ketut123",
        });
        expect(responseLogin.statusCode).toBe(200);
        expect(responseLogin.body).toHaveProperty("status");
        expect(responseLogin.body).toHaveProperty("message");
        expect(responseLogin.body.message).toEqual("Successfully login");
        expect(responseLogin.body.status).toBe(responseLogin.statusCode);
        expect(responseLogin.body).toHaveProperty("data");
        expect(responseLogin.body.data).toHaveProperty("token");
      } catch (error) {
        throw error;
      }
    });
    test("return status:400 with body {status:400,message:[validation details],data:null} when required field is missing", async () => {
      try {
        const responseLogin = await request(app).post(`${mainRoute}/auth/login`).send({
          email: "ketut123@gmail.com",
        });
        expect(responseLogin.statusCode).toBe(400);
        expect(responseLogin.body).toHaveProperty("status");
        expect(responseLogin.body).toHaveProperty("message");
        expect(responseLogin.body).toHaveProperty("data");
        expect(responseLogin.body.message).toBeInstanceOf(Array);
        expect(responseLogin.body.data).toEqual(null);
      } catch (error) {
        throw error;
      }
    });
    test("return status:404 with body {status:403,message:'Incorrect email or password',data:null} when email is not found", async () => {
      try {
        const responseLogin = await request(app).post(`${mainRoute}/auth/login`).send({
          email: "ketut1234@gmail.com",
          password: "ketut123",
        });
        expect(responseLogin.statusCode).toBe(403);
        expect(responseLogin.body).toEqual({
          status: 403,
          message: "Incorrect email or password",
          data: null,
        });
      } catch (error) {
        throw error;
      }
    });
    test("return status:403 with body {status:403,message:'Incorrect email or password',data:null} when password is wrong", async () => {
      try {
        const responseLogin = await request(app).post(`${mainRoute}/auth/login`).send({
          email: "ketut123@gmail.com",
          password: "ketut1234",
        });
        expect(responseLogin.statusCode).toBe(403);
        expect(responseLogin.body).toEqual({
          status: 403,
          message: "Incorrect email or password",
          data: null,
        });
      } catch (error) {
        throw error;
      }
    });
  });

  describe(`POST ${mainRoute}/auth/authenticate`, () => {
    test("return status:200 with body {status:200,message:'Authentication success',data:{object}} when authentication success", async () => {
      try {
        const responseLogin = await request(app).post(`${mainRoute}/auth/login`).send({
          email: "ketut123@gmail.com",
          password: "ketut123",
        });
        if (!responseLogin?.body?.data?.token) {
          throw new Error("Failed to login");
        }
        const authenticateResponse = await request(app)
          .post(`${mainRoute}/auth/authenticate`)
          .set({ Authorization: `Bearer ${responseLogin.body.data.token}` });
        expect(authenticateResponse.statusCode).toBe(200);
        expect(authenticateResponse.body).toHaveProperty("status");
        expect(authenticateResponse.body).toHaveProperty("message");
        expect(authenticateResponse.body).toHaveProperty("data");
        expect(authenticateResponse.body.message).toEqual("Authentication success");
        expect(authenticateResponse.body.data).toBeInstanceOf(Object);
      } catch (error) {
        throw error;
      }
    });
    test("return status:401 with body {status:401,message:'Authentication failed, please login.',data:null} when no headers authorization ", async () => {
      try {
        const authenticateResponse = await request(app).post(`${mainRoute}/auth/authenticate`);
        expect(authenticateResponse.statusCode).toBe(401);
        expect(authenticateResponse.body).toEqual({
          status: 401,
          message: "Authentication failed, please login.",
          data: null,
        });
      } catch (error) {
        throw error;
      }
    });
    test("return status:401 with body {status:401,message:'Authentication failed, jwt invalid.',data:null} when jwt not found/expired", async () => {
      try {
        const authenticateResponse = await request(app).post(`${mainRoute}/auth/authenticate`).set({ Authorization: `asda` }); //JWT NGASAL
        expect(authenticateResponse.statusCode).toBe(401);
        expect(authenticateResponse.body).toEqual({
          status: 401,
          message: "Authentication failed, jwt invalid.",
          data: null,
        });
      } catch (error) {
        throw error;
      }
    });
  });
};
