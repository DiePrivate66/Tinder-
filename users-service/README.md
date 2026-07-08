# Users Service

Microservicio independiente de usuarios, perfil, fotos e intereses.

## Puerto

- `4002` TCP

## Variables

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/tinder_users_db
HOST=127.0.0.1
PORT=4002
```

## Comandos

```bash
npm install
npm run db:create
npm run prisma:migrate:deploy
npm run start:dev
```
