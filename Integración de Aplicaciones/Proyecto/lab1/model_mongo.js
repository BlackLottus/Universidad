const mongodb = require('mongodb'); 
const MongoClient = mongodb.MongoClient; 
const url = 'mongodb://localhost:27017';
const database = 'twitter_lite';
const messages= require("./messages"); 


var colecciones = {
    users : "users",
    messages : "messages"
}

/*                   Función de Login                   */
/*           -------------------------------            */
/*  Esta función sirve para iniciar sesión en Twitter   */
/*           Requiere un <email> y <password>           */
/*    Devuelve un <cb> con el resultado. Indicando      */
/*         Si logró o falló la autentificación.         */

function login(email, password, cb) {  
    MongoClient.connect(url).then(client => {  
        /* Crear un nuevo callback llamado _cb que hace lo mismo */
        /* que el cb normal pero también cierra la conexión */           
        _cb = function (err, res, res2) {      
            client.close();      
            cb(err, res, res2);    
        }  

        /* Crea la conexión a la base de datos */
        let db = client.db(database);    
        let col = db.collection(colecciones.users);    

        /* FindOne busca 1 valor con el <email> y <password> en la base de datos */
        /* Devolverá el resultado dentro del campo <user> del callback */
        col.findOne({ email: email, password: password }).then(_user => {      
            /* Revisamos si el usuario NO está registrado en la base de datos */
            if (!_user) {
                print(messages.login.invalid_credentials, 
                (messages.login.log.invalid_credentials.replace("%email%", email)
                .replace("%password%", password)), 0);              
                _cb(null); // Devuelve un Err:null, Token:undefined y User:undefined
            }else {      
                /* Como si está registrado hacemos las operaciones */
                /* Asignamos toda la información del usuario de la base de datos al usuario actual */
                _cb(null, _user._id.toHexString(), {         
                    id: _user._id.toHexString(), 
                    name: _user.name, 
                    surname: _user.surname,        
                    email: _user.email, 
                    nick: _user.nick
                });    
            }}).catch(err => {      
                _cb(err)    
            });  
    }).catch(err => {    
        cb(err);  
    }); 
}


/*             Función para Añadir Usuario              */
/*         -----------------------------------          */
/*  Esta función sirve para agregar nuevos usuarios a   */
/*          la base de datos de la aplicación           */
/*                  Requiere un <user>                  */
/*    Devuelve un <cb> con el resultado. Que indica     */
/*       Si logró o falló la creación del usuario       */

function addUser(user, cb) {  

    /* Realizamos una serie de comprobaciones para revisar si el <user> que nos pasaron */
    /* tiene todos los parámetros correctamente establecidos. */
    if((user.name == undefined || !user.name) || (user.surname == undefined || !user.surname) || 
    (user.email == undefined || !user.email) || (user.nick == undefined || !user.nick) || 
    (user.password == undefined || !user.password)){
        print(messages.add.no_param, messages.add.log.no_param, 0);
        cb();
    }else{
        MongoClient.connect(url).then((client) => {      
        
            /* Crear un nuevo callback llamado _cb que hace lo mismo */
            /* que el cb normal pero también cierra la conexión */       
            _cb = function (err, res) {        
                client.close();        
                cb(err, res);      
            }
    
             /* Crea la conexión a la base de datos */
            let db = client.db(database);      
            let users = db.collection(colecciones.users);   
            
            /* Revisamos con FindOne un1 valor con el <email> y <password> en la base de datos */
            /* Para revisar si el usuario insertado ya existe en la Database */
            /* En caso de no existir creamos uno nuevo y si existe devolver error */
            users.findOne({$or:[{ email: user.email },{ nick: user.nick }] })
                .then((_user) => { 
                    /* Si existe, Tenemos que devolver el callback avisando de que ya existe */
                    /* Para ello vamos a mandarle un usuario undefined y haremos una comprobación posterior para evitar lanzar un error */ 
                    if(_user){ 
                        if (_user.email == user.email) print(messages.add.email_exists, (messages.add.log.user_exists.replace("%email%",user.email).replace("%nick%",user.nick)), 0);
                        else if (_user.nick == user.nick) print(messages.add.nick_exists, (messages.add.log.user_exists.replace("%email%",user.email).replace("%nick%",user.nick)), 0);
                        _cb(null); 
                    }       
                    /* Si no existe, hay que crear el usuario y devolverlo por el callback */
                    else {            
                        user.following = []; 
                        /* Ejecuta insertOne para crear e insertar el usuario en la base de datos */        
                        users.insertOne(user).then(result => {              
                            _cb(null, {                
                                id: result.insertedId.toHexString(), name: user.name,                 
                                surname: user.surname, email: user.email, nick: user.nick              
                            });            
                        }).catch(err => {              
                            _cb(err)            
                        });          
                    }        
                }).catch(err => {          
                    _cb(err)        
                });      
        }).catch(err => {          
            _cb(err)        
        });
    }   
}

/*            Función para Listar Usuarios              */
/*        -----------------------------------           */
/* Esta función sirve para listar a todos los usuarios  */
/*         de la base de datos de la aplicación         */
/*                 Requiere un <token>                  */
/*    Se pueden especificar <opts> que son opciones.    */
/*    Devuelve un <cb> con el resultado. Que indica     */
/*        la lista de usuarios que hemos listado        */

function listUsers(token, opts, cb) {  
    MongoClient.connect(url).then(client => {  

        /* Crear un nuevo callback llamado _cb que hace lo mismo */
        /* que el cb normal pero también cierra la conexión */  
        _cb = function (err, res) {      
            client.close();      
            cb(err, res);    
        }   

        /* Creamos la conexión a la base de datos */ 
        let db = client.db(database);    
        let users = db.collection(colecciones.users);    

        /* Utilizamos findOne para encontrar en la base de datos el usuario que está ejecutando la consulta */
        /* Si el usuario está en la base de datos es una consulta válida y procedemos a buscar la query */
        users.findOne({ _id: new mongodb.ObjectId(token) })
        .then(_user => {      
            if (!_user) {
                print(messages.list.no_logged, (messages.list.log.no_logged_token.replace("%token%",token)),0);
                _cb(null);  
            }else {        
                // adapt query  
                 
                let _query = opts.q || {};        
                for (let key in _query) {          
                    if (Array.isArray(_query[key])) _query[key] = { $in: _query[key] };        
                }        
                // adapt options        
                let _opts = {};        
                if (opts.ini) _opts.skip = opts.ini;        
                if (opts.count) _opts.limit = opts.count;        
                if (opts.sort) _opts.sort = [[opts.sort.slice(1), (opts.sort.charAt(0) == '+' ? 1 : -1)]];  
                
                /* Busca en la base de datos la query seleccionada */ 
                users.find(_query, _opts).toArray()
                .then(_results => {          
                    let results = _results.map((user) => {            
                        return {              
                            id: user._id.toHexString(), name: user.name,              
                            surname: user.surname, email: user.email, nick: user.nick            
                        };          
                    });          
                    _cb(null, results);        
                }).catch(err => {          
                    _cb(err)        
                });      
            }    
        }).catch(err => {      
            _cb(err)    
        });  
    }).catch(err => {    
        cb(err);  
    }); 
}

// Mensaje de info para los mensajes informativos. >> Color azul.
function info(message){
    console.log('\x1b[34m[Info]\x1b[0m ' + message);
}

// Mensaje de éxitos para los resultados correctos. >> Color verde.
function success(message){
    console.log('\x1b[32m[Éxito]\x1b[0m ' + message);
}

// Mensaje de error para los resultados erróneos. >> Color rojo.
function error(message){
    //console.log('\x1b[31m%s\x1b[0m',message);
    console.log('\x1b[31m[Error]\x1b[0m ' + message);
}

// Mensaje de LOG para los resultados erróneos. >> Color rojo y cursiva.
function log(message){
    console.log('\x1b[90m%s\x1b[0m','[LOG] \x1b[3m'+message+'\x1b[0m');
}

function print(message, logMessage, color){
    switch(color){
        case 0: error(message);
        break;
        case 1: success(message);
        break;
        case 2: info(message);
        break;
    }
    log(logMessage);
}


module.exports = {
    addUser,    
    login,    
    listUsers
}