/**
 * MongoDB Connection Manager
 *
 * Handles MongoDB connection with caching for serverless environments
 * Implements connection pooling and error handling
 * Optimized for Next.js 15+ App Router
 */

import mongoose from 'mongoose';

if (!process.env.MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env file'
  );
}

const MONGODB_URI: string = process.env.MONGODB_URI;

// Validate MongoDB URI format
if (
  !MONGODB_URI.startsWith('mongodb://') &&
  !MONGODB_URI.startsWith('mongodb+srv://')
) {
  throw new Error(
    'Invalid MONGODB_URI format. Must start with mongodb:// or mongodb+srv://'
  );
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections from growing exponentially
 * during API Route usage.
 */
declare global {
  var mongoose: MongooseCache;
}

let cached: MongooseCache = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Connect to MongoDB with caching
 * Uses singleton pattern to prevent multiple connections in serverless environments
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
  // Return existing connection if available
  if (cached.conn) {
    return cached.conn;
  }

  // Create new connection promise if none exists
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Disable mongoose buffering
      maxPoolSize: 10, // Maximum number of connections in the pool
      minPoolSize: 2, // Minimum number of connections to maintain
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      serverSelectionTimeoutMS: 10000, // Timeout for selecting a server
      family: 4, // Use IPv4, skip trying IPv6
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongoose) => {
        const dbName = mongoose.connection.db?.databaseName || 'unknown';
        console.log(`MongoDB connected successfully to database: ${dbName}`);

        // Set up connection event listeners
        mongoose.connection.on('error', (err) => {
          console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
          console.warn('MongoDB disconnected. Attempting to reconnect...');
        });

        mongoose.connection.on('reconnected', () => {
          console.log('MongoDB reconnected successfully');
        });

        // Register legacy aliases for backward compatibility with old data
        // This fixes the issue where RefPath uses lowercase values but Models are PascalCase
        try {
          if (mongoose.models.TradingGood && !mongoose.models.trading_good) {
            mongoose.model('trading_good', mongoose.models.TradingGood.schema);
          }
          if (mongoose.models.FinishedGood && !mongoose.models.finished_good) {
            mongoose.model('finished_good', mongoose.models.FinishedGood.schema);
          }
          if (mongoose.models.RawMaterial && !mongoose.models.raw_material) {
            mongoose.model('raw_material', mongoose.models.RawMaterial.schema);
          }
        } catch (e) {
          console.warn('Failed to register legacy model aliases', e);
        }

        return mongoose;
      })
      .catch((error) => {
        console.error('MongoDB connection failed:', error);
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    // Reset promise on failure to allow retry
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

/**
 * Disconnect from MongoDB
 */
export async function disconnectFromDatabase(): Promise<void> {
  if (cached.conn) {
    await cached.conn.disconnect();
    cached.conn = null;
    cached.promise = null;
    console.log('MongoDB disconnected');
  }
}

/**
 * Check if MongoDB is connected
 */
export function isConnected(): boolean {
  return cached.conn !== null && mongoose.connection.readyState === 1;
}

/**
 * Get connection status
 */
export function getConnectionStatus(): string {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  return states[mongoose.connection.readyState] || 'unknown';
}

/**
 * Get detailed connection information
 */
export function getConnectionInfo() {
  return {
    status: getConnectionStatus(),
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host || null,
    port: mongoose.connection.port || null,
    name: mongoose.connection.name || null,
    collections: mongoose.connection.collections
      ? Object.keys(mongoose.connection.collections)
      : [],
  };
}

// Export mongoose instance for direct access if needed
export { mongoose };

// Export default connection function
export default connectToDatabase;
