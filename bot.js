const Eris = require('eris')
const { CommandOptions, Message } = require('eris')
const fs = require('fs')
const readline = require('readline-sync')
const load = require('./load.js')

class Config {
    /**
     * @param {String} token 
     * @param {String} ownerID
     */
    constructor(token, ownerID, defaultPrefix) {
        this.token = token
        this.ownerID = ownerID
        this.defaultPrefix = defaultPrefix
    }
}

class Catbot {

    /**
     * @param {String} directory
     */
    constructor(directory) {
        this.directory = directory
    }

    load() {
        this.log('loading...')
        this.config = this.getConfig()
        this.tools = load(`${this.directory}/tools`)
        this.client = new Eris.CommandClient(this.config.token, {}, {owner: this.config.ownerID, prefix: this.config.defaultPrefix})
        let events = load(`${this.directory}/events`)
        for (let event in events) {
            if (events[event] instanceof Function) this.client.on(event, (data) => {
                events[event](data, this)
            })
            else this.log(`Could not load event '${event}': No function was exported`)
        }
        /**@type {Command[]} */
        let commands = load(`${this.directory}/commands`)
        for (let cmd in commands) {
            let command = commands[cmd](this)
            this.client.registerCommand(command.name, (msg, args) => {
                command.prepare(this)
                command.run(msg, args, this)
            }, command.options)
        }
        this.loaded = true
        this.log('loaded.')
    }

    connect() {
        if (this.loaded) {
            this.log('connecting...')
            this.client.on('ready', () => {
                this.log('connected.')
            })
            this.client.connect()
        } else {
            throw new Error('Bot could not connect: Bot not loaded!')
        }
    }

    /**
     * @return {Config}
     */
    getConfig() {
        let CONFIG_FILE = 'config.json'
        let neededConfig = new Config()
        if (!fs.existsSync(`${this.directory}/${CONFIG_FILE}`)) {
            this.log('No config file detected!\nCreating new config file...')
            let config = neededConfig
            for (let key in config) {
                config[key] = readline.question(this.getLogString(`Enter ${key}:`))
            }
            fs.writeFileSync(`${this.directory}/${CONFIG_FILE}`, JSON.stringify(config, null, '\t'))
            this.log('Config file generated')
            return config
        } else {
            let config = require(`${this.directory}/${CONFIG_FILE}`)
            for(let key in neededConfig){
                if(config[key] == null){
                    this.log(`No ${key} found in config!`)
                    config[key] = readline.question(this.getLogString(`Enter ${key}:`))
                }
            }
            return config
        }
    }

    /**
     * generates the string `log(msg)` outputs
     * @param {string} msg 
     * @return {string}
     */
    getLogString(msg){
        return `[bot] ${msg}`
    }

    /**
     * logs a message to the console
     * @param {string} msg 
     */
    log(msg) {
        console.log(this.getLogString(msg))
    }
}

let Command = class Command {

    /**
     * @param {String} name 
     * @param {function(Message, String[], Catbot)} run
     * @param {CommandOptions} [options] 
     */
    constructor(name, run, options){
        this.name = name
        this.run = run
        this.options = options
    }

    /**
     * @param {Catbot} bot 
     */
    prepare(bot){
        this.bot = bot
    }

    /**
     * logs a message
     * @param {string} msg 
     */
    log(msg) {
        this.bot.log(`[Command:${this.name}] ${msg}`)
    }
}

let test = new Command('', (msg, args) => {}, {})

Catbot.Command = Command
module.exports = Catbot