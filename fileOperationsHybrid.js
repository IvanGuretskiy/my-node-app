const fs = require('fs');
const path = require('path');

class FileManagerHybrid {
  constructor(baseDir = './data-hybrid') {
    this.baseDir = baseDir;
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }
  }

  // Гибридный метод создания файла
  createFile(filename, content, callback) {
    const filePath = path.join(this.baseDir, filename);
    
    // Если колбэк передан — используем старый стиль
    if (typeof callback === 'function') {
      fs.writeFile(filePath, content, 'utf8', (err) => {
        if (err) return callback(err, null);
        callback(null, filePath);
      });
      return;
    }

    // Если колбэка нет — возвращаем промис
    return fs.promises.writeFile(filePath, content, 'utf8')
      .then(() => filePath);
  }

  // Гибридный метод чтения файла
  readFile(filename, callback) {
    const filePath = path.join(this.baseDir, filename);

    if (typeof callback === 'function') {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) return callback(err, null);
        callback(null, data);
      });
      return;
    }

    return fs.promises.readFile(filePath, 'utf8');
  }
}

module.exports = FileManagerHybrid;
