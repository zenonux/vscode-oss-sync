import * as vscode from "vscode";

export function getRootPath() {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length <= 0) {
    throw new Error("OssSync expects to work at a folder.");
  }
  return workspaceFolders[0].uri.fsPath;
}

export function showTextDocument(uri: string) {
  return vscode.window.showTextDocument(vscode.Uri.file(uri));
}

export function setContext(key: string, val: any) {
  return vscode.commands.executeCommand("setContext", key, val);
}

export async function findFiles(dirPath: string, pattern: string) {
  let files = await vscode.workspace.findFiles(
    new vscode.RelativePattern(dirPath, pattern)
  );
  return files.map((val) => val.fsPath);
}

export function showWarningMessage(msg: string) {
  return vscode.window.showWarningMessage(msg);
}

export function showInformationMessage(msg: string) {
  return vscode.window.showInformationMessage(msg);
}

export function showAlert(msg: string) {
  return vscode.window.showInformationMessage(msg, { modal: true });
}

export async function showDialog(opts: {
  type: "info" | "warning";
  message: string;
}): Promise<boolean> {
  let showMessage =
    opts.type === "info"
      ? vscode.window.showInformationMessage
      : vscode.window.showWarningMessage;
  const res = await showMessage(
    opts.message,
    { modal: true },
    { title: "Cancel", isCloseAffordance: true },
    { title: "Confirm" }
  );
  return res?.title === "Confirm";
}


export const copyToClipboard=(text:string)=>{
  return vscode.env.clipboard.writeText(text);
};

export function showErrorMessage(msg: string) {
  return vscode.window.showErrorMessage(msg);
}

export function createStatusBarItem() {
  return vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
}

export const registerCommand = (
  command: string,
  callback: (...args: any[]) => any
) => {
  return vscode.commands.registerCommand(command, callback);
};
