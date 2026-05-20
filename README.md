# Tinder Backend

Backend NestJS con Prisma 7, organizado por dominios de datos separados y preparado para migrar a microservicios.

## Estado de la entrega

Esta entrega incluye:

- schemas Prisma separados por dominio
- config Prisma separado por dominio
- migraciones separadas por dominio
- clientes Prisma generados por dominio
- runtime Nest usando cliente Prisma separado para `users`
- entrypoints separados para `auth-service`, `users-service` y `gateway`

No incluye todavia:

- persistencia real de sesiones en login/logout
- refresh tokens
- revocacion de sesiones por dispositivo
- despliegue independiente por servicio

## Estructura Prisma

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
USERS_DATABASE_URL="postgresql://postgres:Andres123@localhost:5432/tinder_db?schema=public"
AUTH_DATABASE_URL="postgresql://postgres:Andres123@localhost:5432/tinder_db?schema=auth"
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

## Preparacion para microservicios

El proyecto tiene entrypoints separados para ejecutar dominios como servicios TCP independientes:

- gateway HTTP: `src/main.gateway.ts`
- auth service TCP: `src/main.auth-service.ts`
- users service TCP: `src/main.users-service.ts`
- core service legacy: `src/main.microservice.ts`

El gateway enruta mensajes RPC hacia clientes separados:

- `auth.*` -> `AUTH_SERVICE_CLIENT`
- `users.*` -> `USERS_SERVICE_CLIENT`

Los tokens de cliente estan en `src/contracts/service-clients.ts`.
Los patrones RPC estan en `src/contracts/rpc-patterns.ts`.

### Ejecutar en modo microservicios preparados

Usa tres terminales:

```bash
npm run start:auth-ms:dev
npm run start:users-ms:dev
npm run start:gateway:dev
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

El runtime de `users` usa cliente separado en `src/prisma/prisma.service.ts`.

### Auth Prisma

El runtime de `auth` ya tiene cliente separado preparado en `src/prisma/auth-prisma.service.ts`.

Por ahora `auth` todavia no persiste sesiones reales; el cliente quedo listo para esa siguiente fase.

## Verificacion

Comandos verificados localmente:

```bash
npm run prisma:generate:all
npm run prisma:migrate:status:all
npm run build
```
