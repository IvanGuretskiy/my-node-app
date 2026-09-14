const FileManagerHybrid = require('./fileOperationsHybrid');
const fileManager = new FileManagerHybrid('./test-data-hybrid');

async function runTests() {
  console.log('=== ТЕСТИРОВАНИЕ ГИБРИДНОГО МОДУЛЯ ===\n');

  // 1. Проверяем работу через КОЛБЭК
  console.log('1. Тест через Колбэк...');
  fileManager.createFile('callback-file.txt', 'Привет из колбэка!', (err, path) => {
    if (err) return console.error('❌ Ошибка:', err.message);
    console.log(` ✅ Работает через колбэк! Файл тут: ${path}`);
    
    fileManager.readFile('callback-file.txt', (err, content) => {
      console.log(` ✅ Содержимое через колбэк: "${content}"`);
    });
  });

  // Задержка, чтобы логи не перемешались
  await new Promise(r => setTimeout(r, 100));

  // 2. Проверяем работу через ПРОМИС (async/await)
  console.log('\n2. Тест через Промис...');
  try {
    const path = await fileManager.createFile('promise-file.txt', 'Привет из промиса!');
    console.log(` ✅ Работает через промис! Файл тут: ${path}`);

    const content = await fileManager.readFile('promise-file.txt');
    console.log(` ✅ Содержимое через промис: "${content}"`);
    
    console.log('\n✅ Задание 3 успешно проверено!');
  } catch (err) {
    console.error('❌ Ошибка промиса:', err.message);
  }
}

runTests();
