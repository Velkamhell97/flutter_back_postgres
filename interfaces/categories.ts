import { Request } from 'express';
import { Document, Types } from 'mongoose';

import { Category } from '../models'

export interface CategoriesRequest extends Request {
  body : CategoriesBody,
}

interface CategoriesBody {
  name  : string,
  ownerId : string,
  // state ?: boolean,
  // [rest: string] : string | boolean | undefined
}
