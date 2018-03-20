import chalk from 'chalk'

import * as fs from 'fs'

import load from './util/load'
import Logger from './util/logger'
import Catbot from './bot'

export interface Directory {
  path: string
  generateFolders: boolean
  isDefault: boolean
}

export interface Element {
  fileName: string
  getAllElements(includeEmpty?: boolean): Element[]
  path: string
  isDefault: boolean
}

export interface ElementSearchResult<T extends Element> {
  element: T
  content: string
}

export type ElementFunc<T extends Element> = (Catbot) => T

export default abstract class Handler<T extends Element> {

  bot: Catbot
  logger: Logger
  elements: T[]
  loadDirs: Directory[]
  elementName: string

  constructor(bot: Catbot, logger: Logger, elementName: string) {
    this.bot = bot
    this.logger = logger
    this.elements = []
    this.loadDirs = []
    this.elementName = elementName
  }

  addDir(directory: string, generateFolders: boolean, isDefault: boolean) {
    this.loadDirs.push({ path: directory, generateFolders, isDefault })
  }

  abstract push(element: T): Promise<void>
  abstract find(content: string): ElementSearchResult<T>

  add(element: T, path: string, isDefault: boolean = false): Promise<void> {
    let fileName = path.split('/').pop().split('.')[0]
    element.getAllElements(true).forEach(e => {
      e.path = path
      e.fileName = fileName
      if (isDefault) e.isDefault = true
    })
    return this.push(element)
  }

  reload(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      this.logger.info(`Reloading ${this.elementName}s...`)
      this.elements = []
      let loadedDirs = 0

      let dirCheck = () => {
        loadedDirs++
        if (loadedDirs === this.loadDirs.length) {
          this.logger.success(`Successfully reloaded all ${this.elementName}s.`)
          resolve()
        }
      }

      for (let dir of this.loadDirs) {
        let elementFuncs: ElementFunc<T>[] = load(dir.path, dir.generateFolders)
        if (elementFuncs == null) {
          loadedDirs++
          continue
        }
        let unloaded = 0
        let loaded = 0
        let totalLoaded = 0

        let elementCheck = () => {
          if (loaded === unloaded) {
            this.logger.info(`Loaded ${chalk.magenta(`${totalLoaded} ${this.elementName}${totalLoaded === 1 ? '' : 's'}`)} from ${chalk.gray(dir.path)}`)
            dirCheck()
          }
        }

        if (Object.keys(elementFuncs).length === 0) {
          dirCheck()
        } else {
          for (let elementFunc in elementFuncs) {
            unloaded++
            let element = elementFuncs[elementFunc](this.bot)
            this.add(element, `${dir.path}/${elementFunc}`, dir.isDefault).then(() => {
              loaded++
              totalLoaded += element.getAllElements(false).length
              elementCheck()
            }, (err) => {
              this.logger.error(`Could not load ${this.elementName} from file '${elementFunc}': ${err.stack}`)
              unloaded--
              elementCheck()
            })
          }
        }
      }
    })
  }

  reloadElement(name: string): Promise<void> {
    let reload = (path, isDefault) => {
      return new Promise(async (resolve, reject) => {
        let element: T
        try {
          let required = require(path)
          element = required.default !== undefined ? required.default(this.bot) : required(this.bot)
        } catch (err) {
          reject(err)
          return
        }
        delete require.cache[require.resolve(path)]
        this.elements = this.elements.filter(e => e !== element)
        this.add(element, path, isDefault).then(() => {
          this.logger.info(`Successfully reloaded file for ${this.elementName} '${element.fileName}'`)
          resolve()
        }, err => {
          this.logger.error(`Failed to reload file for ${this.elementName} '${element.fileName}': ${err.stack}`)
          reject(err)
        })
      })
    }

    return new Promise(async (resolve, reject) => {
      this.logger.info(`Attemping to reload ${this.elementName} '${name}'...`)
      let result = this.find(name)
      if (result !== null) {
        let path = result.element.path
        return reload(path, result.element.isDefault).then(() => { resolve() }, reject)
      } else {
        for (let dir of this.loadDirs) {
          let path = `${dir.path}/${name}`
          if (fs.existsSync(path)) {
            try {
              /** @type {Command} */
              return reload(path, dir.isDefault).then(() => { resolve() }, reject)
            } catch (ex) {
              return reject(new Error(`Could not reload ${this.elementName} '${name}':\n\`\`\`js\n${ex.stack}\n\`\`\``))
            }
          }
        }
        reject(new Error(`:x: No ${this.elementName} named '${name}' found`))
      }
    })
  }
}
