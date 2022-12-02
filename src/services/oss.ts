import { readJsonSync, pathExists, outputJson } from 'fs-extra';
import * as path from 'path';
import BucketManagerFactory from './bucketManager';
import {
  createStatusBarItem,
  getRootPath,
  showErrorMessage,
  showInformationMessage,
  showTextDocument,
  showAlert,
} from '../utils/vscode';
import { listDirectoryFiles } from '../utils/util';
import { differenceBy } from 'lodash';

const configPath = path.join(getRootPath(), '.vscode/oss-sync.json');
const ASSETS_CONTEXT = 'ossSyncAssets';
type RemoteFileItem = { prefix: string };
type LocalFileItem = { prefix: string; fullPath: string };

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
    ossPrefix = ossPrefix.charAt(ossPrefix.length - 1) !== '/' ? ossPrefix + '/' : ossPrefix
    let targetPrefix = ossPrefix + filePathOfAssets;
    return targetPrefix;
  }

  _diffFiles(
    localFiles: string[],
    remoteFiles: string[]
  ): [LocalFileItem[], RemoteFileItem[]] {
    let needUploadFiles = differenceBy(
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

    let needRemoveFiles = differenceBy(
      remoteFiles.map((v) => {
        return {
          prefix: v,
        };
      }),
      localFiles.map((file) => {
        return {
          prefix: OssSync.getTargetPrefixByFilePath(file),
          fullPath: file,
        };
      }),
      'prefix'
    );

    return [needUploadFiles, needRemoveFiles];
  }

  async syncFolder(folderPath: string) {
    let prefix = OssSync.getTargetPrefixByFilePath(folderPath);
    let localFiles = listDirectoryFiles(folderPath);
    let remoteFiles = await this._client.listDirectory(prefix);
    let [needUploadFiles, needRemoveFiles] = this._diffFiles(
      localFiles,
      remoteFiles
    );
    if (needUploadFiles.length <= 0) {
      showAlert('No files need to upload.');
      return;
    }
    await showAlert(
      `${needUploadFiles.length} files need to be uploaded, ${needRemoveFiles.length} files need to be removed.`
    );
    const statusBarItem = createStatusBarItem();
    statusBarItem.show();
    let notUploadCount = needUploadFiles.length;
    let notRemoveCount = needRemoveFiles.length;
    for await (let fileItem of needUploadFiles) {
      statusBarItem.text = `upload ${fileItem.fullPath}, ${notUploadCount - 1 >= 0
        ? notUploadCount - 1 + ' files waiting to be uploaded.'
        : ''
        }`;
      await this._client.uploadFile(fileItem.prefix, fileItem.fullPath);
      notUploadCount--;
    }
    for await (let fileItem of needRemoveFiles) {
      statusBarItem.text = `remove ${fileItem.prefix}, ${notRemoveCount - 1 >= 0
        ? notRemoveCount - 1 + ' files waiting to be removed.'
        : ''
        }`;
      await this._client.deleteFile(fileItem.prefix);
      notRemoveCount--;
    }
    statusBarItem.hide();
    showAlert(
      `sync ${prefix} succeed,${needUploadFiles.length} files has been uploaded, ${needRemoveFiles.length} files has been removed.`
    );
  }

  async uploadFile(filePath: string) {
    let targetPrefix = OssSync.getTargetPrefixByFilePath(filePath);
    let isExist = await this._client.checkFileExist(targetPrefix);
    if (isExist) {
      showAlert(`${filePath} already exist.`);
      return;
    }
    try {
      await this._client.uploadFile(targetPrefix, filePath);
      showInformationMessage(`upload ${filePath} succeed.`);
    } catch (e) {
      showAlert(`upload ${filePath} failed.`);
    }
  }
}
