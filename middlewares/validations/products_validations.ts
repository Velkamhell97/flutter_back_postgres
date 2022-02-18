import { Response, NextFunction } from 'express';
import { Op } from 'sequelize';

import { catchError, errorTypes } from '../../errors';
import { ProductsRequest } from '../../interfaces/products';
import { Category, Product, User } from '../../models';


/**
 * @middleware validate product id passed by params
 */
 export const validateProductID = async (req: ProductsRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;

  const dbProduct = await Product.scope('withDetails').findByPk(id);

  //-soft delete only
  if(!dbProduct){
    return catchError({type: errorTypes.product_not_found, res});
  } else {
    res.locals.product = dbProduct;
  }

  next();
}


/**
 * @middleware validate product name (create and update is valid)
 */
 export const validateProductCategory = async (req: ProductsRequest, res: Response, next: NextFunction) => {
  const { category } = req.body;

  if(!category){
    return next();
  }

  const trim = category.toString().split(' ').filter(i => i).join(' ').toLowerCase();

  //-Al parecer sql aplica el collate por defecto, esto hace que posiblemente no sea necesario crear
  //-el lower, ya que compara los campos por defecto
  const dbCategory = await Category.findOne({where: { lower: trim }});

  if(!dbCategory){
    return catchError({
      type: errorTypes.category_not_found,
      extra: `The cateogry with the name \'${category}\' does not exist in the database`,
      res, 
    });
  } else {
    //->se precarga para no hacer otro llamado a la db util en el create y update
    req.body.categoryId = dbCategory.id; 
  }

  next();
}


/**
 * @middleware validate product name (create and update is valid)
 */
 export const validateProduct = async (req: ProductsRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { name } = req.body;

  if(!name){
    return next();
  }

  const trim = name.split(' ').filter(i => i).join(' ').toLowerCase();

  const dbProduct = await Product.findOne({where: { lower: trim, id : {[Op.ne] : id ?? null }}});

  if(dbProduct){
    return catchError({
      type: errorTypes.duplicate_product,
      extra: `The product with the name: \'${dbProduct.name}\' already exist`,
      res, 
    });
  }

  next();
}


/**
 * @middleware validate the author of product
 */
 export const validateProductAuthor = async (_req : ProductsRequest, res : Response, next: NextFunction) => {
  const authUser: User = res.locals.authUser;
  const product: Product = res.locals.product;

  if(product.ownerId != authUser.id){
    return catchError({type: errorTypes.product_unauthorized, res});
  }

  next();
}

