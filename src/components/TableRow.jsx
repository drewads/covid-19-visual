const React = require('react');

function TableElement(props) {
    return (
        <td className='newInfoTableElement'>
            <div>{props.content}</div>
        </td>
    );
}

function TableCol(props) {
    return (
        <tr className={props.rowClass}>
            <TableElement content={props.content[0]}/>
            <TableElement content={props.content[1]}/>
            <TableElement content={props.content[2]}/>
        </tr>
    );
}

module.exports = TableCol;