// Advertisement.js
import React from 'react';
import './Advertisement.css';

function Advertisement({ link, text, imageSrc }) {
    return (
        <div className="advertisement">
            <a href={link} target="_blank" rel="noopener noreferrer">
                {imageSrc && <img src={imageSrc} alt="Advertisement" />}
                <span className="ad-text">{text}</span>
            </a>
        </div>
    );
}

export default Advertisement;
