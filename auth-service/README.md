# Auth Service

Microservicio independiente de autenticacion y RBAC.

## Puerto

- `4001` TCP

## Variables

```env
JWT_SECRET=change_this_for_a_long_random_secret
DATABASE_URL=postgresql://postgres:password@localhost:5432/tinder_auth_db
USERS_DATABASE_URL=postgresql://postgres:password@localhost:5432/tinder_users_db
HOST=127.0.0.1
PORT=4001
USERS_SERVICE_HOST=127.0.0.1
USERS_SERVICE_PORT=4002
```

## Comandos

```bash
npm install
npm run db:create
npm run prisma:migrate:deploy
npm run start:dev
```
