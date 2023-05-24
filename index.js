const express = require('express');
let mysql = require('mysql');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const cookieParser = require("cookie-parser");
const sessions = require('express-session');

//upload
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, 'public/img/');
    },
    filename: function(req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + '.jpg');
    }
});
  
const upload = multer({ storage: storage });



const app = express();
//le decimos a express que use el paquete cookie parser
//para trabajar con cookies
app.use(cookieParser());
//le decimos a express que configure las sesiones con
//llave secreta secret
//creamos el tiempo de expiracion en milisegundos
const timeEXp = 1000 * 60 * 60 * 24;
app.use(sessions({
    secret: "rfghf66a76ythggi87au7td",
    saveUninitialized: true,
    cookie: { maxAge: timeEXp },
    resave: false
}));




app.post('/upload', upload.single('image'), function(req, res) {
    const image = req.file;
    const name = req.body.name;
    const price = req.body.price;
  
    const sql = `INSERT INTO images (imgage, nombre, price) VALUES (?, ?, ?)`;
    const values = [image.filename,name, price];
  
    pool.query(sql, values, function(err, result) {
      if (err) throw err;
      console.log('Image uploaded to the database');
      res.redirect('/upload');
    });
});

app.get('/upload', function(req, res) {
    pool.query('SELECT * FROM images', function(err, images) {

        if (err) throw err;
        //si hay almenos un articulo...
        if (images.length > 0) {
            //recogemos la cookie de sesion
            let session = req.session;
            //verificamos si existe la sesion llamada correo y ademas que no haya expirado y
            //también que
            //sea original, es decir, firmada por nuestro server
            if (session.usuario) {
                //se retorna la plantilla llamada articulos al cliente con la info de todos los
                //articulos
                //y se mostrarán los nombres del usuario en el nav
                return res.render('upload', { usuario: session.usuario, images: images })
            }
            //se retorna la plantilla llamada articulos al cliente con la info de todos los
            //articulos
            //y no se mostrarán los nombres del usuario en el nav ya no está logueado
            return res.render('upload', { usuario: undefined, images: images })
        }
        //si no existen articulos en la base de datos...
        return res.redirect('./sinArticulos');



    //   if (err) throw err;
    //   res.render('upload', { images: images });
    });
});

app.get('/formularioSubir', function(req, res) {
    pool.query('SELECT * FROM images', function(err, images) {

        if (err) throw err;
        //si hay almenos un articulo...
        if (images.length > 0) {
            //recogemos la cookie de sesion
            let session = req.session;
            //verificamos si existe la sesion llamada correo y ademas que no haya expirado y
            //también que
            //sea original, es decir, firmada por nuestro server
            if (session.usuario) {
                //se retorna la plantilla llamada articulos al cliente con la info de todos los
                //articulos
                //y se mostrarán los nombres del usuario en el nav
                return res.render('formularioSubir', { usuario: session.usuario, images: images })
            }
            //se retorna la plantilla llamada articulos al cliente con la info de todos los
            //articulos
            //y no se mostrarán los nombres del usuario en el nav ya no está logueado
            return res.render('formularioSubir', { usuario: undefined, images: images })
        }


    //   if (err) throw err;
    //   res.render('formularioSubir', { images: images });
    });
});




//se habilita a express para analizar y leer diferentes datos de la solicitud, por ejemplo
//formularios
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');//se establece express para que maneje plantillas ejs
app.use('/public/', express.static('./public'));//en la carpeta public cargaremos los archivos
//estaticos
const port = 10101;
const pool = mysql.createPool({
    connectionLimit: 100,
    host: 'localhost',
    user: 'root',
    password: 'Sena12345',
    database: 'servitools',
    debug: false
});
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
        user: 'servi.tools22@gmail.com',
        pass: 'izmthaseotcktbwc'
    }
});

app.get('/seleccion', (req, res) => {

    let session = req.session;

    if (session.usuario) {
        return res.render('seleccion', { usuario: session.usuario })
    }
    return res.render('seleccion', { usuario: undefined })

});

app.get('/', (req, res) => {

    let session = req.session;

    if (session.usuario) {
        return res.render('index', { usuario: session.usuario })
    }
    return res.render('index', { usuario: undefined })

});



app.get('/registro', (req, res) => {
    //se retorna la plantilla llamada registro que contiene
    //el formulario de registro
    res.render('registro')
})
app.get('/login', (req, res) => {
    res.render('login');
})
app.get('/seleccion', (req, res) => {
    res.render('seleccion');
})
app.get('/productos', (req, res) => {
    res.render('productos');
})
app.get('/articulos', (req, res) => {
    res.render('articulos');
})
app.get('/sinArticulos', (req, res) => {
    res.render('sinArticulos');
})


app.post('/registro', (req, res) => {
    //se obtienen los valores de los inputs del
    //formulario
    //de registro
    let nombres = req.body.nombres;
    let apellidos = req.body.apellidos;
    let usuario = req.body.usuario;
    let contrasena = req.body.contrasena;
    let correo = req.body.correo;
    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    //convertimos a hash el password del usuario
    const hash = bcrypt.hashSync(contrasena, salt);
    pool.query("INSERT INTO registro VALUES (?, ?, ?, ?, ?)", [nombres, apellidos, usuario, hash, correo],
        (error) => {
            if (error) throw error;
            res.redirect('/login');
            transporter.sendMail({
                from: 'servi.tools22@gmail.com',
                to: `${correo}`,
                subject: 'Confirmación de correo',
                html: '<h1>Gracias por registrarte!</h1> <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSL14vd2g6r-QSkK6NRJ9Rdc2svG3auTMQuORMe9SxkCJf2xJRsSCPaVOZAnsYVCSny7VY&usqp=CAU">'
            }).then((res) => { console.log(res); }).catch((err) => { console.log(err); });
        });
})

app.post('/login', (req, res) => {
    //se obtienen los valores de los inputs del formulario
    //de login
    let usuario = req.body.usuario;
    let contrasena = req.body.contrasena;
    pool.query("SELECT contraseña, usuario FROM registro WHERE usuario=?", [usuario], (error, data) => {
        if (error) throw error;
        //si existe un correo igual al correo que llega en el formulario de login...
        if (data.length > 0) {
            let contrasenaEncriptada = data[0].contraseña;
            //si la contraseña enviada por el usuario, al comparar su hash generado,
            //coincide con el hash guardado en la base de datos del usuario, hacemos login
            if (bcrypt.compareSync(contrasena, contrasenaEncriptada)) {
                //recogemos session de la solicitud del usuario
                let session = req.session;
                //iniciamos sesion al usuario
                //en este caso la llamamos userid
                //y ella contiene el email del usuario encriptado
                session.usuario = usuario;

                session.usuario = `${data[0].usuario}`

                return res.redirect('/seleccion');
            }
            //si la contraseña enviada por el usuario es incorrecta...
            return res.send('Usuario o contraseña incorrecta');
        }
        //si no existe el usuario en la base de datos...
        return res.send('Usuario o contraseña incorrecta');
    });
})







app.get('/tienda', (req, res) => {
    // seleccionamos los campos de los productos de la tabla articulos
    pool.query("SELECT codigo, nombre, valor, urlImagen FROM articulos", (error, data) => {
        if (error) throw error;
        //si hay almenos un articulo...
        if (data.length > 0) {
            //recogemos la cookie de sesion
            let session = req.session;
            //verificamos si existe la sesion llamada correo y ademas que no haya expirado y
            //también que
            //sea original, es decir, firmada por nuestro server
            if (session.usuario) {
                //se retorna la plantilla llamada articulos al cliente con la info de todos los
                //articulos
                //y se mostrarán los nombres del usuario en el nav
                return res.render('articulos', { usuario: session.usuario, articulos: data })
            }
            //se retorna la plantilla llamada articulos al cliente con la info de todos los
            //articulos
            //y no se mostrarán los nombres del usuario en el nav ya no está logueado
            return res.render('articulos', { usuario: undefined, articulos: data })
        }
        //si no existen articulos en la base de datos...
        return res.send('No hay artículos en este momento');
    });
})







app.get('/detalle-producto/:codigo', (req, res) => {
    //seleccionamos los campos del producto de la tabla articulos
    pool.query("SELECT codigo, nombre, valor, urlImagen, detalle FROM articulos WHERE codigo =?",
        [req.params.codigo], (error, data) => {
            if (error) throw error;
            console.log(data);
            if (data.length > 0) {
                //recogemos la cookie de sesion
                let session = req.session;
                //verificamos si existe la sesion llamada correo y ademas que //no haya expirado y
                //también que
                //sea original, es decir, firmada por nuestro server
                if (session.usuario) {
                    //se retorna la plantilla llamada detalle al cliente con la info dettalada del
                    //articulo
                    //y se mostrarán los nombres del usuario en el nav
                    return res.render('detalle', { usuario: session.usuario, articulo: data })
                }
                //se retorna la plantilla llamada detalle al cliente con la info dettalada del articulo
                //y no se mostrarán los nombres del usuario en el nav ya no está logueado
                return res.render('detalle', { usuario: undefined, articulo: data })
            }
            //si no existe el usuario en la base de datos...
            return res.send('A ocurrido un error al cargar el artículo, inténtelo mas tarde');
        });
})

app.post('/comprar/:codigo', (req, res) => {
    //recogemos la cookie de sesion
    let session = req.session;
    //verificamos si existe la sesion llamada correo y ademas que no haya expirado y también
    //que
    //sea original, es decir, firmada por nuestro server
    if (session.usuario) {
        //aca obtenemos el código del artículo que pasamos por la ruta como parámetro
        let codigo = req.params.codigo;
        //insertamos el codigo del articulo comprado y el correo del usuario que lo compró
        pool.query("INSERT INTO compras VALUES (?, ?)", [codigo ,session.usuario], (error) => {
            if (error) throw error;
            //se retorna la plantilla llamada compraok al cliente notificando que la compra ha sido
            //exitosa
            return res.render('compraok', { usuario: session.usuario })
        });
    } else {
        //si el usuario no está logueado, le enviamos un mensaje para que inicie sesión
        return res.send('Por favor inicie sesión para realizar su compra')
    }
})

app.get('/test-cookies', (req, res) => {
    //recogemos la cookie de sesion
    session = req.session;
    //verificamos si existe la sesion llamada correo y ademas que no haya expirado y también
    //que
    //sea original, es decir, firmada por nuestro server
    if (session.usuario) {
        res.send(`Usted tiene una sesión en nuestro sistema con el usuario:
        ${session.usuario}`);
    } else
        res.send('Por favor inicie sesión para acceder a esta ruta protegida')
});

app.get('/logout', (req, res) => {
    //recogemos la cookie de sesion
    let session = req.session;
    //verificamos si existe la sesion llamada correo y ademas que no haya expirado y también
    //que
    //sea original, es decir, firmada por nuestro server
    //si la sesión está iniciada la destruimos
    if (session.usuario) {
        //la destruimos
        req.session.destroy();
        //redirigimos al usuario a la ruta raíz
        return res.redirect('/');
    } else
        return res.send('Por favor inicie sesión')
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});