import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.DATABASE_URL || 'mongodb+srv://kolamgarimanasa97_db_user:r0w8sG0zYRDha8q6@courseportal.xyhy7sp.mongodb.net/courseportal?retryWrites=true&w=majority&appName=courseportal';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI);
    console.log(`MongoDB Connected: ${conn?.connection?.host || 'mock-host'}`);
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
  }
};

// Export mongoose to keep compatibility check or custom helpers if needed
export default mongoose;
