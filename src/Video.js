import React, { Component } from 'react';
import webm from './media/video/avo-egg.webm';
import mp4 from './media/video/avo-egg.mp4';

const Video = () => {

    return (
        <video  className="video-background" preload="auto" playsInline autoPlay muted loop poster="images/avo-egg.jpg">
            <source src={webm} type="video/webm"/>
            <source src={mp4} type="video/mp4"/>
        </video>
    );
}

export default Video;