const readline = require("readline"); 
const minimist = require("minimist"); 
const messages = require("./messages"); 
const model_rest = require("./model_rest"); 
const model_mongo = require("./model_mongo");

// Lista de comandos para autocompletar
const commands = ['exit', 'listUsers', 'login', 'addUser', 'updateUser', 'deleteUser', 'listFollowing', 'listFollowers', 
    'follow', 'unfollow', 'addTweet', 'addRetweet', 'listTweets', 'like', 'dislike'];

const rl = readline.createInterface({    
    input: process.stdin,    
    output: process.stdout,
    completer: (line) => {
        // Filtrar comandos que comienzan con el texto ingresado
        const hits = commands.filter((cmd) => cmd.startsWith(line));
        
        // Mostrar todas las opciones si no hay coincidencia exacta
        return [hits.length ? hits : commands, line];
      }
}); 

rl.setPrompt(messages.prompt); 
console.log(messages.login_menu);
rl.prompt(); 
rl.on("line", line => {   
    if(line){
        let args = minimist(fields = line.match(/'[^']*'|\S+/g));
        menu(args, () => {        
            rl.prompt();    
        }); 
    } else rl.prompt(); 
});

let token, user;

function menu(args, cb) {    
    if (!args._.length || args._[0] == "") cb();   
    else {         
        if(token !== undefined){  /* Lista de comandos que podremos ejecutar cuando el usuario esté logueado y tenga un Token */
            switch (args._[0]) { 
                case "updateUser": /* Comando: updateUser -n <nombre> -s <surname> -e <email> -p <password> -i <nick> */ 
                    /* Mostramos la ayuda del comando con el parámetro --help */
                    if(args.help != undefined){ console.log(messages.help.update); cb(); break;  } 

                    // Validar que al menos un argumento sea proporcionado
                    if (!args.n && !args.s && !args.e && !args.p && !args.i) {
                        print(messages.cmd.updateUser.no_param, 0);
                        cb();
                        break;
                    } 

                    /* Crea el usuario <newUserData> con lo valores proporcionados en el comando */
                    const newUserData = { name: args.n, surname: args.s, email: args.e, password: args.p, nick: args.i }; 
                   
                    model_rest.updateUser(token, newUserData, (err, res) =>{ /* Llama a la función updateUser() del Model */
                        if(err){
                            if (err.response && err.response.data) console.log(err.response.data); // Mensaje de error del servidor
                            else  console.log(err.message); // Errores que no vienen del servidor
                            cb();
                        }else{
                            print((messages.cmd.updateUser.success.replace("%nick%", res.nick)), 1);
                            if(user.nick != res.nick) rl.setPrompt("\x1b[1m\x1b[33m"+res.nick + "\x1b[0m : "); // Cambiamos el Prompt.
                            user = res; // Reajustamos el usuario.
                            cb();
                        }                                    
                    })
                break;
                case "listUsers": /* Comando: listUsers -q <query> -i <init> -c <count> */
                    /* Mostramos la ayuda del comando con el parámetro --help */
                    if(args.help != undefined){ console.log(messages.help.listUsers); cb(); break;  } 

                    // Llama al método del Model para listar a los Usuarios.
                    model_rest.listUsers(token, args, (err, res) => {
                        if(err) {
                            if (err.response && err.response.data) console.log(err.response.data); // Mensaje de error del servidor
                            else  console.log(err.message); // Errores que no vienen del servidor
                        }
                        else console.table(res);
                        cb();
                    })
                break;
                case "deleteUser": /* Comando: deleteUser --id <userID> */
                     /* Mostramos la ayuda del comando con el parámetro --help */
                     if(args.help != undefined){ console.log(messages.help.delete); cb(); break;  } 

                    /* Comprobación de los parámetros. Revisa si existen y no son undefined */
                    if(!args.id || (typeof args.id !== 'string' || args.id.trim() === '')){  
                        print(messages.cmd.deleteUser.no_id, 0); cb(); break;  
                    }
                    /* Comprobar también si el ID introducido tiene 24 números */
                    if(args.id.length !== 24){ print(messages.cmd.deleteUser.no_length, 0); cb(); break;   }

                    /* Tenemos los parámetros correctamente entonces le pasamos el método */
                    model_rest.deleteUser(token, args.id, (err,res) =>{
                        if(err) {
                            if (err.response && err.response.data) console.log(err.response.data); // Mensaje de error del servidor
                            else  console.log(err.message); // Errores que no vienen del servidor
                        }
                        else {
                            if(token == res){
                                print(messages.cmd.deleteUser.success_own, 1);
                                user = undefined; token = undefined;
                                rl.setPrompt(messages.prompt); 
                                console.log(messages.login_menu);
                            }else print(messages.cmd.deleteUser.success.replace("%userID%", res), 1);
                        }
                        cb(); 
                    });
                break;
                case "follow": /* Comando: follow -id <userID> */
                     /* Mostramos la ayuda del comando con el parámetro --help */
                     if(args.help != undefined){ console.log(messages.help.follows); cb(); break;  } 

                    /* Comprobación de los parámetros. Revisa si existen y no son undefined */
                    if(!args.id || (typeof args.id !== 'string' || args.id.trim() === '')){  print(messages.cmd.follow.no_id, 0);  cb(); break;  }
                    /* Comprobar también si el ID introducido tiene 24 números */
                    if(args.id.length !== 24){ print(messages.cmd.follow.no_length, 0); cb(); break;   }

                    /* Tenemos los parámetros correctamente entonces le pasamos el método */
                    model_rest.follow(token, args.id, (err,res) =>{
                        if(err) console.log(err.message);
                        else print(messages.cmd.follow.success.replace("%nick%",res.nick), 1);
                        cb(); 
                    });
                break;
                case "unfollow": /* Comando: unfollow -id <userID> */
                    /* Mostramos la ayuda del comando con el parámetro --help */
                    if(args.help != undefined){ console.log(messages.help.follows); cb(); break;  } 

                    /* Comprobación de los parámetros. Revisa si existen y no son undefined */
                    if(!args.id || (typeof args.id !== 'string' || args.id.trim() === '')){  print(messages.cmd.unfollow.no_id, 0);  cb(); break;  }
                    /* Comprobar también si el ID introducido tiene 24 números */
                    if(args.id.length !== 24){ print(messages.cmd.unfollow.no_length, 0); cb(); break;   }

                    /* Tenemos los parámetros correctamente entonces le pasamos el método */
                    model_rest.unfollow(token, args.id, (err, res) =>{
                        if(err) console.log(err.message);
                        else print(messages.cmd.unfollow.success.replace("%nick%",res.nick), 1);
                        cb(); 
                    });
                break;
                case "listFollowing": /* Comando: listFollowing -q <query> -i <init> -c <count> */
                    /* Mostramos la ayuda del comando con el parámetro --help */
                    if(args.help != undefined){ console.log(messages.help.listFollowing); cb(); break;  } 

                    // Llama al método del Model para listar a los Followings.
                    model_rest.listFollowing(token, args, (err, res) => {
                        if(err) {
                            if (err.response && err.response.data) console.log(err.response.data); // Mensaje de error del servidor
                            else  console.log(err.message); // Errores que no vienen del servidor
                        }
                        else console.table(res);
                        cb();
                    })
                break;
                case "listFollowers": /* Comando: listFollowers -q <query> -i <init> -c <count> */
                    /* Mostramos la ayuda del comando con el parámetro --help */
                    if(args.help != undefined){ console.log(messages.help.listFollowers); cb(); break;  } 

                    // Llama al método del Model para listar a los Followers.
                    model_rest.listFollowers(token, args, (err, res) => {
                        if(err) {
                            if (err.response && err.response.data) console.log(err.response.data); // Mensaje de error del servidor
                            else  console.log(err.message); // Errores que no vienen del servidor
                        }
                        else console.table(res);
                        cb();
                    })  
                break;
                case "addTweet": /* Comando: addTweet -c <content> */
                    /* Mostramos la ayuda del comando con el parámetro --help */
                    if(args.help != undefined){ console.log(messages.help.addTweet); cb(); break;  } 

                    /* Comprobación de los parámetros. Revisa si existen y no son undefined */

                    if(!args.c || (typeof args.c !== 'string' || args.c.trim() === '')){ print(messages.cmd.addTweet.no_content, 0); cb(); break; }

                    // Llama al método del Model para añadir el Tweet.
                    model_rest.addTweet(token, args.c, (err, res) => {
                        if(err) {
                            if (err.response && err.response.data) console.log(err.response.data); // Mensaje de error del servidor
                            else  console.log(err.message); // Errores que no vienen del servidor
                        }
                        else print(messages.cmd.addTweet.success, 1);
                        cb();
                    })  
                break;
                case "addRetweet": /* Comando: addRetweet --id <tweetID> */
                    /* Mostramos la ayuda del comando con el parámetro --help */
                    if(args.help != undefined){ console.log(messages.help.addRetweet); cb(); break;  } 

                    /* Comprobación de los parámetros. Revisa si existen y no son undefined */
                    if(!args.id || (typeof args.id !== 'string' || args.id.trim() === '')){  print(messages.cmd.addRetweet.no_id, 0);  cb(); break;  }
                    /* Comprobar también si el ID introducido tiene 24 números */
                    if(args.id.length !== 24){ print(messages.cmd.addRetweet.no_length, 0); cb(); break;   }
                    // Llama al método del Model.
                    model_rest.addRetweet(token, args.id, (err, tw) => {
                        if(err) console.log(err.message);
                        else print(messages.cmd.addRetweet.success.replace("%nick%",tw.owner.nick), 1);
                        cb();
                    })  
                break;
                case "listTweets": /* Comando: listTweets -q <query> -i <init> -c <count> */
                    /* Mostramos la ayuda del comando con el parámetro --help */
                    if(args.help != undefined){ console.log(messages.help.listTweets); cb(); break;  } 

                    // Llama al método del Model para listar los Tweets.
                    model_rest.listTweets(token, args, (err, res) => {
                        if(err) {
                            if (err.response && err.response.data) console.log(err.response.data); // Mensaje de error del servidor
                            else  console.log(err.message); // Errores que no vienen del servidor
                        }
                        else console.table(res);
                        cb();
                    })  
                break;
                case "like": /* Comando: like --id <tweetID> */
                    /* Mostramos la ayuda del comando con el parámetro --help */
                    if(args.help != undefined){ console.log(messages.help.like); cb(); break;  } 

                    /* Comprobación de los parámetros. Revisa si existen y no son undefined */
                    if(!args.id || (typeof args.id !== 'string' || args.id.trim() === '')){  print(messages.cmd.like.no_id, 0);  cb(); break;  }
                    /* Comprobar también si el ID introducido tiene 24 números */
                    if(args.id.length !== 24){ print(messages.cmd.like.no_length, 0); cb(); break;   }
                    // Llama al método del Model.
                    model_rest.like(token, args.id, (err, tw) => {
                        if(err) console.log(err.message);
                        else print(messages.cmd.like.success.replace("%nick%",tw.owner.nick), 1);
                        cb();
                    })  
                break;
                case "dislike": /* Comando: dislike --id <tweetID> */
                    /* Mostramos la ayuda del comando con el parámetro --help */
                    if(args.help != undefined){ console.log(messages.help.dislike); cb(); break;  } 

                    /* Comprobación de los parámetros. Revisa si existen y no son undefined */
                    if(!args.id || (typeof args.id !== 'string' || args.id.trim() === '')){  print(messages.cmd.dislike.no_id, 0);  cb(); break;  }
                    /* Comprobar también si el ID introducido tiene 24 números */
                    if(args.id.length !== 24){ print(messages.cmd.dislike.no_length, 0); cb(); break;   }
                    // Llama al método del Model.
                    model_rest.dislike(token, args.id, (err, tw) => {
                        if(err) console.log(err.message);
                        print(messages.cmd.dislike.success.replace("%nick%",tw.owner.nick) ,1);
                        cb();
                    })  
                break;
                case "logout":
                    if(user) console.log(messages.cmd.exit.logged.replace("%nick%",user.nick));
                    else console.log(messages.cmd.exit.not_logged);
                    user = undefined; token = undefined;
                    rl.setPrompt(messages.prompt); 
                    console.log(messages.login_menu);
                    cb();
                    break; 
                default: /* Muestra el menú principal de ayuda */
                    console.log(messages.menu);
                    cb();
            }
        
        }else{ /* Lista de comandos que podremos ejecutar sin Token. Menú de Login */
            if(rl.prompt != messages.prompt) rl.setPrompt(messages.prompt); 
            switch (args._[0]) {           
                case "login": /* Comando: login -e <email> -p <password> */                   
                    /* Mostramos la ayuda del comando con el parámetro --help */
                    if(args.help != undefined){ console.log(messages.help.login); cb(); break;  }

                    /* Comprobación de los parámetros. Revisa si existen y no son undefined */
                    if (!args.e || (typeof args.e !== 'string' || args.e.trim() === '')){ print(messages.cmd.login.no_email, 0);  cb(); break; }
                    else if(!args.p || (typeof args.p !== 'string' || args.p.trim() === '')){ print(messages.cmd.login.no_password, 0); cb(); break; }
     
                    model_rest.login(args.e, args.p, (err, _token, _user) => { /* Llama al método login del Model */
                        if(err) {
                            if (err.response && err.response.data) console.log(err.response.data); // Aquí se imprime únicamente el mensaje de error del servidor
                            else  console.log(err.message); // Esto maneja errores que no vienen del servidor
                            cb();
                        }
                        else {
                            token = _token; user = _user;
                            print((messages.cmd.login.success.replace("%nick%", _user.nick)), 1);
                            rl.setPrompt("\x1b[1m\x1b[33m"+user.nick + "\x1b[0m : "); 
                            console.log(messages.menu);
                            cb();
                        }
                    })

                break;    
                case "exit":
                    console.log(messages.cmd.exit.not_logged);
                    user = undefined; token = undefined;
                    process.exit(0);
                case "addUser": /* Comando: addeUser -n <nombre> -s <surname> -e <email> -p <password> -i <nick> */
                    /* Mostramos la ayuda del comando con el parámetro --help */
                    if(args.help != undefined){ console.log(messages.help.add); cb(); break;  }
                    
                    /* Comprobación de los parámetros. Revisa si existen y no son undefined */
                    if(!args.n || (typeof args.n !== 'string' || args.n.trim() === '')){ print(messages.cmd.addUser.no_name, 0); cb(); break; }
                    else if(!args.s || (typeof args.s !== 'string' || args.s.trim() === '')){ print(messages.cmd.addUser.no_surname, 0); cb(); break; }
                    else if(!args.e || (typeof args.e !== 'string' || args.e.trim() === '')){ print(messages.cmd.addUser.no_email, 0); cb(); break; }
                    else if(!args.p || (typeof args.p !== 'string' || args.p.trim() === '')){ print(messages.cmd.addUser.no_password, 0); cb(); break; }
                    else if(!args.i || (typeof args.i !== 'string' || args.i.trim() === '')){ print(messages.cmd.addUser.no_nick, 0); cb(); break; }
                    

                    /* Crea el usuario <u> con lo valores proporcionados en el comando */
                    let u = { name: args.n, surname: args.s, email: args.e, password: args.p, nick: args.i };
                    model_rest.addUser(u, (err, res) => { /* Llamada a la función addUser() del Model */
                        /* Comprobación de si el método addUser devuelve un usuario o errores */
                        if(err) {
                            if (err.response && err.response.data) console.log(err.response.data); // Mensaje de error desde el servidor
                            else  console.log(err.message); // Errores que no vienen del servidor                     
                        }else print(messages.cmd.addUser.success , 1); // Imprime mensaje de usuario agregado.
                        cb();   
                    })
                break;
                default: /* Muestra el menú de ayuda de login */
                    console.log(messages.login_menu);
                    cb();
            }
        }
            
    } 
}

function print(message, color){
    switch(color){
        case 0: console.log('\x1b[31m[Error]\x1b[0m ' + message);
        break;
        case 1: console.log('\x1b[32m[Éxito]\x1b[0m ' + message);
        break;
        case 2: console.log('\x1b[34m[Info]\x1b[0m ' + message);
        break;
    }
}

