import request from "supertest";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import app from "../app.js";

import User from "../src/models/user-profile.js";
import Subject from "../src/models/subject.js";
import Message from "../src/models/message.js";

const createTestUserAndSubject = async () => {
  const subject = await Subject.create({
    name: "General",
    description: "Default subject for testing",
  });

  const user = await User.create({
    name: "Test User",
    email: `test_${Date.now()}@example.com`,
    password: "TestPass123!",
    preferredSubject: subject._id,
  });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

  return { user, subject, token };
};

describe("BrainBytes API Integration Tests", () => {
  // ----------------------------
  // SUBJECTS
  // ----------------------------
  describe("GET /api/subjects", () => {
    it("should return 200 and list of subjects", async () => {
      await Subject.create({
        name: "Mathematics",
        description: "Math subject",
      });

      const res = await request(app).get("/api/subjects");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  // ----------------------------
  // GUEST MESSAGES
  // ----------------------------
  describe("GET /api/messages (guest)", () => {
    it("should return paginated messages", async () => {
      const res = await request(app).get("/api/messages?page=1&limit=20");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.messages)).toBe(true);
      expect(res.body).toHaveProperty("totalCount");
      expect(res.body).toHaveProperty("hasNextPage");
    });
  });

  // ----------------------------
  // REGISTER + LOGIN
  // ----------------------------
  describe("Auth flow", () => {
    it("should register a new user", async () => {
      const subject = await Subject.create({
        name: "General",
        description: "Default",
      });

      const res = await request(app).post("/api/register").send({
        name: "Integration User",
        email: `test_${Date.now()}@example.com`,
        password: "TestPass123!",
        preferredSubject: subject._id,
      });

      expect(res.status).toBe(201);
    });

    it("should login and return JWT", async () => {
      const subject = await Subject.create({
        name: "General",
        description: "Default",
      });

      const email = `test_${Date.now()}@example.com`;

      await request(app).post("/api/register").send({
        name: "Login User",
        email,
        password: "TestPass123!",
        preferredSubject: subject._id,
      });

      const res = await request(app).post("/api/login").send({
        email,
        password: "TestPass123!",
      });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
    });
  });

  // ----------------------------
  // PROFILE
  // ----------------------------
  describe("GET /api/profile", () => {
    it("should return user profile", async () => {
      const { token } = await createTestUserAndSubject();

      const res = await request(app)
        .get("/api/profile")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty("preferredSubject");
    });

    it("should reject invalid token", async () => {
      const res = await request(app)
        .get("/api/profile")
        .set("Authorization", "Bearer invalid.token.here");

      expect(res.status).toBe(401);
      expect(res.body.message.toLowerCase()).toContain("token");
    });
  });

  // ----------------------------
  // MESSAGES
  // ----------------------------
  describe("POST /api/messages", () => {
    it("should create message with auth and return AI response", async () => {
      const { subject, token } = await createTestUserAndSubject();

      const res = await request(app)
        .post("/api/messages")
        .set("Authorization", `Bearer ${token}`)
        .send({
          text: "what is 1+1",
          subject: subject._id,
        });

      expect(res.status).toBe(201);
      expect(res.body.aiMessage).toBeDefined();
    });

    it("should allow guest message creation", async () => {
      const subject = await Subject.create({
        name: "General",
        description: "Default",
      });

      const res = await request(app).post("/api/messages").send({
        text: "hello guest",
        subject: subject._id,
      });

      expect(res.status).toBe(201);
    });

    it("should reject invalid JWT", async () => {
      const subject = await Subject.create({
        name: "General",
        description: "Default",
      });

      const res = await request(app)
        .post("/api/messages")
        .set("Authorization", "Bearer bad.token")
        .send({
          text: "hello",
          subject: subject._id,
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Invalid or expired token");
    });
  });

  // ----------------------------
  // PAGINATION
  // ----------------------------
  describe("GET /api/messages pagination", () => {
    it("should return paginated structure", async () => {
      const { token } = await createTestUserAndSubject();

      const res = await request(app)
        .get("/api/messages?page=1&limit=20")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.messages)).toBe(true);
      expect(typeof res.body.totalCount).toBe("number");
      expect(typeof res.body.currentPage).toBe("number");
      expect(typeof res.body.hasNextPage).toBe("boolean");
    });
  });
});