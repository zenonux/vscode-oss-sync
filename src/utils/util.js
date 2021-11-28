"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFilesFromFolderSync = void 0;
const path = require("path");
const fs = require("fs");
function getFilesFromFolderSync(dirPath) {
    let fileList = [];
    fs.readdirSync(dirPath).forEach((file) => {
        const fullFilePath = path.join(dirPath, file);
        const fileStat = fs.statSync(fullFilePath);
        if (fileStat.isFile()) {
            fileList.push(fullFilePath);
        }
    });
    return fileList;
}
exports.getFilesFromFolderSync = getFilesFromFolderSync;
//# sourceMappingURL=util.js.map