import { check } from 'express-validator';
import { 
  createUserBody, 
  deleteUserBody, 
  updateUserBody 
} from './body/user_schemas';

import { 
  validateBody, 
  validateJWT, 
  validatePermissions, 
  validateSingleFile
} from './validations/shared_validations';

import { 
  validateEmail, 
  validateRole, 
  validateUserID
} from './validations/user_validations';

//-Debido a que el tipo de dato para buscar por id debe ser si o si un uuid, tenemos tambien que utilizar
//-los schemas en estos metodos de getById
export const getUserByIdMiddlewares = [
  //-No funciona por si solo es necesario el validate result
  check('id', 'Invalid id').isUUID(),
  validateBody,
  validateUserID
]

export const getUserCategoriesMiddlewares = [
  check('id', 'Invalid id').isUUID(),
  validateBody,
  validateUserID
]

export const createUserMiddlewares = [
  ...createUserBody,
  validateBody,
  validateEmail,
  validateRole,
  validateSingleFile('avatar', ['jpg', 'jpeg', 'png'])
]

export const updateUserMiddlewares = [
  ...updateUserBody,
  validateBody,
  validateUserID,
  validateEmail,
  validateRole,
  validateSingleFile('avatar', ['jpg', 'jpeg', 'png'])
]

export const deleteUserMiddlewares = [
  validateJWT,
  ...deleteUserBody,
  validateBody,
  validateUserID,
  validatePermissions,
]