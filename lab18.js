#!/usr/bin/env node

import os from 'os';
import fs from 'fs';
import { Command } from 'commander';
import chalk from 'chalk';

const program = new Command();

program
  .name('os-tool')
  .description('Лабораторная работа №18: Модуль OS')
  .version('1.0.0');

// --- ЗАДАНИЕ 1: Базовая информация ---
program
  .command('info')
  .description('Получение базовой информации о платформе и архитектуре')
  .action(() => {
    const platform = os.platform();
    const uptimeSec = os.uptime();
    
    // Форматирование времени работы
    const hours = Math.floor(uptimeSec / 3600);
    const minutes = Math.floor((uptimeSec % 3600) / 60);
    const seconds = Math.floor(uptimeSec % 60);

    console.log(chalk.bold('=== Информация о системе (группа ББМО-01-23) ==='));
    console.log(`Платформа: ${platform}`);
    console.log(`Тип ОС: ${os.type()}`);
    console.log(`Архитектура: ${os.arch()}`);
    console.log(`Версия ОС: ${os.release()}`);
    console.log(`Имя хоста: ${os.hostname()}`);
    console.log(`Время работы: ${hours} ч ${minutes} мин ${seconds} сек`);

    // Условный вывод на основе платформы
    if (platform === 'win32') console.log(chalk.green('Вы работаете в Windows'));
    else if (platform === 'linux') console.log(chalk.green('Вы работаете в Linux'));
    else if (platform === 'darwin') console.log(chalk.green('Вы работаете в macOS'));
    else console.log(chalk.yellow('Неизвестная платформа'));
    
    process.exit(0);
  });

// --- ЗАДАНИЕ 2: Ресурсы процессора и памяти ---
program
  .command('resources')
  .description('Информация о процессоре и памяти')
  .action(() => {
    const cpus = os.cpus();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const freeMemPercent = (freeMem / totalMem) * 100;
    const usedMemPercent = (usedMem / totalMem) * 100;

    // Расчет средней частоты процессора
    const totalSpeed = cpus.reduce((sum, cpu) => sum + cpu.speed, 0);
    const avgSpeed = Math.round(totalSpeed / cpus.length);

    console.log(chalk.bold('=== Информация о процессоре ==='));
    console.log(`Количество логических ядер: ${cpus.length}`);
    console.log(`Модель процессора: ${cpus[0].model}`);
    console.log(`Средняя частота: ${avgSpeed} МГц`);

    console.log(chalk.bold('\n=== Информация о памяти ==='));
    console.log(`Общий объём: ${(totalMem / 1024 / 1024 / 1024).toFixed(2)} ГБ`);
    console.log(`Свободно: ${(freeMem / 1024 / 1024 / 1024).toFixed(2)} ГБ`);
    console.log(`Использовано: ${(usedMem / 1024 / 1024 / 1024).toFixed(2)} ГБ (${usedMemPercent.toFixed(1)}%)`);
    console.log(chalk.cyan('Группа: ББМО-01-23'));

    // Адаптивный вывод по памяти
    if (freeMemPercent < 20) {
      console.log(chalk.red('⚠ Предупреждение: Доступно менее 20% оперативной памяти!'));
    } else {
      console.log(chalk.green('Память в норме'));
    }

    // Средняя загрузка
    console.log(chalk.bold('\n=== Средняя загрузка системы ==='));
    if (os.platform() === 'win32') {
      console.log(chalk.yellow('Loadavg недоступен на Windows'));
    } else {
      console.log(`Загрузка за 1, 5 и 15 минут: ${os.loadavg().join(', ')}`);
    }
    
    process.exit(0);
  });

// --- ЗАДАНИЕ 3: Сетевые интерфейсы и пользователь ---
program
  .command('network')
  .description('Сетевые интерфейсы и информация о пользователе')
  .action(() => {
    const interfaces = os.networkInterfaces();
    let totalInterfaces = 0;
    let mainInterface = 'Не найден';

    console.log(chalk.bold('=== Сетевые интерфейсы ==='));
    
    for (const [name, info] of Object.entries(interfaces)) {
      totalInterfaces++;
      info.forEach(ipInfo => {
        // Маскирование MAC-адреса
        const maskedMac = ipInfo.mac ? ipInfo.mac.split(':').map((val, idx) => idx > 2 ? '**' : val).join(':') : 'N/A';
        
        console.log(`Интерфейс: ${name}`);
        console.log(`  ${ipInfo.family}: ${ipInfo.address}`);
        console.log(`  MAC: ${maskedMac}`);
        console.log(`  Внутренний: ${ipInfo.internal ? 'да' : 'нет'}`);

        // Поиск основного внешнего IPv4
        if (mainInterface === 'Не найден' && !ipInfo.internal && ipInfo.family === 'IPv4') {
          mainInterface = `${name} (${ipInfo.address})`;
        }
      });
    }

    console.log(`\nВсего интерфейсов: ${totalInterfaces}`);
    console.log(chalk.green(`Основной интерфейс: ${mainInterface}`));

    console.log(chalk.bold('\n=== Информация о пользователе ==='));
    try {
      const user = os.userInfo();
      console.log(`Имя пользователя: ${user.username}`);
      console.log(`UID: ${user.uid}`);
      console.log(`GID: ${user.gid}`);
      console.log(`Домашняя директория: ${user.homedir}`);
      console.log(`Оболочка: ${user.shell || 'N/A'}`);
      console.log(chalk.cyan('Группа: ББМО-01-23'));
      
      // Проверка на root
      const isRoot = user.uid === 0 || user.username === 'root' ? 'да' : 'нет';
      console.log(`Проверка root: ${isRoot}`);
    } catch (e) {
      console.log(chalk.red('Не удалось получить информацию о пользователе.'));
    }
    
    process.exit(0);
  });

// --- ЗАДАНИЕ 4: Мониторинг в реальном времени ---
function getCpuTimes() {
  let totalIdle = 0, totalTick = 0;
  os.cpus().forEach(cpu => {
    for (const type in cpu.times) {
      totalTick += cpu.times[type];
    }
    totalIdle += cpu.times.idle;
  });
  return { idle: totalIdle, total: totalTick };
}

program
  .command('monitor')
  .description('Мониторинг системы в реальном времени (Ctrl+C для выхода)')
  .action(async () => {
    console.log(chalk.bold('Мониторинг (группа ББМО-01-23). Ctrl+C для выхода.\n'));
    
    let warningsCount = 0;
    let startTimes = getCpuTimes();

    const interval = setInterval(() => {
      const endTimes = getCpuTimes();
      
      // Расчет загрузки CPU за интервал
      const idleDiff = endTimes.idle - startTimes.idle;
      const totalDiff = endTimes.total - startTimes.total;
      const cpuLoad = totalDiff > 0 ? ((totalDiff - idleDiff) / totalDiff) * 100 : 0;
      
      startTimes = endTimes; // Обновляем для следующего шага

      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const freeMemPercent = (freeMem / totalMem) * 100;
      const ramLoadPercent = 100 - freeMemPercent;
      const freeGigs = (freeMem / 1024 / 1024 / 1024).toFixed(2);

      let statusIcon = '';
      let anomalyMessage = '';

      // Проверка аномалий
      if (cpuLoad > 80) {
        statusIcon = chalk.red(' ⚠⚠ [КРИТИЧНО]');
        anomalyMessage = `Критическая загрузка CPU: ${cpuLoad.toFixed(1)}%`;
      } else if (cpuLoad > 50) {
        statusIcon = chalk.yellow(' ⚠ [ПРЕДУПРЕЖДЕНИЕ]');
        anomalyMessage = `Повышенная загрузка CPU: ${cpuLoad.toFixed(1)}%`;
      }

      if (freeMemPercent < 10) {
        statusIcon += chalk.red(' ⚠ [МАЛО ПАМЯТИ]');
        anomalyMessage += (anomalyMessage ? ' | ' : '') + `Мало свободной памяти: ${freeMemPercent.toFixed(1)}%`;
      }

      // Логирование аномалий в файл monitor.log
      if (anomalyMessage) {
        warningsCount++;
        const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
        fs.appendFileSync('monitor.log', `[${timestamp}] [ББМО-01-23] Предупреждение: ${anomalyMessage}\n`);
      }

      // Перерисовка одной строки в терминале
      process.stdout.write(`\rCPU: ${cpuLoad.toFixed(1)}% | RAM: ${ramLoadPercent.toFixed(1)}% (${freeGigs} ГБ свободно)${statusIcon}     `);
    }, 2000);

    // Логика чистого завершения по Ctrl+C
    process.on('SIGINT', () => {
      clearInterval(interval);
      console.log(chalk.bold('\n\nМониторинг остановлен.'));
      console.log(`Предупреждений зафиксировано: ${warningsCount}`);
      process.exit(0);
    });
  });

program.parse(process.argv);
