#!/usr/bin/env node

import { EventEmitter } from 'events';
import chalk from 'chalk';
import http from 'http';

// ==========================================
// ЗАДАНИЕ 4: Метапрограммирование (newListener / removeListener)
// ==========================================
class PluginManager extends EventEmitter {
  constructor() {
    super();
    this.on('newListener', (eventName) => {
      console.log(chalk.gray(`[newListener] Добавлен слушатель "${eventName}"`));
    });
    this.on('removeListener', (eventName) => {
      console.log(chalk.gray(`[removeListener] Удалён слушатель "${eventName}"`));
    });
  }
}

console.log(chalk.bold.yellow('=== Задание 4: Система плагинов и Метапрограммирование ==='));
const pluginManager = new PluginManager();
pluginManager.on('plugin:registered', (name) => console.log(chalk.blue(`[PLUGIN] Зарегистрирован: ${name}`)));
pluginManager.on('log', () => {});
pluginManager.emit('plugin:registered', 'LoggerPlugin');
pluginManager.removeAllListeners('log');


// ==========================================
// ЗАДАНИЕ 1: Базовый уровень (Простой EventEmitter)
// ==========================================
console.log(chalk.bold.yellow('\n=== Задание 1: Демонстрация базового EventEmitter ==='));
const basicEmitter = new EventEmitter();

basicEmitter.on('greet', (name) => console.log(`[greet] Привет, ${name}!`));
basicEmitter.on('info', () => console.log(`[info] Группа: ББМО-01-23`));
basicEmitter.on('bye', () => console.log(`[bye] До свидания!`));

basicEmitter.emit('greet', 'Иван');
basicEmitter.emit('info');
basicEmitter.emit('bye');

console.log(`Событие "unknown" без слушателей: ${chalk.red(basicEmitter.emit('unknown'))}`);
console.log(`Событие "greet" со слушателями: ${chalk.green(basicEmitter.emit('greet', 'Иван'))}`);


// ==========================================
// ЗАДАНИЕ 2: Средний уровень (on vs once и управление)
// ==========================================
console.log(chalk.bold.yellow('\n=== Задание 2: Сравнение методов on и once ==='));
const cycleEmitter = new EventEmitter();
let onCount = 0;
let onceCount = 0;

cycleEmitter.on('tick', () => onCount++);
cycleEmitter.once('tick', () => onceCount++);

cycleEmitter.emit('tick');
cycleEmitter.emit('tick');
cycleEmitter.emit('tick');

console.log(`on-слушатель вызван: ${chalk.cyan(onCount)} раза`);
console.log(`once-слушатель вызван: ${chalk.cyan(onceCount)} раз`);

console.log(chalk.bold('\n--- Управление подписками & Порядок вызова ---'));
const orderEmitter = new EventEmitter();
const firstListener = () => console.log('1. Первый слушатель (группа ББМО-01-23)');
const secondListener = () => console.log('2. Второй слушатель');

orderEmitter.on('orderEvent', firstListener);
orderEmitter.on('orderEvent', secondListener);

console.log(`Слушателей до удаления: ${chalk.cyan(orderEmitter.listenerCount('orderEvent'))}`);
orderEmitter.emit('orderEvent');
orderEmitter.removeListener('orderEvent', secondListener);
console.log(`Слушателей после удаления одного: ${chalk.cyan(orderEmitter.listenerCount('orderEvent'))}`);
orderEmitter.removeAllListeners('orderEvent');


// ==========================================
// ЗАДАНИЕ 3: Продвинутый уровень (Наследование от EventEmitter)
// ==========================================
console.log(chalk.bold.yellow('\n=== Задание 3: DatabaseConnection (группа ББМО-01-23) ==='));

class DatabaseConnection extends EventEmitter {
  connect() {
    console.log('[EVENT] Подключение к БД...');
    this.emit('connect');
  }
  query(sql, result) {
    this.emit('query', sql, result);
  }
  close() {
    this.emit('close');
  }
  generateError() {
    this.emit('error', new Error('Connection timeout'));
  }
}

const db = new DatabaseConnection();
db.on('connect', () => console.log(chalk.green('[EVENT] Соединение установлено')));
db.on('query', (sql, result) => {
  console.log(`[EVENT] Выполнение запроса: ${sql} | Результат: ${result}`);
});
db.on('close', () => console.log(chalk.gray('[EVENT] Соединение закрыто')));

db.connect();
db.query('SELECT * FROM students', '50 записей');
db.close();

db.on('error', (err) => {
  console.log(chalk.red(`[EVENT] Ошибка: ${err.message}`));
});
db.generateError();


// ==========================================
// ЗАДАНИЕ 5: Экспертный уровень (Полноценная система EventBus)
// ==========================================
console.log(chalk.bold.yellow('\n=== Задание 5: EventBus (группа ББМО-01-23) ==='));

class EventBus extends EventEmitter {
  constructor() {
    super();
    this.listenersMap = new Map();
    this.wildcards = [];
    this.metrics = {
      group: "ББМО-01-23",
      events: {},
      total: 0,
      listeners: {}
    };
  }

  // Подписка со специфичным приоритетом
  on(event, listener, priority = 0) {
    if (!this.listenersMap.has(event)) {
      this.listenersMap.set(event, []);
    }
    this.listenersMap.get(event).push({ listener, priority, once: false });
    // Сортировка по убыванию приоритета
    this.listenersMap.get(event).sort((a, b) => b.priority - a.priority);
    
    this.metrics.listeners[event] = (this.metrics.listeners[event] || 0) + 1;
  }

  // Одноразовая подписка с приоритетом
  once(event, listener, priority = 0) {
    if (!this.listenersMap.has(event)) {
      this.listenersMap.set(event, []);
    }
    this.listenersMap.get(event).push({ listener, priority, once: true });
    this.listenersMap.get(event).sort((a, b) => b.priority - a.priority);
    
    this.metrics.listeners[event] = (this.metrics.listeners[event] || 0) + 1;
  }

  // Подписка на абсолютно все события (wildcard)
  onAny(listener) {
    this.wildcards.push(listener);
  }

  // Вызов события с учётом приоритетов
  emit(event, ...args) {
    // Обновление метрик
    this.metrics.events[event] = (this.metrics.events[event] || 0) + 1;
    this.metrics.total++;

    // Вызов wildcard-слушателей
    this.wildcards.forEach(listener => listener(event, args));

    const list = this.listenersMap.get(event);
    if (!list || list.length === 0) return false;

    // Идём по копии массива, чтобы безопасно удалять once-слушатели
    const runList = [...list];
    for (const item of runList) {
      try {
        item.listener(...args);
      } catch (err) {
        // Логирование ошибок в слушателях с высоким приоритетом
        console.log(chalk.red(`[ERROR] [ББМО-01-23] Ошибка в слушателе "${event}": ${err.message}`));
      }

      if (item.once) {
        // Удаляем из оригинального списка
        const idx = list.indexOf(item);
        if (idx !== -1) list.splice(idx, 1);
        this.metrics.listeners[event]--;
      }
    }
    return true;
  }

  getMetrics() {
    return this.metrics;
  }
}

const bus = new EventBus();

// --- 1. Демонстрация приоритетов ---
console.log(chalk.cyan('--- Приоритеты ---'));
bus.on('prioTest', () => console.log('[priority 0] Низкий приоритет'), 0);
bus.on('prioTest', () => console.log('[priority 10] Высокий приоритет'), 10);
bus.on('prioTest', () => console.log('[priority 5] Средний приоритет'), 5);
bus.emit('prioTest');

// --- 2. Демонстрация Wildcard ---
console.log(chalk.cyan('\n--- Wildcard ---'));
bus.onAny((event, args) => {
  console.log(`[onAny] Событие "${event}" с аргументами: ${JSON.stringify(args)}`);
});
bus.emit('greet', 'Иван');
bus.emit('info', 'ББМО-01-23');

// --- 3. Демонстрация Once-кэша ---
console.log(chalk.cyan('\n--- Once-кэш ---'));
let busOnceCount = 0;
bus.once('busTick', () => busOnceCount++);

console.log('[tick] Вызов 1'); bus.emit('busTick');
console.log('[tick] Вызов 2'); bus.emit('busTick');
console.log('[tick] Вызов 3'); bus.emit('busTick');
console.log(`once-слушатель вызван: ${chalk.green(busOnceCount)} раз`);

// --- 4. Демонстрация обработки ошибок ---
console.log(chalk.cyan('\n--- Обработка ошибок ---'));
bus.on('testError', () => { throw new Error('Ошибка симуляции 1'); });
bus.on('testError2', () => { throw new Error('Ошибка симуляции 2'); });
bus.emit('testError');
bus.emit('testError2');

// --- 5. Демонстрация метрик ---
console.log(chalk.cyan('\n--- Метрики ---'));
const metrics = bus.getMetrics();
console.log(`greet: ${metrics.events.greet} вызова`);
console.log(`info: ${metrics.events.info} вызов`);
console.log(`tick: ${metrics.events.busTick} вызова`);
console.log(`Всего событий: ${metrics.total}`);

// --- 6. Интеграция с HTTP-сервером ---
const server = http.createServer((req, res) => {
  // Логируем запрос в EventBus
  bus.emit('request', req.method, req.url);

  if (req.url === '/metrics' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(bus.getMetrics(), null, 2));
  } else {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Сервер EventBus запущен. Перейдите на /metrics');
  }
});

server.listen(3000, () => {
  console.log(chalk.green('\n=== HTTP-сервер запущен на http://localhost:3000/metrics ==='));
  console.log(chalk.gray('Скрипт ожидает запросов. Сделайте скриншот вывода Задания 5 и нажмите Ctrl+C.'));
});
