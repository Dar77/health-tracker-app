import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { unregister } from './registerServiceWorker'; // disable service workers
unregister();

ReactDOM.render(<App />, document.getElementById('root'));
