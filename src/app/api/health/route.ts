/**
 * Health Check API Route
 *
 * Provides application and database health status
 * Useful for monitoring and debugging database connectivity
 */

import { NextResponse } from 'next/server';
import {
  connectToDatabase,
  isConnected,
  getConnectionStatus,
  getConnectionInfo
} from '@/lib/mongodb';

export const dynamic = 'force-dynamic'; // Disable caching for health checks

/**
 * GET /api/health
 * Returns health status of the application and database
 */
export async function GET() {
  try {
    const startTime = Date.now();

    // Attempt to connect to database
    await connectToDatabase();

    const connectionTime = Date.now() - startTime;
    const connected = isConnected();
    const status = getConnectionStatus();
    const info = getConnectionInfo();

    if (!connected) {
      return NextResponse.json(
        {
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          database: {
            connected: false,
            status,
            message: 'Database connection failed',
          },
          application: {
            status: 'degraded',
            version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
            environment: process.env.NODE_ENV || 'development',
          },
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: {
          connected: true,
          status,
          connectionTime: `${connectionTime}ms`,
          name: info.name,
          host: info.host,
          collections: info.collections,
        },
        application: {
          status: 'running',
          version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
          environment: process.env.NODE_ENV || 'development',
          uptime: process.uptime(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Health check failed:', error);

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: {
          connected: false,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        application: {
          status: 'degraded',
          version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
          environment: process.env.NODE_ENV || 'development',
        },
      },
      { status: 503 }
    );
  }
}
