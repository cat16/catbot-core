// TODO: if microsoft decides to fix issue 5863 for typescipt change T to this in some places

import { requireDirectory, pathExists, createDirectory, DirectoryContents, loadFile } from '../util/util'
import Logger from '../util/logger'

export interface Element {

  getTriggers(): string[]

}

let isElement = (obj): obj is Element => {
  return 'getTriggers' in obj
}

export type ElementGenerationFunction<T extends Element> = (rawElement: any) => T

export interface RecursiveElement extends Element {

  getSubelements(): ElementManager<this>

}

let isRecursiveElement = (obj): obj is RecursiveElement => {
  return 'getSubelements' in obj && isElement(obj)
}

export class ElementCategory<T extends RecursiveElement> implements Element {

  private elements: ElementManager<T | ElementCategory<T>>
  public triggers: string[]

  constructor(directory: string, generateElement: ElementGenerationFunction<T>) {
    this.elements = new RecursiveElementManager<T>(directory, generateElement, this)
    this.triggers.push(...directory.split('.'))
  }

  getElements(): ElementManager<T | ElementCategory<T>> {
    return this.elements
  }

  getTriggers(): string[] {
    return this.triggers
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

export abstract class ElementManager<T extends Element> {

  private directory: string
  private elementData: ElementData<T>[]
  private recursive: boolean

  constructor(
    directory: string,
    recursive: boolean,
  ) {
    this.directory = directory
    this.elementData = []
    this.recursive = recursive
  }

  add(data: ElementData<T>): void {
    this.getElementData().push(data)
  }

  remove(index: number): ElementData<T> {
    return this.elementData.splice(index, 1)[0]
  }

  set(index: number, data: ElementData<T>)
    : ElementData<T> {
    return this.elementData.splice(index, 1, data)[0]
  }

  find(trigger: string): ElementMatch<T> {
    for (let i = 0; i < this.elementData.length; i++) {
      let element = this.elementData[i].element
      let triggerFound = element.getTriggers().find(t => trigger.startsWith(t))
      if (triggerFound) {
        let r = trigger.slice(triggerFound.length)
        if (isRecursiveElement(element)) {
          let match = element.getSubelements().find(r)
          if (match) return match
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

  abstract loadContents(contents: DirectoryContents): Map<string, Error>

  load(): Map<string, Error> {
    return this.loadContents(requireDirectory(this.getPath(), this.recursive))
  }

  getPath(): string {
    return this.directory
  }

  getElementData(): ElementData<T>[] {
    return this.elementData
  }
}

export class FlatElementManager<T extends Element> extends ElementManager<T> {

  private generateElement: ElementGenerationFunction<T>

  constructor(directory: string, recursive: boolean, generateElement: ElementGenerationFunction<T>) {
    super(directory, recursive)
    this.generateElement = generateElement
  }

  loadContents(contents: DirectoryContents): Map<string, Error> {
    let errors: Map<string, Error> = new Map<string, Error>()
    contents.files.forEach((rawElement, file) => {
      try {
        let element: T = this.generateElement(rawElement)
        this.add(new ElementData<T>(element, `${this.getPath()}/${file}`))
      } catch (err) {
        errors.set(file, err)
      }
    })
    errors = new Map<string, Error>([...errors, ...contents.errors])
    return errors
  }
}

export class RecursiveElementManager<T extends RecursiveElement> extends ElementManager<T | ElementCategory<T>> {

  private generateElement: ElementGenerationFunction<T>
  private parent?: ElementCategory<T>

  constructor(directory: string, generateElement: ElementGenerationFunction<T>, parent?: ElementCategory<T>) {
    super(directory, true)
    this.generateElement = generateElement
    this.parent = parent
  }

  loadContents(contents: DirectoryContents): Map<string, Error> {
    let errors: Map<string, Error> = new Map<string, Error>()
    let rawRecursiveElements: Map<string, any> = new Map<string, any>()
    contents.files.forEach((rawElement, file) => {
      if (!(this.generateElement && contents.directories.get(file))) {
        try {
          let element: T = this.generateElement(rawElement)
          this.add(new ElementData<T>(element, `${this.getPath()}/${file}`))
        } catch (err) {
          errors.set(file, err)
        }
      } else {
        rawRecursiveElements.set(file, rawElement)
        contents.directories.delete(file)
      }
    })
    errors = new Map<string, Error>([...errors, ...contents.errors])
    contents.directories.forEach((contents2, name) => {
      let path = `${this.getPath()}/${name}`
      this.add(new ElementData(new ElementCategory(path, this.generateElement), path))
    })
    rawRecursiveElements.forEach((rawElement, file) => {
      let element = this.generateElement(rawElement)
      this.add(new ElementData<T>(element, `${this.getPath()}/${file}`))
    })
    return errors
  }

  getParent(): ElementCategory<T> {
    return this.parent
  }

  getPath(): string {
    return this.parent
      ? `${this.parent.getElements().getPath()}/${super.getPath()}`
      : super.getPath()
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

export abstract class ElementLoader<T extends Element, MT extends ElementManager<T>> {

  logger: Logger
  manager: MT
  elementName: string
  loadedDirectories: LoadedDirectory<T>[]

  constructor(manager: MT, logger: Logger, elementName: string) {
    this.logger = logger
    this.manager = manager
    this.elementName = elementName
    this.loadedDirectories = []
  }

  loadDirectory(path: string, options: LoadOptions<T> = {}): void {
    options.manager = options.manager || this.manager
    options.generateFolders = options.generateFolders || false
    if (options.generateFolders && !pathExists(path)) createDirectory(path)
    
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
    let match = this.manager.find(trigger)
    if (match) {
      match.manager.set(match.index, match.data.path)
    }

    this.logger.info(`Attemping to reload ${this.elementName} '${name}'...`)
    let result = this.manager.find(name)
    if (result) {
      let element = loadFile(result.data.path)
    }
    if (result !== null) {
      let path = result.data.path
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
