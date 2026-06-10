# Tinder Backend

Backend NestJS con Prisma 7 organizado como **monolito modular**. El proyecto separa dominios por modulos (`auth` y `users`), usa bases PostgreSQL fisicamente separadas y aplica arquitectura hexagonal ligera donde aporta claridad.

## Arquitectura

La arquitectura principal es:

- **Monolito modular**: una sola aplicacion NestJS arrancada desde `src/main.ts`.
- **Modulos por dominio**: `AuthModule` y `UsersModule`.
- **Hexagonal ligera como apoyo interno**: el dominio `users` separa contrato de repositorio, implementacion Prisma e infraestructura.
- **Persistencia separada**: cada dominio tiene su propia base, schema Prisma, config Prisma, migraciones y cliente generado.

No se usa microservicios como arquitectura principal.

## Bases de datos

El proyecto usa 2 bases de datos fisicas PostgreSQL:

- `tinder_users_db`: usuarios, perfiles, fotos e intereses.
- `tinder_auth_db`: sesiones, dispositivos, roles, permisos y RBAC.

`DATABASE_URL` queda como fallback legacy, pero el runtime usa las variables especificas de cada dominio.

```env
DATABASE_URL="postgresql://postgres:Andres123@localhost:5432/tinder_db"
USERS_DATABASE_URL="postgresql://postgres:Andres123@localhost:5432/tinder_users_db"
AUTH_DATABASE_URL="postgresql://postgres:Andres123@localhost:5432/tinder_auth_db"
JWT_SECRET="change_this_for_a_long_random_secret"
PORT=3000
```

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

## Comandos

### Crear bases fisicas

```bash
npm run db:create
```

### Generar clientes Prisma

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

### Ver estado de migraciones

```bash
npm run prisma:migrate:status:users
npm run prisma:migrate:status:auth
npm run prisma:migrate:status:all
```

### Ejecutar el monolito

```bash
npm run start:dev
```

La API HTTP queda en:

```text
http://localhost:3000
```

## Modulos NestJS

### Auth

Responsabilidades:

- registro
- login
- emision de JWT
- validacion de JWT
- RBAC con roles y permisos

Archivos principales:

- `src/auth/auth.module.ts`
- `src/auth/auth.controller.ts`
- `src/auth/auth.service.ts`
- `src/auth/authorization.service.ts`
- `src/prisma/auth-prisma.service.ts`

### Users

Responsabilidades:

- usuarios
- perfil
- fotos
- intereses

Estructura con hexagonal ligera:

- `src/users/domain`: tipos y contrato del repositorio.
- `src/users/infrastructure`: implementacion Prisma del repositorio.
- `src/users/users.service.ts`: logica de aplicacion.
- `src/users/users.controller.ts`: endpoints HTTP.

## RBAC

RBAC significa control de acceso basado en roles.

Roles iniciales:

- `USER`
- `ADMIN`

Permiso inicial:

- `users.list`

`GET /users` requiere JWT valido y permiso `users.list`. Un usuario normal recibe `403 Forbidden`; un admin recibe `200 OK`.

Para promover un usuario existente a admin:

```bash
npm run rbac:seed-admin -- correo@example.com
```

Despues de promoverlo, debe iniciar sesion otra vez para recibir un JWT actualizado.

## Verificacion

Comandos usados para validar:

```bash
npm run db:create
npm run prisma:migrate:deploy:all
npm run prisma:generate:all
npx tsc --noEmit --incremental false
npm run build
```
