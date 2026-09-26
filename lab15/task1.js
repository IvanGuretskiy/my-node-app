const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');

const app = new Koa();
const router = new Router();

app.use(bodyParser());

// --- Задание 3 & 5: Middleware логирования ---
app.use(async (ctx, next) => {
  const start = Date.now();
  const formatDigit = (num) => String(num).padStart(2, '0');
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${formatDigit(now.getMonth() + 1)}-${formatDigit(now.getDate())} ${formatDigit(now.getHours())}:${formatDigit(now.getMinutes())}:${formatDigit(now.getSeconds())}`;
  
  await next();
  
  const ms = Date.now() - start;
  console.log(`[${dateStr}] ${ctx.method} ${ctx.url} - ${ctx.status} - ${ms}ms`);
});

// --- Задание 3: Middleware обработки ошибок ---
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = { 
      error: err.message || 'Внутренняя ошибка сервера', 
      status: ctx.status 
    };
  }
});

// Генерируем 50 студентов для Задания 4 и 5
let students = [];
const firstNames = ['Иван', 'Петр', 'Сидор', 'Алексей', 'Анна', 'Мария', 'Елена', 'Дмитрий'];
const lastNames = ['Иванов', 'Петров', 'Сидоров', 'Кузнецов', 'Попов', 'Смирнов'];

for (let i = 1; i <= 50; i++) {
  const name = `${lastNames[i % lastNames.length]} ${firstNames[i % firstNames.length]}`;
  students.push({
    id: i,
    name: name,
    group: i % 2 === 0 ? 'ББМО-01-23' : 'ББМО-02-23',
    course: (i % 4) + 1
  });
}

// --- Задание 1: Главная HTML-страница ---
router.get('/', async (ctx) => {
  ctx.type = 'text/html; charset=utf-8';
  ctx.body = `
    <!DOCTYPE html>
    <html lang="ru">
    <head><meta charset="UTF-8"><title>Лабораторная работа №15</title></head>
    <body style="font-family: sans-serif; padding: 20px;">
        <h1>Лабораторная работа №15</h1>
        <p><strong>Группа:</strong> ББМО-01-23</p>
        <p><strong>Текущая дата и время:</strong> ${new Date().toLocaleString('ru-RU')}</p>
        <h2>Приветственное сообщение:</h2>
        <p>Сервер на Koa.js успешно запущен!</p>
    </body>
    </html>
  `;
});

// --- Задание 3: Маршрут с авторизацией и искусственная ошибка ---
router.get('/protected', async (ctx) => {
  const auth = ctx.headers['authorization'];
  if (!auth) {
    ctx.status = 401;
    ctx.body = { error: 'Не авторизован', status: 401 };
    return;
  }
  ctx.body = { message: 'Добро пожаловать в защищенную зону!' };
});

router.get('/error', async (ctx) => {
  throw new Error('Тестовое исключение сервера');
});

// --- Задание 4 & 5: Управление студентами (REST API c поиском, пагинацией, фильтрацией) ---
router.get('/api/users', async (ctx) => {
  ctx.body = students.slice(0, 5); // Быстрый список для задания 2
});

router.get('/students', async (ctx) => {
  let result = [...students];
  const { group, search, sort, limit = 10, offset = 0 } = ctx.query;

  if (group) result = result.filter(s => s.group === group);
  if (search) result = result.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  if (sort) {
    const isDesc = sort.startsWith('-');
    const field = isDesc ? sort.substring(1) : sort;
    result.sort((a, b) => {
      if (a[field] < b[field]) return isDesc ? 1 : -1;
      if (a[field] > b[field]) return isDesc ? -1 : 1;
      return 0;
    });
  }

  const total = result.length;
  const paginatedData = result.slice(Number(offset), Number(offset) + Number(limit));

  ctx.body = { total, limit: Number(limit), offset: Number(offset), data: paginatedData };
});

router.get('/students/:id', async (ctx) => {
  const student = students.find(s => s.id === Number(ctx.params.id));
  if (!student) ctx.throw(404, 'Студент не найден');
  ctx.body = student;
});

router.post('/students', async (ctx) => {
  const { name, group, course } = ctx.request.body;
  if (!name || !group || !course) ctx.throw(400, 'Невалидные данные: заполните все поля');
  const newStudent = { id: students.length + 1, name, group, course: Number(course) };
  students.push(newStudent);
  ctx.status = 201;
  ctx.body = newStudent;
});

router.put('/students/:id', async (ctx) => {
  const student = students.find(s => s.id === Number(ctx.params.id));
  if (!student) ctx.throw(404, 'Студент не найден');
  const { name, group, course } = ctx.request.body;
  if (name) student.name = name;
  if (group) student.group = group;
  if (course) student.course = Number(course);
  ctx.body = student;
});

router.delete('/students/:id', async (ctx) => {
  const index = students.findIndex(s => s.id === Number(ctx.params.id));
  if (index === -1) ctx.throw(404, 'Студент не найден');
  students.splice(index, 1);
  ctx.body = { message: 'Успешное удаление' };
});

app.use(router.routes()).use(router.allowedMethods());
app.listen(3000, () => console.log('Сервер Koa запущен на порту 3000'));
