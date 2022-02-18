import { Request,} from 'express';
import { Document, Types } from 'mongoose';

import { Product } from '../models';

export interface ProductsRequest extends Request {
  body : ProductsBody
}

interface ProductsBody {
  name         : string,
  ownerId      : string,
  price       ?: number,
  img         ?: string,
  category    ?: string,
  categoryId   : string,
  description ?: string,
  available   ?: boolean,
  // state       ?: boolean,
  // [rest: string] : string | boolean | undefined
}



