const mysql = require("mysql");

const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: ""
});

con.connect(err => {
    if (err) throw err;
    console.log("Connected to MySQL");

    con.query("CREATE DATABASE IF NOT EXISTS library", (err, result) => {
        if (err) throw err;
        console.log("Database 'library' created");
    });

    con.end();
});
