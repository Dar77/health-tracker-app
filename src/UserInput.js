import React, { Component } from 'react';
import Logo from './Logo';
import Loader from './Loader';
import SearchResults from './SearchResults';
import TodaysCalories from './TodaysCalories';
import WeeksCalories from './WeeksCalories';
import TotalCalories from './TotalCalories';
import { Chart } from './react-google-charts';
import ReportLog from './ReportLog';

// set up moment.js - ref: https://momentjs.com/docs/#/customization/calendar/
const moment = require('moment');
moment.locale('en', {
    calendar : {
        sameDay : '[Today]',
    },
    week: {
        dow: 1, // start 1st day of week on Monday instead of the Sunday default
    },
});
let now = moment().format('YYYY MM DD'); // current date

let selections = []; // an array to store user selected food items

class UserInput extends Component {

    constructor(props) {

        super(props);
        this.state = {
            enteredFood: '', // users food input
            foodItemsObj: [], // array of objects created from search results
            err: '', // error message
            reportErr: '', // error message
            calories: 0,
            caloriesToday: 0,
            caloriesWeek: 0,
            log: 0,
            loading: false, // loading animation
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

    // local storage with react - ref: https://hackernoon.com/how-to-take-advantage-of-local-storage-in-your-react-projects-a895f2b2d3f2
    componentDidMount() {
        //localStorage.clear(); //REMOVE - development only
        this.hydrateStateWithLocalStorage();

        // add event listener to save state to localStorage
        // when user leaves/refreshes the page
        window.addEventListener(
          "beforeunload",
          this.saveStateToLocalStorage.bind(this)
        );
    }

    componentWillUnmount() {

        window.removeEventListener(
          "beforeunload",
          this.saveStateToLocalStorage.bind(this)
        );

        // saves if component has a chance to unmount
        this.saveStateToLocalStorage();
    }

    hydrateStateWithLocalStorage() {

        // if selectedFoodItems exist in localStorage
        if (localStorage.hasOwnProperty('selectedFoodItems')) {
            // get the selectedFoodItems value from localStorage
            let value = localStorage.getItem('selectedFoodItems');

            value = JSON.parse(value);
            const returnedItems = value;
            for (let item in returnedItems) { // construct jsx list items from local storage data
                const selectedName = returnedItems[item].props.children[4];
                const selectedBrand = returnedItems[item].props.children[7];
                const selectedCalories = returnedItems[item].props['data-calories']; // round the calories value to the nearest whole number
                const selectedServing = returnedItems[item].props.children[13];
                // add date and time properties using: moment.js
                const selectionDate = returnedItems[item].props['data-date']; // format - 'Saturday 5th May 2018'
                const dateDefault = returnedItems[item].props['data-default']; // default format - '2018-05-31'
                const selectionDay = returnedItems[item].props['data-day']; // format - 'Saturday'
                // create a unique key for each list item
                const key = returnedItems[item].key;
                // create the list item
                const output = <li onClick={this.removeItem} className="report-item" data-calories={selectedCalories} data-default={dateDefault} data-date={selectionDate} data-day={selectionDay} data-id={key} key={key} data-descr="Delete Item?">Added on: {selectionDate}<br/>Name: {selectedName}<br/>Brand: {selectedBrand}<br/>Calories: {selectedCalories}<br/>Serving Size: {selectedServing}<br/></li>;
                selections.push(output); // fill the selections array
                this.setState({'selectedFoodItems': selections});
            }
        }


        // for all items in state except selectedFoodItems
        for (let key in this.state) {
            // if the key exists in localStorage
            if (localStorage.hasOwnProperty(key) && key !== 'selectedFoodItems') {
                // get the key's value from localStorage
                let value = localStorage.getItem(key);

                // parse the localStorage string and setState
                try {
                    value = JSON.parse(value);
                    this.setState({ [key]: value });
                } catch (e) {
                    // handle empty string
                    this.setState({ [key]: value });
                }
            }
        }
    }

    saveStateToLocalStorage() {

        // for every item in React state
        for (let key in this.state) {
            // save to localStorage
            if (key !== 'selectedFoodItems') {
                localStorage.setItem(key, JSON.stringify(this.state[key]));
            }
        }
        localStorage.setItem('selectedFoodItems', JSON.stringify(selections)); // add selectedFoodItems to local storage
    }

    onChange = (event) => { // the value entered in the input

        this.setState({ enteredFood: event.target.value });
    }

    onSubmit = (event) => { // submit the entered value

        event.preventDefault();
        this.setState({loading: true}); // switch on loading animation

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
                let foodList = response.hits;
                const l = foodList.length;
                const results = []; // temp array for search results
                const resultsObj = []; // temp array for creating objects from search results

                for (let i= 0; i < l; i++) { // loop through the response and create the list items
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
                // turn off loading animation
                this.setState({loading: false});
                // set the react arrays to equal the temp arrays created in loop
                this.setState({foodItems: results});
                this.setState({foodItemsObj: resultsObj});
            })
            .catch(error => {
                // turn off loading animation
                this.setState({loading: false});
                this.setState({foodItems: []}); // empty any search results
                this.setState({err: this.state.enteredFood === '' ? 'You Need to Enter a Food Type!' : 'Failed To Get Nutritionix Resources'});
            });
    }

    selected = (event) => { // the user selected search item

        this.setState({reportErr: ''}); // empty any error messages

        const selectedKey = event.target.getAttribute('id'); // find the id of the user selected item
        const foodSelection = this.state.foodItemsObj[selectedKey]; // get the corresponding item's object
        // set the objects values
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
        // create the list item
        const output = <li onClick={this.removeItem} className="report-item" data-calories={selectedCalories} data-default={dateDefault} data-date={selectionDate} data-day={selectionDay} data-id={key.toString()} key={key} data-descr="Delete Item?">Added on: {selectionDate}<br/>Name: {selectedName}<br/>Brand: {selectedBrand}<br/>Calories: {selectedCalories}<br/>Serving Size: {selectedServing}<br/></li>;

        selections.unshift(output); // instead of pushing to array, add to start of array using .unshift()
        this.setState({selectedFoodItems: selections});
        this.setState({log: selections.length});
        this.calorieCounter();
    }


    // helper function to setState on the chart data without mutating state
    // ref - stackoverflow: https://stackoverflow.com/questions/35174489/reactjs-setstate-of-object-key-in-array?noredirect=1&lq=1
    dataUpdate = (key, arrayItem) => {

        const data = this.state.data.slice();
        data[key] = arrayItem;
        this.setState({ data });
    }

    // helper function to clear chart data when its a new week
    clearChart = (key, arrayItem) => {
        let data = this.state.data.slice();
        data = [
            ['Day', 'Calories'],
            ['Mon', 0],
            ['Tues', 0],
            ['Weds', 0],
            ['Thurs', 0],
            ['Fri', 0],
            ['Sat', 0],
            ['Sun', 0]
        ];
        data[key] = arrayItem;
        this.setState({ data });
        console.log('cleared chart data');
    }

    chartData = (day, calories, itemsDate) => { // update chart data

        // check when the last selected item was added, was it this week?
        const lastItem = moment(selections[1].props['data-default']).isSame(itemsDate, 'week');
        console.log(itemsDate, 'itemsDate', lastItem, 'lastItem', selections[1].props['data-default'], 'selections[1]');

        switch (day) {

            case 'Monday':
                // if the last selected item was added in another week, clear the chart and add new data
                if (lastItem === false) {
                    this.clearChart(1, ['Mon', calories]);
                } else {
                    this.dataUpdate(1, ['Mon', calories]);
                }
                break;

            case 'Tuesday':
                if (lastItem === false) {
                    this.clearChart(2, ['Tues', calories]);
                } else {
                    this.dataUpdate(2, ['Tues', calories]);
                }
                break;

            case 'Wednesday':
                if (lastItem === false) {
                    this.clearChart(3, ['Weds', calories]);
                } else {
                    this.dataUpdate(3, ['Weds', calories]);
                }
                break;

            case 'Thursday':
                if (lastItem === false) {
                    this.clearChart(4, ['Thurs', calories]);
                } else {
                    this.dataUpdate(4, ['Thurs', calories]);
                }
                break;

            case 'Friday':
                if (lastItem === false) {
                    this.clearChart(5, ['Fri', calories]);
                } else {
                    this.dataUpdate(5, ['Fri', calories]);
                }
                break;

            case 'Saturday':
                if (lastItem === false) {
                    this.clearChart(6, ['Sat', calories]);
                } else {
                    this.dataUpdate(6, ['Sat', calories]);
                }
                break;

            case 'Sunday':
                if (lastItem === false) {
                    this.clearChart(7, ['Sun', calories]);
                } else {
                    this.dataUpdate(7, ['Sun', calories]);
                }
                break;

            default:
                console.log('no chart data');
        }
    }

    calorieCounter = () => { // set calories counters

        const l = selections.length;
        let calTotal = 0;
        let calToday = 0;
        let calWeek = 0;
        let day = '';
        let itemsDate = '';
        for (let i= 0; i < l; i++) {
            if (now === selections[i].props['data-default']) { // if its today
                calTotal = calTotal + selections[i].props['data-calories'];
                calToday = calToday + selections[i].props['data-calories'];
                calWeek = calWeek + selections[i].props['data-calories'];
                // call chartData for todays food items
                day = selections[i].props['data-day'];
                itemsDate = selections[i].props['data-default'];
                this.chartData(day, calToday, itemsDate);
            } else if (now !== selections[i].props['data-default'] && moment(selections[i].props['data-default']).isSame(now, 'week')) { // if its this week but not today
                calWeek = calWeek + selections[i].props['data-calories'];
                calTotal = calTotal + selections[i].props['data-calories'];
            } else {
                calTotal = calTotal + selections[i].props['data-calories'];
            }
        }
        this.setState({calories: calTotal});
        this.setState({caloriesToday: calToday});
        this.setState({caloriesWeek: calWeek});
    }

    removeItem = (event) => { // remove item from the food log

        const deleteItem = event.target.dataset.id; // get the 'data-id' value of the item to be deleted;
        const l = selections.length;
        let day = '';
        let remove = 0;
        let deletedCalories = 0;
        let adjusted = [...selections]; // Clone selections array

        for (let i = 0; i < l; i++) {
            deletedCalories = selections[i].props['data-calories'];
            let sel = selections[i].props['data-id']; // compare data-id's
            // find the item that needs deleting from the selectedFoodItems array
            if (sel === deleteItem && moment().calendar() === 'Today' && now === selections[i].props['data-default']) {
                this.setState({reportErr: ''}); // empty any error messages
                day = selections[i].props['data-day'];
                remove = this.state.caloriesToday - deletedCalories;
                this.setState({calories: this.state.calories - deletedCalories});
                this.setState({caloriesToday: this.state.caloriesToday - deletedCalories}); // remove the corresponding number of calories from total
                this.setState({caloriesWeek: this.state.caloriesWeek - deletedCalories});
                // call chartData
                this.chartData(day, remove);
                adjusted.splice([i], 1); // delete using splice and its index
            } else if (sel === deleteItem && moment().calendar() === 'Today' && now !== selections[i].props['data-default']) {
                this.setState({reportErr: 'Sorry you can only remove items added today!'});
            }
        }
        selections= []; // clear the old version of selections
        selections = [...adjusted]; // fill with the contents of adjusted
        this.setState({selectedFoodItems: selections});
        this.setState({log: selections.length});
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
                    {this.state.loading ? <Loader/> : <SearchResults results= {this.state.foodItems}/>}
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
                    <h2>Food Log: <span className= "log">{this.state.log === 1? `${this.state.log} item` : `${this.state.log} items`}</span></h2>
                    <hr/>
                    <TotalCalories calories = {this.state.calories}/>
                    <hr/>
                    <p className="err-msg">{this.state.reportErr}</p>
                    <ReportLog list= {selections}/>
                </section>
            </div>
        );
    }
}

export default UserInput;