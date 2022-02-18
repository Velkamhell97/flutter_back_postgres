import { Response } from 'express';
import bcryptjs from 'bcryptjs';

import { catchError, errorTypes } from '../errors';
import { generateJWT } from "../helpers";
import { User } from '../models';
import { UsersRequest } from "../interfaces/users";
import cloudinary from '../models/cloudinary';


/**
 * @controller /api/users/ : GET
 */
export const getUsersController = async (req: UsersRequest, res: Response) => {
  const { limit = 5, from = 0 } = req.query;

  try {
    const users = await User.findAll({
      limit: parseInt(limit.toString()),
      offset: parseInt(from.toString()),
      //-Recordar que las relaciones has many deben configurarse manualmente, por alguna razon
      // include: {  model: Category, as: 'categories', attributer: ["name"] }
    });

    res.json({msg: 'Users get successfully', users, count: users.length});
  } catch (error) {
    return catchError({error, type: errorTypes.get_users, res});
  }
}


/**
 * @controller /api/users/:id : GET 
 */
 export const getUserByIdController = async (_req: UsersRequest, res: Response) => {
  //-El user no necesita hacer populate de nada (a menos que quiera mostrar las categorias)
  const user: User = res.locals.user;

  res.json({msg: 'Users by ID get successfully', user});
}


/**
 * @controller /api/users/:id/categories : GET
 */
 export const getUserCategoriesController = async (_req: UsersRequest, res: Response) => {
  const user: User = res.locals.user;

  try {
    const categories = await user.getCategories();

    res.json({msg: 'User categories get successfully', categories});
  } catch (error) {
    return catchError({error, type: errorTypes.get_user_categories, res});
  }
}


/**
 * @controller /api/users/ : POST
 */
export const createUserController = async (req: UsersRequest, res: Response) => {
  const { role,...userData } = req.body;
  
  const salt = bcryptjs.genSaltSync();
  const hashPassword = bcryptjs.hashSync(userData.password!, salt);
  userData.password = hashPassword;

  const avatar: Express.Multer.File | undefined = res.locals.file;
  
  //-Como el id es un uuid y no autoincrementado podemos obtenerlo antes del save
  const user = User.build(userData);

  if(avatar){
    try {
      const response = await cloudinary.uploadImage({path: avatar.path, filename: user.id, folder: 'users'});

      user.avatar = response.secure_url;
    } catch (error) { 
      return catchError({error, type: errorTypes.upload_cloudinary, res});
    }
  }

  try {
    await user.save();

    generateJWT(user.id.toString()).then((token) => {
      return res.json({msg: 'User saved successfully', user, token});
    }).catch((error) => {
      return catchError({error, type: errorTypes.generate_jwt, res});
    })
  } catch (error) {
    return catchError({error, type: errorTypes.save_user, res});
  }
}

/**
 * @controller /api/users/:id : PUT
 */
export const updateUserController = async (req: UsersRequest, res: Response) => {
  const { role, ...userData } = req.body;
  const user: User = res.locals.user;
  
  //-Asi la interfaz diga que el userData no puede ser undefined, si en el body no esta lo dara como undefined
  if(userData.password){
    const salt = bcryptjs.genSaltSync();
    const hashPassword = bcryptjs.hashSync(userData.password, salt);
    userData.password = hashPassword;
  }

  const avatar: Express.Multer.File | undefined = res.locals.file; 

  if(avatar){
    try {
      const response = await cloudinary.uploadImage({path: avatar.path, filename: user.id, folder: 'users'});
      
      userData.avatar = response.secure_url;
    } catch (error) { 
      return catchError({error, type: errorTypes.upload_cloudinary, res});
    }
  }

  try {
    //->se debe encontrar y luego actualizar o se podria usar el where del update
    // const user = await User.findByPk(id);
    // await user!.update(userData);

    await user.update(userData);

    return res.json({msg: 'User update successfully', user});
  } catch (error) {
    return catchError({error, type: errorTypes.update_user, res});
  }
}


/**
 * @controller /api/users/:id : DELETE
 */
export const deleteUserController = async (req: UsersRequest, res: Response) => {
  const { id } = req.params;
  const user = res.locals.user; //-para mostrar el usuario borrado

  try {
    //-cualquiera de los dos queda
    // const user = await User.findByPk(id);
    // await user.destroy();

    await User.destroy({where: {id}})

    return res.json({msg: 'User delete successfully', user});
  } catch (error) {
    return catchError({error, type: errorTypes.delete_user, res});
  }
}

