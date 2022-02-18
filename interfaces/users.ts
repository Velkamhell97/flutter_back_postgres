import { Request } from 'express';
import { Document, Types } from 'mongoose';

import { User } from '../models';

export interface UsersRequest extends Request {
  body : UsersBody
}

//-Se podria manejar solo el roleId como el role asi como en mongose pero semanticamente quizas
//-no sea tan claro, queda a cuestion del diseño de la base de datos, aqui se dejara como el estandar
//-de las bases de datos relacionales
interface UsersBody {
  name : string,
  email : string,
  password : string,
  role ?: string,
  roleId : string
  avatar ?: string
  // state ?: boolean, //-no necesario con el soft delete
  // [rest: string] : string | boolean | undefined
}

