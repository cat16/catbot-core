import chalk from 'chalk'
import { requireDirectory, pathExists, createDirectory, DirectoryContents, loadFile } from '../util/util'
import Logger from '../util/logger'
import Catbot from '../bot'

export abstract class Element {
  abstract getTriggers(): string[]
}

export abstract class RecursiveElement extends Element {

  private manager?: ElementManager<this>
  private elements: ElementManager<this>

  constructor(manager?: ElementManager<this>) {
    super()
  }

  getElements(): ElementManager<this> {
    return this.elements
  }

  getManager(): ElementManager<this> {
    return this.manager
  }
}

export class ElementData<T extends Element> {
  element: T
  path: string
  constructor(element: T, path: string) {
    this.element = element
    this.path = path
  }
}

export interface ElementMatch<T extends Element> {
  data: ElementData<T>
  remaining: string
  manager: ElementManager<T>
  index: number
}

export class ElementManager<T extends Element> {

  private parent?: RecursiveElement
  private name: string
  private elementData: ElementData<T>[]

  constructor(parent?: RecursiveElement) {
    this.elementData = []
    this.parent = parent
  }

  add(element: T, path: string): void {
    this.elementData.push(new ElementData(element, path))
  }

  remove(index: number): ElementData<T> {
    return this.elementData.splice(index, 1)[0]
  }

  set(index: number, data: ElementData<T>): ElementData<T> {
    return this.elementData.splice(index, 1, data)[0]
  }

  find(trigger: string): ElementMatch<T> {
    for(let i = 0; i < this.elementData.length; i++) {
      let element = this.elementData[i].element
      let triggerFound = element.getTriggers().find(t => trigger.startsWith(t))
      if (triggerFound) {
        let r = trigger.slice(triggerFound.length)
        if(element instanceof RecursiveElement) {
          let match = element.getElements().find(r)
          if(match) return match
        }
        return {
          data: this.elementData[i],
          remaining: r,
          manager: this,
          index: i
        }
      }
    }
    return null
  }

  clear(): void {
    this.elementData = []
  }

  load(recursive: boolean): void {
    let path: string = this.name
    if(this.parent && this.parent.getManager()) {
      path = `${this.parent.getManager().name}/${path}`
    }
    let loadedDir = requireDirectory(path, recursive)
    loadedDir.files.forEach((ElementClass, name) => {
      try {
        let element: T = new ElementClass()
        if(element instanceof T) {
          this.add(element, `${path}/${name}`)
        }
      } catch (err) {
        
      }
    })
    if (recursive) {
      
    }
  }

  getParent(): RecursiveElement {
    return this.parent
  }
}

export interface LoadOptions<T extends Element> {
  recursive?: boolean
  generateFolders?: boolean
  manager?: ElementManager<T>
}

export interface LoadedDirectory<T extends Element> {
  path: string
  options: LoadOptions<T>
}

export abstract class ElementHandler<T extends Element> {

  logger: Logger
  manager: ElementManager<T>
  elementName: string
  loadedDirectories: LoadedDirectory<T>[]

  constructor(logger: Logger, elementName: string, recursive: boolean = false) {
    this.logger = logger
    this.manager = new ElementManager()
    this.elementName = elementName
    this.loadedDirectories = []
  }

  loadDirectory(path: string, options: LoadOptions<T> = {}): void {
    options.manager = options.manager || this.manager
    options.generateFolders = options.generateFolders || false
    if (options.generateFolders && !pathExists(path)) createDirectory(path)
    let loadedDir = requireDirectory(path, options.recursive)
    loadedDir.files.forEach((element, file) => {
      options.manager.add(element, `${path}/${file}`)
    })
    if(options.recursive) {
      loadedDir.directories.forEach((dir, name) => {
        let match = this.manager.find(name)
        let manager: ElementManager<T>
        if (match && match.data.element instanceof RecursiveElement) {
          manager = match.data.element.getManager()
        } else {
          manager = 
        }
        this.loadDirectory(`${path}/${name}`, {
          recursive: true,
          generateFolders: options.generateFolders,
          manager: manager
        })
      })
    }
    loadedDir.errors.forEach((err, file) => {
      this.logger.error(`Could not load ${this.elementName} from file '${file}': ${err.stack}`)
    })
    this.loadedDirectories.push({
      path: path,
      options: options
    })
  }

  reload(): void {
    this.logger.info(`Reloading ${this.elementName}s...`)
    this.manager.clear()
    for (let directory of this.loadedDirectories) {
      this.loadDirectory(directory.path, directory.options)
    }
    this.logger.success(`Successfully reloaded all ${this.elementName}s.`)
  }

  loadElement(name: string) {

  }

  reloadElement(trigger: string): boolean {
    let reload = (path): void => {
      try {
        let element: T = loadFile(path)
        this.elements = this.elements.filter(e => !e.equals(element))
        this.add(element, path)
        this.logger.info(`Successfully reloaded file for ${this.elementName} '${element.getName()}'`)
      } catch (err) {
        this.logger.error(`Failed to reload file for ${this.elementName} at '${path}': ${err.stack}`)
        throw err
      }
    }

    let match = this.manager.find(trigger)
    if(match) {
      match.manager.set(match.index)
    }

    this.logger.info(`Attemping to reload ${this.elementName} '${name}'...`)
    let result = this.find(name)
    if (result) {
      let element = loadFile(result.data.path)
    }
    if (result !== null) {
      let path = result.element.path
      reload(path)
      return true
    } else {
      for (let directory of this.loadedDirectories) {
        let path = `${directory.path}/${name}`
        if (pathExists(path)) {
          reload(path)
          return true
        }
      }
      return false
    }
  }
}

export class FlatElementHandler extends ElementHandler {

  constructor() {

  }

}
