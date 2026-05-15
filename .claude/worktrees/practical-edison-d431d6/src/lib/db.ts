import mysql from 'mysql2/promise';

export const db = mysql.createPool({
  host: 'localhost',
  user: 'root',      // Usuario por defecto de XAMPP
  password: '',      // Contraseña por defecto (vacía)
  database: 'josman_db',
});