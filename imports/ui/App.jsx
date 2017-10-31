import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";
import { createContainer } from "meteor/react-meteor-data";
import { Questions } from "../api/questions.js";
import { Options } from "../api/options.js";
import Question from "./Question.jsx";
import { Session } from "meteor/session";
import {Meteor} from "meteor/meteor"

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import AuthForm from "./auth/AuthForm.jsx"
import Popup from "react-popup";
import SweetAlert from "react-bootstrap-sweetalert";



////////////
// Header //
////////////

class Header extends React.Component{
  render() {
    return (
      <header className="Header">
        <Logo/>
        <Navigation currentUser={this.props.currentUser}/>
        <Search onSubmit={this.props.onSubmit} />
      </header>
    );
  }
}
class Logo extends React.Component{
  render() {
    return (
      <div id="logo" className="Logo">
        <svg width="300" height="81.38" xmlns="http://www.w3.org/2000/svg">
          <g>
            <title>Layer 1</title>
            <text stroke="#000" textAnchor="start" fontFamily="Helvetica, Arial, sans-serif" fontSize="24" id="svg_12" y="250.7" x="457.5" fillOpacity="null" strokeOpacity="null" strokeWidth="0" fill="#000000"/>
            <path id="svg_13" d="m373.5,241.7" opacity="0.5" fillOpacity="null" strokeOpacity="null" strokeWidth="1.5" stroke="#000" fill="none"/>
            <text fontStyle="normal" fontWeight="bold" stroke="#000" transform="matrix(5.457497378637608,0,0,3.228946107668764,-685.360303996764,-391.9010894248071) " textAnchor="start" fontFamily="'Palatino Linotype', 'Book Antiqua', Palatino, serif" fontSize="24" id="svg_14" y="143.212316" x="126.374748" strokeOpacity="null" strokeWidth="0" fill="#ff3426">Aski</text>
          </g>
        </svg>
      </div>
    );
  }
}

// Navigation
class Navigation extends React.Component{
  render() {
    return (
      <div id="navigation" className="Navigation">
        <nav>
          <ul>
            <li><a href="/Browse">Browse</a></li>
            <li>My Questions</li>
            <li>Top picks</li>
            {this.props.currentUser ?
              <div className="account pull-right">
              <img src="/img/profile_placeholder.svg" class="profile-pic"/>
              <div className="details">
              <p className="headline">Logged in as:</p>
              <p className="username text-primary">{this.props.currentUser.username}</p>
              </div>
              <li className="logout" onClick={() => Meteor.logout()}>Log Out</li>
              </div>
              : ""
            }
          </ul>
        </nav>
      </div>
    );
  }
}

// Search
class Search extends React.Component{

  render() {
    return (
      <form onSubmit={this.props.onSubmit} id="search" className="Search">
        <input id="inputSearch" type="search" placeholder="Search for a question by title or category..." />
        <label htmlFor="inputSearch">  
          .
        </label>
      </form>
    );
  }
}

// App component - represents the main app component
class App extends Component {
  constructor() {
    super();
    this.state = {
      showPopup: false
    };
    this.handlePopup = this.handlePopup.bind(this);
  }

  handlePopup(ev){
    this.setState({
      showPopup: !this.state.showPopup
    });
  }
 performSearch(e) {
    // stop form from submitting
    e.preventDefault();

    // get the value
    var query = $(".Search input").val();
    query = {query:query}
    FlowRouter.go("/questions", "" ,query);
  }
 


  render() {
    console.log(this.props.currentUser);
    let self = this;
    return (
      <MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme)}>
        <div className = "container">
          <div id="hero" className="Hero" style={{backgroundImage: "url(/background.jpg)"}}>
            <div className="content">

              <h1> Ask whatever you want, whenever you want</h1>
              <p>With Aski you can ask and answer tons of questions of all around the world. Just create an account and access the best question network!</p>

              <Search onSubmit={this.performSearch.bind(this)} />
            </div>
            <div className="overlay"></div>
          </div>
        </div>
        {this.state.showPopup ?
          <SweetAlert
          title={<AuthForm popup={self.handlePopup}/>}
          style={{color:"grey"}}
          showConfirmButton= {false} // There won't be any confirm button
          onConfirm={this.handlePopup.bind(this)}
        />
        : null
        }
      </MuiThemeProvider>
    );
  }
}
App.propTypes = {
  questions: PropTypes.array.isRequired,
};

export default createContainer(() => {
  Session.setDefault("query","");
  return {
    questions: Questions.find({question: {"$regex": Session.get("query")}}, { sort: { publishedAt: -1 }}).fetch(),
    currentUser:Meteor.user(),
  };
}, App);
