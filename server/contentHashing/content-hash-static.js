const path = require('path');
const fs = require('fs');
const fsPromises = fs.promises;
const contentHash = require(path.join(__dirname, 'content-hash.js'));
const staticFiles = require(path.join(__dirname, 'contentHash.config.js'));

const hashStaticFilesInDir = async (dir, targetFiles) => {
    try {
        const filesInDir = await fsPromises.readdir(dir);
        const toHash = filesInDir.filter(file => targetFiles.includes(file));
        const hashed = await contentHash.hashFiles(toHash.map(file => path.join(dir, file)));
        return hashed;
    } catch (error) {
        throw error;
    }
}

const hashStaticFiles = async (staticFiles) => {
    const hashed = [];

    try {
        for (const directory of staticFiles) {
            Array.prototype.push.apply(hashed, await hashStaticFilesInDir(directory.dir, directory.files));
        }
    } catch (error) {
        throw error;
    }

    if (hashed.length > 0) {
        console.log('\x1b[1m\x1b[36m[content-hash-static]\x1b[0m '
                    + `The following files were content hashed:\n${hashed.join('\n')}`);
    } else {
        console.log('\x1b[1m\x1b[36m[content-hash-static]\x1b[0m No files were content hashed.');
    }
}

hashStaticFiles(staticFiles)
.catch(error => {
    throw error;
});