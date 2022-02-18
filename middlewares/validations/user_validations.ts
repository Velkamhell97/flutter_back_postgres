import { Response, NextFunction } from 'express';
import { Op } from 'sequelize';

import { catchError, errorTypes } from '../../errors';
import { UsersRequest } from '../../interfaces/users';
import { Role, User } from '../../models';


/**
 * @middleware validate user id passed by params
 */
 export const validateUserID = async (req: UsersRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;

  //-solo retorna los usuarios no eliminados con el soft delete, cuando se establece como pk el uuid
  //-no podemos pasarle algo diferente de un uid como un string o algo para validar ya que si no fallara
  //-por esta razon es necesario validar primero si es un uuid, a travez del express validator
  const dbUser = await User.findByPk(id);

  if(!dbUser){
    return catchError({type: errorTypes.user_not_found, res});
  } else {
    res.locals.user = dbUser;  //->util para los controllers que tengan el id en la ruta
  }

  next();
}


/**
 * @middleware validate user email (create and update valid)
 */
 export const validateEmail = async (req: UsersRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { email } = req.body;

  if(!email){
    return next();
  }

  const dbUser = await User.findOne({where: { email, id: { [Op.ne] : id ?? null }}})

  if(dbUser){
    return catchError({
      type: errorTypes.duplicate_email,
      extra: `The email ${email} is already in use`,
      res
    });
  }

  next();
}


/**
 * @middleware validate user role (create and update valid)
 */
export const validateRole = async (req: UsersRequest, res: Response, next: NextFunction) => {
  const { role } = req.body;

  //-Si no hay role el roleId es undefined, en creacion siempre habra asi que siempre habra roleId
  if(!role) {
    return next();
  }

  const dbRole = await Role.findOne({where: { name: role }});

  if(!dbRole){
    return catchError({
      type: errorTypes.role_not_found,
      extra: `The role with the name \'${role}\' does not exist in the database`,
      res
    });
  } else {
    //->lo setea al body para ahorra una llamada al db, create y update
    req.body.roleId = dbRole.id;
  }

  next();
}