# Discord-TicketSystem 📖
##### *An easy to use ticket system for Discord.js v12 and MongoDB!*
##### 💖 ~ Support: [Fusion Terror's YouTube](https://www.youtube.com/channel/UCjTvZBc6GFbYkVs9rGWJLbA), [Fusion Terror's Patreon](https://www.patreon.com/fusionterror)
##### 🙋‍♂ ~ Help: [Discord Server](https://discord.gg/QJyTkNxVrX)
---
&nbsp;
## ✅ ~ Installation
```
npm i discord-ticketsystem
```
&nbsp;
## ⚙️ ~ Requirements
 ### You **must** have [mongoose](https://www.npmjs.com/package/mongoose) installed in your project.
&nbsp;
## 📝 ~ Features

- Interactive tickets.
- Create and close tickets quickly and effortlessly.
- MongoDB Support
- Discord.js 12 Support
- Discord Server Support
&nbsp;

## 💡 ~ Example
```js
const Discord = require('discord.js'); //Requiring Discord.js module.
const TicketSystem = require('discord-ticketsystem'); //Requiring Discord-TicketSystem module.
const client = new Discord.Client(); //Creating and assigning the Discord.js Client constructor.

TicketSystem.ticketURL(mongoDatabaseURL); //This is where you would pass in your Database connection string. This should only be your code ONCE.

client.on('ready', () => { //Discord.js Ready Event
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => { //Discord.js Message Event
  if (msg.content === '!reactor') {
  	TicketSystem.createReactor(msg); //Creates a ticket reactor allowing users to react and make tickets.
  }
});

client.on('messageReactionAdd', (messageReaction, user) => { //Discord.js Message Reaction Add Event. (This event only checks reactions of cached messages. Therefore, if the bot goes offline you must make a new reactor (using !reactor) when it goes back online.
	TicketSystem.checkReaction(messageReaction, user);
});
```