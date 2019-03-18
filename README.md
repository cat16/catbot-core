# cat16's Discord Bot Core
An Eris-based Discord bot core designed to cover all your basic needs!
## Features
 - A dynamic command handler with a lot of features on its own
 - A dynamic event handler for [eris client events](https://abal.moe/Eris/docs/Client)
 - A database manager to make storing data easy and efficient
 - A custom logger to make output pretty and readable
 - A (not yet) externally dynamic config system for things like the token
 - Very extendable feature such as an abstract handler class
 - Some preloaded commands to make internal systems managable and testing easier
 - Typescript support
## Dependencies
 - [eris](https://github.com/abalabahaha/eris) for the Discord API
 - [sqlite3](https://github.com/mapbox/node-sqlite3) for the database system
 - [chalk](https://github.com/chalk/chalk) for colors on the console
 - [readline-sync](https://github.com/anseki/readline-sync) for easy console input
## Quick Creation Guide
- In order to get started, you're going to want to make a folder to store all of the bot files in your project.

- Go to Command Prompt (for Windows) or Bash (for Linux), navigate to the directory, and run ``npm init`` to initialize the project. Follow the prompts to setup your project's name and details.

- Run ``npm install cat16-bot-core`` to install the base dependency - this bot core. 

- Create the base bot file for your project by creating a file in the folder named ``bot.js`` or ``base.js``. Copy and paste the code below into the file, and then save it:
```js
const Catbot = require('cat16-bot-core')
let bot = new Catbot(__dirname)
bot.start()
```
- Run the file using ``node filename.js`` and everything else needed should be automatically generated. You may then continue coding and customizing the bot as you see fit. Happy coding!

Documentation for the core's built in classes and functions may be found in the form of docstrings (real docs coming soon)
