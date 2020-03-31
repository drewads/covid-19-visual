const React = require('react');
const State = require('./State.jsx');

function Document(props) {

    const assembleStates = (recentData) => {
        const states = [];

        for (const state of recentData) {
            states.push(<State key={state.name} data={state}/>);
        }

        return states;
    }

    return (
        <div className='document'>
            <div className='headerName'>
                COVID-19 Data Visualization for US States
            </div>
            <div className='headerDescription'>
                Note: the data used for this site is compiled by the New York Times. It can be found on
                <span>{' '}</span>
                <a href='https://github.com/nytimes/covid-19-data' about='blank' className='inline-link'>
                    Github
                </a>.
                The data and plots on this site are updated automatically within an hour of
                every new data update.
            </div>
            {assembleStates(props.recentData)}
        </div>
    );
}

module.exports = Document;