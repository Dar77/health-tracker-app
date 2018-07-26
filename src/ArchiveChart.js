import React from 'react';

const ArchiveChart = ({archiveData, archiveKey, chart}) => {

  let Chart = chart;
  let cal = 0;

  this.state = {
    options: {
        title: `The Week Beginning:
                ${archiveData[archiveKey] === undefined? 'No Data Available!' : archiveData[archiveKey].date}`,
        pieSliceText: 'value',
        pieSliceTextStyle: {color: 'black', fontSize: 14},
        is3D: true,
        colors:['#49eadb','#49c0ea', '#5f49ea', '#b049ea', '#49ea8e','#c5ea49','#ea9849']
    }
  };

  // get the total calories for the archived week
  if (archiveData[archiveKey] !== undefined) {
    const l = archiveData[archiveKey].data.length;
    for (let i = 1; i < l; i++) {
      let value = archiveData[archiveKey].data[i][1];
      cal = cal + value;
    }
  }

  return (
    <div>
      <h3>Calories For Week: <span>{cal}</span></h3>
      <hr/>
      <Chart
        chartType="PieChart"
        data= {archiveData[archiveKey] === undefined? '' : archiveData[archiveKey].data}
        options={this.state.options}
        width="100%"
        height="350px"
        legend_toggle
      />
    </div>
  );
}

export default ArchiveChart;