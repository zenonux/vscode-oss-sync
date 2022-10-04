import * as TencentCos from 'cos-nodejs-sdk-v5';
import { createReadStream } from 'fs-extra';
type OssType = 'tencent';

type OssConfig = {
  type: OssType
  accessKeyId: string
  accessKeySecret: string
  bucket: string
  region: string
  prefix?: string
};

interface BucketManager {
  put(name: string, filePath: string): Promise<any>
  checkFileExist(prefix: string): Promise<boolean>
  listPrefix(prefix: string): Promise<string[]>
}

class TencentBucketManager implements BucketManager {
  private _client?: TencentCos;
  constructor(private readonly _config: OssConfig) {
    this._client = new TencentCos({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      SecretId: _config.accessKeyId,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      SecretKey: _config.accessKeySecret,
    });
  }
  async put(name: string, filePath: string) {
    if (!this._client) {
      return;
    }
    let res = await this._client.putObject({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Bucket: this._config.bucket /* 填入您自己的存储桶，必须字段 */,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Region: this._config.region || '',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Key: name,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Body: createReadStream(filePath),
    });
    return res;
  }

  async checkFileExist(prefix: string): Promise<boolean> {
    if (!this._client) {
      return false;
    }
    return new Promise((resolve) => {
      this._client?.headObject(
        {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          Bucket: this._config.bucket /* 填入您自己的存储桶，必须字段 */,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          Region: this._config.region || '',
          // eslint-disable-next-line @typescript-eslint/naming-convention
          Key: prefix /* 存储在桶里的对象键（例如1.jpg，a/b/test.txt），必须字段 */,
        },
        function (err, data) {
          if (data) {
            resolve(true);
          } else {
            resolve(false);
          }
        }
      );
    });
  }

  async listPrefix(prefix: string): Promise<string[]> {
    if (!this._client) {
      return [];
    }
    prefix =
      prefix.charAt(prefix.length - 1) !== '/'
        ? prefix + '/'
        : prefix;
    let res = await this._client.getBucket({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Bucket: this._config.bucket /* 填入您自己的存储桶，必须字段 */,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Region: this._config.region || '',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Prefix: prefix,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Delimiter: '/',
    });
    return res.Contents.map((item) => item.Key);
  }

  deleteFile(prefix: string) {
    return new Promise((resolve) => {
      this._client?.deleteObject({
       // eslint-disable-next-line @typescript-eslint/naming-convention
       Bucket: this._config.bucket /* 填入您自己的存储桶，必须字段 */,
       // eslint-disable-next-line @typescript-eslint/naming-convention
       Region: this._config.region || '',
       // eslint-disable-next-line @typescript-eslint/naming-convention
       Key: prefix,
      }, function (err) {
        if(err){
          resolve(false);
        }else{
          resolve(true);
        }
      });
    });
  }

}

export default class BucketManagerFactory {
  static create(config: OssConfig) {
    return new TencentBucketManager(config);
  }
}
