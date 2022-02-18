import { Response } from "express";
import { Op } from "sequelize";

import { catchError, errorTypes } from "../errors";
import { CategoriesRequest } from "../interfaces/categories";
import { User, Category } from "../models";


/**
 * @controller /api/categories/ : GET
 */
export const getCategoriesController = async(_req: CategoriesRequest, res: Response) => {
  try {
    //-Agregando el scope podemos ahorranos codigo, el soft delete esta activado por defecto
    const categories = await Category.scope('withUser').findAll();

    return res.json({msg:'Get all categories successfully', categories});
  } catch (error) {
    return catchError({error, type: errorTypes.get_categories, res});
  }
}


/**
 * @controller /api/categories/search?name=:name : GET
 */
 export const getCategoriesByNameController = async(req: CategoriesRequest, res: Response) => {
  const { name } = req.query;

  const lower = name?.toString().toLowerCase();

  try {
    const categories = await Category.scope('withUser').findAll({
      where: { lower: {[Op.like]: lower + "%"} } //--> Prefix Match (starts with)
    }); 

    return res.json({msg:'Get categories by name successfully', categories});
  } catch (error) {
    return catchError({error, type: errorTypes.get_categories_by_name, res});
  }
}


/**
 * @controller /api/categories/:id : GET
 */
 export const getCategoryByIdController = async(_req: CategoriesRequest, res: Response) => {
  const category: Category = res.locals.category;

  return res.json({msg:'Get category by id successfully', category});
}


/**
 * @controller /api/categories/:id/products : GET
 */
 export const getCategoriesProductsController = async(_req: CategoriesRequest, res: Response) => {
  const category: Category = res.locals.category;

  try {
    const products = await category.getProducts({ 
      //->recordar que el include de las hastoMany  se definen en la busqueda
      // include: { model: User, as: 'user', attributes: ['name'] }
    });
      
    return res.json({msg:'Get categories products successfully', products});
  } catch (error) {
    return catchError({error, type: errorTypes.get_category_products, res});
  }
}


/**
 * @controller /api/categories/ : POST
 */
export const createCategoryController = async(req: CategoriesRequest, res: Response) => {
  const categoryData = req.body;
  const authUser: User   = res.locals.authUser;

  categoryData.ownerId = authUser.id;
  
  try {
    //-Por alguna razon los scopes del modelo o del query no funciona en el create
    //-si se quiere obtener el nombre del usuario se tendria que devolver el usuario (authUser)
    const category = await Category.create(categoryData, {
      //-tampoco funciona dentro del query en el create
      // include: { model: User, as: 'user', attributes: ["name"] }
    });
    
    return res.json({msg: 'Category saved successfully', category});
  } catch (error) {
    return catchError({error, type: errorTypes.save_category, res});
  }
}


/**
 * @controller /api/categories/:id : PUT
 */
export const updateCategoryController = async(req: CategoriesRequest, res: Response) => {
  const { ownerId, ...categoryData } = req.body;

  const category: Category = res.locals.category;

  try {
    //-se podria actualizar y devolver el que viene del res, este regresa dos valores, el numero de row
    //afectadas y las filas afectadas (solo postgres)
    // await Category.update(categoryData, {where: {id}})

    //-ya tiene el scope del validador del id
    await category.update(categoryData);

    return res.json({msg: 'Category updated successfully', category});
  } catch (error) {
    return catchError({error, type: errorTypes.update_category, res});
  }
}


/**
 * @controller /api/categories/:id : DELETE
 */
export const deleteCategoryController = async(req: CategoriesRequest, res: Response) => {
  // const { id } = req.params;
  const category: Category = res.locals.category;

  try {
    // const category = await Category.findByPk(id);
    // await category?.update({state: false});

    await category.destroy();

    return res.json({msg: 'Category deleted successfully', category});
  } catch (error) {
    return catchError({error, type: errorTypes.delete_category, res});
  }
}