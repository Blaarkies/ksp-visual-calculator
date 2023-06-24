import * as fsp from 'fs/promises';
import * as glob from 'glob';

export async function readFile(path: string): Promise<any> {
  return fsp.readFile(
    path,
    {encoding: 'utf8'})
    // remove zero-width-no-break-space at start of text
    .then(text => text.replace(/[\u200B-\u200D\uFEFF]/g, ''))
    .catch(e => console.error(e));
}

export async function writeToFile(fileName: string, payload: string): Promise<void> {
  return fsp.writeFile(fileName, payload)
    .catch(e => console.error(e));
}

export async function makeDirectory(path: string) {
  await fsp.mkdir(path).catch(() => void 0);
}

function sanitizePath(path: string): string {
  return path.replace(/\\/g, '/');
}

export function getFiles(src: string, extension: string = ''): Promise<string[]> {
  src = sanitizePath(src);
  return new Promise(resolve => {
    glob(src + '/**/*' + extension, (err, res) => err
      ? console.log('Error ', err)
      : resolve(res));
  });
}
