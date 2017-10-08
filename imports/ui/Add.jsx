import React, { Component } from "react";
import { Questions } from "../api/questions.js";
import { Options } from "../api/options.js";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import Question from "./Question.jsx";
import Option from "./Option.jsx";
import { createContainer } from "meteor/react-meteor-data";
import {Meteor} from "meteor/meteor"
import Select from 'react-select';
import "react-select/dist/react-select.css";



const categories = [
  { label: 'Ciencia', value: 'ciencia' },
  { label: 'Vanilla', value: 'vanilla' },
  { label: 'Strawberry', value: 'strawberry' },
  { label: 'Caramel', value: 'caramel' },
  { label: 'Cookies and Cream', value: 'cookiescream' },
  { label: 'Peppermint', value: 'peppermint' },
];
// Task component - represents a single todo item
class Add extends Component {	

constructor(props) {
    super(props);
    this.state = {value:""}
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event) {
    event.preventDefault();

    // Find the text field via the React ref
    const question = ReactDOM.findDOMNode(this.refs.question).value.trim();
    const description = ReactDOM.findDOMNode(this.refs.desc).value.trim();
    Questions.insert({
      question: question,
      publishedAt: new Date(),
      description:description,
      categories:this.state.value.split(","),
      ownerId:this.props.currentUser._id,
      ownerName:this.props.currentUser.username,
      rating:{},
      options:this.props.options,
      comments:[]
    })
    ReactDOM.findDOMNode(this.refs.question).value = "";
    ReactDOM.findDOMNode(this.refs.desc).value = "";
    this.setState({value:""});
    this.props.options.map((option)=>{
      Options.remove({_id:option._id});
    })
  }
  handleOptions(e) {
    if (e.key === 'Enter') {
      const name = ReactDOM.findDOMNode(this.refs.option).value.trim();
      Options.insert({
        name: name,
        countries:[]
      })
      ReactDOM.findDOMNode(this.refs.option).value = "";
    }
  }
  handleChange(value) {
    console.log("Selected: " + JSON.stringify(value.split(",")));
    this.setState({ value });
  }
  renderOptions(){
    return this.props.options.map((option)=>(
        <Option key={option._id} option={option}/>
      ));
  }
  renderQuestions() {
    return this.props.questions.map((question) => (
      <div>
        <Question key={question._id} question={question} />
      </div>
    ));
  }

  render() {
    const { value } = this.state;
    return(
        <div className="container">
          <header>
            <h1>Ask Away!</h1>
            <form id="saveQuestion"></form>
            <div className = "new-question">
              <input
                type="text"
                ref="question"
                placeholder="What do you wanna ask?"
              />
              <input
                type="text"
                ref="desc"
                placeholder="Description"
              />
              <label>
                Pick the categories that matches your question:
                <Select
                  multi
                  closeOnSelect={false}
                  onChange={this.handleChange}
                  options={categories}
                  placeholder="Select your categories"
                  simpleValue
                  value={value}
                />
              </label>
                <input
                  type="text"
                  onKeyPress={this.handleOptions.bind(this)}
                  ref="option"
                  placeholder="Type to add new options to your question"
                />
              <div class="row">
                  <ul>
                    {this.renderOptions()}
                  </ul>
              </div>
              <input type="button" value="Submit" form="saveQuestion" onClick={this.handleSubmit.bind(this)} />
              </div>
          </header>
          <h1> Questions: </h1>
          <ul>
            {this.renderQuestions()}
          </ul>
        </div>
    );
  }
}

Add.propTypes = {
  questions: PropTypes.array.isRequired,
  options:PropTypes.array
};
export default createContainer(() => {
  return {
    questions: Questions.find({}, { sort: { publishedAt: -1 }}).fetch(),
    currentUser:Meteor.user(),
    options:Options.find({}).fetch()
  };
}, Add);