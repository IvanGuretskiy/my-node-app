import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const VARIANT = 6;
const SRC_DIR = path.resolve(`source_${VARIANT}`);
const BAK_DIR = path.resolve(`backup_${VARIANT}`);
const REPORT_FILE = path.resolve(`sync_report_${VARIANT}.txt`);

// Функция вычисления MD5 для доп. условия (файлы > 500 КБ)
async function getFileMD5(filePath) {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash('md5');
        const stream = fs.createReadStream(filePath);
        stream.on('data', data => hash.update(data));
        stream.on('end', () => resolve(hash.digest('hex')));
        stream.on('error', err => reject(err));
    });
}

// 1. Создание тестовой структуры source_6
async function createTestStructure() {
    console.log(`📁 Создание тестовой структуры в ${path.basename(SRC_DIR)}...`);
    await fsp.mkdir(SRC_DIR, { recursive: true });

    const subfolders = ['src', 'assets', 'docs'];
    for (const sub of subfolders) {
        await fsp.mkdir(path.join(SRC_DIR, sub), { recursive: true });
    }

    const manifest = { files: [] };
    const extensions = ['txt', 'js', 'json', 'jpg', 'png', 'gif'];

    // Генерируем 20 файлов
    for (let i = 1; i <= 20; i++) {
        const ext = extensions[i % extensions.length];
        const isSubfolder = i % 2 === 0;
        const subDir = isSubfolder ? subfolders[i % subfolders.length] : '';
        const fileName = `file_${i}.${ext}`;
        const relativePath = path.join(subDir, fileName);
        const fullPath = path.join(SRC_DIR, relativePath);

        // Делаем парочку файлов большими (> 500 КБ) для проверки MD5
        const sizeBytes = (i === 5 || i === 11) ? 600 * 1024 : 10 * 1024; 
        const dummyContent = Buffer.alloc(sizeBytes, `Content of file ${i}. `);

        await fsp.writeFile(fullPath, dummyContent);
        manifest.files.push({ name: fileName, path: relativePath, size: sizeBytes });
    }

    await fsp.writeFile(path.join(SRC_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf-8');
    console.log('✅ Исходная структура и manifest.json успешно созданы.');
}

// 2. Копирование с фильтрацией через потоки и обычным способом
async function copyWithFilter(src, dest, stats = { total: 0, stream: 0, normal: 0, size: 0 }) {
    await fsp.mkdir(dest, { recursive: true });
    const items = await fsp.readdir(src, { withFileTypes: true });

    for (const item of items) {
        const srcPath = path.join(src, item.name);
        const destPath = path.join(dest, item.name);

        if (item.isDirectory()) {
            await copyWithFilter(srcPath, destPath, stats);
        } else if (item.isFile()) {
            stats.total++;
            const fileStat = await fsp.stat(srcPath);
            stats.size += fileStat.size;

            const ext = path.extname(item.name).toLowerCase();
            const streamExts = ['.txt', '.js', '.json'];
            const normalExts = ['.jpg', '.png', '.gif'];

            if (streamExts.includes(ext)) {
                // Потоковое копирование
                stats.stream++;
                await new Promise((resolve, reject) => {
                    const read = fs.createReadStream(srcPath);
                    const write = fs.createWriteStream(destPath);
                    read.on('error', reject);
                    write.on('error', reject);
                    write.on('finish', resolve);
                    read.pipe(write);
                });
            } else {
                // Обычное копирование
                stats.normal++;
                await fsp.copyFile(srcPath, destPath);
            }
            console.log(` ├── Скопирован: ${path.relative(SRC_DIR, srcPath)} [${streamExts.includes(ext) ? 'STREAM' : 'NORMAL'}]`);
        }
    }
    return stats;
}

// 3. Синхронизация и сравнение (MD5 для > 500 КБ)
async function syncAndCompare() {
    console.log('\n🔄 Сравнение директорий и генерация отчета...');
    
    let matches = 0, changed = 0, added = 0, deleted = 0;
    const reportLines = [];

    async function scanDir(dir, baseDir) {
        const fileList = [];
        async function recurse(currentDir) {
            const items = await fsp.readdir(currentDir, { withFileTypes: true });
            for (const item of items) {
                const fullPath = path.join(currentDir, item.name);
                if (item.isDirectory()) {
                    await recurse(fullPath);
                } else {
                    fileList.push(path.relative(baseDir, fullPath));
                }
            }
        }
        await recurse(dir);
        return fileList;
    }

    const srcFiles = await scanDir(SRC_DIR, SRC_DIR);
    const bakFiles = await scanDir(BAK_DIR, BAK_DIR);

    for (const relPath of srcFiles) {
        const srcFullPath = path.join(SRC_DIR, relPath);
        const bakFullPath = path.join(BAK_DIR, relPath);

        if (!bakFiles.includes(relPath)) {
            added++;
            reportLines.push(`[Добавлен] ${relPath}`);
            continue;
        }

        const srcStat = await fsp.stat(srcFullPath);
        const bakStat = await fsp.stat(bakFullPath);

        let isDifferent = srcStat.size !== bakStat.size;

        // ВАРИАНТ 6-10: Проверка MD5 для файлов > 500 КБ
        if (!isDifferent && srcStat.size > 500 * 1024) {
            const srcMD5 = await getFileMD5(srcFullPath);
            const bakMD5 = await getFileMD5(bakFullPath);
            if (srcMD5 !== bakMD5) isDifferent = true;
        }

        if (isDifferent) {
            changed++;
            reportLines.push(`[Изменен] ${relPath}`);
        } else {
            matches++;
        }
    }

    for (const relPath of bakFiles) {
        if (!srcFiles.includes(relPath)) {
            deleted++;
            reportLines.push(`[Удален] ${relPath}`);
        }
    }

    const finalReport = `🔄 Сравнение директорий:
- Совпадают: ${matches} файла(ов)
- Изменены: ${changed} файла(ов)
- Добавлены: ${added} файла(ов)
- Удалены: ${deleted} файла(ов)\n\nДетали изменений:\n` + (reportLines.join('\n') || 'Изменений не обнаружено.');

    await fsp.writeFile(REPORT_FILE, finalReport, 'utf-8');
    console.log(finalReport);
    console.log(`\n📄 Отчет сохранен в: ${path.basename(REPORT_FILE)}`);
}

async function main() {
    try {
        const startTime = process.hrtime.bigint();
        await createTestStructure();
        
        console.log(`\n⏳ Начало копирования в папку ${path.basename(BAK_DIR)}...`);
        const stats = await copyWithFilter(SRC_DIR, BAK_DIR);
        
        const endTime = process.hrtime.bigint();
        const execTime = (Number(endTime - startTime) / 1e9).toFixed(2);

        console.log(`\n✅ Копирование завершено!`);
        console.log(`📊 Статистика:\n- Скопировано файлов: ${stats.total}\n- Потоковое копирование: ${stats.stream}\n- Обычное копирование: ${stats.normal}\n- Общий размер: ${(stats.size / 1024).toFixed(2)} КБ\n- Время выполнения: ${execTime} сек`);

        await syncAndCompare();
    } catch (error) {
        console.error(`❌ Ошибка выполнения задания 5: ${error.message}`);
    }
}

main();
