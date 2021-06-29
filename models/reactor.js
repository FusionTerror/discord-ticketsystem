const mongoose = require('mongoose');
const reactorSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId(),
    reactorID: String,
    guildID: String,
    createdAt: String
});
module.exports = mongoose.model('Reactor', reactorSchema, 'reactors');