import React, { Component } from 'react';
import UserInput from './UserInput';
import Video from './Video';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      foodItems: [],
      selectedFoodItems: []
    };
  }

  render() {
    return (
      <div>
        <Video/>
        <UserInput/>
      </div>
    );
  }
}

export default App;
