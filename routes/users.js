const express = require('express'),
  router = express.Router(),
  archivos = require('fs'),
  bcrypt = require("bcrypt");

// get user lists
router.post('/listarclases', function (req, res) {
  let sql = [`SELECT c.nombre_clase, c.id, p.nombre, p.apellido FROM clase c, clase_alumno ca, profesor p where c.id = ca.id_clase and ca.id_alumno = ? and p.id = c.profesor_clave;`,
  `SELECT id, nombre_clase FROM clase where profesor_clave = ?`];
  
  con.query(sql[req.body.ocupacion], [req.body.id], function (err, data, fields) {
    if (err) throw err;
    res.json({
      status: 200,
      data,
      message: "Clases enlistadas con exito"
    })
    console.log(data);
  })
});

// consulta SQL para el ingresar al sistema
router.post('/login', (req, res) => {
  let sql = [`SELECT id, nombre, apellido, pass from alumno where email = ?`,
    `SELECT id, nombre, apellido, pass from profesor where email = ?`];
  con.query(sql[0], [req.body.email], (error, datasel, fields) => {
    if (error) throw error;
    console.log("el dato extraido es", datasel[0]);
    if (datasel[0] != undefined)
      bcrypt.compare(req.body.pass, datasel[0].pass, (err, result) => {
        if (err) throw err;
        if (result) {
          console.log("la comparacion de pass es: ", result);
          return res.json({
            id : datasel[0].id,
            pass: datasel[0].pass,
            nombre: datasel[0].nombre,
            email: req.body.email,
            apellido : datasel[0].apellido,
            ocupacion : 0
          })
        }
        else
          return res.send(false);
      });
    else {
      con.query(sql[1], [req.body.email], (error, datasel, fields) => {
        if (error) throw error;
        console.log("el dato extraido de profesor es: ", datasel);
        if (datasel[0] != undefined)
          bcrypt.compare(req.body.pass, datasel[0].pass, (err, result) => {
            if (err) throw err;
            if (result) {
              console.log("la comparacion de pass en profe es: ", result);
              return res.json({
                id : datasel[0].id,
                pass: datasel[0].pass,
                nombre: datasel[0].nombre,
                email: req.body.email,
                apellido : datasel[0].apellido,
                ocupacion : 1
              })
            }
            else
              return res.send(false);
          });
        else
          return res.send(false);
      });
    }
  });
});

// ruta para crear un nuevo usuario /users/new
router.post('/new', function (req, res) {
  var sql = [`INSERT INTO alumno(nombre,apellido,fecha,email,pass) VALUES (?)`,
    `INSERT INTO profesor(nombre,apellido,fecha,email,pass) VALUES (?)`];
  bcrypt.hash(req.body.pass, 10, function (error, hash) {
    if (error) throw error;
    var values = [
      req.body.nombre,
      req.body.apellido,
      req.body.fecha,
      req.body.email,
      hash
    ];

    con.query(sql[req.body.ocupacion], [values], function (err, data, fields) {
      if (err) throw err;
      res.json({
        status: 200,
        datus: fields,
        message: "New user added successfully"
      });
    });
  });
  console.log("Nombre : " + req.body.nombre);
  console.log("Apellido : " + req.body.apellido);
  console.log("Nacimiento : " + req.body.fecha);
  console.log("Ocupacion : " + req.body.ocupacion);
  console.log("email : " + req.body.email);
  console.log("Password >:) : " + req.body.pass);
});

router.post('/newclass', (req, res) =>{
  var sql = `INSERT INTO clase(profesor_clave, nombre_clase) values (?)`
  var values = [
    req.body.id,
    req.body.nombre
  ]
  con.query(sql, [values], (err, data, fields)=>{
    if(err) throw err;
    res.json({
      status : 200,
      datus : fields,
      message : "Clase creada con exito papu"
    });
  });
});

router.post('/deleteclass', (req, res)=>{
  var sql = "delete from clase_actividad where id_clase = ?;" + 
  "delete from clase_alumno where id_clase = ?;" +
  "delete from clase where id = ?;";
  var values = [
    parseInt(req.body.id),
    parseInt(req.body.id),
    parseInt(req.body.id)
  ]
  con.query(sql, values, function (err, data, fields){
    if(err) throw err;
    res.json({
      status : 200,
      datus : fields,
      message : "Clase Borrada con exito papu"
    });
  });
});

router.post('/newactividad', (req, res)=>{
  console.log("Guardando nueva Actividad en la base de datos;")
  var sql = "insert into actividad(nombre_act, type, id_profesor) values (?);"+
    "insert into clase_actividad(id_clase, id_actividad) values(?, (select id from actividad where nombre_act = ? and id_profesor = ? ORDER BY id DESC LIMIT 1));"+
    "insert into alumno_actividad(id_alumno, id_actividad) "+
    "select a.id, (select id from actividad where nombre_act = ? and id_profesor = ? ORDER BY id DESC LIMIT 1) from alumno a, clase_alumno ca where a.id = ca.id_alumno and ca.id_clase = ?;";

  var values = [
    [req.body.nombre,req.body.type, req.body.id_user],
    req.body.id_clase, req.body.nombre, req.body.id_user, req.body.nombre, 
    req.body.id_user, req.body.id_clase
  ]
  con.query(sql, values, function (err, data, fields) {
    if (err) throw err;
    res.json({
      status : 200,
      datus : fields,
      message : "Actividad registrada con exito"
    });
  })

})

router.post('/newactividad_sola', (req, res)=>{
  console.log("Guardando nueva Actividad sola en la base de datos;")
  var sql = "insert into actividad(nombre_act, type, id_profesor) values (?);"

  var values = [
    [req.body.nombre,req.body.type, req.body.id_user]
  ]
  con.query(sql, values, function (err, data, fields) {
    if (err) throw err;
    res.json({
      status : 200,
      datus : fields,
      message : "Actividad registrada con exito"
    });
  })

})

router.post('/deleteactividad_fromclase', (req, res)=>{
  var sql = "delete from clase_actividad where id_actividad = ? and id_clase = ?;" + 
  "delete from alumno_actividad where id_actividad = ?;";
  var values = [
    parseInt(req.body.id),
    parseInt(req.body.id_clase),
    parseInt(req.body.id)
  ]
  con.query(sql, values, function (err, data, fields){
    if(err) throw err;
    console.log("Actividad borrada Con exito!!!");
    res.json({
      status : 200,
      datus : fields,
      message : "Actividad borrada con exito!!!"
    });
  });
});

router.post('/deleteactividad_permanente', (req, res)=>{
  var sql = "delete from clase_actividad where id_actividad = ?;" + 
  "delete from alumno_actividad where id_actividad = ?;"+
  "delete from actividad where id = ?"
  var values = [
    parseInt(req.body.id),
    parseInt(req.body.id),
    parseInt(req.body.id)
  ]
  con.query(sql, values, function (err, data, fields){
    if(err) throw err;
    console.log("Actividad borrada Con exito!!!");
    res.json({
      status : 200,
      datus : fields,
      message : "Actividad borrada permanentemente con exito!!!"
    });
  });
});

router.post('/listar_actividades_de_clase', (req, res)=>{
  var sql = [`select a.id, a.nombre_act, a.archivo, a.type, aac.calificacion from actividad a,`+
  ` alumno_actividad aac, clase_actividad cac where aac.id_alumno = ? and aac.id_actividad = a.id`+
  ` and cac.id_clase = ? and cac.id_actividad = a.id;` ,
  `select a.id, a.nombre_act, a.archivo, a.type from actividad a,`+
  ` clase_actividad cac where a.id_profesor = ?`+
  ` and cac.id_clase = ? and cac.id_actividad = a.id;` 
  ]
  var values = [
    req.body.id_user,
    req.body.id
  ]
  console.log("Obteniendo actividades de la clase : ", req.body.id);
  console.log(sql[req.body.ocupacion])
  con.query(sql[req.body.ocupacion], values, function (err, data, fields){
    if (err) throw err;
    res.json({
      status : 200,
      data,
      message : "Actividades recopiladas con exito"
    });
  });

});

router.post('/listar_actividades_totales', (req, res)=>{
  var sql = [`select a.id, a.nombre_act, a.archivo, a.type from actividad a,`+
  ` alumno_actividad aac where aac.id_alumno = ? and aac.id_actividad = a.id`,
  `select a.id, a.nombre_act, a.archivo, a.type from actividad a`+
  ` where a.id_profesor = ?`
  ]
  var values = [
    req.body.id_user
  ]
  console.log("Obteniendo actividades totales de usuario : ", req.body.id_user);
  console.log(sql[req.body.ocupacion])
  con.query(sql[req.body.ocupacion], values, function (err, data, fields){
    if (err) throw err;
    res.json({
      status : 200,
      data,
      message : "Actividades recopiladas con exito"
    });
  });

});

router.post('/clasedatos', (req, res)=>{
  var sql = `SELECT c.nombre_clase, p.nombre, p.apellido FROM clase c, profesor p `+
    `where c.id = ? and p.id = c.profesor_clave`;

  con.query(sql, req.body.id, function (err, data, fields){
    if (err) throw err;
    res.json({
      status : 200,
      data,
      message : "Actividades recopiladas con exito"
    });
  }); 
});

router.post('/actsueltas', (req, res)=>{
  console.log("\nBuscando Actividades Sueltas");
  var sql = `SELECT a.id, a.nombre_act, a.archivo, a.type from actividad a `+
  `where not exists(select cac.id_actividad from clase_actividad cac where `+
  `cac.id_actividad = a.id and cac.id_clase = ?) and a.id_profesor = ?;`;

  var values = [
    req.body.id,
    req.body.id_profesor
  ]
  con.query(sql, values, function (err, data, fields){
    if (err) throw err;
    console.log(data);
    res.json({
      status : 200,
      data,
      message : "Actividades Sueltas recopiladas"
    });
  }); 
});

router.post('/calificaciones_alumnos', (req, res)=>{
  console.log("\nRecopilando calificaciones por actividad de alumnos");

  var sql = `SELECT aac.id_actividad, a.nombre, a.apellido, aac.calificacion, cac.id_clase from alumno a,`+
    ` alumno_actividad aac, clase_actividad cac, clase_alumno ca`+
    ` where a.id = aac.id_alumno and a.id = ca.id_alumno and ca.id_clase = cac.id_clase and aac.id_actividad = ? and cac.id_actividad = ? and aac.calificacion is not null;` +
    ` SELECT nombre_act, type, archivo FROM actividad where id = ?;` 

  var values = [
    req.body.id_actividad,
    req.body.id_actividad, 
    req.body.id_actividad
  ]
  con.query(sql, values, function (err, data, fields){
    if (err) throw err;
    console.log(data);
    res.json({
      status : 200,
      data,
      message : "Actividades Sueltas recopiladas"
    });
  }); 
});

router.post('/guardar_editactividad', (req, res)=>{
  console.log("\nGuardando actividad Editada con id: ", req.body.id_actividad);
  var sql = `UPDATE actividad SET archivo = ? where id = ? and id_profesor = ?;`
  var values = [
    req.body.archivo, 
    req.body.id_actividad, req.body.id_profesor
  ]
  con.query(sql, values, function (err, data, fields){
    if (err) throw err;
    console.log(data);
    res.json({
      status : 200,
      data,
      message : "Actividad editada Guardada con exito"
    });
  });
});

router.post('/calificar', (req, res)=>{
  console.log("\nCalificando alumno con id: ", req.body.id_alumno);
  var sql = `UPDATE alumno_actividad SET calificacion = ? where id_alumno = ? and id_actividad = ?;`
  var values = [
    req.body.calificacion, 
    req.body.id_alumno , req.body.id_actividad
  ]
  con.query(sql, values, function (err, data, fields){
    if (err) throw err;
    console.log(data);
    res.json({
      status : 200,
      data,
      message : "Alumno calificado con exito"
    });
  });
});



router.post('/accederclase', (req, res)=>{
  console.log("Solicitando acceder a clase ", req.body.id_clase ,"por alumno ", req.body.id_alumno);
  var sql = ["SELECT id FROM clase where id = ?; SELECT id_clase from clase_alumno where id_alumno = ? and id_clase = ?", "insert into clase_alumno values (?); insert into alumno_actividad(id_alumno, id_actividad) "+
    "select ?, ac.id from actividad ac, clase_actividad cac where ac.id = cac.id_actividad and cac.id_clase = ?"
  ]
  var values = [
    [req.body.id_alumno, req.body.id_clase],
    req.body.id_alumno, req.body.id_clase
  ]
  var values_verify = [
    req.body.id_clase,
    req.body.id_alumno,
    req.body.id_clase
  ]
  //verificamos que exista la clase
  con.query(sql[0], values_verify, function (err, data, fields){
    if (err) throw err;
    if(data[0].length > 0){ // la id si existe
      if(data[1].length === 0){ // el men no esta en la clase 
        con.query(sql[1], values, function (err, datu, fields){
          if (err) throw err;
          console.log("Acceso permitido");
          res.json({
            exist : 2,
            datu,
            message : "Acceso logrado"
          });
        });
      }else{
        console.log("Ya esta dentro de la clase");
        res.json({exist : 1});
      }
      
    } else { // no existe la clase 
      console.log("Acceso denegado");
      res.json({exist : 0});
    }

  });
});

router.post('/addactividad', (req, res)=>{
  console.log("\nAgregando actividad suelta a clase");
  var sql = "insert into clase_actividad(id_clase, id_actividad) values(?);"+
  "insert into alumno_actividad(id_alumno, id_actividad) "+
  "select a.id, ? from alumno a, clase_alumno ca where a.id = ca.id_alumno and ca.id_clase = ?;";
  var values = [
    [req.body.id_clase, req.body.id_actividad],
    req.body.id_actividad, req.body.id_clase 
  ]
  con.query(sql, values, function (err, data, fields){
    if (err) throw err;
    console.log(data);
    res.json({
      status : 200,
      data: fields,
      message : "Actividades Sueltas recopiladas"
    });
  });

});


router.post('/books', (req, res) => {
  archivos.readdir('/var/www/salouaserver.com/libros', (err, archivoslista)=>{
    if(err) throw err;
    console.log(archivoslista);
    res.json({
      libros : archivoslista
    });
  })
})


module.exports = router;