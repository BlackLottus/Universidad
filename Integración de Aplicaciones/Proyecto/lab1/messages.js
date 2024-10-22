
/*                 Archivo de MENSAJES                  */
/*           -------------------------------            */
/*  En este archivo encontrarás todos los mensajes de   */
/*      forma global de la aplicación Twitter Lite      */

prompt = "\x1b[34m[TW Lite]\x1b[0m : "
login = {
    log : {
        invalid_credentials : "Registrando autentificación fallida para el email: <%email%> y password: <%password%>",
        no_email_or_pass : "Autentificación fallida por falta del parámetro <email> o <password>.",
        user_join : "Acaba de acceder a la plataforma el usuario <%user%> con email: <%email%>",
    },
    invalid_credentials : ">> El usuario o la contraseña especificados no existen en nuestra base de datos.",
    no_email : ">> Necesitas especificar un email. \x1b[33mComando\x1b[0m: \x1b[32mlogin\x1b[0m -e \x1b[32m<email>\x1b[0m -p \x1b[32m<password>\x1b[0m ",
    no_password : ">> Debes introducir una contraseña. \x1b[33mComando\x1b[0m: \x1b[32mlogin\x1b[0m -e \x1b[32m<email>\x1b[0m o \x1b[32m<password>\x1b[0m.",
    welcome : ">> Bievenido a Twitter %user%"
} 


modify = {
    log : {
        cancel_add_no_param : "La creación del usuario se ha anulado debido a que falta algún parámetro obligatorio.",
        user_exists : "La creación / modificación del usuario se ha anulado debido a que ya existe un usuario registrado con email <%email%> o nick <%nick%> en la base de datos.",
        user_added : "La aplicación ha registrado a un nuevo usuario con email <%email%> y nick <%nick%> en la base de datos.",
        user_updated : "La aplicación ha registrado a cambio en los datos del usuario con email <%email%> y nick <%nick%> y se ha aplicado en la base de datos.",
    },
    no_param : ">> Se ha cancelado la acción para el usuario porque faltan parámetros.",
    no_name : ">> Se ha cancelado la acción para el usuario porque falta el parámetro <nombre>",
    no_surname : ">> Se ha cancelado la acción para el usuario porque falta el parámetro <apellido>",
    no_email : ">> Se ha cancelado la acción para el usuario porque falta el parámetro <email>",
    no_password : ">> Se ha cancelado la acción para el usuario porque falta el parámetro <password>",
    no_nick : ">> Se ha cancelado la acción para el usuario porque falta el parámetro <nick>",
    email_exists : ">> Ya existe un usuario en nuestra base de datos ese email registrado.",
    nick_exists : ">> Ya existe un usuario en nuestra base de datos con ese nick registrado.",
    user_registered : ">> ¡Enhorabuena! te has registrado correctamente en Twitter.",
    user_updated : ">> Has actualizado tus datos de usuario.",
}

list = {
    log : {
        no_logged_token : "El sistema ha rechazado una petición de listar usuarios por token inválido: <%token%>",
    },
    no_logged : "Para poder ejecutar este comando tienes que loguearte en Twitter Lite.",
}

menu =
`
==================
  MENÚ PRINCIPAL 
==================

\x1b[33m1.\x1b[0m \x1b[32mlistUsers\x1b[0m -q \x1b[32m<query>\x1b[0m -i \x1b[32m<init>\x1b[0m -c \x1b[32m<count>\x1b[0m
\x1b[33m2.\x1b[0m \x1b[32mupdateUser\x1b[0m -n \x1b[32m<name>\x1b[0m -s \x1b[32m<surname>\x1b[0m -e \x1b[32m<email>\x1b[0m -p \x1b[32m<password>\x1b[0m -i \x1b[32m<nick>\x1b[0m
\x1b[33m3.\x1b[0m \x1b[32mlistFollowing\x1b[0m -n \x1b[32m<name>\x1b[0m -s \x1b[32m<surname>\x1b[0m -e \x1b[32m<email>\x1b[0m -p \x1b[32m<password>\x1b[0m -i \x1b[32m<nick>\x1b[0m
\x1b[33m4.\x1b[0m \x1b[32mlistFollowers\x1b[0m -n \x1b[32m<name>\x1b[0m -s \x1b[32m<surname>\x1b[0m -e \x1b[32m<email>\x1b[0m -p \x1b[32m<password>\x1b[0m -i \x1b[32m<nick>\x1b[0m
\x1b[33m5.\x1b[0m \x1b[32mfollow\x1b[0m -n \x1b[32m<name>\x1b[0m -s \x1b[32m<surname>\x1b[0m -e \x1b[32m<email>\x1b[0m -p \x1b[32m<password>\x1b[0m -i \x1b[32m<nick>\x1b[0m
\x1b[33m6.\x1b[0m \x1b[32munfollow\x1b[0m -n \x1b[32m<name>\x1b[0m -s \x1b[32m<surname>\x1b[0m -e \x1b[32m<email>\x1b[0m -p \x1b[32m<password>\x1b[0m -i \x1b[32m<nick>\x1b[0m
\x1b[33m7.\x1b[0m \x1b[32mhelp\x1b[0m - Mostrar el menú de ayuda.
\x1b[33m8.\x1b[0m \x1b[32mexit\x1b[0m - Cerrar la aplicación.

`;

login_menu =
`
Bienvenido a la Aplicación de Twitter Lite.

Comandos Disponibles :

\x1b[33m1.\x1b[0m \x1b[32mlogin\x1b[0m -e \x1b[32m<email>\x1b[0m -p \x1b[32m<password>\x1b[0m
\x1b[33m2.\x1b[0m \x1b[32maddUser\x1b[0m -n \x1b[32m<name>\x1b[0m -s \x1b[32m<surname>\x1b[0m -e \x1b[32m<email>\x1b[0m -p \x1b[32m<password>\x1b[0m -i \x1b[32m<nick>\x1b[0m
\x1b[33m3.\x1b[0m \x1b[32mhelp\x1b[0m - Mostrar el menú de ayuda.
\x1b[33m4.\x1b[0m \x1b[32mexit\x1b[0m - Cerrar la aplicación.

`;

module.exports = {
    login, modify, list, menu, login_menu, prompt
}