import * as vscode from 'vscode';
import OssSync from '../services/oss';

export const initConfigCommand =async () => {
  await OssSync.initConfig();
};

export const uploadFileCommand =async (folder:vscode.Uri) => {
  const ossInstance=OssSync.getInstance();
  ossInstance &&  await ossInstance.uploadFile(folder.fsPath);
};


export const syncFolderCommand =async (folder:vscode.Uri) => {
  const ossInstance=OssSync.getInstance();
  ossInstance && await ossInstance.syncFolder(folder.fsPath);
};

