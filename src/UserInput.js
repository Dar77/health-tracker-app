import React, { Component } from 'react';
import Logo from './Logo';
import TodaysCalories from './TodaysCalories';
import WeeksCalories from './WeeksCalories';
import TotalCalories from './TotalCalories';
import { Chart } from './react-google-charts';

// set up moment.js - ref: https://momentjs.com/docs/#/customization/calendar/
const moment = require('moment');
moment.locale('en', {
    calendar : {
        sameDay : '[Today]',
    },
    week: {
        dow: 1, // start 1st day of week on Monday instead of Sunday default
    },
});
let now = moment().format("YYYY MM DD"); // current date
//let now = moment('2018 05 21');// used for testing DELETE

let selections = []; // a temp array to push user selected food items

class UserInput extends Component {

    constructor(props) {

        super(props);
        this.state = {
            enteredFood: '', // users food input
            foodItemsObj: [], // array of objects created from search results
            err: '', // error message
            reportErr: '',
            calories: 0,
            caloriesToday: 0,
            caloriesWeek: 0,
            // react-google-charts setup below
            options: {
                title: 'This Weeks Overview',
                pieSliceText: 'value',
                pieSliceTextStyle: {color: 'black', fontSize: 14},
                is3D: true,
                colors:['#49eadb','#49c0ea', '#5f49ea', '#b049ea', '#49ea8e','#c5ea49','#ea9849']
            },
            data: [
                ['Day', 'Calories'],
                ['Mon', 0],
                ['Tues', 0],
                ['Weds', 0],
                ['Thurs', 0],
                ['Fri', 0],
                ['Sat', 0],
                ['Sun', 0]
            ]
        };
    }

    onChange = (event) => {

        this.setState({ enteredFood: event.target.value });
    }

    onSubmit = (event) => {

        event.preventDefault();

        const appId = 'd4fdeca5';
        const appKey = 'b5cc447ce282c158b3ae1e80e148842d';
        let nutriUrl = `https://api.nutritionix.com/v1_1/search/${this.state.enteredFood}?results=0:30&fields=item_name,brand_name,item_id,nf_calories&appId=${appId}&appKey=${appKey}`;

        const inputCheck = (response) => { // check a search term has been entered

            let mySearch = this.state.enteredFood;
            if (mySearch !== '') {
                return Promise.resolve(response);
            } else {
                return Promise.reject();
            }
        }

        const status = (response) => { // check the response from the request

            if (response.status >= 200 && response.status < 300) { // && this.state.cancel === false) {
                return Promise.resolve(response);
            } else {
                return Promise.reject(new Error(response.statusText))
            }
        }

        fetch(nutriUrl) // use the fetch api to process the request
            .then(inputCheck)
            .then(status)
            .then(response => response.json())
            .then (response => {
                this.setState({err: ''}) // empty any error messages
                console.log('Request succeeded with JSON response', response);
                let foodList = response.hits;
                let ln = foodList.length;
                const results = []; // temp array for search results
                const resultsObj = []; // temp array for creating objects from search results

                for (let i = 0; i < ln; i++) { // loop through the response and create the list items
                    const name = foodList[i].fields.item_name;
                    const brand = foodList[i].fields.brand_name;
                    const calories = foodList[i].fields.nf_calories;
                    const serving = foodList[i].fields.nf_serving_size_qty;
                    // react requires a unique key for each list item: key={[i]}
                    results.push(<li className="food-item" id={[i]} key={[i]} onClick={this.selected}>Name: {name}<br/>Brand: {brand}<br/>Serving Size: {serving}</li>);
                    // also create an array of objects containing food properties
                    resultsObj.push(
                        {
                            name: name,
                            brand: brand,
                            calories: calories,
                            serving: serving
                        });
                }
                // set the react prop arrays to equal the temp arrays created in loop
                this.setState({foodItems: results})
                this.setState({foodItemsObj: resultsObj})
            })
            .catch(error => {
                console.log('request failed', error);
                this.setState({foodItems: []}) // empty any search results
                this.setState({err: this.state.enteredFood === '' ? 'You Need to Enter a Food Type!' : 'Failed To Get Nutritionix Resources'})
            });
    }

    selected = (event) => { // the user selected search item

        this.setState({reportErr: ''}) // empty any error messages
        const selectedKey = event.target.getAttribute('id'); // find the id of the user selected item
        const foodSelection = this.state.foodItemsObj[selectedKey]; // get the corresponding item's object
        const selectedName = foodSelection.name;
        const selectedBrand = foodSelection.brand;
        const selectedCalories = Math.round(foodSelection.calories); // round the calories value to the nearest whole number
        const selectedServing = foodSelection.serving;
        // add date and time properties using: moment.js
        const selectionDate = moment().format('dddd Do MMMM YYYY'); // format - 'Saturday 5th May 2018'
        const dateDefault = moment().format("YYYY MM DD"); // default format - '2018-05-31'
        const selectionDay = moment().format('dddd'); // format - 'Saturday'
        // create a unique key for each list item
        const key = Math.random() * (100 - 10) + 10;

        const output = <li onClick={this.removeItem} onMouseOver={this.deleteStyle} className="report-item" data-calories={selectedCalories} data-default={dateDefault} data-date={selectionDate} data-day={selectionDay} data-id={key.toString()} key={key} data-descr="Delete Item?">Added on: {selectionDate}<br/>Name: {selectedName}<br/>Brand: {selectedBrand}<br/>Calories: {selectedCalories}<br/>Serving Size: {selectedServing}<br/></li>;

        selections.unshift(output); // instead of pushing to array, add to start of array using .unshift()
        this.setState({selectedFoodItems: selections});
        this.calorieCounter(); // call calorieCounter method

        console.log(selectedKey, 'selectedKey value', foodSelection, 'foodSelection value', this.state.selectedFoodItems, 'selectedFoodItems');
    }

    calorieCounter = () => { // set calories counters

        const l = selections.length;
        let calTotal = 0;
        let calToday = 0;
        let calWeek = 0;
        let calDay = 0;
        let day = '';
        let itemsDate = '';
        for (let i = 0; i < l; i++) {
            console.log(moment(selections[i].props['data-default']).isSame(now, 'week'), 'if', now, 'now', selections[i].props['data-default'], 'data-default')
            if (moment().calendar() === 'Today' && now === selections[i].props['data-default']) { // if its today
                calTotal = calTotal + selections[i].props['data-calories'];
                calToday = calToday + selections[i].props['data-calories'];
                calWeek = calWeek + selections[i].props['data-calories'];
                // call chartData
                day = selections[i].props['data-day'];
                itemsDate = selections[i].props['data-default'];
                this.chartData(day, calToday, itemsDate);
            } else if (moment(selections[i].props['data-default']).isSame(now, 'week')) { // if its this week but not today
                calWeek = calWeek + selections[i].props['data-calories'];
                calTotal = calTotal + selections[i].props['data-calories'];
                // call chartData
                day = selections[i].props['data-day'];
                calDay = calDay + selections[i].props['data-calories']; // this days calories
                this.chartData(day, calDay);
            } else {
                calTotal = calTotal + selections[i].props['data-calories'];
            }
        }
        this.setState({calories: calTotal});
        this.setState({caloriesToday: calToday});
        this.setState({caloriesWeek: calWeek});
    }

    // helper function to setState on the chart data without mutating state
    // ref - stackoverflow: https://stackoverflow.com/questions/35174489/reactjs-setstate-of-object-key-in-array?noredirect=1&lq=1
    dataUpdate = (key, arrayItem) => {
        const data = this.state.data.slice();
        data[key] = arrayItem;
        this.setState({ data });
    }

    chartData = (day, calories, itemsDate) => { // update chart data

        // check whether Monday has chart data already, if so clear the old weeks data first
        if (itemsDate !== null && day === 'Monday' && this.state.data[1] !== ['Mon', 0]) {
            this.dataUpdate(1, ['Mon', 0]);
            this.dataUpdate(2, ['Tues', 0]);
            this.dataUpdate(3, ['Weds', 0]);
            this.dataUpdate(4, ['Thurs', 0]);
            this.dataUpdate(5, ['Fri', 0]);
            this.dataUpdate(6, ['Sat', 0]);
            this.dataUpdate(7, ['Sun', 0]);
        }

        switch (day) {

            case 'Monday':
                this.dataUpdate(1, ['Mon', calories]);
                break;

            case 'Tuesday':
                this.dataUpdate(2, ['Tues', calories]);
                break;

            case 'Wednesday':
                this.dataUpdate(3, ['Weds', calories]);
                break;

            case 'Thursday':
                this.dataUpdate(4, ['Thurs', calories]);
                break;

            case 'Friday':
                this.dataUpdate(5, ['Fri', calories]);
                break;

            case 'Saturday':
                this.dataUpdate(6, ['Sat', calories]);
                break;

            case 'Sunday':
                this.dataUpdate(7, ['Sun', calories]);
                break;
        }
    }

    removeItem = (event) => { // remove item from the food log

        const deleteItem = event.target.dataset.id; // get the 'data-id' value of the item to be deleted;
        const l = this.state.selectedFoodItems.length;
        let day = '';
        let remove = 0;
        let deletedCalories = 0;
        selections = [].concat(this.state.selectedFoodItems); // Clone selectedFoodItem array with concat

        for (let i = 0; i < l; i++) {
            deletedCalories = this.state.selectedFoodItems[i].props['data-calories']; // use .props['data-id'] to access react jsx properties
            let sel = this.state.selectedFoodItems[i].props['data-id']; // compare data-id's
            // find the item that needs deleting from the selectedFoodItems array
            if (sel === deleteItem && moment().calendar() === 'Today' && now === this.state.selectedFoodItems[i].props['data-default']) {
                selections.splice([i], 1); // delete using splice and its index
                this.setState({calories: this.state.calories - deletedCalories});
                this.setState({caloriesToday: this.state.caloriesToday - deletedCalories}); // remove the corresponding number of calories from total
                this.setState({caloriesWeek: this.state.caloriesWeek - deletedCalories});
                this.setState({selectedFoodItems: selections}); // set the adjusted selections array as selectedFoodItems new value
                // call chartData
                day = this.state.selectedFoodItems[i].props['data-day'];
                remove = this.state.caloriesToday - deletedCalories;
                this.chartData(day, remove);
            } else if (moment().calendar() === 'Today' && now !== this.state.selectedFoodItems[i].props['data-default']) {
                this.setState({reportErr: 'Sorry you can only remove items added today!'})
            }
            console.log(deleteItem, 'this is deleteItem', event.target, 'this is the target', l, 'this is l', sel, 'this is sel');
        }
    }

    render() {

        return (
            <div className="container">
                <header className="item-a">
                    <h1>Health Tracker</h1>
                </header>
                <section className="item-b">
                    <h2>Calorie Counter</h2>
                    <hr/>
                    <h3>What Did You Eat?</h3>
                    <form onSubmit={this.onSubmit}>
                        <input value={this.state.enteredFood} onChange={this.onChange} placeholder="enter food type" type="text" aria-label="enter a food type"/>
                    </form>
                    <h3>{this.state.foodItems? 'Please Select From The List' : ''}</h3>
                    <hr/>
                    <p className="err-msg">{this.state.err}</p>
                    <div className="search-results">
                        <ul>
                            {this.state.foodItems}
                        </ul>
                    </div>
                </section>
                <section className="item-c">
                    <h2>Your Report</h2>
                    <hr/>
                    <TodaysCalories calories = {this.state.caloriesToday}/>
                    <WeeksCalories calories = {this.state.caloriesWeek}/>
                    <hr/>
                    <div className="chart">
                        <Chart
                            chartType="PieChart"
                            data={this.state.data}
                            options={this.state.options}
                            graph_id="PieChart"
                            width="100%"
                            height="400px"
                            legend_toggle
                        />
                    </div>
                    <Logo/>
                </section>
                <section className="item-d">
                    <h2>Food Log: <span>{selections.length === 1? `${selections.length} item` : `${selections.length} items`}</span></h2>
                    <hr/>
                    <TotalCalories calories = {this.state.calories}/>
                    <hr/>
                    <p className="err-msg">{this.state.reportErr}</p>
                    <div className="report-results">
                        <ul className="report-list">
                            {this.state.selectedFoodItems}
                        </ul>
                    </div>
                </section>
            </div>
        );
    }
}

export default UserInput;
