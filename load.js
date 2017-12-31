import fs from 'fs'
import path from 'path'

/**
 * @param {string} source 
 * @return {boolean}
 */
let isFile = source => fs.lstatSync(source).isFile()

/**
 * gets all files in a directory
 * @param {string} source 
 * @return {string[]}
 */
let getFiles = (source) => {
    if(source.startsWith('.')) source = source.substring(1)
    const path = `${__dirname}/../${source}`
    let files = fs.readdirSync(path).map(name => path.join(path, name)).filter(isFile)
    for (let file in files) {
        files[file] = files[file].slice(__dirname.length - 5 + source.length)
    }
    return files
}

let log = msg => {
    console.log(`[load.js] ${msg}`)
}

let load = (directory) => {

    if(!fs.existsSync(directory)){
        fs.mkdirSync(directory)
    }

    let obj = {}
    for(let file of getFiles(directory)){
        if(file.endsWith('.js')) {
            try {
                obj[file.slice(0, -3)] = require(`${directory}/${file}`)
            } catch (ex) {
                log(`Failed to load file '${file}'! : ${ex}`)
            }
        }
    }
    return obj
}

module.exports = load;