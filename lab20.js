#!/usr/bin/env node

import http from 'http';
import { URL } from 'url';

// Память для хранения данных REST API (Задание 4)
let students = [
  { id: 1, name: "Иван", group: "ББМО-01-23" },
  { id: 2, name: "Мария", group: "ББМО-01-23" }
];

// Объект метрик (Задание 5)
const metrics = {
  group: "BBMO-01-23",
  total: 0,
  byMethod: { GET: 0, POST: 0, PUT: 0, DELETE: 0, PATCH: 0 },
  byStatus: { 200: 0, 201: 0, 404: 0, 405: 0, 413: 0 }
};

// Функция логирования (Задание 1 и 4)
function logRequest(req, statusCode) {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  console.log(`[${timestamp}] [ББМО-01-23] ${req.method} ${req.url} ${statusCode}`);
  
  // Обновляем метрики
  metrics.total++;
  metrics.byMethod[req.method] = (metrics.byMethod[req.method] || 0) + 1;
  metrics.byStatus[statusCode] = (metrics.byStatus[statusCode] || 0) + 1;
}

// Вспомогательная функция для сборки тела запроса (Задание 3)
function getRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    let totalSize = 0;
    const MAX_SIZE = 1024 * 1024; // Ограничение 1 МБ

    req.on('data', chunk => {
      body += chunk;
      totalSize += chunk.length;
      if (totalSize > MAX_SIZE) {
        reject({ code: 413, message: 'Payload Too Large' });
      }
    });

    req.on('end', () => resolve(body));
    req.on('error', err => reject(err));
  });
}

// Создаем сервер
const server = http.createServer(async (req, res) => {
  // Настройка базовых обязательных заголовков (Задание 2 и 5)
  res.setHeader('X-Powered-By', 'Node.js');
  res.setHeader('X-Group', 'BBMO-01-23');
  res.setHeader('Cache-Control', 'no-cache');

  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // --- ЗАДАНИЕ 1: Базовые HTML страницы ---
  if (pathname === '/' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>=== Лабораторная работа №20 ===</h1><p>Группа: ББМО-01-23</p><p>Метод: GET</p>');
    logRequest(req, 200);
    return;
  }

  if (pathname === '/about' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>=== О студенте ===</h1><p>Группа: ББМО-01-23</p><p>Студент: Иван Гурецкий</p>');
    logRequest(req, 200);
    return;
  }

  // --- ЗАДАНИЕ 2: Работа с заголовками ---
  if (pathname === '/headers' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      headers: req.headers,
      method: req.method,
      url: req.url,
      httpVersion: req.httpVersion
    }, null, 2));
    logRequest(req, 200);
    return;
  }

  if (pathname === '/headers/set' && req.method === 'GET') {
    res.setHeader('X-Custom-Test', 'Hello-From-Lab20');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<p>Кастомные заголовки успешно установлены!</p>');
    logRequest(req, 200);
    return;
  }

  if (pathname === '/headers/check' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      hasContentType: res.hasHeader('Content-Type'),
      hasXGroup: res.hasHeader('X-Group'),
      hasUnknown: res.hasHeader('X-Unknown-Header')
    }, null, 2));
    logRequest(req, 200);
    return;
  }

  // --- ЗАДАНИЕ 3: Работа с POST данными ---
  if (pathname === '/echo' && req.method === 'POST') {
    try {
      const body = await getRequestBody(req);
      const contentType = req.headers['content-type'] || 'text/plain';
      
      res.writeHead(200, { 'Content-Type': contentType });
      
      if (contentType.includes('application/json')) {
        const json = JSON.parse(body);
        json.group = "ББМО-01-23"; // Модификация по методичке
        res.end(JSON.stringify(json, null, 2));
      } else {
        res.end(body);
      }
      logRequest(req, 200);
    } catch (err) {
      const status = err.code || 400;
      res.writeHead(status, { 'Content-Type': 'text/plain' });
      res.end(err.message || 'Bad Request');
      logRequest(req, status);
    }
    return;
  }

  if (pathname === '/form' && req.method === 'POST') {
    try {
      const body = await getRequestBody(req);
      const params = new URLSearchParams(body);
      const formData = Object.fromEntries(params.entries());
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(formData, null, 2));
      logRequest(req, 200);
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Bad Request');
      logRequest(req, 400);
    }
    return;
  }

  // --- ЗАДАНИЕ 4: REST API (Маршрутизация) ---
  if (pathname === '/api/students') {
    if (req.method === 'GET') {
      const groupFilter = parsedUrl.searchParams.get('group');
      let result = students;
      if (groupFilter) {
        result = students.filter(s => s.group === groupFilter);
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result, null, 2));
      logRequest(req, 200);
      return;
    }
    
    if (req.method === 'POST') {
      try {
        const body = await getRequestBody(req);
        const data = JSON.parse(body);
        const newStudent = {
          id: students.length + 1,
          name: data.name || 'Аноним',
          group: data.group || 'ББМО-01-23'
        };
        students.push(newStudent);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(newStudent, null, 2));
        logRequest(req, 201);
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Invalid JSON');
        logRequest(req, 400);
      }
      return;
    }
  }

  // Маршруты с динамическими ID: /api/students/:id
  if (pathname.startsWith('/api/students/')) {
    const id = parseInt(pathname.split('/')[3]);
    const studentIndex = students.findIndex(s => s.id === id);

    if (studentIndex === -1) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Student Not Found');
      logRequest(req, 404);
      return;
    }

    if (req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(students[studentIndex], null, 2));
      logRequest(req, 200);
      return;
    }

    if (req.method === 'PUT') {
      const body = await getRequestBody(req);
      const data = JSON.parse(body);
      students[studentIndex].name = data.name || students[studentIndex].name;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(students[studentIndex], null, 2));
      logRequest(req, 200);
      return;
    }

    if (req.method === 'DELETE') {
      students.splice(studentIndex, 1);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ deleted: true, id }, null, 2));
      logRequest(req, 200);
      return;
    }

    // Ошибка 405 при PATCH или других методах (Задание 4)
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('405 Method Not Allowed');
    logRequest(req, 405);
    return;
  }

  // --- ЗАДАНИЕ 5: Эндпоинт метрик ---
  if (pathname === '/metrics' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(metrics, null, 2));
    logRequest(req, 200);
    return;
  }

  // --- 404 Не найдено (Задание 1) ---
  res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end('<h1>=== 404 Not Found ===</h1><p>Путь не найден</p>');
  logRequest(req, 404);
});

// Слушаем порт 3000
server.listen(3000, () => {
  console.log('Сервер успешно запущен на порту 3000');
  console.log('Готов к тестированию эндпоинтов лабы №20...');
});
