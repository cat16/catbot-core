# cat16's Discord Bot Core

A bot core designed to cover all basic needs

## Features

- A customizable command handler with a relatively simple way to add commands
- An event handler for [discord.js client events](https://discord.js.org/#/docs/main/stable/class/Client)
- A database interface that lets you use any database with the bot
- A custom logger to make output pretty and readable
- Core commands to manage modules
- It's written in Typescript

## Quick Creation Guide

In order to get started, you're going to want a main file that creates and starts a bot, which should look something like this:

```ts
import { Bot } from "cat16-bot-core";
let bot = new Bot(__dirname);
bot.start();
```

All you have to do then is run it using node and everything else needed should be generated or prompted.
