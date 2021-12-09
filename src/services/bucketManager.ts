import * as AliOss from 'ali-oss';
import * as qiniu from 'qiniu';

type OssType = 'ali' | 'qiniu';

type OssConfig = {
  type: OssType
  accessKeyId: string
  accessKeySecret: string
  bucket: string
  region?: string
  prefix?:string
};

interface BucketManager {
  put(name: string, filePath: string): Promise<any>
  listPrefix(prefix: string): Promise<string[]>
}

class AliBucketManager implements BucketManager {
  private client?: AliOss;
  constructor(config: OssConfig) {
    this.client = new AliOss({
      accessKeyId: config.accessKeyId,
      accessKeySecret: config.accessKeySecret,
      region: config.region,
      bucket: config.bucket,
    });
  }
  async put(name: string, filePath: string) {
    if (!this.client) {
      return;
    }
    let res=await this.client.put(name, filePath);
    return res;
  }
  async listPrefix(prefix: string): Promise<string[]> {
    if (!this.client) {
      return [];
    }
    let res = await this.client.list(
      {
        prefix: prefix,
        delimiter: '/',
        'max-keys': 100, // default 100，max 1000
      },
      {}
    );
    return res.objects.map((item) => item.name);
  }
}

class QiniuBucketManager implements BucketManager {
  private uploadToken: string = '';
  private formUploader?: qiniu.form_up.FormUploader;
  private putExtra: qiniu.form_up.PutExtra | null=null;
  private bucketManager?: qiniu.rs.BucketManager;

  constructor(private config: OssConfig) {
    let mac = new qiniu.auth.digest.Mac(
      config.accessKeyId,
      config.accessKeySecret
    );
    let qiniuConfig = new qiniu.conf.Config({});
    let putPolicy = new qiniu.rs.PutPolicy({
      scope: config.bucket,
      expires: 7200,
    });
    this.putExtra= new qiniu.form_up.PutExtra();
    this.formUploader = new qiniu.form_up.FormUploader({});
    this.uploadToken = putPolicy.uploadToken(mac);
    this.bucketManager = new qiniu.rs.BucketManager(mac, qiniuConfig);
  }
  async put(name: string, filePath: string) {
    return new Promise((resolve, reject) => {
      this.formUploader &&
        this.formUploader.putFile(
          this.uploadToken,
          name,
          filePath,
          this.putExtra,
          function (e?: Error, respBody?: any, respInfo?: any) {
            if (e) {
              reject(e);
            } else {
              resolve(respInfo.data);
            }
          }
        );
    });
  }

  async listPrefix(prefix: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.bucketManager &&
        this.bucketManager.listPrefix(
          this.config.bucket,
          {
            prefix: prefix === '/' ? '' : prefix,
            delimiter: '/',
            limit: 100,
          },
          function (e?: Error, respBody?: any, respInfo?: any) {
            if (e) {
              reject(e);
            } else {
              let nameList = respInfo.data.items.map((val: any) => val.key);
              resolve(nameList);
            }
          }
        );
    });
  }
}

export default class BucketManagerFactory {
  static create(config: OssConfig) {
    if (config.type === 'ali') {
      return new AliBucketManager(config);
    } else {
      return new QiniuBucketManager(config);
    }
  }
}
