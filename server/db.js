const mysql = require('mysql')

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'holidays'
})

connection.connect((err) => {
    if (err) {
        console.log(`Error connecting to database : ${err.stack}`);
    }
    console.log("Successfully Connected to Database");

})

module.exports = connection;