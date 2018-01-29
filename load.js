// TODO: implement logging system or make this a class

const fs = require('fs')
const path = require('path')

/**
 * @param {string} source
 * @return {boolean}
 */
let isFile = source => fs.lstatSync(source).isFile()

/**
 * gets all files in a directory
 * @param {string} directory
 * @return {string[]}
 */
let getFiles = (directory) => {
  let files = fs.readdirSync(directory).map(name => path.join(directory, name)).filter(isFile)
  for (let file in files) {
    files[file] = files[file].slice(directory.length + 1)
  }
  return files
}

let log = msg => {
  console.log(`[load.js] ${msg}`)
}

let load = (directory, generateNew) => {
  if (!fs.existsSync(directory)) {
    if (generateNew) fs.mkdirSync(directory)
    else return null
  }

  let obj = {}
  for (let file of getFiles(directory)) {
    if (file.endsWith('.js')) {
      try {
        obj[file.slice(0, -3)] = require(`${directory}/${file}`)
        delete require.cache[require.resolve(`${directory}/${file}`)]
      } catch (ex) {
        log(`Failed to load file '${file}'! : ${ex.stack}`)
      }
    }
  }
  return obj
}

module.exports = load
