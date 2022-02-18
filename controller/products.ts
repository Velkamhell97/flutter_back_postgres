import { Response } from "express";
import { Op } from "sequelize";

import { catchError, errorTypes } from "../errors";
import { Product, User } from "../models";
import { ProductsRequest } from "../interfaces/products";
import cloudinary from "../models/cloudinary";


/**
 * @controller /api/products/ : GET
 */
export const getProductsController = async (_req: ProductsRequest, res: Response) => {
  try {
    //-soft delete por defecto
    const categories = await Product.scope('withDetails').findAll();

    return res.json({msg:'Get all products successfully', categories});
  } catch (error) {
    return catchError({error, type: errorTypes.get_products, res});
  }
}


/**
 * @controller /api/products/search?name=:name : GET
 */
 export const getProductsByNameController = async(req: ProductsRequest, res: Response) => {
  const { name } = req.query;

  const lower = name?.toString().toLowerCase();

  try {
    const products = await Product.scope('withDetails').findAll({
      where: { lower: { [Op.like]: lower + "%"} } //--> Prefix Match (starts with)
    }); 

    return res.json({msg:'Get products by name successfully', products});
  } catch (error) {
    return catchError({error, type: errorTypes.get_products_by_name, res});
  }
}


/**
 * @controller /api/products/:id : GET
 */
 export const getProductByIdController = async(_req: ProductsRequest, res: Response) => {
  const product: Product = res.locals.product;

  return res.json({msg:'Get product by id successfully', product});
}


/**
 * @controller /api/products/ : POST
 */
 export const createProductController = async (req: ProductsRequest, res: Response) => {
  const { category, ...productData } = req.body;
  const authUser: User = res.locals.authUser;

  productData.ownerId = authUser.id;

  const img: Express.Multer.File | undefined = res.locals.file;

  //-Aprovechamos el uuid como id
  const product = Product.build(productData);

  if(img){
    try {
      const response = await cloudinary.uploadImage({path: img.path, filename: product.id, folder: 'products'});
      
      product.img = response.secure_url;
    } catch (error) { 
      throw {error, type: errorTypes.upload_cloudinary, res};
    }
  }

  try {
    //-no necesita transaccion cuando solo es una operacion
    await product.save();

    return res.json({msg: 'Product saved successfully', product});
  } catch (error) {
    return catchError({error, type: errorTypes.save_product, res});
  }
}


/**
 * @controller /api/products/:id : PUT
 */
 export const updateProductController = async (req: ProductsRequest, res: Response) => {
  const { ownerId, ...productData } = req.body;
  const product: Product = res.locals.product;

  const img: Express.Multer.File | undefined = res.locals.file;

  if(img){
    try {
      const response = await cloudinary.uploadImage({path: img.path, filename: product.id, folder: 'products'});
      productData.img = response.secure_url;
    } catch (error) { 
      return catchError({error, type: errorTypes.upload_cloudinary, res});
    }
  }
  
  try {
    await product.update(productData);

    return res.json({msg: 'Product updated successfully', product});
  } catch (error) {
    return catchError({error, type: errorTypes.update_product, res});
  }
}


/**
 * @controller /api/products/:id : DELETE
 */
 export const deleteProductController = async (req: ProductsRequest, res: Response) => {
  const product: Product = res.locals.product;

  try {
    // const product  = await Product.findByPk(id);
    // product?.update({state: false});

    await product.destroy();

    return res.json({msg: 'Product deleted successfully', product});
  } catch (error) {
    return catchError({error, type: errorTypes.delete_product, res});
  }
}