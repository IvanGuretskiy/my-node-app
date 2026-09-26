const express = require('express');
const jwt = require('jsonwebtoken');
const { faker } = require('@faker-js/faker');

const app = express();
app.use(express.json());

const PORT = 3000;
const JWT_SECRET = 'super-secret-key-bbmo';

// Хранилища данных в памяти
let books = [];
let users = [
  { id: 1, username: 'admin', password: 'password123', role: 'admin' },
  { id: 2, username: 'user', password: 'password123', role: 'user' }
];

// === ЗАДАНИЕ 5: Автоматическая генерация 100 книг при старте ===
function generateInitialBooks() {
  for (let i = 1; i <= 100; i++) {
    books.push({
      id: i,
      title: faker.book.title(),
      author: faker.book.author(),
      year: faker.number.int({ min: 1900, max: 2026 }),
      genre: faker.book.genre()
    });
  }
  console.log('Успешно сгенерировано 100 тестовых книг!');
}
generateInitialBooks();

// === ЗАДАНИЕ 3: Middleware логирования (Logger) ===
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const now = new Date();
    const formattedDate = now.toISOString().replace('T', ' ').substring(0, 19);
    console.log(`[${formattedDate}] ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// === ЗАДАНИЕ 5: Middleware авторизации JWT и проверки ролей ===
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: "Доступ запрещен. Токен отсутствует." });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Невалидный или просроченный токен." });
    req.user = user;
    next();
  });
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ error: `Доступ запрещен. Требуется роль: ${role}` });
    }
    next();
  };
}

// === ЗАДАНИЕ 1 ===
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ru">
    <head>
        <meta charset="UTF-8">
        <title>Лабораторная работа №16</title>
    </head>
    <body style="font-family: sans-serif; padding: 20px; line-height: 1.6; max-width: 800px; margin: 0 auto;">
        <h1>Лабораторная работа №16 (Express.js)</h1>
        <p><strong>Группа:</strong> ББМО-01-23</p>
        <p><strong>Текущая дата и время:</strong> ${new Date().toLocaleString()}</p>
        
        <h2>Приветственное сообщение:</h2>
        <p style="background: #eef2f7; padding: 10px; border-left: 5px solid #0066cc;">
            Сервер на фреймворке Express.js успешно запущен и работает в штатном режиме!
        </p>

        <h3>Список доступных маршрутов для проверки:</h3>
        <ul>
          <li><a href="/" style="color: #0066cc; font-weight: bold;">Главная страница (/)</a></li>
          <li><a href="/api/books" target="_blank">Список книг с пагинацией (/api/books)</a></li>
          <li><a href="/api/books?page=1&limit=3&sortBy=year&order=asc" target="_blank">Фильтрация, сортировка и лимит в 3 книги</a></li>
          <li><a href="/api/books/analytics" target="_blank">Статистика и аналитика базы данных (/api/books/analytics)</a></li>
          <li><a href="/api/books/export/csv" target="_blank" style="color: #228b22; font-weight: bold;">Скачать базу книг в формате CSV (/api/books/export/csv)</a></li>
        </ul>
        
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
            * Маршруты POST, PUT и DELETE защищены токеном JWT и тестируются автоматически при старте сервера в консоли.
        </p>
    </body>
    </html>
  `);
});


// === ЗАДАНИЕ 5: Роуты авторизации (Вход и Регистрация) ===
app.post('/api/auth/register', (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password) return res.status(400).json({ error: "Заполните username и password" });
  
  const userExists = users.find(u => u.username === username);
  if (userExists) return res.status(400).json({ error: "Пользователь уже существует" });

  const newUser = {
    id: users.length + 1,
    username,
    password, // В учебных целях пароль хранится в открытом виде
    role: role === 'admin' ? 'admin' : 'user'
  };
  users.push(newUser);
  res.status(201).json({ message: "Пользователь зарегистрирован", user: { id: newUser.id, username, role: newUser.role } });
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  
  if (!user) return res.status(401).json({ error: "Неверное имя пользователя или пароль" });

  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// === ЗАДАНИЕ 4: Аналитика и статистика ===
app.get('/api/books/analytics', (req, res) => {
  if (books.length === 0) return res.json({ totalBooks: 0 });

  const oldestBook = books.reduce((min, b) => b.year < min.year ? b : min, books[0]);
  const newestBook = books.reduce((max, b) => b.year > max.year ? b : max, books[0]);
  
  const genreStats = {};
  books.forEach(b => {
    genreStats[b.genre] = (genreStats[b.genre] || 0) + 1;
  });

  res.json({
    totalBooks: books.length,
    oldestBook,
    newestBook,
    genreDistribution: genreStats
  });
});

// === ЗАДАНИЕ 5: Экспорт данных в CSV ===
app.get('/api/books/export/csv', (req, res) => {
  let csvContent = "id,title,author,year,genre\n";
  books.forEach(b => {
    // Экранируем запятые в названиях книг и авторов для корректного CSV
    const title = b.title.replace(/"/g, '""');
    const author = b.author.replace(/"/g, '""');
    csvContent += `${b.id},"${title}","${author}",${b.year},"${b.genre}"\n`;
  });
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=books_export.csv');
  res.status(200).send(csvContent);
});

// === ЗАДАНИЕ 2 и 4: Получение списка всех книг (с фильтрацией, пагинацией и сортировкой) ===
app.get('/api/books', (req, res) => {
  let filteredBooks = [...books];
  const { author, year, startYear, endYear, genre, sortBy, order, page = 1, limit = 10 } = req.query;

  // Фильтрация (Задание 4)
  if (author) filteredBooks = filteredBooks.filter(b => b.author.toLowerCase().includes(author.toLowerCase()));
  if (genre) filteredBooks = filteredBooks.filter(b => b.genre.toLowerCase().includes(genre.toLowerCase()));
  if (year) filteredBooks = filteredBooks.filter(b => b.year === Number(year));
  if (startYear && endYear) filteredBooks = filteredBooks.filter(b => b.year >= Number(startYear) && b.year <= Number(endYear));

  // Сортировка (Задание 4)
  if (sortBy && ['title', 'author', 'year'].includes(sortBy)) {
    const sortOrder = order === 'desc' ? -1 : 1;
    filteredBooks.sort((a, b) => {
      if (typeof a[sortBy] === 'string') {
        return a[sortBy].localeCompare(b[sortBy]) * sortOrder;
      }
      return (a[sortBy] - b[sortBy]) * sortOrder;
    });
  }

  // Пагинация (Задание 4)
  const pageNum = Number(page);
  const limitNum = Number(limit);
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = pageNum * limitNum;

  const paginatedBooks = filteredBooks.slice(startIndex, endIndex);

  res.json({
    totalResults: filteredBooks.length,
    currentPage: pageNum,
    totalPages: Math.ceil(filteredBooks.length / limitNum),
    results: paginatedBooks
  });
});

// GET /api/books/:id — Получение книги по ID
app.get('/api/books/:id', (req, res) => {
  const book = books.find(b => String(b.id) === String(req.params.id));
  if (!book) return res.status(404).json({ error: "Книга не найдена" });
  res.json(book);
});

// === ЗАДАНИЕ 5: Защищенные маршруты изменения данных ===

// POST /api/books — Добавление книги (Доступно любому авторизованному пользователю)
app.post('/api/books', authenticateToken, (req, res) => {
  const { title, author, year, genre } = req.body;
  if (!title || !author || !year) return res.status(400).json({ error: "Заполните title, author и year" });

  const newBook = {
    id: books.length > 0 ? Math.max(...books.map(b => Number(b.id))) + 1 : 1,
    title,
    author,
    year: Number(year),
    genre: genre || "Unknown"
  };

  books.push(newBook);
  res.status(201).json(newBook);
});

// PUT /api/books/:id — Обновление книги (Доступно только ADMIN)
app.put('/api/books/:id', authenticateToken, requireRole('admin'), (req, res) => {
  const book = books.find(b => String(b.id) === String(req.params.id));
  if (!book) return res.status(404).json({ error: "Книга не найдена" });

  const { title, author, year, genre } = req.body;
  if (title) book.title = title;
  if (author) book.author = author;
  if (year) book.year = Number(year);
  if (genre) book.genre = genre;

  res.json(book);
});

// DELETE /api/books/:id — Удаление книги (Доступно только ADMIN)
app.delete('/api/books/:id', authenticateToken, requireRole('admin'), (req, res) => {
  const bookIndex = books.findIndex(b => String(b.id) === String(req.params.id));
  if (bookIndex === -1) return res.status(404).json({ error: "Книга не найдена" });

  books.splice(bookIndex, 1);
  res.json({ message: "Книга успешно удалена администратором" });
});

app.listen(PORT, () => {
  console.log(`Полный сервер запущен на порту ${PORT}: http://localhost:${PORT}`);
});

// === СЦЕНАРИЙ АВТОТЕСТИРОВАНИЯ ВСЕХ 5 ЗАДАНИЙ ===
setTimeout(async () => {
  console.log('\n--- СТАРТ ТЕСТИРОВАНИЯ ВСЕХ 5 УРОВНЕЙ СЛОЖНОСТИ ---');
  try {
    // 1. Проверка Задания 4: Запрос первой страницы книг с лимитом 3 штуки и сортировкой по году
    console.log('> Запрос пагинации и сортировки (Задание 4)...');
    await fetch(`http://localhost:3000/api/books?page=1&limit=3&sortBy=year&order=asc`);

    // 2. Проверка Задания 4: Запрос аналитики данных
    console.log('> Запрос аналитики (Задание 4)...');
    await fetch(`http://localhost:3000/api/books/analytics`);

    // 3. Проверка Задания 5: Вход под учетной записью администратора
    console.log('> Авторизация пользователя (Задание 5)...');
    const loginRes = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'password123' })
    });
    const { token } = await loginRes.json();

    // 4. Проверка Задания 5: Попытка добавить книгу с JWT токеном
    console.log('> Добавление книги защищенным методом POST (Задание 5)...');
    await fetch('http://localhost:3000/api/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ title: "JWT Masterpiece", author: "IT Student", year: 2026, genre: "Education" })
    });

    // 5. Проверка Задания 5: Попытка удалить книгу администратором
    console.log('> Удаление книги защищенным методом DELETE от Admin (Задание 5)...');
    await fetch('http://localhost:3000/api/books/5', {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    // 6. Проверка Задания 5: Тест экспорта в CSV
    console.log('> Запрос экспорта базы данных в формат CSV (Задание 5)...');
    await fetch(`http://localhost:3000/api/books/export/csv`);

    console.log('--- ТЕСТИРОВАНИЕ ПОЛНОСТЬЮ ЗАВЕРШЕНО! ВСЕ ЛОГИ ГОТОВЫ ---\n');
  } catch (err) {
    console.error('Ошибка автоматических тестов:', err.message);
  }
}, 1500);
