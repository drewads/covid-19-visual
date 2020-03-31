const React = require('react');
const ReactDOMServer = require('react-dom/server');
const Document = require('./components/Document.jsx');
const path = require('path');
const fsPromises = require('fs').promises;

const sha256Len = 64;

const getFilenamesForDir = async (files, dir) => {
    let filesInDir;

    try {
        filesInDir = await fsPromises.readdir(dir);
    } catch (error) {
        throw error;
    }

    const hashedFiles = {};
    
    files.forEach(searchFile => {
        const decFile = path.parse(searchFile);
        const fileRegex = new RegExp(`^${decFile.name}_\\w{${sha256Len},${sha256Len}}\\${decFile.ext}$`);

        filesInDir.forEach(fileFromDir => {
            if (fileRegex.test(fileFromDir)) {
                hashedFiles[searchFile] = fileFromDir;
            }
        });
    });
    
    return hashedFiles;
}

async function getPage(recentData) {
    const distFiles = ['favicon.png', 'styles.css'];
    const distDir = path.join(__dirname, '../dist');

    let hashedFiles;
    try {
        hashedFiles = await getFilenamesForDir(distFiles, distDir);
    } catch (error) {
        throw error;
    }
    
    return ReactDOMServer.renderToStaticMarkup(
        <html>
            <head>
                <title>COVID-19 Data Visualization</title>
                <link rel="icon" type="image/png" href={'./' + hashedFiles['favicon.png']} sizes="64x64"></link>
                <link rel='stylesheet' href={'./' + hashedFiles['styles.css']}></link>
            </head>
            <body>
                <div id='root'>
                    <Document recentData={recentData}/>
                </div>
            </body>
        </html>
    );
}

exports.getPage = getPage;