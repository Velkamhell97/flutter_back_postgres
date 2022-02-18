import { check } from 'express-validator';
import { 
  createProductBody, 
  deleteProductBody, 
  updateProductBody 
} from './body/products_schemas';

import { 
  validateProduct,
  validateProductAuthor, 
  validateProductCategory, 
  validateProductID 
} from './validations/products_validations';

import { 
  validateBody, 
  validateJWT, 
  validatePermissions, 
  validateSingleFile
} from './validations/shared_validations';

export const getProductyByIdMiddlewares = [
  check('id', 'Invalid id').isUUID(),
  validateBody,
  validateProductID
]

export const createProductMiddlewares = [
  validateJWT,
  ...createProductBody,
  validateBody,
  validateProductCategory,
  validateProduct,
  validateSingleFile('img', ['jpg', 'jpeg', 'png'])
]

export const updateProductMiddlewares = [
  validateJWT,
  ...updateProductBody,
  validateBody,
  validateProductID,
  validateProductCategory,
  validateProduct,
  validateSingleFile('img', ['jpg', 'jpeg', 'png']),
  validateProductAuthor
]

export const deleteProductMiddlewares = [
  validateJWT,
  ...deleteProductBody,
  validateBody,
  validateProductID,
  validateProductAuthor,
  validatePermissions
]

