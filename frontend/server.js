const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const path = require('path');

const connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '',
	database : 'loginbase'
});

const app = express();

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'static')));

// http://localhost:3000/login
app.get('/login', function(request, response) {
	response.sendFile(path.join(__dirname + 'dir login nya (login.html)'));
});

// http://localhost:3000/auth
app.post('/auth', function(request, response) {
	let username = request.body.username;
	let password = request.body.password;
	if (username && password) {
		connection.query('SELECT * FROM akun WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (error) throw error;

			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
				response.redirect('home dir');
			} else {
				response.send('Incorrect Username and/or Password!');
                response.redirect('dir login');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

// http://localhost:3000/home
app.get('/C:/Users/LENOVO/OneDrive/Documents/!Perkuli-ahan/SEMESTER 3/RPL/express/home.html', function(request, response) {
	if (request.session.loggedin) {
		response.send('identify, ' + request.session.username + '!');
	} else {
		response.send('not loggin in');
	}
	response.end();
});

app.listen(3000);