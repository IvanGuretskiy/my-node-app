const express = require('express');
const app = express();

app.use(express.json());

let users = [
  { id: 1, name: "Иванов Иван", group: "ББМО-01-23" },
  { id: 2, name: "Петров Петр", group: "ББМО-01-23" }
];

// === ЗАДАНИЕ 1 ===
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ru">
    <head>
        <meta charset="UTF-8">
        <title>Лабораторная работа №16</title>
    </head>
    <body style="font-family: sans-serif; padding: 20px;">
        <h1>Лабораторная работа №16 (Express.js)</h1>
        <p><strong>Группа:</strong> ББМО-01-23</p>
        <p><strong>Текущая дата и время:</strong> ${new Date().toLocaleString()}</p>
        <h2>Приветственное сообщение:</h2>
        <p>Сервер на фреймворке Express.js успешно запущен!</p>
    </body>
    </html>
  `);
});

// === ЗАДАНИЕ 2 ===
app.get('/api/users', (req, res) => {
  res.json(users);
});

// Запуск сервера на порту 4000
app.listen(4000, () => {
  console.log('Сервер Express успешно запущен: http://localhost:4000');
});
