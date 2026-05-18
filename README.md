# Tinder Backend

Backend NestJS con Prisma 7, organizado por dominios de datos separados.

## Estado de la entrega

Esta entrega incluye:

- schemas Prisma separados por dominio
- config Prisma separado por dominio
- migraciones separadas por dominio
- clientes Prisma generados por dominio
- runtime Nest usando cliente Prisma separado para `users`

No incluye todavía:

- persistencia real de sesiones en login/logout
- refresh tokens
- revocación de sesiones por dispositivo

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

## Runtime actual

### Users Prisma

El runtime de `users` usa cliente separado en `src/prisma/prisma.service.ts`.

### Auth Prisma

El runtime de `auth` ya tiene cliente separado preparado en `src/prisma/auth-prisma.service.ts`.

Por ahora `auth` todavía no persiste sesiones reales; el cliente quedó listo para esa siguiente fase.

## Verificación

Comandos verificados localmente:

```bash
npm run prisma:generate:all
npm run prisma:migrate:status:all
npm run build
```
