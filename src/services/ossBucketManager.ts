import * as AliOss from 'ali-oss';
import * as qiniu from 'qiniu';
import { promisify } from 'util';

type OssType = 'ali-oss' | 'qiniu';

interface OssConfig {
  type: OssType
  accessKeyId: string
  accessKeySecret: string
  bucket: string
  region?: string
}
export default class OssBucketManager {
  private aliClient?: AliOss;
  private qiniuUploadToken: string = '';
  private qiniuFormUploader?: qiniu.form_up.FormUploader;
  private qiniuBucketManager?: qiniu.rs.BucketManager;
  private type: OssType;
  constructor(private config: OssConfig) {
    this.type = config.type;
    if (this.type === 'ali-oss') {
      this.aliClient = new AliOss(config);
    } else {
      let mac = new qiniu.auth.digest.Mac(
        config.accessKeyId,
        config.accessKeySecret
      );
      let qiniuConfig = new qiniu.conf.Config({});
      let putPolicy = new qiniu.rs.PutPolicy({
        scope: config.bucket,
        expires: 7200,
      });
      this.qiniuFormUploader = new qiniu.form_up.FormUploader({});
      this.qiniuUploadToken = putPolicy.uploadToken(mac);
      this.qiniuBucketManager = new qiniu.rs.BucketManager(mac, qiniuConfig);
    }
  }
  async put(name: string, file: any) {
    if (this.type === 'ali-oss' && this.aliClient) {
      let res = await this.aliClient.put(name, file);
    } else{
      return new Promise((resolve,reject)=>{
        this.qiniuFormUploader && this.qiniuFormUploader.putFile(
          this.qiniuUploadToken,
          name,
          file,
          new qiniu.form_up.PutExtra(),
          function(e?: Error, respBody?: any, respInfo?: any){
            if(e){
              reject(e);
            }else{
              resolve(respInfo.data);
            }
          }
        );
      });
    }
  }
  async listPrefix(opts: { prefix: string; delimiter: string }):Promise<string[]> {
    if (this.type === 'ali-oss' && this.aliClient) {
      let res = await this.aliClient.list(
        {
          prefix: opts.prefix,
          delimiter: opts.delimiter,
          'max-keys': 100, // default 100，max 1000
        },
        {}
      );
    } else if (this.type === 'qiniu' && this.qiniuBucketManager) {
      return new Promise((resolve, reject) => {
        this.qiniuBucketManager && this.qiniuBucketManager.listPrefix(
          this.config.bucket,
          {
            prefix: opts.prefix === '/' ? '' : opts.prefix,
            delimiter: opts.delimiter,
            limit: 100,
          },
          function (e?: Error, respBody?: any, respInfo?: any) {
            if(e){
              reject(e);
            }else{
              let nameList=respInfo.data.items.map((val:any) => val.key);
              resolve(nameList);
            }
          }
        );
      });
    }
  }
}
