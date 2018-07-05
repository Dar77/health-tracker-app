import React from 'react';
import { Chart } from './react-google-charts';

class ArchiveChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      options: {
          title: 'This Weeks Overview',
          pieSliceText: 'value',
          pieSliceTextStyle: {color: 'black', fontSize: 14},
          is3D: true,
          colors:['#49eadb','#49c0ea', '#5f49ea', '#b049ea', '#49ea8e','#c5ea49','#ea9849']
      },
      data: [
        ['Day', 'Calories'],
        ['Mon', 50],
        ['Tues', 70],
        ['Weds', 90],
        ['Thurs', 20],
        ['Fri', 10],
        ['Sat', 10],
        ['Sun', 60]
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

export default ArchiveChart;