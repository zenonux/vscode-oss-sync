// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { initConfigCommand, uploadFileCommand, syncFolderCommand, renameAndUploadFileCommand, uploadFolderCommand } from './commands/oss';
import { registerCommand } from './utils/vscode';

export function activate(context: vscode.ExtensionContext) {

	context.subscriptions.push(registerCommand('vscode-oss-sync.config', initConfigCommand));
	context.subscriptions.push(registerCommand('vscode-oss-sync.uploadFile', uploadFileCommand));
	context.subscriptions.push(registerCommand('vscode-oss-sync.renameAndUploadFile', renameAndUploadFileCommand));
	context.subscriptions.push(registerCommand('vscode-oss-sync.uploadFolder', uploadFolderCommand));
	context.subscriptions.push(registerCommand('vscode-oss-sync.syncFolder', syncFolderCommand));

}

// this method is called when your extension is deactivated
export function deactivate() { }
