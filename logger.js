// logger.js
const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, 'logs.txt');

function setupLogger(app) {
    const events = ['server:started', 'server:stopped', 'request:received'];

    events.forEach(eventName => {
        app.on(eventName, (data) => {
            const timestamp = new Date().toISOString();
            let dataString = '';
            if (data) {
                dataString = typeof data === 'object' ? JSON.stringify(data) : data;
            }

            const logMessage = `[${timestamp}] ${eventName.toUpperCase()}: ${dataString}\n`;

            // Асинхронно записываем в logs.txt
            fs.appendFile(logFilePath, logMessage, (err) => {
                if (err) {
                    console.error('Ошибка записи в лог-файл:', err);
                }
            });
        });
    });
}

module.exports = { setupLogger };
