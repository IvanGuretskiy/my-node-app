import fs from 'node:fs/promises';
import path from 'node:path';

const VARIANT = 6; // Ваш вариант
const TARGET_DIR = process.argv[2] || '.'; // Если путь не передан, сканируем текущую папку

// Функция для красивого форматирования размера файлов
function formatSize(bytes) {
    if (bytes === 0) return '0 Байт';
    const sizes = ['Байт', 'КБ', 'МБ', 'ГБ'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}

async function analyzeDirectory() {
    // Объект для сбора итоговой статистики
    const stats = {
        totalFolders: 0,
        totalFiles: 0,
        totalSize: 0,
        extensions: {},
        allFilesList: [] // Для последующей сортировки Топ-5
    };

    async function scan(dirPath) {
        const items = await fs.readdir(dirPath, { withFileTypes: true });

        for (const item of items) {
            const fullPath = path.join(dirPath, item.name);
            
            // УСЛОВИЕ ВАРИАНТА 6: Игнорируем node_modules и .git
            if (item.name === 'node_modules' || item.name === '.git') {
                continue;
            }

            if (item.isDirectory()) {
                stats.totalFolders++;
                await scan(fullPath); // Рекурсивный вызов для вложенных папок
            } else if (item.isFile()) {
                stats.totalFiles++;
                const fileStat = await fs.stat(fullPath);
                const size = fileStat.size;
                stats.totalSize += size;

                // Получаем расширение файла (.js, .json и т.д.)
                const ext = path.extname(item.name).toLowerCase() || 'без расширения';
                
                // Группировка расширений
                if (!stats.extensions[ext]) {
                    stats.extensions[ext] = { count: 0, size: 0 };
                }
                stats.extensions[ext].count++;
                stats.extensions[ext].size += size;

                // Добавляем файл в общий список для поиска топ-5
                stats.allFilesList.push({
                    name: item.name,
                    path: path.relative('.', fullPath),
                    size: size
                });
            }
        }
    }

    try {
        const resolvedTarget = path.resolve(TARGET_DIR);
        console.log(`📊 Анализ директории: ${resolvedTarget}`);
        
        await scan(resolvedTarget);

        // Сортируем топ-5 больших и маленьких файлов
        const sortedByBig = [...stats.allFilesList].sort((a, b) => b.size - a.size);
        const sortedBySmall = [...stats.allFilesList].sort((a, b) => a.size - b.size);

        const top5Largest = sortedByBig.slice(0, 5);
        const top5Smallest = sortedBySmall.slice(0, 5);

        // Вывод результатов в консоль
        console.log(`📁 Общее количество папок: ${stats.totalFolders}`);
        console.log(`📄 Общее количество файлов: ${stats.totalFiles}`);
        console.log(`💾 Общий размер: ${formatSize(stats.totalSize)} (${stats.totalSize} байт)`);
        
        console.log('\n📂 Расширения файлов:');
        for (const [ext, data] of Object.entries(stats.extensions)) {
            console.log(`  ${ext}: ${data.count} файлов (${formatSize(data.size)})`);
        }

        console.log('\n🏆 Топ-5 самых больших файлов:');
        top5Largest.forEach((f, i) => console.log(`  ${i + 1}. ${f.name} (${formatSize(f.size)}) - ./${f.path}`));

        console.log('\n📉 Топ-5 самых маленьких файлов:');
        top5Smallest.forEach((f, i) => console.log(`  ${i + 1}. ${f.name} (${formatSize(f.size)}) - ./${f.path}`));

        // Формируем JSON-отчет
        const reportData = {
            targetDirectory: resolvedTarget,
            totalFolders: stats.totalFolders,
            totalFiles: stats.totalFiles,
            totalSizeBytes: stats.totalSize,
            totalSizeFormatted: formatSize(stats.totalSize),
            extensionsSummary: stats.extensions,
            top5LargestFiles: top5Largest,
            top5SmallestFiles: top5Smallest
        };

        const reportName = `report_${VARIANT}.json`;
        await fs.writeFile(path.resolve(reportName), JSON.stringify(reportData, null, 2), 'utf-8');
        console.log(`\n📄 Отчет сохранен: ${reportName}`);

    } catch (error) {
        console.error(`❌ Ошибка анализа директории: ${error.message}`);
    }
}

analyzeDirectory();
