const Koa = require('koa');
const Router = require('@koa/router');
const bodyParser = require('koa-bodyparser');

const app = new Koa();
const router = new Router();

app.use(bodyParser());

let users = [
  { id: 1, name: "Иванов Иван", group: "ББМО-01-23" },
  { id: 2, name: "Петров Петр", group: "ББМО-01-23" }
];

router.get('/', async (ctx) => {
  ctx.type = 'text/html; charset=utf-8';
  ctx.body = `
    <!DOCTYPE html>
    <html lang="ru">
    <head>
        <meta charset="UTF-8">
        <title>Лабораторная работа №15</title>
    </head>
    <body style="font-family: sans-serif; padding: 20px;">
        <h1>Лабораторная работа №15</h1>
        <p><strong>Группа:</strong> ББМО-01-23</p>
        <p><strong>Текущая дата и время:</strong> ${new Date().toLocaleString()}</p>
        <h2>Приветственное сообщение:</h2>
        <p>Сервер на фреймворке Koa.js успешно запущен и обрабатывает запросы!</p>
    </body>
    </html>
  `;
});

router.get('/api/users', async (ctx) => {
  ctx.body = users;
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(3000, () => {
  console.log('Сервер Koa успешно запущен на порту 3000');
});
