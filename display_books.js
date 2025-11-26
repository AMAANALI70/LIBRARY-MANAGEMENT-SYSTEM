const mysql = require("mysql");

const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "library"
});

con.connect(err => {
    if (err) throw err;

    con.query("SELECT * FROM books", (err, result) => {
        if (err) throw err;
        console.table(result);
    });

    con.end();
});
