import * as vscode from 'vscode';
import OssSync from '../services/oss';

export const initConfigCommand = async () => {
  await OssSync.initConfig();
};


export const copyLinkCommand = async (folder: vscode.Uri) => {
  const ossInstance = OssSync.getInstance();
  ossInstance && await ossInstance.copyLink(folder.fsPath);
};

export const uploadFileCommand = async (folder: vscode.Uri) => {
  const ossInstance = OssSync.getInstance();
  ossInstance && await ossInstance.uploadFile(folder.fsPath);
};

export const uploadFolderCommand = async (folder: vscode.Uri) => {
  const ossInstance = OssSync.getInstance();
  ossInstance && await ossInstance.uploadFolder(folder.fsPath);
};



