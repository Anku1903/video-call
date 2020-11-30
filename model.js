const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const videouser = new Schema({
    name: {type: String,required: true,unique: true},
    uuid: {type: String,required: true},
    password: {type: String,required: true}
},{timestamps: true});
const Vuser = mongoose.model('Vuser',videouser);
module.exports = Vuser;