import { Request, Response } from "express";

import { catchError, errorTypes } from "../errors";
import { LocalUploadedFile } from "../interfaces/uploads";
import { uploadFileCloudinary } from "../helpers";


/**
 * @controller /api/uploads/multer : POST
 */
 export const uploadFilesLocalController = async(req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];

  const uploadedFiles = files.map<LocalUploadedFile>(file => ({fieldname: file.fieldname, name: file.filename, path: file.path}));

  res.json({msg: 'Files uploaded successfully', uploadedFiles})
}


/**
 * @controller /api/uploads/cloud : POST
 */
 export const uploadFilesCloudinaryController = async(req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];

  try {
    const uploadedFiles = await Promise.all(
      files.map(file => uploadFileCloudinary(file.fieldname, file.path, 'others'))
    );

    //->Para subir archivos a cloudinary todos se almacenan primero en el temp y despues se borran (si se requiere)
    // deleteFilesLocal(files.map(f => f.path))
    
    res.json({msg: 'Files uploaded successfully', uploadedFiles});
  } catch (error:any) {
    return catchError({
      error: error.error,
      type: errorTypes.upload_cloudinary,
      extra: error.msg,
      res
    });
  }
}