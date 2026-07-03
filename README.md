# Tinder Backend

Backend NestJS con Prisma 7 organizado oficialmente como tres piezas:

- `gateway` HTTP
- `auth-service`
- `users-service`

No hay monolito HTTP paralelo. La ruta oficial del proyecto es microservicios TCP.

## Arquitectura oficial

- **Gateway HTTP**: expone `/auth/*` y `/users/*` en `localhost:3000`
- **Auth service**: maneja registro, login, JWT y RBAC
- **Users service**: maneja usuarios, perfil, fotos e intereses
- **Auth -> Users**: la consulta/creacion de usuarios se hace por RPC
- **RBAC**: roles y permisos viven en la base `auth`

## Bases de datos

El proyecto mantiene 2 bases PostgreSQL fisicamente separadas:

- `tinder_users_db`
- `tinder_auth_db`

### Users

- schema Prisma: `prisma/users/schema.prisma`
- config Prisma: `prisma/users/prisma.config.ts`
- migraciones: `prisma/users/migrations`
- cliente generado: `generated/prisma/users`

### Auth

- schema Prisma: `prisma/auth/schema.prisma`
- config Prisma: `prisma/auth/prisma.config.ts`
- migraciones: `prisma/auth/migrations`
- cliente generado: `generated/prisma/auth`

## Variables de entorno

```env
JWT_SECRET=change_this_for_a_long_random_secret
DATABASE_URL=postgresql://postgres:password@localhost:5432/tinder_db
USERS_DATABASE_URL=postgresql://postgres:password@localhost:5432/tinder_users_db
AUTH_DATABASE_URL=postgresql://postgres:password@localhost:5432/tinder_auth_db
GATEWAY_PORT=3000
AUTH_SERVICE_HOST=127.0.0.1
AUTH_SERVICE_PORT=4001
USERS_SERVICE_HOST=127.0.0.1
USERS_SERVICE_PORT=4002
```

`DATABASE_URL` queda como fallback legacy. El runtime oficial usa `USERS_DATABASE_URL` y `AUTH_DATABASE_URL`.

## Runtime y arranque

Usa 3 terminales:

```bash
npm run start:users-ms:dev
npm run start:auth-ms:dev
npm run start:gateway:dev
```

Orden recomendado:

1. `users-service`
2. `auth-service`
3. `gateway`

Scripts principales:

- `start:gateway`
- `start:gateway:dev`
- `start:auth-ms`
- `start:auth-ms:dev`
- `start:users-ms`
- `start:users-ms:dev`

## Contratos RPC y registro comun

Por ahora el proyecto mantiene contratos RPC centralizados en:

- `src/contracts/rpc-patterns.ts`

Y un registro comun simple en:

- `src/contracts/service-registry.ts`

Ese registro define por servicio:

- `serviceKey`
- `rpcPrefix`
- `clientToken`
- `databaseUrlEnv`
- `hostEnv`
- `portEnv`

Esto deja preparado el crecimiento para un futuro `match-ms` o `chat-ms` sin meter autodiscovery ni scaffolding.

## API HTTP publica

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

### Users

- `GET /users`
- `GET /users/me/profile`
- `PATCH /users/me/profile`
- `POST /users/me/photos`
- `DELETE /users/me/photos/:photoId`
- `POST /users/me/interests`

## RBAC

Roles base:

- `USER`
- `ADMIN`

Permiso base:

- `users.list`

Reglas:

- un usuario `USER` puede autenticarse y consultar su propio perfil
- `GET /users` exige JWT valido y permiso `users.list`
- sin token -> `401`
- con usuario normal -> `403`
- con admin -> `200`

Promover usuario a admin:

```bash
npm run rbac:seed-admin -- correo@example.com
```

Despues debe iniciar sesion otra vez para obtener un JWT actualizado.

## Prisma y migraciones

### Crear bases

```bash
npm run db:create
```

### Generar clientes

```bash
npm run prisma:generate:users
npm run prisma:generate:auth
npm run prisma:generate:all
```

### Aplicar migraciones

```bash
npm run prisma:migrate:deploy:users
npm run prisma:migrate:deploy:auth
npm run prisma:migrate:deploy:all
```

### Ver estado

```bash
npm run prisma:migrate:status:users
npm run prisma:migrate:status:auth
npm run prisma:migrate:status:all
```

## Verificacion

Comandos base:

```bash
npx tsc --noEmit --incremental false
npm run build
npm run prisma:migrate:status:all
```

Flujo verificado:

1. `POST /auth/register`
2. `POST /auth/login`
3. `GET /auth/me`
4. `GET /users/me/profile`
5. `GET /users` con `USER` -> `403`
6. `GET /users` sin token -> `401`
7. promover a `ADMIN`, relogin y `GET /users` -> `200`
