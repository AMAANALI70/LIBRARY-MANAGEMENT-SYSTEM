// =====================
// IMPORTS
// =====================
const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());

// JWT Secret
const SECRET = "mysecretkey123";

// =====================
// MYSQL CONNECTION
// =====================
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "library"
});

db.connect((err) => {
    if (err) throw err;
    console.log("MySQL Connected!");
});


// =====================
// MIDDLEWARE: VERIFY TOKEN
// =====================
function verifyToken(req, res, next) {
    const token = req.headers["authorization"];

    if (!token) return res.status(403).json({ error: "Token missing" });

    const tokenString = token.startsWith("Bearer ") ? token.slice(7, token.length) : token;

    jwt.verify(tokenString, SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ error: "Invalid token" });

        req.user = decoded;
        next();
    });
}


// =====================
// MIDDLEWARE: ADMIN ONLY
// =====================
function adminOnly(req, res, next) {
    if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Admin access only" });
    }
    next();
}


// =====================
// USER REGISTRATION
// =====================
app.post("/register", (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const hashedPass = bcrypt.hashSync(password, 10);

    const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
    db.query(sql, [name, email, hashedPass], (err) => {
        if (err) {
            console.error("Registration Error:", err);
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ error: "Email already exists" });
            }
            return res.status(500).json({ error: "Database error" });
        }
        res.json({ message: "User registered successfully" });
    });
});


// =====================
// LOGIN
// =====================
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email], (err, result) => {
        if (err) return res.status(500).send(err);

        if (result.length === 0)
            return res.status(404).json({ error: "User not found" });

        const user = result[0];

        if (!bcrypt.compareSync(password, user.password))
            return res.status(401).json({ error: "Incorrect password" });

        const token = jwt.sign(
            { id: user.id, role: user.role },
            SECRET,
            { expiresIn: "5h" }
        );

        res.json({ message: "Login successful", token, role: user.role });
    });
});


// =====================
// GET BOOKS (SEARCH & FILTER)
// =====================
app.get("/books", (req, res) => {
    const { search, genre, year, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let sql = "SELECT * FROM books WHERE 1=1";
    const params = [];

    if (search) {
        sql += " AND (title LIKE ? OR author LIKE ? OR isbn LIKE ?)";
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (genre) {
        sql += " AND genre = ?";
        params.push(genre);
    }

    if (year) {
        sql += " AND year = ?";
        params.push(year);
    }

    sql += " LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(offset));

    db.query(sql, params, (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result);
    });
});


// =====================
// ADD NEW BOOK (ADMIN ONLY)
// =====================
app.post("/books", verifyToken, adminOnly, (req, res) => {
    const { title, author, isbn, genre, year, total_copies } = req.body;

    const sql = "INSERT INTO books (title, author, isbn, genre, year, total_copies, available_copies) VALUES (?, ?, ?, ?, ?, ?, ?)";

    db.query(sql, [title, author, isbn, genre, year, total_copies, total_copies], (err) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: "ISBN already exists" });
            return res.status(500).send(err);
        }
        res.send("Book added successfully!");
    });
});


// =====================
// BORROW BOOK (TRANSACTION)
// =====================
app.post("/borrow", verifyToken, (req, res) => {
    const { book_id } = req.body;
    const user_id = req.user.id;

    db.beginTransaction((err) => {
        if (err) return res.status(500).send(err);

        // 1. Check availability with FOR UPDATE to lock the row
        db.query("SELECT available_copies FROM books WHERE id = ? FOR UPDATE", [book_id], (err, result) => {
            if (err) return db.rollback(() => res.status(500).send(err));

            if (result.length === 0) return db.rollback(() => res.status(404).send("Book not found"));

            if (result[0].available_copies <= 0)
                return db.rollback(() => res.status(400).send("No copies available"));

            // 2. Check if user already has this book
            db.query("SELECT * FROM borrow_records WHERE user_id = ? AND book_id = ? AND return_date IS NULL", [user_id, book_id], (err, existing) => {
                if (err) return db.rollback(() => res.status(500).send(err));

                if (existing.length > 0)
                    return db.rollback(() => res.status(400).send("You already have this book"));

                // 3. Insert borrow record
                const borrowSQL = `
                    INSERT INTO borrow_records (user_id, book_id, borrow_date, due_date)
                    VALUES (?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 14 DAY))
                `;

                db.query(borrowSQL, [user_id, book_id], (err) => {
                    if (err) return db.rollback(() => res.status(500).send(err));

                    // 4. Decrement copies
                    db.query("UPDATE books SET available_copies = available_copies - 1 WHERE id = ?", [book_id], (err) => {
                        if (err) return db.rollback(() => res.status(500).send(err));

                        db.commit((err) => {
                            if (err) return db.rollback(() => res.status(500).send(err));
                            res.send("Book borrowed successfully");
                        });
                    });
                });
            });
        });
    });
});


// =====================
// RETURN BOOK (TRANSACTION + FINES)
// =====================
app.post("/return", verifyToken, (req, res) => {
    const { book_id } = req.body;
    const user_id = req.user.id;

    db.beginTransaction((err) => {
        if (err) return res.status(500).send(err);

        // 1. Find active record
        const findSQL = `
            SELECT id, due_date FROM borrow_records 
            WHERE user_id = ? AND book_id = ? AND return_date IS NULL
        `;

        db.query(findSQL, [user_id, book_id], (err, result) => {
            if (err) return db.rollback(() => res.status(500).send(err));

            if (result.length === 0) return db.rollback(() => res.status(400).send("No active borrow record found"));

            const record = result[0];
            const dueDate = new Date(record.due_date);
            const now = new Date();
            let fine = 0;

            // Calculate fine ($1 per day overdue)
            if (now > dueDate) {
                const diffTime = Math.abs(now - dueDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                fine = diffDays * 1.00;
            }

            // 2. Update record
            const updateSQL = `
                UPDATE borrow_records 
                SET return_date = CURDATE(), fine_amount = ?
                WHERE id = ?
            `;

            db.query(updateSQL, [fine, record.id], (err) => {
                if (err) return db.rollback(() => res.status(500).send(err));

                // 3. Increment copies
                db.query("UPDATE books SET available_copies = available_copies + 1 WHERE id = ?", [book_id], (err) => {
                    if (err) return db.rollback(() => res.status(500).send(err));

                    db.commit((err) => {
                        if (err) return db.rollback(() => res.status(500).send(err));
                        res.json({ message: "Book returned successfully", fine });
                    });
                });
            });
        });
    });
});


// =====================
// VIEW BORROWED BOOKS (USER)
// =====================
app.get("/borrowed", verifyToken, (req, res) => {
    const user_id = req.user.id;

    const sql = `
        SELECT br.book_id, b.title, b.author, br.borrow_date, br.due_date, br.return_date, br.fine_amount
        FROM borrow_records br
        JOIN books b ON br.book_id = b.id
        WHERE br.user_id = ?
        ORDER BY br.borrow_date DESC
    `;

    db.query(sql, [user_id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result);
    });
});


// =====================
// ADMIN STATS
// =====================
app.get("/admin/stats", verifyToken, adminOnly, (req, res) => {
    const stats = {};

    const q1 = "SELECT COUNT(*) as total_books, SUM(available_copies) as available_books FROM books";
    const q2 = "SELECT COUNT(*) as active_borrows FROM borrow_records WHERE return_date IS NULL";
    const q3 = "SELECT COUNT(*) as overdue FROM borrow_records WHERE return_date IS NULL AND due_date < CURDATE()";

    db.query(q1, (err, r1) => {
        if (err) return res.status(500).send(err);
        stats.inventory = r1[0];

        db.query(q2, (err, r2) => {
            if (err) return res.status(500).send(err);
            stats.active_borrows = r2[0].active_borrows;

            db.query(q3, (err, r3) => {
                if (err) return res.status(500).send(err);
                stats.overdue = r3[0].overdue;
                res.json(stats);
            });
        });
    });
});


// =====================
// START SERVER
// =====================
app.listen(3000, () => {
    console.log("Library API running on http://localhost:3000");
});
