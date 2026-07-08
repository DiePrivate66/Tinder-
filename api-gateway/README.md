# API Gateway

Gateway HTTP independiente del backend Tinder.

## Puerto

- `3000`

## Variables

```env
JWT_SECRET=change_this_for_a_long_random_secret
PORT=3000
AUTH_SERVICE_HOST=127.0.0.1
AUTH_SERVICE_PORT=4001
USERS_SERVICE_HOST=127.0.0.1
USERS_SERVICE_PORT=4002
MATCH_SERVICE_HOST=127.0.0.1
MATCH_SERVICE_PORT=4003
CHAT_SERVICE_HOST=127.0.0.1
CHAT_SERVICE_PORT=4004
```

## Comandos

```bash
npm install
npm run start:dev
```
