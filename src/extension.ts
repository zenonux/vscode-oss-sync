// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { initConfig,uploadFile,uploadFolder } from './commands/oss';
import { setContext } from './utils/vscode';
export function activate(context: vscode.ExtensionContext) {
	setContext('ossSync.enabled',true);
	initConfig(context);
	uploadFile(context);
	uploadFolder(context);

}

// this method is called when your extension is deactivated
export function deactivate() {}
