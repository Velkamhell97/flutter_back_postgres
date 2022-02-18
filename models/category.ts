import { 
  Association, 
  BelongsToCreateAssociationMixin, 
  BelongsToGetAssociationMixin, 
  CreationOptional, 
  DataTypes, 
  HasManyGetAssociationsMixin, 
  InferAttributes, 
  InferCreationAttributes, 
  Model, 
  NonAttribute 
} from 'sequelize';

import { User, Product } from './index';
import db from '../database/connection';

class Category extends Model<InferAttributes<Category, {omit: 'products'}>, InferCreationAttributes<Category, {omit: 'products'}>> {
  declare id        : CreationOptional<string>;
  declare name      : string;
  declare lower     : CreationOptional<string>;
  // declare state     : CreationOptional<boolean>;
  
  //-foreings
  declare ownerId   : string;

  declare getProducts: HasManyGetAssociationsMixin<Product>;

  declare getUser: BelongsToGetAssociationMixin<User>;
  declare createUser: BelongsToCreateAssociationMixin<User>;

  declare products ?: NonAttribute<Category[]>;

  declare static associations: {
    user: Association<Category, User>;
    products: Association<Category, Product>;
  }

  // public toJSON<T extends InferAttributes<Category, { omit: 'products'; }>>(): T;
  // public toJSON(): object;
  // public toJSON(): object | any {
  //   //-Se dejara comentado para ver el id y agilizar las pruebas en postman
  //   // const { id, ownerId, ...category } = this.get();
  //   // return category;
  // }
}

Category.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: new DataTypes.STRING(50), allowNull: false, unique: true },
    lower: new DataTypes.STRING(50),
    // state: { type: DataTypes.BOOLEAN, defaultValue: true },
    
    //-foreings
    ownerId: { type: DataTypes.UUID, allowNull: false },
  },
  {
    defaultScope: {},
    scopes: {
      withUser: {
        include: { model: User, as: 'user', attributes: ['name'] }
      },
      deleted: {
        where: db.where(db.col('deletedAt'), "!=", null),
        paranoid: false
      }
    },
    tableName: 'categories',
    timestamps: true,
    paranoid: true,
    collate: "utf8_general_ci", //-Para ignorar accentos, mysql la tiene por defecto, postgress no
    sequelize: db,
  }
);

Category.beforeSave(category => {
  if(!category.name) return;

  const trim = category.name.split(' ').filter(i => i).join(' ');

  category.name  = trim.charAt(0).toUpperCase() + trim.substring(1).toLowerCase();
  // this.lower = this.name.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, ""); --> Quitar acentos

  category.lower = category.name.toLowerCase();
});

export default Category;