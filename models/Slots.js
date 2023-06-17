const mongoose = require('mongoose')

const SlotsSchema = mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'users'
    },
   name:{
        type:String,
        required:true
    },
    place:{
        type:String,
        required:true
    },
    date:{
        type:Date,
        default:Date.now
    }
});
module.exports=mongoose.model('slots',SlotsSchema)