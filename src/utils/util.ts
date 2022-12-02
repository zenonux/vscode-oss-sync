import * as path from "path";
import * as fs from "fs";
import { v1 } from 'uuid';

const hashReg = /__\[\w{8}\]/gi;
function generateHash() {
  return '__[' + v1().slice(0, 8) + ']';
}

export const renameFile = (filePath: string) => {
  let dirname = path.dirname(filePath);
  let basename = path.basename(filePath);
  basename = basename.replace(hashReg, '');
  let extname = path.extname(basename);
  let filename = path.basename(basename, extname);
  basename = filename + generateHash() + extname;
  return path.resolve(dirname, basename);
}

export function listDirectoryFiles(dirPath: string) {
  let fileList: string[] = [];
  fs.readdirSync(dirPath).forEach((file) => {
    const fullFilePath = path.join(dirPath, file);
    const fileStat = fs.statSync(fullFilePath);
    if (fileStat.isFile()) {
      fileList.push(fullFilePath);
    }
  });
  return fileList;
}
