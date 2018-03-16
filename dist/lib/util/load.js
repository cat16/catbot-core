"use strict";
// TODO: implement logging system or make this a class
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
let isFile = (source) => fs.lstatSync(source).isFile();
let getFiles = (directory) => {
    let files = fs.readdirSync(directory).map(name => path.join(directory, name)).filter(isFile);
    for (let file in files) {
        files[file] = files[file].slice(directory.length + 1);
    }
    return files;
};
let log = msg => {
    console.log(`[load.js] ${msg}`);
};
function load(directory, generateNew) {
    if (!fs.existsSync(directory)) {
        if (generateNew)
            fs.mkdirSync(directory);
        else
            return null;
    }
    let obj = {};
    for (let file of getFiles(directory)) {
        if (file.endsWith('.js')) {
            try {
                let required = require(`${directory}/${file}`);
                obj[file.slice(0, -3)] = required.default === null ? required : required.default;
                delete require.cache[require.resolve(`${directory}/${file}`)];
            }
            catch (ex) {
                log(`Failed to load file '${file}'! : ${ex.stack}`);
            }
        }
    }
    return obj;
}
exports.default = load;
