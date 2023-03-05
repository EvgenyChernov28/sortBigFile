import { createReadStream, createWriteStream } from 'fs';
import { rm } from 'fs/promises';
import { pipeline } from 'stream/promises';
import readline from 'readline';


const BUFFER_CAPACITY = 250_000_000;
const MAX_MEM_USE = 250_000_000; 

(async function () {
  await externSort("bigFile.txt");
})();

async function externSort(fileName) {
  const file = createReadStream(fileName, { highWaterMark: BUFFER_CAPACITY });
  const lines = readline.createInterface({ input: file, crlfDelay: Infinity });
  const v = [];
  let size = 0;
  const tmpFileNames = [];
  for await (let line of lines) {
    size += line.length;
    v.push((line));
    if (size > MAX_MEM_USE) {
      await sortAndWriteToFile(v, tmpFileNames);
      size = 0;
    }
  }
  if (v.length > 0) {
    await sortAndWriteToFile(v, tmpFileNames);
  }
  await merge(tmpFileNames, fileName);
  await cleanUp(tmpFileNames);
}

function cleanUp(tmpFileNames) {
  return Promise.all(tmpFileNames.map(f => rm(f)));
}

async function merge(tmpFileNames, fileName) {
  console.log('merging result ...');
  const resultFileName = `${fileName.split('.txt')[0]}-sorted.txt`;
  const file = createWriteStream(resultFileName, { highWaterMark: BUFFER_CAPACITY });
  const activeReaders = tmpFileNames.map(
    name => readline.createInterface(
      { input: createReadStream(name, { highWaterMark: BUFFER_CAPACITY }), crlfDelay: Infinity }
    )[Symbol.asyncIterator]()
  )
  const values = await Promise.all(activeReaders.map(r => r.next().then(e => (e.value))));
  return pipeline(
    async function* () {
      while (activeReaders.length > 0) {
        let minVal = values[0]
        let i = 0
        values.forEach((elem, index) =>{
          if(minVal > elem){
            minVal = elem
            i  = index
          }
        })
        yield `${minVal}\n`;
        minVal = values[0]
        const res = await activeReaders[i].next();
        if (!res.done) {
          values[i] = (res.value);
        } else {
          values.splice(i, 1);
          activeReaders.splice(i, 1);
        }
        i = 0
      }
    },
    file
  );
}

async function sortAndWriteToFile(v, tmpFileNames) {
    v.sort();
  let tmpFileName = `tmp_sort_${tmpFileNames.length}.txt`;
  tmpFileNames.push(tmpFileName);
  console.log(`creating tmp file: ${tmpFileName}`);
  await pipeline(
    v.map(e => `${e}\n`),
    createWriteStream(tmpFileName, { highWaterMark: BUFFER_CAPACITY })
  );
  v.length = 0;
}
