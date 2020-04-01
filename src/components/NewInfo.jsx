const React = require('react');
const TableRow = require('./TableRow.jsx');

function NewInfo(props) {
    const rowContent = (rows) => {
        const tableRows = [];

        for (let row = 0; row < rows; row++) {
            tableRows.push(<TableRow key={`${props.name}${row}`} rowClass=''
                            content={[props.data[row].date, props.data[row].newCases, props.data[row].newDeaths]}
                            />);
        }

        return tableRows;
    }

    return (
        <div className='newInfoTableWrapper'>
            <table className='newInfoTable'>
                <thead>
                    <tr>
                        <th colSpan='3' className='newInfoTableHeader'>{props.name}: Last Three Days of Data</th>
                    </tr>
                </thead>
                <tbody>
                    <TableRow rowClass='newInfoTableColumnLabels' content={['Date', 'New Cases', 'New Deaths']}/>
                    {rowContent(3)}
                </tbody>
            </table>
        </div>
    );
}

module.exports = NewInfo;