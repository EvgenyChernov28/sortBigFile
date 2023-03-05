import { stat, appendFile } from 'fs';

function str_gen(len) {
  const chrs = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  var str = '';
  for (var i = 0; i < len; i++) {
    var pos = Math.floor(Math.random() * chrs.length);
    str += chrs.substring(pos, pos + 1);
  }
  return str;
}

function getFileSize(name) {
  return new Promise((resolve, reject) =>
    stat(name, (err, { size }) => {
      if (err) return reject(err);
      resolve(size);
    })
  );
}


function writeFile(fileName, strLen) {
  appendFile(fileName, str_gen(strLen) + '\n', function (error) {
    if (error) throw error;
  });
}

function main() {
  getFileSize(`bigFile.txt`).then((result) => {
    if (result < 10*1024*1024*1024) {
      writeFile('bigFile.txt', 128);
      main();
    }
  });
}

main();
