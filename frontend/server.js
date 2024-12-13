const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

const db = mysql.createPool({// ini sesuaiin aja le
  host: 'localhost',
  user: 'root',  
  password: '',  
  database: 'loginbase',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0 
});

// Middleware cors - body parser
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//___________________________________________________________________

// Regis
app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if email already exists
    const [rows] = await db.execute('SELECT * FROM akun WHERE email = ?', [email]);

    if (rows.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.execute('INSERT INTO akun (email, password) VALUES (?, ?)', [email, hashedPassword]);

    return res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error registering user' });
  }
});

//_________________________________________________________________________________

// Login user
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
// email
    const [rows] = await db.execute('SELECT * FROM akun WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const user = rows[0];

// komparator (hashing)
    const pwMatch = await bcrypt.compare(password, user.password);

    if (pwMatch) {
      return res.status(200).json({ message: 'Login successful' });
    } else {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error logging in user' });
  }
});

// porting
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
