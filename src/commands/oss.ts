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

export const uploadFile = (context: vscode.ExtensionContext) => {
  let command: vscode.Disposable = vscode.commands.registerCommand(
    'vscode-oss-sync.uploadFile',
    async (folder:vscode.Uri) => {
      const ossClient=Oss.getInstance();
      if(ossClient){
        await ossClient.uploadFile(folder.fsPath);
      }
    }
  );
  context.subscriptions.push(command);
};


export const uploadFolder = (context: vscode.ExtensionContext) => {
  let command: vscode.Disposable = vscode.commands.registerCommand(
    'vscode-oss-sync.uploadFolder',
    async (folder:vscode.Uri) => {
      const ossClient=Oss.getInstance();
      if(ossClient){
        await ossClient.uploadFolder(folder.fsPath);
      }
    }
  );
  context.subscriptions.push(command);
};

