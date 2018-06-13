import React from 'react';

const SearchResults = ({results}) => {

	return (
	    <div className="search-results">
	        <ul>
	            {results}
	        </ul>
	    </div>
	);
}

export default SearchResults;
