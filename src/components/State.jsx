const React = require('react');
const NewInfo = require('./NewInfo.jsx');

function State(props) {
    return(
        <div className='state'>
            <div className='stateName'>{props.data.name}</div>
            <img src={props.data.totalPlot} alt={`Plot of total COVID-19 cases and deaths in ${props.data.name}`}></img>
            <img src={props.data.newPlot} alt={`Plot of new COVID-19 cases and deaths daily in ${props.data.name}`}></img>
            <NewInfo name={props.data.name} data={props.data.data}/>
        </div>
    );
}

module.exports = State;