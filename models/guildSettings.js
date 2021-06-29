const mongoose = require('mongoose');
const guildSettingsSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId(),
    ticketAccessRole: { type: String, required: false },
    guildID: String,
    createdAt: String
});
module.exports = mongoose.model('GuildSettings', guildSettingsSchema, 'guild-settings');