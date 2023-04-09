const mongoose = require('mongoose');
const startConnection = async function() {
    try{
        await mongoose.connect('mongodb+srv://jota:jota1234@cluster0.4ft9hwi.mongodb.net/?retryWrites=true&w=majority');
        console.log("DATABASE CONNECTED"); 
    } catch(error){
        console.log("Conexión fallida: ", error)
    }
}
module.exports = { startConnection };