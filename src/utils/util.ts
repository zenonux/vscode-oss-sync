import * as path from "path";
import * as fs from "fs";

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
