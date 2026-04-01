import mysql from 'mysql2';
import { ENV } from './env';

export const db = mysql.createConnection({
  host: ENV.DB_HOST,
  port: ENV.DB_PORT,
  user: ENV.DB_USER,
  password: ENV.DB_PASSWORD,
  database: ENV.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.error('Error conectando a la DB:', err);
    return;
  }
  console.log('DB conectada');
});