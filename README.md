# Oss Sync

Sync files between Local and Oss. Support tencent cos.

## Usage

1. init oss config

   `command/ctrl+shift+p` OssSync:config

2. create `AssetsOssSync` directory in your project

   move files into `AssetsOssSync`

3. use the entry in the context menu to upload file or folder

   right-click `AssetsOssSync`,run OssSync: Sync

## Config

```js
{
  "label": "oss label", //required.
  "type": "tencent", //required. value: tencent
  "region": "assets-sh-1234", //required.
  "accessKeyId": "", //required.
  "accessKeySecret": "", //required.
  "bucket": "", //required.
  "prefix": "" //required.
  "domain": "", //required.
  "cacheControl":"" //optional
}
```
