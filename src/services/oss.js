"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fse = require("fs-extra");
const path = require("path");
const AliOss = require("ali-oss");
const vscode_1 = require("../utils/vscode");
const util_1 = require("../utils/util");
const lodash_1 = require("lodash");
const CONFIG_PATH = '.vscode/oss-sync.json';
const ASSETS_CONTEXT = 'ossSyncAssets';
class Oss {
    constructor() {
        let config = Oss.getConfig();
        this.client = new AliOss({
            region: config.region,
            accessKeyId: config.accessKeyId,
            accessKeySecret: config.accessKeySecret,
            bucket: config.bucket,
        });
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new Oss();
        }
        return this.instance;
    }
    static getConfig() {
        const configPath = path.join((0, vscode_1.getRootPath)(), CONFIG_PATH);
        return fse.readJsonSync(configPath);
    }
    static async initConfig() {
        const configPath = path.join((0, vscode_1.getRootPath)(), CONFIG_PATH);
        let exist = await fse.pathExists(configPath);
        if (exist) {
            await (0, vscode_1.showTextDocument)(configPath);
            return;
        }
        await fse.outputJson(configPath, {
            name: 'oss label',
            region: 'oss-cn-shanghai',
            accessKeyId: '',
            accessKeySecret: '',
            bucket: '',
            prefix: '',
        }, { spaces: 4 });
        await (0, vscode_1.showTextDocument)(configPath);
    }
    // sync local folder to oss
    async syncLocalToRemote(menuPath) {
        // async file
        if (path.extname(menuPath)) {
            await this.syncFile(menuPath);
        }
        //sync folder
        else {
            await this.syncFolder(menuPath);
        }
    }
    static getPrefixByPath(menuPath) {
        let suffix = menuPath.split(ASSETS_CONTEXT)[1];
        return suffix.charAt(0) === '/'
            ? suffix.substring(1, suffix.length)
            : suffix;
    }
    static async getTargetPrefixByPath(filePath) {
        let prefix = Oss.getPrefixByPath(filePath);
        let targetPrefix = (await Oss.getConfig().prefix)
            ? Oss.getConfig().prefix + '/' + prefix
            : prefix;
        return targetPrefix;
    }
    diffFiles(localFiles, remoteFiles) {
        return (0, lodash_1.difference)(localFiles.map(file => Oss.getPrefixByPath(file)), remoteFiles);
    }
    async syncFolder(folderPath) {
        let prefix = Oss.getPrefixByPath(folderPath);
        let localFiles = (0, util_1.getFilesFromFolderSync)(folderPath);
        let remoteFiles = await this.listPrefix(prefix);
        let needUploadFiles = this.diffFiles(localFiles, remoteFiles);
        if (needUploadFiles.length <= 0) {
            (0, vscode_1.showWarningMessage)('No files need to upload.');
            return;
        }
        const statusBarItem = (0, vscode_1.createStatusBarItem)();
        statusBarItem.show();
        let notUploadCount = needUploadFiles.length;
        let assetsContext = path.resolve((0, vscode_1.getRootPath)(), ASSETS_CONTEXT);
        for await (let prefix of needUploadFiles) {
            let filePath = path.resolve(assetsContext, prefix);
            statusBarItem.text = `upload ${filePath}, ${notUploadCount - 1 >= 0
                ? notUploadCount - 1 + ' files waiting for upload.'
                : ''}`;
            await this.client.put(prefix, filePath);
            notUploadCount--;
        }
        statusBarItem.hide();
        (0, vscode_1.showInformationMessage)(`sync ${prefix} succeed.`);
    }
    async syncFile(filePath) {
        let targetPrefix = await Oss.getTargetPrefixByPath(filePath);
        try {
            await this.client.put(targetPrefix, filePath);
            (0, vscode_1.showInformationMessage)(`upload ${filePath} succeed.`);
        }
        catch (e) {
            (0, vscode_1.showErrorMessage)(`upload ${filePath} failed.`);
        }
    }
    // list oss directory
    async listPrefix(prefix) {
        let files = [];
        let res = await this.client.list({
            prefix: prefix + '/',
            delimiter: '/',
            'max-keys': 100, // default 100，max 1000
        }, {});
        if (res.objects) {
            res.objects.forEach((item) => {
                files.push(item.name);
            });
        }
        return files;
    }
}
exports.default = Oss;
//# sourceMappingURL=oss.js.map