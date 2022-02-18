import { Sequelize } from 'sequelize';

const db = new Sequelize(
  // process.env.SQL_DATABASE!,
  'flutter_back_pg',
  'postgres',
  'velkamhell', 
  {
    host: 'localhost',
    dialect: "postgres",
    logging: false,
    define: {
      charset: 'utf8',
      collate: 'utf8_general_ci'
    }
  },
)

export default db;