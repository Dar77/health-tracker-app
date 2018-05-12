import React, { Component } from 'react';
//import video from './my-great-background-video.video-file'; TODO ===============================
import UserInput from './UserInput'; // import UserInput component

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
        <UserInput/>
    );
  }
}

export default App;
