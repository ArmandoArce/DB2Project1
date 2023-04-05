const express = require('express');
const mysql = require('mysql'); 
const app = express();

// Crear conexión a la base de datos
const connection = mysql.createConnection({
  host: 'localhost', // Cambiar si tu base de datos está en otro host
  user: 'root', // Usuario
  password: '1234', // Contraseña
  database: 'ge' // Nombre de tu base de datos
});

// Usar la conexión para conectar a la base de datos
connection.connect((err) => {
  if (err) {
    console.error('Error al conectar a la base de datos: ' + err.stack);
    return;
  }
  console.log('Conexión a la base de datos establecida con el ID: ' + connection.threadId);
});

// --------------------------------- Funciones ---------------------------------

// Función para actualizar la contraseña en la base de datos
function updatePassword(userID, currentPassword, newPassword) {
  return new Promise((resolve, reject) => {
    connection.query(
      'CALL updatePassword(?, ?, ?)', [userID, currentPassword, newPassword],
      (error, results) => {
        if (error) {
          reject(error);
        } else {
          const message = results[0][0].message;
          resolve(message);
        }
      }
    );
  });
}


// Función para insertar un nuevo usuario en la base de datos
function insertNewUser(tIDUsers, tName, tLastName, tPassword, tUserType, tBirthday) {
  const query = `CALL insertNewUser(${tIDUsers}, '${tName}', '${tLastName}', '${tPassword}', '${tUserType}', '${tBirthday}')`;
  connection.query(query, function(error, results, fields) {
      if (error) throw error;
      console.log('Nuevo usuario insertado con éxito.');
  });
}

// Función para hacer SELECT con un id específico
const getUserById = (id, callback) => {
  const query = `SELECT * FROM users WHERE id_users = ?`;
  connection.query(query, [id], (err, rows) => {
    if (err) {
      console.error('Error al realizar SELECT en la base de datos: ' + err.stack);
      callback(err, null);
      return;
    }
    callback(null, rows);
  });
};

// Función para hacer deleto con un id específico
const deleteUser = (id, callback) => {
  const query = `DELETE from users where id_users = ?`;
  connection.query(query, [id], (err, rows) => {
    if (err) {
      console.error('Error al realizar DELETE en la base de datos: ' + err.stack);
      callback(err, null);
      return;
    }
    callback(null, rows);
  });
};

// Ejemplo de uso de la función checkPassword
function checkPassword(idToCheck, passwordToCheck, callback) {
  const query = 'SELECT checkPassword(?, ?) AS result';
  connection.query(query, [idToCheck, passwordToCheck], (error, results, fields) => {
      if (error) throw error;
      const result = results[0].result;
      callback(result);
  });
}

// Función getUserType
function getUserType(idToCheck, callback) {
  const query = 'SELECT getUserType(?) AS result';
  connection.query(query, [idToCheck], (error, results, fields) => {
      if (error) throw error;
      const result = results[0].result;
      callback(result);
  });
}

// Función isAdmin
function isAdmin(idToCheck, callback) {
  const query = 'SELECT isAdmin(?) AS result';
  connection.query(query, [idToCheck], (error, results, fields) => {
      if (error) throw error;
      const result = results[0].result;
      callback(result);
  });
}

// Función isUser
function isUser(idToCheck, callback) {
  const query = 'SELECT isUser(?) AS result';
  connection.query(query, [idToCheck], (error, results, fields) => {
      if (error) throw error;
      const result = results[0].result;
      callback(result);
  });
}


// --------------------------------- Prueba de funciones ---------------------------------
// getUserById con usuario existente
getUserById(615464189, (err, rows) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log('Resultado del SELECT: ', JSON.stringify(rows, null, 2));
  console.log(''); // borrar SALTO DE LINEA
});


// getUserById con usuario no existente
getUserById(340678901, (err, rows) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log('Resultado del SELECT: ', JSON.stringify(rows, null, 2));
  console.log(''); // borrar SALTO DE LINEA
});


// Insert del usuario
insertNewUser(103406789, 'John', 'Doe', 'mypassword', 'user', '1990-01-01');
console.log(''); // borrar SALTO DE LINEA


// getUserById del nuevo usuario
getUserById(103406789, (err, rows) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log('Resultado del SELECT: ', JSON.stringify(rows, null, 2));
  console.log(''); // borrar SALTO DE LINEA
})

// Comprobando la contraseña del usuario 615464189 - Siendo la correcta
checkPassword(615464189, 'e^UjU97p#B#m', (result) => {
  console.log('Resultado de checkPassword correcta:', result);
  console.log(''); // borrar SALTO DE LINEA
});

// Comprobando la contraseña del usuario 615464189 - Siendo incorrecta
checkPassword(615464189, 'passwordnt', (result) => {
  console.log('Resultado de checkPassword incorrecta:', result);
  console.log(''); // borrar SALTO DE LINEA
});

// Get de userType
getUserType(615464189, (result) => {
  console.log('Resultado de getUserType:', result);
  console.log(''); // borrar SALTO DE LINEA
});

isAdmin(615464189, (result) => {
  console.log('Resultado de isAdmin:', result);
  console.log(''); // borrar SALTO DE LINEA
});

isUser(615464189, (result) => {
  console.log('Resultado de isUser:', result);
  console.log(''); // borrar SALTO DE LINEA
});

// borrando el usuario nuevo 
deleteUser(103406789, (err, rows) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log('Resultado del DELETE: ', JSON.stringify(rows, null, 2));
  console.log(''); // borrar SALTO DE LINEA
})



// actualizado contraseña de 615464189
updatePassword(615464189, 'e^UjU97p#B#m','nuevapass')
  .then(message => {
    if (message === '1') {
      console.log('Contraseña actualizada exitosamente');
      console.log(''); // borrar SALTO DE LINEA
    } else {
      console.log('Contraseña incorrecta');
      console.log(''); // borrar SALTO DE LINEA
    }
  })
  .catch(error => {
    console.error('Error al actualizar la contraseña:', error);
  });


// Cerrar conexión a la base de datos al finalizar la aplicación
process.on('exit', () => {
  connection.end();
});