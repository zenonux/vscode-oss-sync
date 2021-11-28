"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const oss_1 = require("./commands/oss");
const vscode_1 = require("./utils/vscode");
function activate(context) {
    (0, vscode_1.setContext)('ossSync.enabled', true);
    (0, oss_1.initConfig)(context);
    (0, oss_1.syncLocalToRemote)(context);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map