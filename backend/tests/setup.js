import path from 'path';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
let mongoServer;

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-jwt-secret';

  const downloadDir = path.resolve(process.cwd(), '.cache/mongodb-binaries');

  mongoServer = await MongoMemoryServer.create({
    binary: {
      version: '7.0.14',
      downloadDir,
    },
  });
  const uri = mongoServer.getUri();

  await mongoose.connect(uri);
}, 120000); // Increase timeout for first-run download

afterAll(async () => {
  try {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
});


beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});
