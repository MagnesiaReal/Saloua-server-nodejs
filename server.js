//Nodejs Express para el BACKEND
// requerimientos 
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const cors = require('cors');
const port = 5002;

//requerir router
const usersRouter = require('./routes/users');

//setup database
// Paquete necesario para conectar a bases de datos MySQL.
const mysql = require('mysql');
// Parámetros de conexión a la base de datos.
con = mysql.createConnection({
    host: "localhost",
    user: "magnesiareal",
    password: "magnesiareal",
    database: 'prueba8',
    multipleStatements: true
});
// Funcion que nos devolverá resultados de la base de datos.
con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");

});


// usando los modulos
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
// usando router
app.use('/users', usersRouter);

app.get('/', (req, res) => {
    res.json({"mensaje" : "Vayamos a Registrar un NEWUSER UWU!!!!"});
    console.log("Alguien entro a la pag");
});

app.listen(port, () => {
    console.log('Soy El servidor en espera activa en el puerto: ' );
})