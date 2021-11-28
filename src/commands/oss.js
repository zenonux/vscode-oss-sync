"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncLocalToRemote = exports.initConfig = void 0;
const vscode = require("vscode");
const oss_1 = require("../services/oss");
const ossClient = oss_1.default.getInstance();
const initConfig = (context) => {
    let command = vscode.commands.registerCommand('vscode-oss-sync.initConfig', async () => {
        await oss_1.default.initConfig();
    });
    context.subscriptions.push(command);
};
exports.initConfig = initConfig;
const syncLocalToRemote = (context) => {
    let command = vscode.commands.registerCommand('vscode-oss-sync.syncLocalToRemote', async (folder) => {
        await ossClient.syncLocalToRemote(folder.fsPath);
    });
    context.subscriptions.push(command);
};
exports.syncLocalToRemote = syncLocalToRemote;
//# sourceMappingURL=oss.js.map