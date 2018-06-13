import React, { Component } from 'react';

const Logo = () => {

	const nutritionixLogo= "data:image/png;base64,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";
	const nutritionixLogoAlt= "nutritionix logo";

    return (
        <img className="nutri-logo" src={nutritionixLogo} alt={nutritionixLogoAlt}/>
    );
}

export default Logo;