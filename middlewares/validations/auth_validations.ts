import { Response, NextFunction } from 'express';
import bcryptjs from 'bcryptjs';

import { AuthRequest } from '../../interfaces/auth';
import { catchError, errorTypes } from '../../errors';
import { User } from '../../models';

/**
 * @middleware validate login
 */
 export const validateLogin = async (req : AuthRequest, res : Response, next: NextFunction) => {
  const { email, password } = req.body;
  
  //-Solo retorna los que no tienen soft delete
  const user = await User.findOne({where: { email }});

  if(!user){
    return catchError({type: errorTypes.login, res});
  }

  const matchPassword = bcryptjs.compareSync(password, user.password)

  if(!matchPassword) {
    return catchError({type: errorTypes.login, res})
  } else {
    res.locals.logedUser = user;
  }

  next()
}