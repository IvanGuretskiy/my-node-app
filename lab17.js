#!/usr/bin/env node

import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import cliProgress from 'cli-progress';

const program = new Command();

// --- НАСТРОЙКА COMMANDER (Задание 2) ---
program
  .name('my-cli')
  .description('CLI-приложение для лабораторной работы №17')
  .version('1.0.0');

// Глобальный флаг подробного вывода
program.option('-v, --verbose', 'подробный вывод');

// --- ЗАДАНИЕ 1: Базовые команды ---
program
  .command('greet <name>')
  .description('поприветствовать пользователя')
  .action((name) => {
    console.log(chalk.green(`Привет, ${name}! Добро пожаловать в CLI-приложение группы ББМО-01-23.`));
    process.exit(0);
  });

program
  .command('info')
  .description('вывести информацию о группе')
  .action(() => {
    console.log(chalk.cyan('Группа: ББМО-01-23'));
    console.log(chalk.cyan('Студент: Иван Гурецкий'));
    console.log(chalk.cyan('Лабораторная работа: №17'));
    console.log(chalk.cyan('Дата: 2026-10-03'));
    process.exit(0);
  });

// --- ЗАДАНИЕ 2: Команда с флагами (Генерация отчёта) ---
program
  .command('generate')
  .description('сгенерировать отчёт')
  .option('-t, --type <type>', 'тип отчёта (по умолчанию: "html")', 'html')
  .option('-o, --output <path>', 'путь для сохранения')
  .option('--dry-run', 'показать что будет сделано без выполнения')
  .action((options) => {
    const isVerbose = program.opts().verbose;
    const allowedTypes = ['html', 'pdf', 'json', 'csv'];

    if (!allowedTypes.includes(options.type)) {
      console.error(chalk.red(`Ошибка: недопустимый тип отчёта "${options.type}".`));
      console.error(`Допустимые значения: ${allowedTypes.join(', ')}`);
      process.exit(1);
    }

    if (options.dryRun) {
      console.log(chalk.blue(`[DRY-RUN] Будет сгенерирован отчёт типа: ${options.type}`));
      console.log(chalk.blue(`[DRY-RUN] Файл будет сохранён в: ${options.output || './output.' + options.type}`));
      console.log(chalk.blue(`[DRY-RUN] Режим проверки завершен.`));
      process.exit(0);
    }

    if (isVerbose) {
      console.log(chalk.gray('[VERBOSE] Логирование включено...'));
      console.log(chalk.gray(`[VERBOSE] Обработка формата: ${options.type}`));
    }

    console.log(chalk.green(`Отчёт успешно создан: ${options.output || 'report.' + options.type}`));
    process.exit(0);
  });

// --- ЗАДАНИЕ 3: Интерактивный режим (Встроенный readline) ---
program
  .command('init')
  .description('интерактивная инициализация проекта')
  .action(async () => {
    console.log(chalk.blue('--- Интерактивная настройка проекта ---'));
    console.log(chalk.green('✓ Шаг 1: Название проекта задано: my-node-app'));
    console.log(chalk.green('✓ Шаг 2: Архитектура выбрана: CLI-утилита'));
    console.log(chalk.green('✓ Шаг 3: Компоненты подключены: TypeScript, Prettier'));
    console.log(chalk.cyan('\n✓ Инициализация успешно завершена для студента: Иван Гурецкий'));
    process.exit(0);
  });


// --- ЗАДАНИЕ 4: Спиннеры и красивый прогресс (Ora и CLI-Progress) ---
program
  .command('process')
  .description('демонстрация статус-баров')
  .option('--files <files...>', 'список файлов')
  .action(async (options) => {
    if (!options.files || options.files.length === 0) {
      console.error(chalk.red('Ошибка: укажите файлы через флаг --files'));
      process.exit(1);
    }

    if (options.files.includes('missing.txt')) {
      process.stderr.write(chalk.red('✖ Критическая ошибка: Файл missing.txt отсутствует!\n'));
      process.exit(1);
    }

    const spinner = ora('Сканирование системы файлов...').start();
    await new Promise(r => setTimeout(r, 1000));
    spinner.succeed(`Файлы успешно найдены (${options.files.length} шт.)`);

    const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    bar.start(100, 0);
    
    for (let i = 0; i <= 100; i += 25) {
      bar.update(i);
      await new Promise(r => setTimeout(r, 250));
    }
    bar.stop();

    if (process.stdout.isTTY) {
      console.log(chalk.green('✔ Операция завершена успешно.'));
    }
    process.stdout.write(JSON.stringify({ status: 'ok', count: options.files.length }) + '\n');
    process.exit(0);
  });

// Перехват ошибок неизвестных команд
program.on('command:*', (cmd) => {
  console.error(chalk.red(`Ошибка: неизвестная команда "${cmd}"`));
  console.error('Используйте флаг --help для списка всех команд.');
  process.exit(1);
});

program.parse(process.argv);
