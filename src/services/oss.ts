import * as fse from 'fs-extra';
import * as path from 'path';
import  BucketManagerFactory from './bucketManager';

import {
  createStatusBarItem,
  getRootPath,
  showErrorMessage,
  showInformationMessage,
  showTextDocument,
  showWarningMessage,
} from '../utils/vscode';
import { getFilesFromFolderSync } from '../utils/util';
import { difference } from 'lodash';

const CONFIG_PATH = '.vscode/oss-sync.json';
const ASSETS_CONTEXT = 'ossSyncAssets';

export default class Oss {
  private client;
  constructor() {
    let config = Oss.getConfig();
    this.client = BucketManagerFactory.create({
      type:config.type,
      region: config.region,
      accessKeyId: config.accessKeyId,
      accessKeySecret: config.accessKeySecret,
      bucket: config.bucket,
    });
  }

  private static instance: Oss | null;
  static getInstance() {
    try {
      if (!this.instance) {
        this.instance = new Oss();
      }
    } catch (e) {
      showErrorMessage('Please check your config in ./vscode/oss-sync.json.');
      this.instance = null;
    }
    return this.instance;
  }
  static getConfig() {
    const configPath = path.join(getRootPath(), CONFIG_PATH);
    return fse.readJsonSync(configPath);
  }

  static async initConfig() {
    const configPath = path.join(getRootPath(), CONFIG_PATH);
    let exist = await fse.pathExists(configPath);
    if (exist) {
      await showTextDocument(configPath);
      return;
    }
    await fse.outputJson(
      configPath,
      {
        name: 'oss label',  //required.
        type:'ali',    //required. value: ali || qiniu
        region: "oss-cn-shanghai",  // required only in ali oss.
        accessKeyId: '', //required.
        accessKeySecret: '', //required.
        bucket: '',  //required.
        prefix: '',  //optional.
      },
      { spaces: 4 }
    );
    await showTextDocument(configPath);
  }


  static getPrefixByPath(menuPath: string) {
    let suffix = menuPath.split(ASSETS_CONTEXT)[1].replace(/\\/g,'/');
    return suffix.charAt(0) === '/'
      ? suffix.substring(1, suffix.length)
      : suffix;
  }
  static async getTargetPrefixByPath(filePath: string) {
    let prefix = Oss.getPrefixByPath(filePath);
    let ossPrefix= await Oss.getConfig().prefix;
    let targetPrefix = ossPrefix
      ? ossPrefix + '/' + prefix
      : prefix;
    return targetPrefix;
  }

  diffFiles(localFiles: string[], remoteFiles: string[]) {
    return difference(
      localFiles.map((file) => Oss.getPrefixByPath(file)),
      remoteFiles
    );
  }

  async uploadFolder(folderPath: string) {
    let prefix = Oss.getPrefixByPath(folderPath);
    let localFiles = getFilesFromFolderSync(folderPath);
    let remoteFiles = await this.client.listPrefix(prefix);
    let needUploadFiles = this.diffFiles(localFiles, remoteFiles);
    if (needUploadFiles.length <= 0) {
      showWarningMessage('No files need to upload.');
      return;
    }
    const statusBarItem = createStatusBarItem();
    statusBarItem.show();
    let notUploadCount = needUploadFiles.length;
    let assetsContext = path.resolve(getRootPath(), ASSETS_CONTEXT);
    for await (let prefix of needUploadFiles) {
      let filePath = path.resolve(assetsContext, prefix);
      statusBarItem.text = `upload ${filePath}, ${
        notUploadCount - 1 >= 0
          ? notUploadCount - 1 + ' files waiting for upload.'
          : ''
      }`;
      try {
        await this.client.put(prefix, filePath);
      } catch (e) {
        console.error(e);
      }
      notUploadCount--;
    }
    statusBarItem.hide();
    showInformationMessage(`sync ${prefix} succeed,${notUploadCount} files has been uploaded.`);
  }

  async uploadFile(filePath: string) {
    let targetPrefix = await Oss.getTargetPrefixByPath(filePath);
    try {
      await this.client.put(targetPrefix, filePath);
      showInformationMessage(`upload ${filePath} succeed.`);
    } catch (e) {
      showErrorMessage(`upload ${filePath} failed.`);
    }
  }

}
