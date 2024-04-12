/* c8 ignore start */

const { PrismaClient } = require("@prisma/client");
const userService = require("../services/users.service");
const prisma = new PrismaClient();
const request = require("supertest");
const mainRoute = "/api/v1";
const bcryptjs = require("bcryptjs");
const { registerUser } = require("../services/auth.service");

exports.usersTests = (app) => {
  beforeEach(async () => {
    let name = "Ketut";
    let email = "krisna@gmail.com";
    let password = "ketut123";
    let identity_type = "KTP";
    let identity_number = "98979567";
    let address = "Bonang";
    try {
      const response = await registerUser({ body: { name, email, password, identity_type, identity_number, address } });
    } catch (error) {
      console.log("Gagal membuat user");
    }
  });
  afterEach(async () => {
    await prisma.users.deleteMany({});
    // console.log("Mengapus data user");
  });
  describe(`GET ${mainRoute}/users/`, () => {
    test("return status:200 with body {status:200,message:'Successfully get users data',data:{users,current_page,total_page}}", async () => {
      try {
        const response = await request(app).get(`${mainRoute}/users`);
        // console.log("Mencari semua user");

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("status");
        expect(response.body).toHaveProperty("message");
        expect(response.body).toHaveProperty("data");
        expect(response.body.message).toEqual("Successfully get users data");
        expect(response.body.status).toBe(response.statusCode);
        expect(response.body.data).toHaveProperty("users");
        expect(response.body.data).toHaveProperty("current_page");
        expect(response.body.data).toHaveProperty("total_page");
        expect(response.body.data.users).toBeInstanceOf(Array);
        expect(response.body.data.users[0]).toBeInstanceOf(Object);
      } catch (error) {
        throw error;
      }
    });
    test("return status:400 with body {status:400,message:'Page exceeded total page',data:null} when page params exceeded total page", async () => {
      try {
        const limit = 5;
        const totalData = await prisma.users.count({});
        const totalPage = Math.ceil(totalData / limit);
        const response = await request(app).get(`${mainRoute}/users?page=${totalPage + 1}`);
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
    test("return status:400 with body {status:400,message:'No users created yet',data:null} when no users is created", async () => {
      try {
        const deleteUsers = await prisma.users.deleteMany({});
        const response = await request(app).get(`${mainRoute}/users`);
        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
          status: 400,
          message: "No users created yet",
          data: null,
        });
      } catch (error) {
        throw error;
      }
    });
    test("return status:400 with body {status:400,message:'Incorrect query value',data:null} when page is not a number", async () => {
      try {
        const response = await request(app).get(`${mainRoute}/users?page=a`);
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
  describe(`GET ${mainRoute}/users/:userId`, () => {
    test("return status:200 with body {status:200,message:'Successfully get user data',data:{users}}", async () => {
      try {
        const userData = await prisma.users.findUnique({
          where: {
            email: "krisna@gmail.com",
          },
        });
        const response = await request(app).get(`${mainRoute}/users/${userData.id}`);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("status");
        expect(response.body).toHaveProperty("message");
        expect(response.body).toHaveProperty("data");
        expect(response.body.message).toEqual("Successfully get user data");
        expect(response.body.status).toBe(response.statusCode);
        expect(response.body.data).toHaveProperty("user");
        expect(response.body.data.user).toBeInstanceOf(Object);
      } catch (error) {
        throw error;
      }
    });
    test("return status: 404 with body {status: 404, message: 'User not found', data: null} when user is not found", async () => {
      try {
        const response = await request(app).get(`${mainRoute}/users/123`);

        expect(response.statusCode).toBe(404);
        expect(response.body).toEqual({
          status: 404,
          message: "User not found",
          data: null,
        });
      } catch (error) {
        throw error;
      }
    });
  });
};
