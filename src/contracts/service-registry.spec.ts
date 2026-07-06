import {
  ServiceRegistry,
  createServiceClientRegistrations,
  getServiceClientToken,
  getServiceKeyForRpcPattern,
  getServiceTcpOptions,
  listServiceKeys,
} from './service-registry';

describe('ServiceRegistry', () => {
  it('lists the registered microservices', () => {
    expect(listServiceKeys()).toEqual(['auth', 'users', 'match', 'chat']);
  });

  it('resolves client tokens and rpc prefixes from one registry', () => {
    expect(getServiceClientToken('auth')).toBe(ServiceRegistry.auth.clientToken);
    expect(getServiceKeyForRpcPattern('users.findAll')).toBe('users');
    expect(getServiceKeyForRpcPattern('auth.login')).toBe('auth');
    expect(getServiceKeyForRpcPattern('match.health')).toBe('match');
    expect(getServiceKeyForRpcPattern('chat.health')).toBe('chat');
  });

  it('builds tcp client registrations from registry metadata', () => {
    const registrations = createServiceClientRegistrations([
      'auth',
      'users',
      'match',
      'chat',
    ]);

    expect(registrations).toHaveLength(4);
    expect(registrations[0]?.name).toBe(ServiceRegistry.auth.clientToken);
    expect(getServiceTcpOptions('users')).toEqual({
      host: ServiceRegistry.users.defaultHost,
      port: ServiceRegistry.users.defaultPort,
    });
    expect(getServiceTcpOptions('match')).toEqual({
      host: ServiceRegistry.match.defaultHost,
      port: ServiceRegistry.match.defaultPort,
    });
    expect(getServiceTcpOptions('chat')).toEqual({
      host: ServiceRegistry.chat.defaultHost,
      port: ServiceRegistry.chat.defaultPort,
    });
  });
});
