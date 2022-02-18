import { check } from 'express-validator';
import { 
  createCategoryBody, 
  deleteCategoryBody, 
  updateCategoryBody 
} from './body/category_schemas';

import { 
  validateCategory, 
  validateCategoryAuthor, 
  validateCategoryID 
} from './validations/categories_validations';

import { 
  validateBody, 
  validateJWT, 
  validatePermissions 
} from './validations/shared_validations';

export const getCategoryByIdMiddlewares = [
  check('id', 'Invalid id').isUUID(),
  validateBody,
  validateCategoryID
]

export const getCategoriesProductsMiddlewares = [
  check('id', 'Invalid id').isUUID(),
  validateBody,
  validateCategoryID
]

export const createCategoryMiddlewares = [
  validateJWT,
  ...createCategoryBody,
  validateBody,
  validateCategory
]

export const updateCategoryMiddlewares = [
  validateJWT,
  ...updateCategoryBody,
  validateBody,
  validateCategoryID,
  validateCategory,
  validateCategoryAuthor,
]

export const deleteCategoryMiddlewares = [
  validateJWT,
  ...deleteCategoryBody,
  validateBody,
  validateCategoryID,
  validateCategoryAuthor,
  validatePermissions,
]