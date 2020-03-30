const React = require('react');
const ReactDOMServer = require('react-dom/server');
const Document = require('./components/Document.jsx');

function getPage(recentData) {
    return ReactDOMServer.renderToStaticMarkup(
        <html>
            <head>
                <title>COVID-19 Data Visualization</title>
                <link rel="icon" type="image/png" href="./favicon.png" sizes="64x64"></link>
                <link rel='stylesheet' href='./styles.css'></link>
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