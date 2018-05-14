import React, { Component } from 'react';
import Logo from './Logo';

// set up moment.js - ref: https://momentjs.com/docs/#/customization/calendar/
const moment = require('moment');
moment.locale('en', {
    calendar : {
        sameDay : '[Today]',
    }
});
let now = moment().format('dddd Do MMMM YYYY'); // the current date 'when function is called'
//let now = moment('Friday 11th May 2018')// used for testing DELETE

let selections = []; // a temp array to push user selected food items

class UserInput extends Component {

    constructor(props) {

        super(props);
        this.state = {
            enteredFood: '', // users food input
            foodItemsObj: [], // array of objects created from search results
            err: '', // error message
            calories: 0,
            caloriesToday: 0
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

        const selectedKey = event.target.getAttribute('id'); // find the id of the user selected item
        const foodSelection = this.state.foodItemsObj[selectedKey]; // get the corresponding item's object
        const selectedName = foodSelection.name;
        const selectedBrand = foodSelection.brand;
        const selectedCalories = Math.round(foodSelection.calories); // round the calories value to the nearest whole number
        const selectedServing = foodSelection.serving;
        // add date and time properties using: moment.js
        const selectionDate = moment().format('dddd Do MMMM YYYY'); // format - Saturday 5th May 2018
        const calendar = moment().calendar();
        const selectionDay = moment().format('dddd'); // format - Saturday
        // create a unique key for each list item
        const key = Math.random() * (100 - 10) + 10;

        const output = <li onClick={this.removeItem} className="report-item" data-calories={selectedCalories} data-date={selectionDate} data-id={key.toString()} key={key}>{selectionDate}<br/>Name: {selectedName}<br/>Brand: {selectedBrand}<br/>Calories: {selectedCalories}<br/>Serving Size: {selectedServing}<br/></li>;

        selections.unshift(output); // instead of pushing to array, add to start of array using .unshift()
        this.setState({selectedFoodItems: selections});
        this.calorieCounter(); // call calorieCounter method
        //this.setState({caloriesToday: this.state.caloriesToday + selectedCalories});

        console.log(selectedKey, 'selectedKey value', foodSelection, 'foodSelection value', this.state.selectedFoodItems, 'selectedFoodItems');
    }

    calorieCounter = () => { // set calories counters

        const len = selections.length;
        let calToday = 0;
        for (let i = 0; i < len; i++) {
            if (moment().calendar() === 'Today' && now === selections[i].props['data-date']) { // if its today
                calToday = calToday + selections[i].props['data-calories'];
            }// else {
             //   this.setState({calories: this.state.calories + cal})
            //}
            //this.setState({caloriesToday: this.state.calories + cal})
        }
        this.setState({caloriesToday: calToday})
    }

    removeItem = (event) => { // remove item from the report

        const deleteItem = event.target.dataset.id; // get the 'data-id' value);
        const l = this.state.selectedFoodItems.length;
        let deletedCalories = 0;
        selections = [].concat(this.state.selectedFoodItems); // Clone array with concat

        for (let i = 0; i < l; i++) {
            deletedCalories = this.state.selectedFoodItems[i].props['data-calories']; // use .props['data-id'] to access react jsx properties
            let sel = this.state.selectedFoodItems[i].props['data-id'];
            if (sel === deleteItem) { // find the item that needs deleting from the selectedFoodItems array
                selections.splice([i], 1); // delete using splice and its index
                this.setState({caloriesToday: this.state.caloriesToday - deletedCalories}) // remove the corresponding number of calories from total
                this.setState({selectedFoodItems: selections});
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
                    <h3>What Did You Eat?</h3>
                    <form onSubmit={this.onSubmit}>
                        <input value={this.state.enteredFood} onChange={this.onChange} placeholder="enter food type" type="text" aria-label="enter a food type"/>
                        <button>search</button>
                    </form>
                    <h3>Select From The List Below</h3>
                    <p className="err-msg">{this.state.err}</p>
                    <div className="search-results">
                        <ul>
                            {this.state.foodItems}
                        </ul>
                    </div>
                    <Logo/>
                </section>
                <section className="item-c">
                    <h2>Your Report</h2>
                    <h3>Total Calories: <span>{this.state.calories}</span></h3>
                    <h3>Todays Calories: <span>{this.state.caloriesToday}</span></h3>
                    <h3>This Week: <span>{this.state.caloriesThisWeek}</span></h3>
                    <div className="google-chart"></div>
                    <h3>Food Log:</h3>
                    <div className="report-results">
                        <ul className="report-list">
                            {this.state.selectedFoodItems}
                        </ul>
                    </div>
                    <Logo/>
                </section>
            </div>
        );
    }
}

export default UserInput;

