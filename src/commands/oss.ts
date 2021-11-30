import * as vscode from 'vscode';
import Oss from '../services/oss';


export const initConfig = (context: vscode.ExtensionContext) => {
  let command: vscode.Disposable = vscode.commands.registerCommand(
    'vscode-oss-sync.config',
    async () => {
      await Oss.initConfig();
    }
  );
  context.subscriptions.push(command);
};

export const syncLocalToRemote = (context: vscode.ExtensionContext) => {
  let command: vscode.Disposable = vscode.commands.registerCommand(
    'vscode-oss-sync.syncLocalToRemote',
    async (folder:vscode.Uri) => {
      const ossClient=Oss.getInstance();
      if(ossClient){
        await ossClient.syncLocalToRemote(folder.fsPath);
      }
    }
  );
  context.subscriptions.push(command);
};

