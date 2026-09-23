const Koa = require('koa');
const Router = require('@koa/router');
const bodyParser = require('koa-bodyparser'); // <-- Изменили эту строчку (убрали фигурные скобки)

const app = new Koa();
const router = new Router();

// Включаем обработчик JSON-тела для POST/PUT запросов
app.use(bodyParser());

// Исходный массив пользователей для Задания 2
let users = [
  { id: 1, name: "Иванов Иван", group: "ББМО-01-23" },
  { id: 2, name: "Петров Петр", group: "ББМО-01-23" }
];

// === ЗАДАНИЕ 1: Главная HTML-страница ===
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

// === ЗАДАНИЕ 2: REST API Пользователей ===

// 1. GET /api/users — получение всех пользователей
router.get('/api/users', async (ctx) => {
  ctx.body = users;
});

// 2. POST /api/users — добавление нового пользователя
router.post('/api/users', async (ctx) => {
  const { name, group } = ctx.request.body;
  
  if (!name || !group) {
    ctx.status = 400;
    ctx.body = { error: "Невалидные данные: поля name и group обязательны" };
    return;
  }

  const newUser = {
    id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
    name,
    group
  };

  users.push(newUser);
  ctx.status = 201;
  ctx.body = newUser;
});

// 3. PUT /api/users/:id — обновление данных пользователя
router.put('/api/users/:id', async (ctx) => {
  const id = parseInt(ctx.params.id);
  const { name, group } = ctx.request.body;
  
  const user = users.find(u => u.id === id);
  if (!user) {
    ctx.status = 404;
    ctx.body = { error: "Пользователь не найден" };
    return;
  }

  if (!name || !group) {
    ctx.status = 400;
    ctx.body = { error: "Невалидные данные для обновления" };
    return;
  }

  user.name = name;
  user.group = group;
  ctx.body = user;
});

// 4. DELETE /api/users/:id — удаление пользователя
router.delete('/api/users/:id', async (ctx) => {
  const id = parseInt(ctx.params.id);
  const index = users.findIndex(u => u.id === id);

  if (index === -1) {
    ctx.status = 404;
    ctx.body = { error: "Пользователь не найден" };
    return;
  }

  users.splice(index, 1);
  ctx.body = { message: "Пользователь успешно удален" };
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(3000, () => {
  console.log('Сервер Koa успешно запущен на порту 3000: http://localhost:3000');
});
