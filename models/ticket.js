const mongoose = require('mongoose');
const ticketSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId(),
    creatorID: String,
    channelID: String,
    closeMessageID: String,
    guildID: String,
    createdAt: String
});
module.exports = mongoose.model('Ticket', ticketSchema, 'tickets');