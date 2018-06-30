// TODO: if microsoft decides to fix issue 5863 for typescipt change T to this in some places

import { requireDirectory, pathExists, createDirectory, DirectoryContents, loadFile } from '../util/util'

export interface Element {
  getTriggers(): string[]
}

let isElement = (obj): obj is Element => {
  return 'getTriggers' in obj
}

export type ElementGenerationFunction<T extends Element> = (rawElement: any) => T

export interface RecursiveElement extends Element {
  getElementManager(): RecursiveElementLoader<RecursiveElement>
  getParent(): RecursiveElement | null
}

let isRecursiveElement = (obj): obj is RecursiveElement => {
  return (
    'getSubelements' in obj
    && 'getParent' in obj
    && isElement(obj)
  )
}

export class ElementGroup<T extends RecursiveElement> implements RecursiveElement {

  private elementManager: RecursiveElementLoader<T>
  private parent?: RecursiveElement
  public triggers: string[]

  constructor(directory: string, generateElement: ElementGenerationFunction<T>, parent?: RecursiveElement) {
    this.elementManager = new RecursiveElementLoader<T>(directory, generateElement, this)
    this.triggers.push(...directory.split('.'))
    this.parent = parent
  }

  getElementManager(): RecursiveElementLoader<T> {
    return this.elementManager
  }

  getParent(): RecursiveElement {
    return this.parent
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
  manager: ElementLoader<T>
  index: number
}

export abstract class ElementLoader<T extends Element> {

  private directory: string
  private elementData: ElementData<T>[]
  private recursive: boolean

  constructor(
    directory: string,
    recursive: boolean
  ) {
    this.directory = directory
    this.elementData = []
    this.recursive = recursive
  }

  abstract loadContents(contents: DirectoryContents): Map<string, Error>
  abstract generateElement(rawElement: any): T

  add(data: ElementData<T>): void {
    this.elementData.push(data)
  }

  remove(index: number): ElementData<T> {
    return this.elementData.splice(index, 1)[0]
  }

  get(index: number): ElementData<T> {
    return this.elementData[index]
  }

  set(index: number, data: ElementData<T>)
    : ElementData<T> {
    return this.elementData.splice(index, 1, data)[0]
  }

  getAllElements(): T[] {
    return this.elementData.map(d => d.element)
  }

  find(trigger: string): ElementMatch<T> {
    for (let i = 0; i < this.elementData.length; i++) {
      let element = this.elementData[i].element
      let triggerFound = element.getTriggers().find(t => trigger.startsWith(t))
      if (triggerFound) {
        let r = trigger.slice(triggerFound.length).trim()
        if (isRecursiveElement(element) || element instanceof ElementGroup) {
          let match = element.getElementManager().find(r)
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

  load(): Map<string, Error> {
    return this.loadContents(requireDirectory(this.getPath(), this.recursive))
  }

  reloadElement(index: number): boolean {
    let elementData = this.get(index)
    if (elementData == null) return false
    let path = elementData.path
    this.set(
      index,
      new ElementData<T>(
        this.generateElement(
          loadFile(path)
        ), path
      )
    )
  }

  loadElement(file: string, rawElement?: any): boolean {
    let match = this.find(file)
    if (match) {
      return false
    } else {
      if (rawElement == null) {
        if (pathExists(`${this.getPath()}/${file}`)) rawElement = loadFile(`${this.getPath()}/${file}`)
        else return false
      }
      let element: T = this.generateElement(rawElement)
      this.add(new ElementData<T>(element, `${this.getPath()}/${file}`))
      return true
    }
  }

  getDirectory(): string {
    return this.directory
  }

  getPath(): string {
    return `./${this.getDirectory()}`
  }
}

export class FlatElementLoader<T extends Element> extends ElementLoader<T> {

  private generateElementFunc: ElementGenerationFunction<T>

  constructor(directory: string, generateElement: ElementGenerationFunction<T>, recursive: boolean) {
    super(directory, recursive)
    this.generateElementFunc = generateElement
  }

  loadContents(contents: DirectoryContents): Map<string, Error> {
    let errors: Map<string, Error> = new Map<string, Error>()
    contents.files.forEach((rawElement, file) => {
      try {
        this.loadElement(file, rawElement)
      } catch (err) {
        errors.set(file, err)
      }
    })
    errors = new Map<string, Error>([...errors, ...contents.errors])
    return errors
  }

  generateElement(rawElement: any): T {
    return this.generateElementFunc(rawElement)
  }
}

export class RecursiveElementLoader<T extends RecursiveElement> extends ElementLoader<T | ElementGroup<T>> {

  private generateElementFunc: ElementGenerationFunction<T>
  private parent?: ElementGroup<T> | T

  constructor(directory: string, generateElement: ElementGenerationFunction<T>, parent?: ElementGroup<T> | T) {
    super(directory, true)
    this.generateElementFunc = generateElement
    this.parent = parent
  }

  loadContents(contents: DirectoryContents): Map<string, Error> {
    let errors: Map<string, Error> = new Map<string, Error>()
    let rawRecursiveElements: Map<string, any> = new Map<string, any>()
    contents.files.forEach((rawElement, file) => {
      if (!contents.directories.get(file)) {
        try {
          this.loadElement(file, rawElement)
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
      this.add(new ElementData(new ElementGroup(path, this.generateElement), path))
    })
    rawRecursiveElements.forEach((rawElement, file) => {
      this.loadElement(file, rawElement)
    })
    return errors
  }

  generateElement(rawElement: any): T {
    return this.generateElementFunc(rawElement)
  }

  getParent(): ElementGroup<T> | T {
    return this.parent
  }

  getDirectory(): string {
    return this.parent
      ? `${this.parent.getElementManager().getDirectory()}/${super.getDirectory()}`
      : super.getDirectory()
  }
}

export abstract class ElementManager<T extends Element> {

  managers: ElementLoader<T>[]

  constructor() {
    this.managers = []
  }

  addManager(manager: ElementLoader<T>): Map<string, Error> {
    let errors = manager.load()
    this.managers.push(manager)
    return errors
  }

  reload(): Map<string, Error> {
    let errors: Map<string, Error> = new Map<string, Error>()
    for (let manager of this.managers) {
      manager.clear()
      errors = new Map<string, Error>([...manager.load(), ...errors])
    }
    return errors
  }

  getAllElements(): T[] {
    return [].concat(...this.managers.map(m => m.getAllElements()))
  }

  find(trigger: string): ElementMatch<T> {
    let manager = this.managers.find(m => trigger.startsWith(m.getDirectory()))
    if (manager) {
      return manager.find(trigger.slice(manager.getDirectory().length).trim())
    }
    for (let manager of this.managers) {
      let match = manager.find(trigger)
      if (match) return match
    }
    return null
  }

  loadElement(trigger: string): boolean {
    let match = this.find(trigger)
    if (match) {
      if (match.remaining) {
        let element = match.data.element
        let manager = isRecursiveElement(element) || element instanceof ElementGroup
          ? element.getElementManager()
          : match.manager
        return manager.loadElement(match.remaining)
      } else {
        return false
      }
    } else {
      let manager = this.managers.find(m => trigger.startsWith(m.getDirectory()))
      if (manager) {
        return manager.loadElement(trigger.slice(manager.getDirectory().length).trim())
      } else {
        for (let manager of this.managers) {
          if (manager.loadElement(trigger)) return true
        }
        return false
      }
    }
  }

  reloadElement(trigger: string): boolean {
    let match = this.find(trigger)
    if (match) {
      if (match.remaining) {
        return false
      } else {
        match.manager.reloadElement(match.index)
      }
    }
  }
}
