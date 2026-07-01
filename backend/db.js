// db.js
const mysql = require('mysql2');

// Buat koneksi internal khusus controller jika diperlukan, 
// atau kita gunakan pool yang terhubung ke database.
// Kita gunakan .promise() supaya kodingan lebih rapi pakai async/await
// Membuat SATU pool terpusat untuk seluruh aplikasi
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
}).promise();

module.exports = db;