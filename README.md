# Tinder Backend

Este repositorio ya no funciona como un workspace unico de NestJS.

Ahora contiene proyectos NestJS independientes:

- `api-gateway/`
- `auth-service/`
- `users-service/`
- `match-service/`
- `chat-service/`

Cada carpeta tiene su propio:

- `package.json`
- `nest-cli.json`
- `tsconfig.json`
- `.env`
- `README.md`
- `prisma/`

## Topologia

- `api-gateway`: HTTP en `3000`
- `auth-service`: microservicio TCP en `4001`
- `users-service`: microservicio TCP en `4002`
- `match-service`: microservicio TCP en `4003`
- `chat-service`: microservicio TCP en `4004`

## Bases de datos

- `auth-service` -> `tinder_auth_db`
- `users-service` -> `tinder_users_db`
- `match-service` -> `tinder_match_db`
- `chat-service` -> `tinder_chat_db`

Cada servicio maneja su propio schema Prisma y sus propias migraciones.

## Arranque

Abre una terminal por servicio:

```bash
cd users-service
npm install
npm run db:create
npm run prisma:migrate:deploy
npm run start:dev
```

```bash
cd auth-service
npm install
npm run db:create
npm run prisma:migrate:deploy
npm run start:dev
```

```bash
cd match-service
npm install
npm run db:create
npm run prisma:migrate:deploy
npm run start:dev
```

```bash
cd chat-service
npm install
npm run db:create
npm run prisma:migrate:deploy
npm run start:dev
```

```bash
cd api-gateway
npm install
npm run start:dev
```

Orden recomendado:

1. `users-service`
2. `auth-service`
3. `match-service`
4. `chat-service`
5. `api-gateway`

## Nota

La carpeta raiz ya no es una aplicacion Nest ejecutable. Su funcion ahora es solo agrupar los microservicios independientes.
