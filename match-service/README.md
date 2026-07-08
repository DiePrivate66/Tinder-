# Match Service

Microservicio independiente de matches.

## Puerto

- `4003` TCP

## Variables

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/tinder_match_db
HOST=127.0.0.1
PORT=4003
```

## Comandos

```bash
npm install
npm run db:create
npm run prisma:migrate:deploy
npm run start:dev
```
