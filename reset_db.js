const mysql = require("mysql");

const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "library"
});

con.connect(err => {
    if (err) throw err;
    console.log("Connected!");

    con.query("DROP TABLE IF EXISTS borrow_records");
    con.query("DROP TABLE IF EXISTS books");
    con.query("DROP TABLE IF EXISTS users");

    console.log("Tables dropped!");
    con.end();
});
