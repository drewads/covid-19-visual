const https = require('https');
const path = require('path');
const fs = require('fs');
const fsPromises = fs.promises;
const child_process = require('child_process');
const email = require(path.join(__dirname, 'email.js'));
require('@babel/register');
const pageRender = require(path.join(__dirname, '../src/index.jsx'));

const getNewData = (url) => {
    return new Promise(resolve => {
        https.get(url, (response) => {
            let data = [];
            
            response.on('data', (chunk) => {
                data.push(chunk);
            });

            response.on('end', () => {
                resolve(Buffer.concat(data).toString());
            });
        });
    });
}

const checkDiff = async (file, newData) => {
    try {
        const currData = await fsPromises.readFile(file, {encoding: 'utf-8'});
        return newData !== currData;
    } catch (error) {
        throw error;
    }
}

const runVisualizer = () => {
    return new Promise((resolve, reject) => {
        // change for deploy: python3 on raspbian, pythonw on macos
        child_process.exec('pythonw plot-states.py', {cwd: __dirname}, (error, stdout, stderr) => {
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
    return {name: stateData[0], data: dataArray};
}

const getDataArray = async () => {
    // turn recent file into js object
    const recentDataFile = path.join(__dirname, '../data/recent-state-data.csv');

    try {
        const recentData = await fsPromises.readFile(recentDataFile, {encoding: 'utf-8'});
        const stateArray = recentData.split('\n');
        const dataArray = new Array(stateArray.length);
        for (let i = 0; i < dataArray.length; i++) {
            dataArray[i] = getStateData(stateArray[i]);
        }
        return dataArray;
    } catch (error) {
        throw error;
    }
}

const rerenderPage = async () => {
    const renderDest = path.join(__dirname, '../dist/index.html');

    try {
        const dataArray = await getDataArray();
        await fsPromises.writeFile(renderDest, pageRender.getPage(dataArray));
        return;
    } catch (error) {
        throw error;
    }
}

exports.revisualizeData = async () => {
    const stateUrl = 'https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-states.csv';
    const stateData = await getNewData(stateUrl);
    const writeLoc = path.join(__dirname, '../data/us-states.csv');
    
    try {
        if (await checkDiff(writeLoc, stateData)) {
            await fsPromises.writeFile(writeLoc, stateData);
            await runVisualizer();
            await rerenderPage();
            email.notify('covid-19-visual Visuals Updated', 'There has been a data and plots update.');
        }
    } catch (error) {
        console.log(error.message);
        const subject = 'An Error Has Occurred on the covid-19-visual Server';
        const message = `Error code: ${error.code}\n${error.stack}`;
        email.notify(subject, message);
    }
}