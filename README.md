# Oss Sync

Sync files between Local and Oss. Support ali oss and qiniu oss.

## Usage

1. init oss config

   `command/ctrl+shift+p` OssSync:config

2. create `ossSyncAssets` directory at the root of project

   move files into `ossSyncAssets`

3. use the entry in the context menu to upload file or folder

   right-click `ossSyncAssets`,run OssSync: uploadFolder

## Config

```js
{
  "name": "oss label", //required.
  "type": "ali", //required. value: ali | qiniu
  "region": "oss-cn-shanghai", //required only in ali oss.
  "accessKeyId": "", //required.
  "accessKeySecret": "", //required.
  "bucket": "", //required.
  "prefix": "" //optional.
}
```
