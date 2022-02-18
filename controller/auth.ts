import { Request, Response } from "express"

import { AuthRequest } from "../interfaces/auth";
import { catchError, errorTypes } from "../errors";
import { generateJWT, googleVerify } from "../helpers";
import { User } from "../models";

/**
 * @controller /auth/renew : GET
 */
export const renewTokenController = async (_req: AuthRequest, res: Response) => {
  const user: User = res.locals.authUser;
  // await user.populate('role', 'role');

  generateJWT(user.id.toString()).then((token) => {
    res.json({msg: 'Token renew', user, token});
  }).catch((error) => {
    return catchError({error, type: errorTypes.generate_jwt, res});
  })
}


/**
 * @controller /api/auth/login : POST
 */
export const loginController = async (_req: AuthRequest, res: Response) => {
  const user: User = res.locals.logedUser;
  // await user.populate('role', 'role');

  generateJWT(user.id.toString()).then((token) => {
    res.json({msg: 'Login successfully', user, token});
  }).catch((error) => {
    return catchError({error, type: errorTypes.generate_jwt, res});
  })
}


/**
 * @controller /api/auth/google : POST
 */
 export const googleSignInController = async (req: Request, res: Response) => {
  const { id_token } = req.body;

  try {
    const {name, email, picture} = await googleVerify(id_token);

    let user = await User.findOne({where: { email }}); 

    if(!user) {
      //->passwords menores a 6 letras no pasan el login normal solo valido por google
      user = await User.create({name: name!, email: email!, avatar: picture, password: 'less6', roleId: 'ds'});
    }

    if(!user.isSoftDeleted) {
      return catchError({error: user, type:errorTypes.user_blocked, res});
    }

    generateJWT(user.id.toString()).then((token) => {
      return res.json({msg: 'Google sign in successfully', user, token})
    }).catch((error) => {
      return catchError({error, type: errorTypes.generate_jwt, res});
    })
  } catch (error) {
    return catchError({error, type: errorTypes.google_signin, res});
  }
}
