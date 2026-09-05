const http = require('http');

function calculatePi(digits) {
    let pi = 3.0;
    let sign = 1;
    for (let i = 2; i < 200000; i += 2) {
        pi += sign * (4.0 / (i * (i + 1) * (i + 2)));
        sign *= -1;
    }
    return pi.toFixed(digits);
}

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });

    const journalNumber = 6; 
    const calculatedPi = calculatePi(journalNumber);

    res.write('Гурецкий Иван Сергеевич<br>');
    res.write('Группа: 401<br>');
    res.write(`Число Пи (знаков после запятой — ${journalNumber}): ${calculatedPi}`);
    
    res.end();
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
