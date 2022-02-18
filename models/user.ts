import { 
  Association, 
  CreationOptional, 
  DataTypes, 
  HasManyGetAssociationsMixin,
  InferAttributes, 
  InferCreationAttributes, 
  Model, 
  NonAttribute, 
} from 'sequelize';

import { Category } from './index';
import db from '../database/connection';

class User extends Model<InferAttributes<User, {omit: 'categories'}>, InferCreationAttributes<User, {omit: 'categories'}>> {
  declare id        : CreationOptional<string>;
  declare name      : string;
  declare lower     : CreationOptional<string>;
  declare email     : string;
  declare password  : string;
  declare avatar    : CreationOptional<string>;
  declare online    : CreationOptional<boolean>;
  declare google    : CreationOptional<boolean>;
  // declare state     : CreationOptional<boolean>

  //-foreings
  declare roleId    : string;

  declare getCategories: HasManyGetAssociationsMixin<Category>;
  
  declare categories ?: NonAttribute<Category[]>;

  declare static associations: {
    categories: Association<User, Category>;
  }

  //-Forma de sobreescribir el objeto json sin exluir campos
  // public toJSON<T extends InferAttributes<User, { omit: 'categories'; }>>(): T;
  // public toJSON(): object;
  // public toJSON(): object | any {
  //   // const { id, password, roleId, ...user } = this.get();

  //   // return user;
  // }

  //-la clase de por si tiene otros metodos de instancia que podemos sobreescribir
}

User.init(
  {
    //-Cuando el id es un uuid no es autoincremental por lo que debemos establecer un valor por defecto
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 ,primaryKey: true,  },
    name: { type: new DataTypes.STRING(50), allowNull: false },
    lower: new DataTypes.STRING(50),
    email: { type: new DataTypes.STRING(100), allowNull: false, unique: true }, //Se puede poner el nombre del unique en vez del true
    password: { type: new DataTypes.STRING(255), allowNull: false },
    avatar: new DataTypes.STRING(255),
    online: { type: DataTypes.BOOLEAN, defaultValue: false },
    google: { type: DataTypes.BOOLEAN, defaultValue: false },
    // state: { type: DataTypes.BOOLEAN, defaultValue: true },
    
    //-foreings
    roleId: { type: DataTypes.UUID, allowNull: false },
  },
  {
    defaultScope: {
      //-Al parecer si se exluyen de aqui tambien se exluyen de las propiedades
      // attributes: {
      //   exclude: ["id","roleId"]
      // }
    },
    scopes: { 
      deleted: {
        where: db.where(db.col('deletedAt'), "!=", null),
        paranoid: false
      }
    },
    
    tableName: 'users',
    timestamps: true,
    paranoid: true,
    sequelize: db,
  }
);



//-Hook
User.beforeSave(user => {
  if(!user.name) return;

  const trim = user.name.split(' ').filter(i => i).join(' ');

  user.name  = trim.replace(/(^\w|\s\w)(\S*)/g, (_,m1,m2) => m1.toUpperCase()+m2.toLowerCase());
  user.lower = user.name.toLowerCase();
});

export default User;