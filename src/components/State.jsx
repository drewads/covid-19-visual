const React = require('react');
const NewInfo = require('./NewInfo.jsx');

function State(props) {
    return(
        <div className='state'>
            <div className='stateName'>{props.name}</div>
            <img src={`${props.name}Total.png`} alt={`Plot of total COVID-19 cases and deaths in ${props.name}`}></img>
            <img src={`${props.name}New.png`} alt={`Plot of new COVID-19 cases and deaths daily in ${props.name}`}></img>
            <NewInfo name={props.name} data={props.data}/>
        </div>
    );
}

module.exports = State;