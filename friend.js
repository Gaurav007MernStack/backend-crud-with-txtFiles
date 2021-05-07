const mongoose = require('mongoose');
const Schema = mongoose.Schema
const filesSchema = new Schema({
    name: String,
    content: String,
})

const Files = mongoose.model("files",filesSchema);

module.exports = Files;
//CRUD OPERATIONS CREATE READ/GET UPDATE DELETE
