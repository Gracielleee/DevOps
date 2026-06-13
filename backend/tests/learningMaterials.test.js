import request from 'supertest';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import app from '../app.js';
import User from '../src/models/user-profile.js';
import Subject from '../src/models/subject.js';
import LearningMaterial from '../src/models/learning-material.js';

const createTestUserAndSubject = async () => {
  const subject = await Subject.create({
    name: 'Mathematics',
    description: 'Math subject for testing'
  });

  const user = await User.create({
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    preferredSubject: subject._id
  });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

  return { user, subject, token };
};

describe('Learning Materials API', () => {
  describe('GET /api/materials', () => {
    it('should return 200 and an array of learning materials', async () => {
      const { user, subject, token } = await createTestUserAndSubject();

      await LearningMaterial.create({
        owner: user._id,
        subject: subject._id,
        topic: 'Algebra Basics',
        content: 'Introduction to algebra concepts'
      });

      const response = await request(app)
        .get('/api/materials')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].topic).toBe('Algebra Basics');
    });
  });

  describe('GET /api/materials/:id', () => {
    it('should return 200 for a valid ID', async () => {
      const { user, subject, token } = await createTestUserAndSubject();

      const material = await LearningMaterial.create({
        owner: user._id,
        subject: subject._id,
        topic: 'Geometry',
        content: 'Study of shapes and sizes'
      });

      const response = await request(app)
        .get(`/api/materials/${material._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.topic).toBe('Geometry');
    });

    it('should return 404 for a non-existent ID', async () => {
      const { token } = await createTestUserAndSubject();
      const nonExistentId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/api/materials/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/materials', () => {
    it('should return 201 on success and save data to the database', async () => {
      const { subject, token } = await createTestUserAndSubject();

      const newMaterial = {
        subject: subject._id.toString(),
        topic: 'Calculus',
        content: 'Limits, derivatives, and integrals'
      };

      const createResponse = await request(app)
        .post('/api/materials')
        .set('Authorization', `Bearer ${token}`)
        .send(newMaterial);

      expect(createResponse.status).toBe(201);
      expect(createResponse.body).toHaveProperty('data');
      expect(createResponse.body.data.topic).toBe('Calculus');

      const materialId = createResponse.body.data.id || createResponse.body.data._id;

      const fetchResponse = await request(app)
        .get(`/api/materials/${materialId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(fetchResponse.status).toBe(200);
      expect(fetchResponse.body.data.topic).toBe('Calculus');
      expect(fetchResponse.body.data.content).toBe('Limits, derivatives, and integrals');

      const dbMaterial = await LearningMaterial.findById(materialId);
      expect(dbMaterial).not.toBeNull();
      expect(dbMaterial.topic).toBe('Calculus');
    });

    it('should return 400 if required fields are missing', async () => {
      const { token } = await createTestUserAndSubject();

      const response = await request(app)
        .post('/api/materials')
        .set('Authorization', `Bearer ${token}`)
        .send({ topic: 'Missing subject and content' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
      expect(Array.isArray(response.body.errors)).toBe(true);
    });
  });
});
