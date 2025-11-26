const mysql = require("mysql");

const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "library"
});

con.connect(err => {
    if (err) throw err;
    console.log("Connected to library DB");

    const userTable = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100),
            email VARCHAR(150) UNIQUE,
            password VARCHAR(255),
            role ENUM('user','admin') DEFAULT 'user'
        )
    `;

    const bookTable = `
        CREATE TABLE IF NOT EXISTS books (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255),
            author VARCHAR(255),
            isbn VARCHAR(20) UNIQUE,
            genre VARCHAR(100),
            year INT,
            total_copies INT DEFAULT 1,
            available_copies INT DEFAULT 1
        )
    `;

    const borrowTable = `
        CREATE TABLE IF NOT EXISTS borrow_records (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            book_id INT,
            borrow_date DATE,
            due_date DATE,
            return_date DATE,
            fine_amount DECIMAL(10, 2) DEFAULT 0.00,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (book_id) REFERENCES books(id)
        )
    `;

    con.query(userTable);
    con.query(bookTable);
    con.query(borrowTable);

    console.log("Tables created successfully!");

    con.end();
});
