import fs from 'node:fs/promises';
import path from 'node:path';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

async function runTask1() {
    // Настраиваем ввод данных из консоли
    const rl = readline.createInterface({ input, output });

    try {
        console.log('--- Ввод данных студента ---');
        const studentName = await rl.question('Введите Фамилию и Имя: ');
        const group = await rl.question('Введите номер группы: ');
        const variant = await rl.question('Введите номер вашего варианта: ');
        
        console.log('\nВведите 5 ваших любимых фильмов или книг:');
        const favorites = [];
        for (let i = 1; i <= 5; i++) {
            const item = await rl.question(`${i}: `);
            favorites.push(`${i}. ${item}`);
        }
        rl.close(); // Закрываем ввод

        // 1. Формируем путь к файлу student_N.txt с помощью модуля path
        const fileName = `student_${variant}.txt`;
        const filePath = path.resolve(fileName);

        // Получаем и форматируем текущую дату и время
        const now = new Date().toLocaleString('ru-RU').replace(',', '');

        // 2. Формируем массив строк для записи
        const lines = [
            `Студент: ${studentName}`,
            `Группа: ${group}`,
            `Вариант: ${variant}`,
            `Дата: ${now}`,
            'Любимые книги/фильмы:',
            ...favorites
        ];

        // Считаем общее количество строк (учитывая будущую строку с итогом)
        const totalLines = lines.length + 1;
        lines.push(`Количество записей: ${totalLines}`);

        // Собираем всё в одну строку с переносами
        const fileContent = lines.join('\n');

        // Записываем файл (асинхронно)
        await fs.writeFile(filePath, fileContent, 'utf-8');
        console.log(`\n✅ Создан файл: ${fileName}`);

        // 4. Читаем файл и выводим его содержимое в консоль
        const fileData = await fs.readFile(filePath, 'utf-8');
        
        console.log('\nСодержимое файла:');
        console.log('─────────────────────────────────');
        console.log(fileData);
        console.log('─────────────────────────────────');

    } catch (error) {
        // 3. Обработка всех возможных ошибок
        console.error(`❌ Произошла ошибка: ${error.message}`);
        rl.close();
    }
}

runTask1();
