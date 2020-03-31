const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');
const crypto = require('crypto');

'use strict';

const hashFile = (oldPath) => {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash('sha256');

        const stream = fs.createReadStream(oldPath);

        stream.on('readable', () => {
            const chunk = stream.read();

            if (chunk) {
                hash.update(chunk);
            } else {
                const oldParsed = path.parse(oldPath);
                const newPath = `${oldParsed.dir}/${oldParsed.name}_${hash.digest('hex')}${oldParsed.ext}`;
                
                fsPromises.rename(oldPath, newPath)
                .then(() => resolve(newPath))
                .catch((error) => reject(error));
            }
        });

        stream.on('error', (error) => {
            reject(error);
        });
    });
}

const hashFiles = async (paths) => {
    let caughtError = null;
    const unhashed = [];
    const hashed = [];

    for (const path of paths) {
        try {
            hashed.push(await hashFile(path));
        } catch (error) {
            if (!caughtError) {
                caughtError = error;
            }
            unhashed.push(path);
        }
    }

    if (caughtError) {
        throw { code: caughtError.code,
                message: `The following files were not content hashed:\n${unhashed.toString()}`,
                stack: caughtError.stack };
    }

    return hashed;
}

exports.hashFile = hashFile;
exports.hashFiles = hashFiles;