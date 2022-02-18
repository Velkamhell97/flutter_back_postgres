import { 
  Association,
  BelongsToCreateAssociationMixin, 
  BelongsToGetAssociationMixin, 
  CreationOptional, 
  DataTypes, 
  InferAttributes, 
  InferCreationAttributes, 
  Model, 
} from 'sequelize';

import { Category, User } from './index';
import db from '../database/connection';

class Product extends Model<InferAttributes<Product>, InferCreationAttributes<Product>> {
  declare id          : CreationOptional<string>;
  declare name        : string;
  declare lower       : CreationOptional<string>;
  declare price       : CreationOptional<number>;
  declare img         : CreationOptional<string>;
  declare description : CreationOptional<string>;
  declare available   : CreationOptional<boolean>;
  // declare state       : CreationOptional<boolean>;
  
  //-foreings
  declare ownerId     : string;
  declare categoryId  : string;

  declare getUser: BelongsToGetAssociationMixin<User>;
  declare createUser: BelongsToCreateAssociationMixin<User>;

  declare static associations: {
    user: Association<Product, User>;
  }
}

Product.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: new DataTypes.STRING(50), allowNull: false, unique: true },
    lower: new DataTypes.STRING(50),
    //-con el metodo increment se puede causar incrementos de un campo en especifico
    price : { type: DataTypes.DECIMAL(10,2), defaultValue: 0.0 },
    img: new DataTypes.STRING(255),
    description: { type: new DataTypes.STRING(255), defaultValue: 'Sin descripción'},
    available: { type: DataTypes.BOOLEAN, defaultValue: true },
    // state: { type: DataTypes.BOOLEAN, defaultValue: true },
    
    //-foreings
    ownerId: { type: DataTypes.UUID, allowNull: false },
    categoryId: { type: DataTypes.UUID, allowNull: false },
  },
  {
    scopes: {
      withDetails: {
        include: [
          { model: User, as: 'user', attributes: ['name'] },
          { model: Category, as: 'category', attributes: ['name'] }
        ],
      },
      deleted: {
        where: db.where(db.col('deletedAt'), "!=", null),
        paranoid: false
      }
    },
    indexes: [ //-Asi se declaran los indices
      {
        fields: ['price'],
        name: 'price_index',
      }
    ],
    tableName: 'products',
    timestamps: true,
    paranoid: true,
    collate: "utf8_general_ci", //-Para ignorar accentos, mysql la tiene por defecto, postgress no
    sequelize: db,
  }
);

Product.beforeSave(product => {
  if(!product.name) return;

  const trim = product.name.split(' ').filter(i => i).join(' ');

  product.name  = trim.charAt(0).toUpperCase() + trim.substring(1).toLowerCase();
  // this.lower = this.name.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, ""); --> Quitar acentos

  product.lower = product.name.toLowerCase();
});



export default Product;