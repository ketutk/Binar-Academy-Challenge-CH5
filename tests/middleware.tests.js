/* c8 ignore start */

const request = require("supertest");
const mainRoute = "/api/v1";
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { registerUser } = require("../services/auth.service");

exports.middlewareTests = (app) => {
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
      throw error;
    }
  });
  afterAll(async () => {
    await prisma.users.deleteMany({});
    // console.log("menghapus user");
  });
  describe(`Testing Middleware`, () => {
    test("go to next process when authentication success", async () => {
      try {
        const responseLogin = await request(app).post(`${mainRoute}/auth/login`).send({
          email: "ketut123@gmail.com",
          password: "ketut123",
        });
        if (!responseLogin?.body?.data?.token) {
          throw new Error("Failed to login");
        }
        const response = await request(app)
          .get(`${mainRoute}/accounts/my`)
          .set({ Authorization: `Bearer ${responseLogin.body.data.token}` });
        expect(response.statusCode).toBe(200);
      } catch (error) {
        throw error;
      }
    });
    test("return status:401 with body {status:401,message:'Authentication failed, please login.',data:null} when no headers authorization ", async () => {
      try {
        const response = await request(app).get(`${mainRoute}/accounts/my`);
        expect(response.statusCode).toBe(401);
        expect(response.body).toEqual({
          status: 401,
          message: "Authentication failed, please login.",
          data: null,
        });
      } catch (error) {
        throw error;
      }
    });
    test("return status:500 with body {status:500,message:{error message},data:null} when jwt not found/expired or any unexpected error", async () => {
      try {
        const response = await request(app).get(`${mainRoute}/accounts/my`).set({ Authorization: `Bearer asda` }); //JWT NGASAL
        expect(response.statusCode).toBe(500);
        expect(response.body).toHaveProperty("status");
        expect(response.body).toHaveProperty("message");
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toEqual(null);
      } catch (error) {
        throw error;
      }
    });
  });
};
