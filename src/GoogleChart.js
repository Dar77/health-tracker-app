import React from 'react';
import { Chart } from './react-google-charts';

class GoogleChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      options: {
        title: 'This Week Overview',
        is3D: true,
        pieHole: 0.4,
        colors:['#49eadb','#49c0ea', '#5f49ea', '#b049ea', '#49ea8e','#c5ea49','#ea9849']
      },
      data: [
        ['Day', 'Calories'],
        ['Mon', 2000],
        ['Tues', 1200],
        ['Weds', 5500],
        ['Thurs', 1400],
        ['Fri', 5400],
        ['Sat', 3500],
        ['Sun', 7000]
      ],
    };
  }
  render() {
    return (
      <Chart
        chartType="PieChart"
        data={this.state.data}
        options={this.state.options}
        graph_id="PieChart"
        width="100%"
        height="400px"
        legend_toggle
      />
    );
  }
}

export default GoogleChart;