const Eris = require('eris')
const { CommandOptions, Message } = require('eris')
const fs = require('fs')
const load = require('./load.js')

class Config {
    /**
     * @param {String} token 
     * @param {String} ownerId 
     */
    constructor(token, ownerId) {
        this.token = token
        this.ownerId = ownerId
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
        this.client = new Eris.CommandClient(this.config.token)
        let events = load(`${this.directory}/events`)
        for (let event in events) {
            if (events[event] instanceof Function) this.client.on(event, (data) => {
                events[event](data, this);
            })
            else this.log(`Could not load event '${event}': No function was exported`)
        }
        /**@type {Command[]} */
        let commands = load(`${this.directory}/commands`)
        for (let command in commands) {
            this.client.registerCommand(command, (msg, args) => {commands[command].run.(msg, args)})
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
        if (!fs.existsSync(`${this.directory}/${CONFIG_FILE}`)) {
            this.log('No config file detected!\nCreating new config file...')
            let config = new Config()
            const readline = require('readline-sync')
            for (let key in config) {
                config[key] = readline.question(`Enter ${key}:`)
            }
            fs.writeFileSync(`${this.directory}/${CONFIG_FILE}`, JSON.stringify(config, null, '\t'))
            this.log('Config file generated')
            return config
        } else {
            return require('./config.json')
        }
    }

    log(msg) {
        console.log(`[bot] ${msg}`)
    }
}

let Command = class Command extends Eris.Command {

    /**
     * @typedef {Function} RunFunction
     * @param {Message} msg
     * @param {String[]} args
     * @param {Catbot} bot
     * @abstract
     */

    /**
     * @param {String} name 
     * @param {RunFunction} run
     * @param {CommandOptions} [options] 
     */
    constructor(name, run, options){
        super(name, run, options)
        this.name = name
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