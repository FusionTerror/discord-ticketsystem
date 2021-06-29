const Ticket = require('./models/ticket');
const Reactor = require('./models/reactor');
const GuildSettings = require('./models/guildSettings');
const mongoose = require('mongoose');

module.exports = {
    createReactor: async (message) => {
        if (!message) throw new TypeError(`Discord.js <message> was not passed into the function.`);
        const reactor = {};
        let currentReactor = await Reactor.findOne({ guildID: message.guild.id });
        if (!currentReactor) {
            await message.channel.send(`> React with :ticket: to create a ticket!`)
                .then(async sentMessage => {
                    sentMessage.react('🎫');
                    reactor.messageID = sentMessage.id;
                });
            currentReactor = await new Reactor({
                _id: mongoose.Types.ObjectId(),
                reactorID: reactor.messageID,
                guildID: message.guild.id,
                createdAt: Date.now()
            }).then(async () => await currentReactor.save());
        } else {
            await Reactor.findOneAndDelete({ _id: currentReactor._id });
            await message.channel.send(`> React with :ticket: to create a ticket!`)
                .then(async sentMessage => {
                    sentMessage.react('🎫');
                    reactor.messageID = sentMessage.id;
                });
            currentReactor = await new Reactor({
                _id: mongoose.Types.ObjectId(),
                reactorID: reactor.messageID,
                guildID: message.guild.id,
                createdAt: Date.now()
            }).then(async () => await currentReactor.save());
        }
    },

    createTicket: async (user, guild) => {
        if (!user) throw new TypeError(`A user was not passed into the function.`);
        if (!guild) throw new TypeError(`A guild was not passed into the function.`);
        const ticket = {};
        let currentTicket = await Ticket.findOne({ guildID: guild.id, creatorID: user.id });
        const guildSettingsProfile = await this.fetchGuild(guild);
        if (!currentTicket) {
            if (!await guild.roles.fetch(guildSettingsProfile.ticketAccessRole)) {
                await guild.channels.create(`ticket-${user.id}`, {
                    type: 'text',
                    permissionOverwrites: [
                        {
                            id: guild.roles.everyone.id,
                            deny: ['VIEW_CHANNEL']
                        },
                        {
                            id: user.id,
                            allow: ['VIEW_CHANNEL']
                        }
                    ],
                }).then(newChannel => {
                    ticket.channelID = newChannel.id
                    newChannel.send(`:wave: ${user}, this is your ticket! Discuss your issues here while you wait for someone to assit you.`);
                });
            } else {
                const ticketRole = await guild.roles.fetch(guildSettingsProfile.ticketAccessRole);
                await guild.channels.create(`ticket-${user.id}`, {
                    type: 'text',
                    permissionOverwrites: [
                        {
                            id: guild.roles.everyone.id,
                            deny: ['VIEW_CHANNEL']
                        },
                        {
                            id: ticketRole.id,
                            allow: ['VIEW_CHANNEL']
                        },
                        {
                            id: user.id,
                            allow: ['VIEW_CHANNEL']
                        }
                    ],
                }).then(newChannel => {
                    ticket.channelID = newChannel.id
                    newChannel.send(`:wave: ${user}, this is your ticket! Discuss your issues here while you wait for someone to assit you. ${await guild.roles.fetch(guildSettingsProfile.ticketAccessRole)}`);
                });
            }
            currentTicket = await new Ticket({
                _id: mongoose.Types.ObjectId(),
                creatorID: user.id,
                channelID: ticket.channelID,
                guildID: guild.id,
                createdAt: Date.now()
            }).then(async () => await currentTicket.save());
        } else {
            if (!guild.channels.cache.get(currentTicket.channelID)) {
                await Ticket.findOneAndDelete({ _id: currentTicket._id });
                if (!await guild.roles.fetch(guildSettingsProfile.ticketAccessRole)) {
                    await guild.channels.create(`ticket-${user.id}`, {
                        type: 'text',
                        permissionOverwrites: [
                            {
                                id: guild.roles.everyone.id,
                                deny: ['VIEW_CHANNEL']
                            },
                            {
                                id: user.id,
                                allow: ['VIEW_CHANNEL']
                            }
                        ],
                    }).then(newChannel => {
                        ticket.channelID = newChannel.id
                        newChannel.send(`:wave: ${user}, this is your ticket! Discuss your issues here while you wait for someone to assit you. React with :lock: to close.`)
                            .then(sentMessage => {
                                sentMessage.react('🔒');
                                ticket.sentMessage = sentMessage.id;
                            });
                    });
                } else {
                    const ticketRole = await guild.roles.fetch(guildSettingsProfile.ticketAccessRole);
                    await guild.channels.create(`ticket-${user.id}`, {
                        type: 'text',
                        permissionOverwrites: [
                            {
                                id: guild.roles.everyone.id,
                                deny: ['VIEW_CHANNEL']
                            },
                            {
                                id: ticketRole.id,
                                allow: ['VIEW_CHANNEL']
                            },
                            {
                                id: user.id,
                                allow: ['VIEW_CHANNEL']
                            }
                        ],
                    }).then(newChannel => {
                        ticket.channelID = newChannel.id
                        newChannel.send(`:wave: ${user}, this is your ticket! Discuss your issues here while you wait for someone to assit you. React with :lock: to close. ${await guild.roles.fetch(guildSettingsProfile.ticketAccessRole)}`)
                            .then(sentMessage => {
                                sentMessage.react('🔒');
                                ticket.sentMessage = sentMessage.id;
                            });
                    });
                }
                currentTicket = await new Ticket({
                    _id: mongoose.Types.ObjectId(),
                    creatorID: user.id,
                    channelID: ticket.channelID,
                    closeMessageID: ticket.sentMessage,
                    guildID: guild.id,
                    createdAt: Date.now()
                }).then(async () => await currentTicket.save());
            } else await user.send(`:wave: Hey, you already have a ticket in ${guild.name}. No need to make another one, you can discuss your issue here: ${guild.channels.cache.get(currentTicket.channelID)}`);
        }
    },

    deleteTicket: async (ticket, guild) => {
        if (!ticket) throw new TypeError(`A ticket was not passed into the function.`);
        if (!guild) throw new TypeError(`A guild was not passed into the function.`);
        const channel = await guild.channels.cache.get(ticket.channelID);
        if (channel) await channel.delete(`Ticket Closed.`);
        await Ticket.findOneAndDelete({ _id: ticket._id });
    },

    checkReaction: async (messageReaction, user) => {
        if (!user) throw new TypeError(`A user was not passed into the function.`);
        if (!messageReaction) throw new TypeError(`A messageReaction was not passed into the function.`);
        if (user.bot) return;
        const guildSettingsProfile = await this.fetchGuild(messageReaction.message.guild);
        const currentReactor = await this.fetchReactor(messageReaction.message.guild);
        let currentTicket = await this.fetchTicket(messageReaction.message.guild, user);
        if (currentReactor && currentReactor.reactorID == messageReaction.message.id && messageReaction.emoji.name === "🎫") {
            await this.createTicket(user, messageReaction.message.guild);
        } else if (currentTicket && currentTicket.channelID == messageReaction.message.channel.id && messageReaction.message.id == currentTicket.closeMessageID && messageReaction.emoji.name === "🔒") {
            await this.deleteTicket(currentTicket, messageReaction.message.guild);
        }
    },

    ticketURL: async (url) => {
        if (!url) throw new TypeError(`A url was not passed into the function.`);
        mongoose.Promise = global.Promise;
        await mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false
        }).catch(err => console.error(err));
    },

    fetchGuild: async (guild) => {
        let guildSettingsProfile = await GuildSettings.findOne({ guildID: guild.id });
        if (!guildSettingsProfile) {
            guildSettingsProfile = await new GuildSettings({
                _id: mongoose.Types.ObjectId(),
                guildID: guild.id,
                createdAt: Date.now()
            }).then(async () => await guildSettingsProfile.save());
            return guildSettingsProfile;
        } else return guildSettingsProfile;
    },

    fetchReactor: async (guild) => {
        let currentReactor = await Reactor.findOne({ guildID: guild.id });
        if (!currentReactor) return false;
        else return currentReactor;
    },

    fetchTicket: async (guild, user) => {
        let currentTicket = await Ticket.findOne({ guildID: guild.id, creatorID: user.id });
        if (!currentTicket) return false;
        else return currentTicket;
    },
};