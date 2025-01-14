const mysql = require('mysql2')

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'test'
})

connection.connect((err) => {
    if (err) {
        console.log(`Error connecting to database : ${err.stack}`);
    }
    console.log("Successfully Connected to Database");

})

module.exports = connection;
