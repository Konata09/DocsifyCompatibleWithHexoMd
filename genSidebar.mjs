import fs from 'fs';
const fsPromises = fs.promises;

const infoRe = /^---[\r\n](.|[\r\n])*[\r\n]---[\r\n]/;
const titleRe = /title:\s?(.*)/;
const categoryRe = /categories:\s?[\r\n]+\s+-\s(.*)/;
const dateRe = /date:\s?(.*)/;
const perfix = '';

let catalog = new Map();

async function walkPath(path) {
    let fileList = await fsPromises.readdir(path, { encoding: 'utf8', withFileTypes: true });
    return new Promise(async (resolve) => {
        await Promise.all(fileList.map(async (dirent) => {
            if (dirent.isDirectory())
                await walkPath(path + '/' + dirent.name);
            else if (dirent.name.endsWith('.md'))
                await lookIntoFile(path.slice(2) ? path.slice(2) + '/' + dirent.name : dirent.name);
        }))
        resolve();
    })
}

async function lookIntoFile(path) {
    let data = await fsPromises.readFile(path, 'utf-8')
    return new Promise((resolve) => {
        if (data.match(infoRe))
            try {
                let mdInfo = data.match(infoRe)[0];
                let mdTitle = mdInfo.match(titleRe)[1];
                let mdCategory = mdInfo.match(categoryRe)[1];
                // let mdDate = mdInfo.match(dateRe)[1];
                if (!catalog.has(mdCategory)) {
                    let map = new Map();
                    catalog.set(mdCategory, map);
                }
                catalog.get(mdCategory).set(mdTitle, path);
            } catch (e) {
                console.log('WARN: This file does not contain title or category data, will be dropped in sidebar: ' + path);
            }
        else
            console.log('INFO: Not a Hexo markdown file: ' + path);
        resolve();
    })
}

function writeSidebar() {
    let string = new String();
    catalog.forEach((value, key) => {
        string = string.concat(`* ${key}\n\n`);
        value.forEach((v, k) => {
            string = string.concat(`  * [${k}](${perfix ? perfix + '/' : ''}${v})\n`);
        });
        string = string.concat('\n');
    })
    return fsPromises.writeFile('_sidebar.md', string);
}

function sortMap(map) {
    map.forEach((value, key) => { map.set(key, new Map([...value].sort())) });
    let mapAsc = new Map([...map].sort());
    return mapAsc;
}

export async function docsifyGenSidebar(path = '.') {
    await walkPath(path);
    catalog = sortMap(catalog)
    writeSidebar();
}
docsifyGenSidebar();