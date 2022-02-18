import { UploadApiResponse, v2 } from 'cloudinary';
import streamifier from 'streamifier';

interface UploadParams {
  path: string,
  filename ?: string,
  folder ?: string
}

class Cloudinary {
  private cloudinary;

  constructor(){
    this.cloudinary = v2;
  }

  init(){
    // this.cloudinary.config(process.env.CLOUDINARY_URL!); //->No funciono con la variable de entorno
    this.cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_SECRET_KEY
    })
  }
  
  //->Si envia un path lo sobreescribe si no genera un id
  async uploadImage({path, filename, folder}: UploadParams) : Promise<UploadApiResponse> {
    let public_id : string | undefined;

    //-Si se deja el mismo id autogenerado y se pasa la url para actualizar se saca el public_id
    if(filename?.includes('http')){
      public_id = filename.split('/').at(-1)!.split('.')[0];
    } else {
      //-si se utiliza un filename propio solo lo pasamos como public id
      public_id = filename;
    }
    
    return await this.cloudinary.uploader.upload(path,{
      public_id,
      folder:`flutter_chat_back/${folder}`,
      overwrite: filename ? true : false
    });
  }

  async removeImage(url:string, folder?:string) {
    const id = url.split('/').at(-1)!.split('.')[0]
    const chunk = folder ? (folder + "/") : "" ;

    await this.cloudinary.uploader.destroy(`flutter_chat_back/${chunk}${id}`);
  }

  uploadImageBytes(buffer: string | Buffer, folder:string) : Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      let stream = this.cloudinary.uploader.upload_stream(
        {
          folder:`flutter_chat_back/${folder}`
        },
        (error, result) => {
          if(result){
            resolve(result);
          } else {
            return reject(error);
          }
        },
      )

      streamifier.createReadStream(buffer).pipe(stream);
    })
  }
}

//->Esta exportacion de una instancia permite tener una clase singlenton
export default new Cloudinary();