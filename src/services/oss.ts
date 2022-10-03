import { readJsonSync, pathExists, outputJson } from 'fs-extra';
import * as path from 'path';
import BucketManagerFactory from './bucketManager';
import {
  createStatusBarItem,
  getRootPath,
  showErrorMessage,
  showInformationMessage,
  showTextDocument,
  showWarningMessage,
} from '../utils/vscode';
import { getFilesFromFolderSync } from '../utils/util';
import { differenceBy } from 'lodash';

const configPath = path.join(getRootPath(), '.vscode/oss-sync.json');
const ASSETS_CONTEXT = 'ossSyncAssets';

export default class OssSync {
  private _client;
  private constructor() {
    this._client = BucketManagerFactory.create(OssSync.getConfig());
  }

  private static _instance: OssSync | null;
  static getInstance() {
    try {
      if (!OssSync._instance) {
        OssSync._instance = new OssSync();
      }
    } catch (e) {
      showErrorMessage('Please check your config in ./vscode/oss-sync.json.');
      OssSync._instance = null;
    }
    return OssSync._instance;
  }

  static getConfig() {
    return readJsonSync(configPath);
  }

  static async initConfig() {
    let exist = await pathExists(configPath);
    if (exist) {
      await showTextDocument(configPath);
      return;
    }
    await outputJson(
      configPath,
      {
        label: 'oss label',
        type: 'tencent',
        region: 'assets-sh-1234',
        accessKeyId: '',
        accessKeySecret: '',
        bucket: '',
        prefix: '',
      },
      { spaces: 4 }
    );
    await showTextDocument(configPath);
  }

  static getFilePathOfAssets(filePath: string) {
    let formatFilePath = filePath.split(ASSETS_CONTEXT)[1].replace(/\\/g, '/');
    formatFilePath =
      formatFilePath.charAt(0) === '/'
        ? formatFilePath.substring(1, formatFilePath.length)
        : formatFilePath;

    return formatFilePath;
  }
  static getTargetPrefixByFilePath(filePath: string) {
    let filePathOfAssets = OssSync.getFilePathOfAssets(filePath);
    let ossPrefix = OssSync.getConfig().prefix;
    let targetPrefix = ossPrefix
      ? ossPrefix + '/' + filePathOfAssets
      : filePathOfAssets;
    return targetPrefix;
  }

  diffFiles(localFiles: string[], remoteFiles: string[]) {
    return differenceBy(
      localFiles.map((file) => {
        return {
          prefix: OssSync.getTargetPrefixByFilePath(file),
          fullPath: file,
        };
      }),
      remoteFiles.map((v) => {
        return {
          prefix: v,
        };
      }),
      'prefix'
    );
  }

  async uploadFolder(folderPath: string) {
    let prefix = OssSync.getTargetPrefixByFilePath(folderPath);
    let localFiles = getFilesFromFolderSync(folderPath);
    let remoteFiles = await this._client.listPrefix(prefix);
    let needUploadFiles = this.diffFiles(localFiles, remoteFiles);
    if (needUploadFiles.length <= 0) {
      showWarningMessage('No files need to upload.');
      return;
    }
    const statusBarItem = createStatusBarItem();
    statusBarItem.show();
    let notUploadCount = needUploadFiles.length;
    for await (let fileItem of needUploadFiles) {
      statusBarItem.text = `upload ${fileItem.fullPath}, ${
        notUploadCount - 1 >= 0
          ? notUploadCount - 1 + ' files waiting for upload.'
          : ''
      }`;
      await this._client.put(fileItem.prefix, fileItem.fullPath);
      notUploadCount--;
    }
    statusBarItem.hide();
    showInformationMessage(
      `sync ${prefix} succeed,${needUploadFiles.length} files has been uploaded.`
    );
  }

  async uploadFile(filePath: string) {
    let targetPrefix = OssSync.getTargetPrefixByFilePath(filePath);
    let isExist = await this._client.checkFileExist(targetPrefix);
    if (isExist) {
      showErrorMessage(`${filePath} already exist.`);
      return;
    }
    try {
      await this._client.put(targetPrefix, filePath);
      showInformationMessage(`upload ${filePath} succeed.`);
    } catch (e) {
      showErrorMessage(`upload ${filePath} failed.`);
    }
  }
}
