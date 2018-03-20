# cat16's Discord Bot Core
A bot core designed to cover all basic needs
## Features
 - A dynamic command handler with a lot of featrues on its own
 - A dynamic event handler for [eris client events](https://abal.moe/Eris/docs/Client)
 - A database manager to make storing data easy and efficient
 - A custom logger to make output pretty and readable
 - A (not yet externally dynamic) config system for things like the token
 - Very extendable feature such as an abstract handler class
 - Some preloaded commands to make internal systems managable and testing easier
 - Typescript support
## Dependancies
 - [eris](https://github.com/abalabahaha/eris) for a discord API
 - [sqlite3](https://github.com/mapbox/node-sqlite3) for databases
 - [chalk](https://github.com/chalk/chalk) for colors!
 - [readline-sync](https://github.com/anseki/readline-sync) for easy console input
## Quick Creation Guide
In order to get started, you're going to want to make a folder within your project to store all of the bot files.
Inside, you should have a main file that creates and starts a bot, which should look something like this:
```js
const Catbot = require('cat16-bot-core')
let bot = new Catbot(__dirname)
bot.start()
```
All you have to do then is run it using node and everything else needed should be generated.
