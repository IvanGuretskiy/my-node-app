// index.js
const http = require('http');
const EventEmitter = require('events');
const logger = require('./logger'); // Подключаем логгер из Задания 2

// Функция расчета Пи по вашему алгоритму (Нилаканта) для 6 знаков
function calculatePi(digits) {
    let pi = 3.0;
    let sign = 1;
    for (let i = 2; i < 200000; i += 2) {
        pi += sign * (4.0 / (i * (i + 1) * (i + 2)));
        sign *= -1;
    }
    return pi.toFixed(digits);
}

// ============================================================================
// ЗАДАНИЕ 1: Модернизация HTTP-сервера с событиями
// ============================================================================
class AppServer extends EventEmitter {
    constructor() {
        super();
        this.server = http.createServer((req, res) => {
            // Генерируем событие при входящем запросе
            this.emit('request:received', { url: req.url, method: req.method });

            // Перехватываем роут для Задания 3: GET /order/<id>
            if (req.method === 'GET' && req.url.startsWith('/order/')) {
                const orderId = req.url.split('/')[2]; // Получаем id из URL
                orderHandler.processOrder(orderId);
                
                res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end(`Обработка заказа #${orderId} запущена! Проверьте консоль.\n`);
                return;
            }

            // Стандартный ответ сервера на остальные запросы (Задание 3.4)
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.write('<h3>Hello from Event-Driven Server!</h3>');
            res.write('Гурецкий Иван Сергеевич<br>');
            res.write('Группа: 401<br>');
            res.end();
        });
    }

    start(port) {
        this.server.listen(port, () => {
            this.emit('server:started', port);
        });
    }

    stop() {
        this.server.close(() => {
            this.emit('server:stopped');
        });
    }
}

// Инициализация сервера
const app = new AppServer();

// Регистрация обработчиков событий для вывода в консоль (Задание 3.3)
app.on('server:started', (port) => {
    console.log(`🚀 Сервер запущен на порту ${port}`);
});

app.on('request:received', (data) => {
    console.log(`📨 Получен запрос: ${data.method} ${data.url}`);
});

app.on('server:stopped', () => {
    console.log('🛑 Сервер остановлен');
});

// Настройка системы логирования (Задание 2)
logger.setupLogger(app);


// ============================================================================
// ЗАДАНИЕ 3: Асинхронная обработка данных с таймерами (Заказы)
// ============================================================================
class OrderHandler extends EventEmitter {
    processOrder(orderId) {
        // 1. Сразу генерируем старт
        this.emit('order:start', orderId);

        // 2. Через 2 секунды — обработка
        setTimeout(() => {
            this.emit('order:processing', orderId);
        }, 2000);

        // 3. Еще через 2 секунды (итого 4) — завершение
        setTimeout(() => {
            const randomSum = Math.floor(Math.random() * (1000 - 100 + 1)) + 100;
            this.emit('order:complete', orderId, randomSum);
        }, 4000);
    }
}

const orderHandler = new OrderHandler();

// Подписка на события обработчика заказов
orderHandler.on('order:start', (orderId) => {
    console.log(`→ [order:start] Заказ #${orderId} начат`);
});

orderHandler.on('order:processing', (orderId) => {
    console.log(`→ [order:processing] Заказ #${orderId}: Идёт обработка...`);
});

orderHandler.on('order:complete', (orderId, sum) => {
    const journalNumber = 6; // Ваш номер журнала
    const formattedPi = calculatePi(journalNumber);
    console.log(`💰 Заказ #${orderId} завершён на сумму ${sum} руб. PI = ${formattedPi}`);
});


// ============================================================================
// ЗАДАНИЕ 5: Создание собственного события с параметрами (UserTracker)
// ============================================================================
class UserTracker extends EventEmitter {
    trackAction(userId, action, metadata) {
        const eventObject = {
            userId: userId,
            action: action,
            timestamp: new Date().toISOString(),
            metadata: metadata,
            id: Math.random().toString(36).substring(2, 11) // уникальный ID события
        };
        this.emit('user:action', eventObject);
    }
}

const tracker = new UserTracker();

// Обработчик красивого вывода в консоль
tracker.on('user:action', (event) => {
    console.log(`\n👤 Пользователь ${event.userId} совершил действие "${event.action}"`);
    console.log(`   Время: ${event.timestamp}`);
    console.log(`   ID события: ${event.id}`);
    console.log(`   Доп. данные: ${JSON.stringify(event.metadata)}`);
});


// ============================================================================
// ЗАПУСК И ЭМУЛЯЦИЯ ТЕСТОВ
// ============================================================================
app.start(3000);

// Тестовые вызовы для Задания 5 (Творческое)
setTimeout(() => {
    tracker.trackAction('user_101', 'login', { ip: '192.168.1.1', device: 'Desktop' });
    tracker.trackAction('user_202', 'add_to_cart', { item_id: 777, price: 1500 });
}, 1000);

// Эмуляция автоматической остановки через 20 секунд
setTimeout(() => {
    app.stop();
}, 20000);
