import fs from 'node:fs/promises';
import path from 'node:path';

const VARIANT = 6; // Ваш вариант
const ROOT_DIR = path.resolve(`project_${VARIANT}`);

// Список папок с их описанием для info.txt
const directories = {
    'src/modules': 'Модули приложения для разделения бизнес-логики.',
    'src/components': 'Повторно используемые компоненты интерфейса.',
    'src/utils': 'Вспомогательные функции и утилиты.',
    'data/input': 'Входные данные для обработки.',
    'data/output': 'Выходные данные и результаты работы.',
    'temp': 'Временные файлы сессии.'
};

// Функция для отрисовки дерева в консоли (простая рекурсивная функция)
async function printTree(dirPath, prefix = '') {
    const files = await fs.readdir(dirPath, { withFileTypes: true });
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const isLast = i === files.length - 1;
        console.log(`${prefix}${isLast ? '└── ' : '├── '}${file.name}${file.isDirectory() ? '/' : ''}`);
        if (file.isDirectory()) {
            await printTree(path.join(dirPath, file.name), prefix + (isLast ? '    ' : '│   '));
        }
    }
}

async function runTask2() {
    try {
        console.log(`📁 Создание структуры проекта project_${VARIANT}...`);
        const now = new Date().toLocaleString('ru-RU');

        // 1. Создаем папки и файлы info.txt + README.md
        for (const [subDir, description] of Object.entries(directories)) {
            const targetPath = path.join(ROOT_DIR, subDir);
            
            // Создаем папку (recursive: true позволяет создавать вложенные пути сразу)
            await fs.mkdir(targetPath, { recursive: true });

            // Создаем info.txt
            await fs.writeFile(path.join(targetPath, 'info.txt'), description, 'utf-8');

            // ДОП. УСЛОВИЕ: Создаем README.md с датой для четного варианта
            await fs.writeFile(path.join(targetPath, 'README.md'), `# Дата создания: ${now}`, 'utf-8');
        }

        console.log('\n🌳 Исходное дерево структуры:');
        console.log(`project_${VARIANT}/`);
        await printTree(ROOT_DIR);

        // 4. Перемещаем папку temp внутрь data -> data/temp
        console.log('\n🔄 Перемещение temp в data...');
        const oldTemp = path.join(ROOT_DIR, 'temp');
        const newTemp = path.join(ROOT_DIR, 'data', 'temp');
        await fs.rename(oldTemp, newTemp);

        // 5. Переименовываем data/output в data/results
        console.log('✏️  Переименование data/output в data/results...');
        const oldOutput = path.join(ROOT_DIR, 'data', 'output');
        const newResults = path.join(ROOT_DIR, 'data', 'results');
        await fs.rename(oldOutput, newResults);

        // 6. Удаляем папку temp со всем содержимым (recursive: true)
        console.log('🗑️  Удаление папки temp со всем содержимым...');
        await fs.rm(newTemp, { recursive: true, force: true });

        console.log('\n🌳 Обновленное дерево структуры:');
        console.log(`project_${VARIANT}/`);
        await printTree(ROOT_DIR);
        console.log('\n✅ Задание 2 успешно выполнено!');

    } catch (error) {
        console.error(`❌ Произошла ошибка: ${error.message}`);
    }
}

runTask2();
