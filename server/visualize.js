const https = require('https');
const path = require('path');
const fs = require('fs');
const fsPromises = fs.promises;
const child_process = require('child_process');
const crypto = require('crypto');
const email = require(path.join(__dirname, '../server/email/email.js'));
require('@babel/register');
const pageRender = require(path.join(__dirname, '../src/index.jsx'));
const contentHash = require(path.join(__dirname, '../server/contentHashing/content-hash.js'));

'use strict';

const getHashOfReadStream = (stream) => {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash('sha256');
        
        stream.on('data', (chunk) => {
            hash.update(chunk);
        });

        stream.on('end', () => {
            resolve(hash.digest('hex'));
        });

        stream.on('error', (error) => {
            reject(error);
        });
    });
}

const fileHash = async (filepath) => {
    try {
        return await getHashOfReadStream(fs.createReadStream(filepath));
    } catch (error) {
        throw error;
    }
}

const remotePageHash = (url) => {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            getHashOfReadStream(response)
            .then(hash => resolve(hash))
            .catch(error => reject(error));
        });
    });
}

const writeRemoteDataToFile = (url, file) => {
    return new Promise((resolve, reject) => {
        const writeStream = fs.createWriteStream(file);

        https.get(url, (response) => {
            response.pipe(writeStream);

            response.on('error', (error) => {
                writeStream.end();
                reject(error);
            })
        });

        writeStream.on('close', () => {
            resolve();
        });

        writeStream.on('error', (error) => {
            writeStream.end();
            reject(error);
        });
    });
}

const runVisualizer = () => {
    return new Promise((resolve, reject) => {
        // python3 on raspbian, pythonw on macos -- also, change cwd to __dirname
        child_process.exec('pythonw plot-states.py', {cwd: path.join(__dirname, '../server/dataAnalysis')}, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}

const getStateData = (line) => {
    const stateData = line.split(',');
    const dataArray = [];
    for (let i = 1; i <= 3; i++) {
        dataArray.push({date: stateData[i], newCases: stateData[i + 3], newDeaths: stateData[i + 6]});
    }
    return {name: stateData[0], data: dataArray,
            totalPlot: `${stateData[0]}Total.png`, newPlot: `${stateData[0]}New.png`};
}

const getDataArray = async () => {
    // turn recent file into js object
    const recentDataFile = path.join(__dirname, '../data/recent-state-data.csv');

    try {
        const recentData = await fsPromises.readFile(recentDataFile, {encoding: 'utf-8'});
        const stateArray = recentData.split('\n');
        return stateArray.map(line => getStateData(line));
    } catch (error) {
        throw error;
    }
}

const contentHashFiles = (dataArray) => {
    return Promise.all(
        dataArray.map(async (state) => {
            try {
                const newTotalPlotPath = await contentHash.hashFile(path.join(__dirname, `../data/plots/${state.totalPlot}`));
                const newNewPlotPath = await contentHash.hashFile(path.join(__dirname, `../data/plots/${state.newPlot}`));
                state.totalPlot = path.basename(newTotalPlotPath);
                state.newPlot = path.basename(newNewPlotPath);
                return state;
            } catch (error) {
                throw error;
            }
        })
    );
}

const rerenderPage = async () => {
    const renderDest = path.join(__dirname, '../dist/index.html');

    try {
        const dataArray = await contentHashFiles(await getDataArray());
        await fsPromises.writeFile(renderDest, await pageRender.getPage(dataArray));
        
        const newPlotNames = new Set();
        for (const state of dataArray) {
            newPlotNames.add(state.totalPlot);
            newPlotNames.add(state.newPlot);
        }
        return newPlotNames;
    } catch (error) {
        throw error;
    }
}

const deleteFiles = async (dir, files) => {
    let caughtError = null;
    const undeleted = [];

    for (const file of files) {
        try {
            await fsPromises.unlink(path.join(dir, file));
        } catch (error) {
            if (!caughtError) {
                caughtError = error;
            }
            undeleted.push(file);
        }
    }

    if (caughtError) {
        throw { code: caughtError.code,
                message: `The following files were not deleted from ${dir}:\n${undeleted.toString()}`,
                stack: caughtError.stack };
    }
}

exports.revisualizeData = async () => {
    const stateUrl = 'https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-states.csv';
    const writeLoc = path.join(__dirname, '../data/us-states.csv');
    
    try {
        if (await fileHash(writeLoc) === await remotePageHash(stateUrl)) return;
        await writeRemoteDataToFile(stateUrl, writeLoc);
        const plotDir = path.join(__dirname, '../data/plots');
        const oldPlots = await fsPromises.readdir(plotDir);
        await runVisualizer();
        const newPlots = await rerenderPage();
        await deleteFiles(plotDir, oldPlots.filter(plot => !newPlots.has(plot)));
        email.notify('covid-19-visual Visuals Updated', 'There has been a data and plots update.');
    } catch (error) {
        console.log(error);
        const subject = 'An Error Has Occurred on the covid-19-visual Server';
        const message = `Code: ${error.code}\nMessage: ${error.message}\n${error.stack}`;
        email.notify(subject, message);
    }
}