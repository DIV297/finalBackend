const mongoose = require('mongoose')
const connectToMongo=()=>{
mongoose.connect("mongodb+srv://divbajaj297:Divanshbajaj297$@cluster0.nhxzsge.mongodb.net/?retryWrites=true&w=majority/vaccination");
// mongoose.connect("mongodb://localhost:27017/vaccination");
console.log("connected to db");
}
connectToMongo()
module.exports = connectToMongo;



