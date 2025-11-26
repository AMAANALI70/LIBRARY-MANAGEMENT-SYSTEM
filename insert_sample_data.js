const mysql = require("mysql");
const bcrypt = require("bcryptjs");

const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "library"
});

con.connect(err => {
    if (err) throw err;
    console.log("Connected!");

    const adminPass = bcrypt.hashSync("admin123", 10);
    const userPass = bcrypt.hashSync("user123", 10);

    const userInsert = `
        INSERT INTO users (name, email, password, role)
        VALUES 
        ('Admin User', 'admin@lib.com', ?, 'admin'),
        ('Normal User', 'user@lib.com', ?, 'user')
    `;

    const bookInsert = `
        INSERT INTO books (title, author, isbn, genre, year, total_copies, available_copies)
        VALUES
        ('The Alchemist', 'Paulo Coelho', '978-0062315007', 'Fiction', 1988, 5, 5),
        ('Clean Code', 'Robert C. Martin', '978-0132350884', 'Programming', 2008, 3, 3),
        ('Harry Potter', 'J. K. Rowling', '978-0439708180', 'Fantasy', 2001, 10, 10)
    `;

    con.query(userInsert, [adminPass, userPass]);
    con.query(bookInsert);

    console.log("Sample users & books inserted!");

    con.end();
});
