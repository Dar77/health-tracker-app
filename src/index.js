import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { unregister } from './registerServiceWorker'; // disable service workers because I'm not using https - avoids error
unregister();

ReactDOM.render(<App />, document.getElementById('root'));
