# Chat Service

Microservicio independiente de conversaciones y mensajes.

## Puerto

- `4004` TCP

## Variables

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/tinder_chat_db
HOST=127.0.0.1
PORT=4004
```

## Comandos

```bash
npm install
npm run db:create
npm run prisma:migrate:deploy
npm run start:dev
```
