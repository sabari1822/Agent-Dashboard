const mongoose= require('mongoose');

const Employeeschema= new mongoose.Schema({
  email: String,
  password: String
})

const Employeemodel= mongoose.model("employees",Employeeschema)
module.exports= Employeemodel