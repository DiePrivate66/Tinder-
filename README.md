# Tinder Backend

Backend NestJS con Prisma 7, organizado por dominios de datos con bases PostgreSQL fisicamente separadas y migrado a una base de arquitectura de microservicios TCP.

## Estado de la entrega

Esta entrega incluye:

- schemas Prisma separados por dominio
- config Prisma separado por dominio
- migraciones separadas por dominio
- clientes Prisma generados por dominio
- bases de datos fisicas separadas para `users` y `auth`
- runtime Nest usando cliente Prisma separado para `users`
- entrypoints separados para `auth-service`, `users-service` y `gateway`
- gateway HTTP como unica entrada publica para `auth` y `users`
- `auth-service` comunicandose con `users-service` por RPC, sin importar directamente la capa de usuarios

No incluye todavia:

- persistencia real de sesiones en login/logout
- refresh tokens
- revocacion de sesiones por dispositivo
- despliegue independiente por servicio en servidores separados

## Estructura Prisma

## Bases de datos

El proyecto usa 2 bases de datos fisicas PostgreSQL:

- `tinder_users_db`: dominio `users`
- `tinder_auth_db`: dominio `auth`

`DATABASE_URL` queda como fallback legacy, pero el runtime y Prisma usan las variables especificas de cada dominio.

### Dominio `users`

- config: `prisma/users/prisma.config.ts`
- schema: `prisma/users/schema.prisma`
- migraciones: `prisma/users/migrations`
- cliente generado: `generated/prisma/users`

### Dominio `auth`

- config: `prisma/auth/prisma.config.ts`
- schema: `prisma/auth/schema.prisma`
- migraciones: `prisma/auth/migrations`
- cliente generado: `generated/prisma/auth`

## Variables de entorno

```env
DATABASE_URL="postgresql://postgres:Andres123@localhost:5432/tinder_db"
USERS_DATABASE_URL="postgresql://postgres:Andres123@localhost:5432/tinder_users_db"
AUTH_DATABASE_URL="postgresql://postgres:Andres123@localhost:5432/tinder_auth_db"
JWT_SECRET="change_this_for_a_long_random_secret"
GATEWAY_PORT=3000
AUTH_SERVICE_HOST=127.0.0.1
AUTH_SERVICE_PORT=4001
USERS_SERVICE_HOST=127.0.0.1
USERS_SERVICE_PORT=4002
```

## Migraciones por esquema

### Users

- `20260406133636_init`
- `20260422012816_user_profile_core`

### Auth

- `20260518000100_init_auth`

## Comandos Prisma

### Crear bases fisicas

```bash
npm run db:create
```

### Generar clientes

```bash
npm run prisma:generate:users
npm run prisma:generate:auth
npm run prisma:generate:all
```

### Migraciones de desarrollo

```bash
npm run prisma:migrate:dev:users
npm run prisma:migrate:dev:auth
```

### Aplicar migraciones

```bash
npm run prisma:migrate:deploy:users
npm run prisma:migrate:deploy:auth
npm run prisma:migrate:deploy:all
```

### Ver estado de migraciones

```bash
npm run prisma:migrate:status:users
npm run prisma:migrate:status:auth
npm run prisma:migrate:status:all
```

## Arquitectura de microservicios

El proyecto ejecuta los dominios principales como servicios TCP independientes:

- gateway HTTP: `src/main.gateway.ts`
- auth service TCP: `src/main.auth-service.ts`
- users service TCP: `src/main.users-service.ts`
- core service legacy: `src/main.microservice.ts`

El gateway es la capa HTTP publica. Los controladores HTTP viven en:

- `src/gateway/auth-gateway.controller.ts`
- `src/gateway/users-gateway.controller.ts`

Los servicios internos escuchan patrones RPC:

- `src/auth/auth.message.controller.ts`
- `src/users/users.message.controller.ts`

El gateway enruta mensajes RPC hacia clientes separados:

- `auth.*` -> `AUTH_SERVICE_CLIENT`
- `users.*` -> `USERS_SERVICE_CLIENT`

Los tokens de cliente estan en `src/contracts/service-clients.ts`.
Los patrones RPC estan en `src/contracts/rpc-patterns.ts`.

### Comunicacion entre servicios

`auth-service` ya no importa el modulo de usuarios para crear o consultar usuarios. Usa `src/auth/users-rpc.service.ts`, que llama al `users-service` por TCP/RPC.

Flujo de registro:

1. HTTP `POST /auth/register` llega al gateway.
2. El gateway envia `auth.register` al `auth-service`.
3. `auth-service` consulta/crea usuario enviando `users.findByEmailForAuth` y `users.create` al `users-service`.
4. `auth-service` firma el JWT y responde al gateway.

### Ejecutar en modo microservicios

Usa tres terminales:

```bash
npm run start:users-ms:dev
npm run start:auth-ms:dev
npm run start:gateway:dev
```

Orden recomendado: primero `users-service`, luego `auth-service`, luego `gateway`.

Los scripts `*:dev` usan `ts-node` para evitar que varios procesos de Nest compitan limpiando `dist` al mismo tiempo.

Para ejecutar los servicios compilados:

```bash
npm run build
npm run start:users-ms
npm run start:auth-ms
npm run start:gateway
```

### Ejecutar modo core legacy

El entrypoint anterior sigue disponible para pruebas con un solo microservicio central:

```bash
npm run start:core-ms:dev
npm run start:gateway:dev
```

Para evitar conflictos de puertos, no ejecutes `core-ms` y `auth-ms` al mismo tiempo si ambos usan el puerto `4001`.

## Runtime actual

### Users Prisma

El runtime de `users-service` usa cliente separado en `src/prisma/prisma.service.ts`.

### Auth Prisma

El runtime de `auth` ya tiene cliente separado preparado en `src/prisma/auth-prisma.service.ts`.

Por ahora `auth` todavia no persiste sesiones reales; el cliente quedo listo para esa siguiente fase.

### JWT

JWT esta implementado en:

- firma de token: `src/auth/auth.service.ts`
- estrategia Passport: `src/auth/jwt.strategy.ts`
- guard HTTP legacy: `src/auth/jwt-auth.guard.ts`
- guard del gateway: `src/gateway/gateway-jwt-auth.guard.ts`

En modo microservicios, el gateway valida el Bearer token y envia el usuario autenticado al servicio correspondiente por RPC.

## Verificacion

Comandos verificados localmente:

```bash
npm run prisma:generate:all
npm run db:create
npm run prisma:migrate:status:all
npx tsc --noEmit --incremental false
npm run build
```
