# Tinder Backend

Backend NestJS con Prisma 7 organizado oficialmente como cinco piezas:

- `gateway` HTTP
- `auth-service`
- `users-service`
- `match-service`
- `chat-service`

No hay monolito HTTP paralelo. La ruta oficial del proyecto es microservicios TCP.

## Arquitectura oficial

- **Gateway HTTP**: expone `/auth/*` y `/users/*` en `localhost:3000`
- **Auth service**: maneja registro, login, JWT y RBAC
- **Users service**: maneja usuarios, perfil, fotos e intereses
- **Match service**: maneja matches internos por RPC
- **Chat service**: maneja conversaciones directas y mensajes por RPC
- **Auth -> Users**: la consulta/creacion de usuarios se hace por RPC
- **RBAC**: roles y permisos viven en la base `auth`

## Bases de datos

El proyecto mantiene 4 bases PostgreSQL fisicamente separadas:

- `tinder_users_db`
- `tinder_auth_db`
- `tinder_match_db`
- `tinder_chat_db`

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

### Match

- schema Prisma: `prisma/match/schema.prisma`
- config Prisma: `prisma/match/prisma.config.ts`
- migraciones: `prisma/match/migrations`
- cliente generado: `generated/prisma/match`

### Chat

- schema Prisma: `prisma/chat/schema.prisma`
- config Prisma: `prisma/chat/prisma.config.ts`
- migraciones: `prisma/chat/migrations`
- cliente generado: `generated/prisma/chat`

## Variables de entorno

```env
JWT_SECRET=change_this_for_a_long_random_secret
DATABASE_URL=postgresql://postgres:password@localhost:5432/tinder_db
USERS_DATABASE_URL=postgresql://postgres:password@localhost:5432/tinder_users_db
AUTH_DATABASE_URL=postgresql://postgres:password@localhost:5432/tinder_auth_db
MATCH_DATABASE_URL=postgresql://postgres:password@localhost:5432/tinder_match_db
CHAT_DATABASE_URL=postgresql://postgres:password@localhost:5432/tinder_chat_db
GATEWAY_PORT=3000
AUTH_SERVICE_HOST=127.0.0.1
AUTH_SERVICE_PORT=4001
USERS_SERVICE_HOST=127.0.0.1
USERS_SERVICE_PORT=4002
MATCH_SERVICE_HOST=127.0.0.1
MATCH_SERVICE_PORT=4003
CHAT_SERVICE_HOST=127.0.0.1
CHAT_SERVICE_PORT=4004
```

`DATABASE_URL` queda como fallback legacy. El runtime oficial usa `USERS_DATABASE_URL`, `AUTH_DATABASE_URL`, `MATCH_DATABASE_URL` y `CHAT_DATABASE_URL`.

## Runtime y arranque

Usa 5 terminales si quieres levantar todo:

```bash
npm run start:users-ms:dev
npm run start:auth-ms:dev
npm run start:match-ms:dev
npm run start:chat-ms:dev
npm run start:gateway:dev
```

Orden recomendado:

1. `users-service`
2. `auth-service`
3. `match-service`
4. `chat-service`
5. `gateway`

Scripts principales:

- `start:gateway`
- `start:gateway:dev`
- `start:auth-ms`
- `start:auth-ms:dev`
- `start:users-ms`
- `start:users-ms:dev`
- `start:match-ms`
- `start:match-ms:dev`
- `start:chat-ms`
- `start:chat-ms:dev`

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

Esto deja preparado el crecimiento para un futuro `chat-ms` u otro servicio sin meter autodiscovery ni scaffolding.

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

### Match

`match-service` por ahora es **RPC-only**. No tiene endpoints HTTP publicos en el gateway todavia.

### Chat

`chat-service` por ahora es **RPC-only**. Contiene conversaciones directas y un modulo interno de `messages`.

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
npm run prisma:generate:match
npm run prisma:generate:chat
npm run prisma:generate:all
```

### Aplicar migraciones

```bash
npm run prisma:migrate:deploy:users
npm run prisma:migrate:deploy:auth
npm run prisma:migrate:deploy:match
npm run prisma:migrate:deploy:chat
npm run prisma:migrate:deploy:all
```

### Ver estado

```bash
npm run prisma:migrate:status:users
npm run prisma:migrate:status:auth
npm run prisma:migrate:status:match
npm run prisma:migrate:status:chat
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
