const React = require('react');

function NewInfo(props) {
    return (
        <div className='newInfoTableWrapper'>
            <table className='newInfoTable'>
                <thead>
                    <tr>
                        <th colSpan='3' className='newInfoTableHeader'>{props.name}: Last Three Days of Data</th>
                    </tr>
                </thead>
                <tbody className='newInfoTableBody'>
                    <tr className='newInfoTableColumnLabels'>
                        <td className='newInfoTableElement'>
                            <div className='newInfoTableElementContent'>Date</div>
                        </td>
                        <td className='newInfoTableElement'>
                            <div className='newInfoTableElementContent'>New Cases</div>
                        </td>
                        <td className='newInfoTableElement'>
                            <div className='newInfoTableElementContent'>New Deaths</div>
                        </td>
                    </tr>
                    <tr>
                        <td className='newInfoTableElement'>
                            <div className='newInfoTableElementContent'>{props.data[0].date}</div>
                        </td>
                        <td className='newInfoTableElement'>
                            <div className='newInfoTableElementContent'>{props.data[0].newCases}</div>
                        </td>
                        <td className='newInfoTableElement'>
                            <div className='newInfoTableElementContent'>{props.data[0].newDeaths}</div>
                        </td>
                    </tr>
                    <tr>
                        <td className='newInfoTableElement'>
                            <div className='newInfoTableElementContent'>{props.data[1].date}</div>
                        </td>
                        <td className='newInfoTableElement'>
                            <div className='newInfoTableElementContent'>{props.data[1].newCases}</div>
                        </td>
                        <td className='newInfoTableElement'>
                            <div className='newInfoTableElementContent'>{props.data[1].newDeaths}</div>
                        </td>
                    </tr>
                    <tr>
                        <td className='newInfoTableElement'>
                            <div className='newInfoTableElementContent'>{props.data[2].date}</div>
                        </td>
                        <td className='newInfoTableElement'>
                            <div className='newInfoTableElementContent'>{props.data[2].newCases}</div>
                        </td>
                        <td className='newInfoTableElement'>
                            <div className='newInfoTableElementContent'>{props.data[2].newDeaths}</div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

module.exports = NewInfo;