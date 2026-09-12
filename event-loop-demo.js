// event-loop-demo.js

setTimeout(() => {
    console.log("1. setTimeout");
}, 0);

setImmediate(() => {
    console.log("2. setImmediate");
});

process.nextTick(() => {
    console.log("3. process.nextTick");
});

Promise.resolve().then(() => {
    console.log("4. Promise.then");
});

// Синхронный код выполняется в первую очередь
console.log("5. Синхронный код");

/*
ОБЪЯСНЕНИЕ ПОРЯДКА ВЫВОДА:
1. "5. Синхронный код" — выполняется сразу в главном потоке (Call Stack).
2. "3. process.nextTick" — очередь микрозадач с наивысшим приоритетом, выполняется до фаз цикла событий.
3. "4. Promise.then" — обычная очередь микрозадач, выполняется сразу после nextTick.
4. "1. setTimeout" — макрозадача, попадает в фазу таймеров (Timers Phase).
5. "2. setImmediate" — макрозадача, попадает в фазу проверки (Check Phase), которая идет позже таймеров.
*/
