import * as vscode from 'vscode';
import Oss from '../services/oss';


export const initConfig = (context: vscode.ExtensionContext) => {
  let command: vscode.Disposable = vscode.commands.registerCommand(
    'vscode-oss-sync.initConfig',
    async () => {
      await Oss.initConfig();
    }
  );
  context.subscriptions.push(command);
};

export const syncLocalToRemote = (context: vscode.ExtensionContext) => {
  const ossClient=Oss.getInstance();
  let command: vscode.Disposable = vscode.commands.registerCommand(
    'vscode-oss-sync.syncLocalToRemote',
    async (folder:vscode.Uri) => {
      await ossClient.syncLocalToRemote(folder.fsPath);
    }
  );
  context.subscriptions.push(command);
};

