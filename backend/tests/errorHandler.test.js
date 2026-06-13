import { jest } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import app from '../app.js';
import User from '../src/models/user-profile.js';
import Subject from '../src/models/subject.js';
import LearningMaterial from '../src/models/learning-material.js';

const createTestUserAndSubject = async () => {
  const subject = await Subject.create({
    name: 'Science',
    description: 'Science subject for testing'
  });

  const user = await User.create({
    name: 'Error Test User',
    email: 'error-test@example.com',
    password: 'password123',
    preferredSubject: subject._id
  });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

  return { user, subject, token };
};

describe('Error Handling Middleware', () => {
  it('should return 404 for an unknown route', async () => {
    const response = await request(app).get('/api/unknown-route');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message');
  });

  it('should return JSON with a message field from the global error handler', async () => {
    const { user, subject, token } = await createTestUserAndSubject();

    const material = await LearningMaterial.create({
      owner: user._id,
      subject: subject._id,
      topic: 'Physics',
      content: 'Laws of motion'
    });

    const findByIdSpy = jest.spyOn(LearningMaterial, 'findById').mockImplementation(() => {
      throw new Error('Simulated unexpected database error');
    });

    const response = await request(app)
      .get(`/api/materials/${material._id}`)
      .set('Authorization', `Bearer ${token}`);

    findByIdSpy.mockRestore();

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('Simulated unexpected database error');
  });

  it('should return 400 for invalid ObjectId via CastError handling', async () => {
    const { token } = await createTestUserAndSubject();

    const response = await request(app)
      .get('/api/materials/invalid-id-format')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message');
  });
});
