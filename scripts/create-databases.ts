import 'dotenv/config';
import { Client } from 'pg';

const DATABASE_ENV_KEYS = ['USERS_DATABASE_URL', 'AUTH_DATABASE_URL'] as const;

function getDatabaseUrl(envKey: (typeof DATABASE_ENV_KEYS)[number]): URL {
  const rawUrl = process.env[envKey];
  if (!rawUrl) {
    throw new Error(`${envKey} is required.`);
  }

  return new URL(rawUrl);
}

function getMaintenanceUrl(databaseUrl: URL): string {
  const maintenanceUrl = new URL(databaseUrl.toString());
  maintenanceUrl.pathname = '/postgres';
  maintenanceUrl.search = '';
  return maintenanceUrl.toString();
}

function getDatabaseName(databaseUrl: URL): string {
  const databaseName = databaseUrl.pathname.replace('/', '');
  if (!databaseName) {
    throw new Error(`Missing database name in ${databaseUrl.toString()}`);
  }

  return databaseName;
}

async function createDatabaseIfMissing(databaseUrl: URL): Promise<void> {
  const databaseName = getDatabaseName(databaseUrl);
  const client = new Client({
    connectionString: getMaintenanceUrl(databaseUrl),
  });

  await client.connect();

  try {
    const existingDatabase = await client.query<{ datname: string }>(
      'SELECT datname FROM pg_database WHERE datname = $1',
      [databaseName],
    );

    if (existingDatabase.rowCount && existingDatabase.rowCount > 0) {
      console.log(`Database already exists: ${databaseName}`);
      return;
    }

    await client.query(`CREATE DATABASE "${databaseName}"`);
    console.log(`Database created: ${databaseName}`);
  } finally {
    await client.end();
  }
}

async function main(): Promise<void> {
  const databaseUrls = DATABASE_ENV_KEYS.map(getDatabaseUrl);

  for (const databaseUrl of databaseUrls) {
    await createDatabaseIfMissing(databaseUrl);
  }
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
