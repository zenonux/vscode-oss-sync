// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import {
  initConfigCommand,
  uploadFileCommand,
  syncFolderCommand,
  copyAndUploadFileCommand,
  uploadFolderCommand,
  copyLinkCommand,
} from "./commands/oss";
import { registerCommand } from "./utils/vscode";

export function activate(context: vscode.ExtensionContext) {

  const commands = [
    registerCommand("vscode-oss-sync.config", initConfigCommand),
    registerCommand("vscode-oss-sync.uploadFile", uploadFileCommand),
    registerCommand("vscode-oss-sync.uploadFolder", uploadFolderCommand),
    registerCommand("vscode-oss-sync.copyLink", copyLinkCommand),
    registerCommand(
      "vscode-oss-sync.copyAndUploadFile",
      copyAndUploadFileCommand
    ),
    registerCommand("vscode-oss-sync.syncFolder", syncFolderCommand),
  ];

  context.subscriptions.push(...commands);
}

// this method is called when your extension is deactivated
export function deactivate() {}
