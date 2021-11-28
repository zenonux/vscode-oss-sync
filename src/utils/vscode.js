"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStatusBarItem = exports.showErrorMessage = exports.showInformationMessage = exports.showWarningMessage = exports.findFiles = exports.setContext = exports.showTextDocument = exports.getRootPath = void 0;
const vscode = require("vscode");
function getRootPath() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length <= 0) {
        throw new Error('OssSync expects to work at a folder.');
    }
    return workspaceFolders[0].uri.fsPath;
}
exports.getRootPath = getRootPath;
function showTextDocument(uri) {
    return vscode.window.showTextDocument(vscode.Uri.file(uri));
}
exports.showTextDocument = showTextDocument;
function setContext(key, val) {
    return vscode.commands.executeCommand('setContext', key, val);
}
exports.setContext = setContext;
async function findFiles(dirPath, pattern) {
    let files = await vscode.workspace.findFiles(new vscode.RelativePattern(dirPath, pattern));
    return files.map((val) => val.fsPath);
}
exports.findFiles = findFiles;
function showWarningMessage(msg) {
    return vscode.window.showWarningMessage(msg);
}
exports.showWarningMessage = showWarningMessage;
function showInformationMessage(msg) {
    return vscode.window.showInformationMessage(msg);
}
exports.showInformationMessage = showInformationMessage;
function showErrorMessage(msg) {
    return vscode.window.showErrorMessage(msg);
}
exports.showErrorMessage = showErrorMessage;
function createStatusBarItem() {
    return vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
}
exports.createStatusBarItem = createStatusBarItem;
//# sourceMappingURL=vscode.js.map