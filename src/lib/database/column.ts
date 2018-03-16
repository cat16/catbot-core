export interface ColumnOptions {
  name: string
  value: any
}

export class Column {

  name: string
  value: any

  constructor (options: ColumnOptions) {
    this.name = options.name
    this.value = options.value
  }
}

export interface ColumnInfoOptions {
  name: string
  type: string
  unique?: boolean
}

export class ColumnInfo {

  name: string
  type: string
  unique: boolean

  constructor (options: ColumnInfoOptions) {
    this.name = options.name
    this.type = options.type
    this.unique = options.unique || false
  }
}
