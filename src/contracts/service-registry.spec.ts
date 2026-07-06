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
    expect(listServiceKeys()).toEqual(['auth', 'users', 'match']);
  });

  it('resolves client tokens and rpc prefixes from one registry', () => {
    expect(getServiceClientToken('auth')).toBe(ServiceRegistry.auth.clientToken);
    expect(getServiceKeyForRpcPattern('users.findAll')).toBe('users');
    expect(getServiceKeyForRpcPattern('auth.login')).toBe('auth');
    expect(getServiceKeyForRpcPattern('match.health')).toBe('match');
  });

  it('builds tcp client registrations from registry metadata', () => {
    const registrations = createServiceClientRegistrations([
      'auth',
      'users',
      'match',
    ]);

    expect(registrations).toHaveLength(3);
    expect(registrations[0]?.name).toBe(ServiceRegistry.auth.clientToken);
    expect(getServiceTcpOptions('users')).toEqual({
      host: ServiceRegistry.users.defaultHost,
      port: ServiceRegistry.users.defaultPort,
    });
    expect(getServiceTcpOptions('match')).toEqual({
      host: ServiceRegistry.match.defaultHost,
      port: ServiceRegistry.match.defaultPort,
    });
  });
});
