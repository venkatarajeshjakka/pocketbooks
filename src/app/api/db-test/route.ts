/**
 * Database Test API Route
 *
 * Tests database connectivity by performing actual database operations
 * This endpoint demonstrates how to use the MongoDB connection with Mongoose models
 */

import { NextResponse } from 'next/server';
import { connectToDatabase, mongoose } from '@/lib/mongodb';

export const dynamic = 'force-dynamic'; // Disable caching

/**
 * GET /api/db-test
 * Tests database connection by listing all collections
 */
export async function GET() {
  try {
    // Connect to database
    await connectToDatabase();

    // Get list of all collections
    const collections = await mongoose.connection.db
      ?.listCollections()
      .toArray();

    // Get database stats
    const dbStats = await mongoose.connection.db?.stats();

    return NextResponse.json(
      {
        success: true,
        message: 'Database connection successful',
        database: {
          name: mongoose.connection.db?.databaseName,
          collections: collections?.map((col) => ({
            name: col.name,
            type: col.type,
          })),
          stats: {
            collections: dbStats?.collections,
            dataSize: dbStats?.dataSize,
            indexes: dbStats?.indexes,
          },
        },
        connection: {
          host: mongoose.connection.host,
          port: mongoose.connection.port,
          readyState: mongoose.connection.readyState,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Database test failed:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
