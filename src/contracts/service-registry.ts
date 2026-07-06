import { ClientProviderOptions, Transport } from '@nestjs/microservices';

interface ServiceDefinition {
  serviceKey: string;
  rpcPrefix: string;
  clientToken: string;
  databaseUrlEnv: string;
  hostEnv: string;
  portEnv: string;
  defaultHost: string;
  defaultPort: number;
}

export const ServiceRegistry = {
  auth: {
    serviceKey: 'auth',
    rpcPrefix: 'auth',
    clientToken: 'AUTH_SERVICE_CLIENT',
    databaseUrlEnv: 'AUTH_DATABASE_URL',
    hostEnv: 'AUTH_SERVICE_HOST',
    portEnv: 'AUTH_SERVICE_PORT',
    defaultHost: '127.0.0.1',
    defaultPort: 4001,
  },
  users: {
    serviceKey: 'users',
    rpcPrefix: 'users',
    clientToken: 'USERS_SERVICE_CLIENT',
    databaseUrlEnv: 'USERS_DATABASE_URL',
    hostEnv: 'USERS_SERVICE_HOST',
    portEnv: 'USERS_SERVICE_PORT',
    defaultHost: '127.0.0.1',
    defaultPort: 4002,
  },
  match: {
    serviceKey: 'match',
    rpcPrefix: 'match',
    clientToken: 'MATCH_SERVICE_CLIENT',
    databaseUrlEnv: 'MATCH_DATABASE_URL',
    hostEnv: 'MATCH_SERVICE_HOST',
    portEnv: 'MATCH_SERVICE_PORT',
    defaultHost: '127.0.0.1',
    defaultPort: 4003,
  },
  chat: {
    serviceKey: 'chat',
    rpcPrefix: 'chat',
    clientToken: 'CHAT_SERVICE_CLIENT',
    databaseUrlEnv: 'CHAT_DATABASE_URL',
    hostEnv: 'CHAT_SERVICE_HOST',
    portEnv: 'CHAT_SERVICE_PORT',
    defaultHost: '127.0.0.1',
    defaultPort: 4004,
  },
} as const satisfies Record<string, ServiceDefinition>;

export type ServiceKey = keyof typeof ServiceRegistry;

export function listServiceKeys(): ServiceKey[] {
  return Object.keys(ServiceRegistry) as ServiceKey[];
}

export function getServiceDefinition(serviceKey: ServiceKey) {
  return ServiceRegistry[serviceKey];
}

export function getServiceClientToken(serviceKey: ServiceKey): string {
  return getServiceDefinition(serviceKey).clientToken;
}

export function getServiceDatabaseEnv(serviceKey: ServiceKey): string {
  return getServiceDefinition(serviceKey).databaseUrlEnv;
}

export function getServiceTcpOptions(serviceKey: ServiceKey) {
  const definition = getServiceDefinition(serviceKey);

  return {
    host: process.env[definition.hostEnv] ?? definition.defaultHost,
    port: Number(process.env[definition.portEnv] ?? definition.defaultPort),
  };
}

export function createServiceClientRegistrations(
  serviceKeys: readonly ServiceKey[],
): ClientProviderOptions[] {
  return serviceKeys.map((serviceKey) => ({
    name: getServiceClientToken(serviceKey),
    transport: Transport.TCP,
    options: getServiceTcpOptions(serviceKey),
  }));
}

export function getServiceKeyForRpcPattern(pattern: string): ServiceKey {
  const prefix = pattern.split('.')[0];

  const serviceKey = listServiceKeys().find(
    (candidate) => ServiceRegistry[candidate].rpcPrefix === prefix,
  );

  if (!serviceKey) {
    throw new Error(`No service registered for RPC pattern "${pattern}"`);
  }

  return serviceKey;
}
