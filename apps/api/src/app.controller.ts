import { Controller, Get } from '@nestjs/common';
import { Pool } from 'pg';

const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : null;

type DatabaseStatus = {
  connected: boolean;
  eventCount?: number;
  message?: string;
};

const recordDatabaseHeartbeat = async (): Promise<DatabaseStatus> => {
  if (!pool) {
    return {
      connected: false,
      message: 'DATABASE_URL is not set for this service.',
    };
  }

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS starter_events (
        id BIGSERIAL PRIMARY KEY,
        service TEXT NOT NULL,
        environment TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await pool.query(
      'INSERT INTO starter_events (service, environment) VALUES ($1, $2)',
      [
        process.env.STRICTOPS_SERVICE_NAME || 'api',
        process.env.STRICTOPS_ENV_NAME || 'local',
      ],
    );
    const result = await pool.query<{ count: string }>('SELECT COUNT(*) AS count FROM starter_events');
    return {
      connected: true,
      eventCount: Number(result.rows[0].count),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Database query failed.';
    return {
      connected: false,
      message,
    };
  }
};

@Controller()
export class AppController {
  @Get()
  getRoot() {
    return {
      service: process.env.STRICTOPS_SERVICE_NAME || 'api',
      environment: process.env.STRICTOPS_ENV_NAME || 'local',
      project: process.env.STRICTOPS_PROJECT_NAME || 'starter',
      region: process.env.STRICTOPS_REGION || 'local',
      status: 'running',
    };
  }

  @Get('status')
  async getStatus() {
    return {
      ...this.getRoot(),
      database: await recordDatabaseHeartbeat(),
    };
  }

  @Get('health')
  getHealth() {
    return { ok: true };
  }
}
