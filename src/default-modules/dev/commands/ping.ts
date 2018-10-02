import { Command, CommandContext, CommandConstructionData } from '../../..'

export default class extends Command {
  constructor(data: CommandConstructionData) {
    super(data, {
      name: 'ping'
    })
  }
  run(data: CommandContext) {
    let now = new Date()
    data.say('Ping: loading...').then(sent => {
      let then = new Date()
      sent.edit(`Ping: ${then.getTime() - now.getTime()}ms`)
    })
  }
  hasPermission(): boolean {
    return true
  }
}