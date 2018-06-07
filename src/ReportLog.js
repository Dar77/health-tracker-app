import React from 'react';

const ReportLog = ({list}) => {

	return (
		<div className="report-results">
			<ul className="report-list">
			    {list}
			</ul>
		</div>
	)
}

export default ReportLog;