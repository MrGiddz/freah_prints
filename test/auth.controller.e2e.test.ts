import request from "supertest";
import UserModel from "../src/models/user.model";

import { createVendor, doLogin } from "../src/modules/auth/auth.service";
import { HTTPError } from "../src/utils/http-errors";
import app from "../src/app";

// Mock UserModel and auth services
jest.mock("../src/models/user.model.ts");
jest.mock("../src/modules/auth/auth.service");

describe("Auth Controller", () => {
  afterEach(async () => {
    jest.clearAllMocks();
  });

  describe("POST /api/auth/register", () => {
    it("should return 400 if required fields are missing", async () => {
      const res = await request(app).post("/api/auth/register").send({});
      
      console.log(res.status, res.body);
  
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("errors");
      expect(Array.isArray(res.body.errors)).toBe(true);
      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          { field: "email", message: "Required" },
          { field: "name", message: "Required" },
          { field: "password", message: "Required" },
        ])
      );
    });


    it("should return 409 if email already exists", async () => {
      (UserModel.findOne as jest.Mock).mockResolvedValueOnce(true);

      const res = await request(app).post("/api/auth/register").send({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      });

      expect(res.status).toBe(409);
      expect(res.body.message).toBe("Account already exists");
    });

    it("should return 201 and create user if valid input is provided", async () => {
      (UserModel.findOne as jest.Mock).mockResolvedValueOnce(null);
      (createVendor as jest.Mock).mockResolvedValueOnce({
        id: "123",
        name: "John Doe",
        email: "john@example.com",
      });

      const res = await request(app).post("/api/auth/register").send({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      });

      expect(res.status).toBe(201);
      expect(res.body.user).toHaveProperty("id", "123");
      expect(res.body.user).toHaveProperty("email", "john@example.com");
    });
  });

  describe("POST /api/auth/login", () => {
    it("should return 400 if email or password is missing", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "test@example.com" });

        expect(res.body).toHaveProperty("success", false);
        expect(res.body).toHaveProperty("errors");
        expect(Array.isArray(res.body.errors)).toBe(true);
        expect(res.body.errors).toEqual(
          expect.arrayContaining([
            { field: "password", message: "Required" },
          ])
        );
    });

    it("should return 403 if credentials are incorrect", async () => {
      (doLogin as jest.Mock).mockRejectedValueOnce(
        new HTTPError({
          message: "Username or password incorrect",
          statusCode: 403,
          cause: "Invalid credentials",
        })
      );

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "test@example.com", password: "wrongpassword" });

      expect(res.status).toBe(403);
      expect(res.body.message).toBe("Username or password incorrect");
    });

    it("should return 200 and tokens if login is successful", async () => {
      const tokens = {
        accessToken: "access-token",
        refreshToken: "refresh-token",
      };

      (doLogin as jest.Mock).mockResolvedValueOnce(tokens);

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "test@example.com", password: "validpassword" });

      expect(res.status).toBe(200);
      expect(res.body).toEqual(tokens);
    });
  });
});
