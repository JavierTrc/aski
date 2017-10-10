import React, { Component } from "react";
import { Questions } from "../api/questions.js";
import DataMapContainer from "./graphs/DataMapContainer";
import PieChart from "./graphs/PieChart";
import BarChart from "./graphs/BarChart";

import { createContainer } from "meteor/react-meteor-data";
import { Mongo } from "meteor/mongo";
import ReactDOM from "react-dom";

import PropTypes from "prop-types";

// Task component - represents a single todo item
class Question extends Component {

  constructor(props) {
    super(props);
    this.state = {
      selectedOption:"",
      rating:"",
      isUp:[],
      pasos:[]
    }

  }
    //Meteor.call("questions.insert", rating, options, comments)
  handleSubmit(e){
    console.log(this.props.currentUser)
    const question = this.props.question;
    const id = question._id;
    const text = ReactDOM.findDOMNode(this.refs.comment).value.trim();
    let rating = "";
    if(this.state.rating != ""){
    const count = question.rating.count + 1;
    let calc = ((question.rating.rating*question.rating.count)+this.state.rating)/count
    rating = {rating:calc, count:count};
  }
  else{
    rating = question.rating;
  }
    const comments = {
      authorId: this.props.currentUser._id,
      authorName: this.props.currentUser.username,
      text: text,
      createdAt: new Date(),
      rating: {rating:0,count:0}
    }
    const country = this.props.currentUser.country;
    let indexOption = 0;
    const countries = {countryCode:country.value, countryName:country.label};
    this.props.question.options.map((option,index)=>{
      if(option.name == this.state.selectedOption){
        indexOption = index;
      }
    })
    const options ={
      name: this.state.selectedOption,
      countries:countries
    }
    let found = false;
    let indexCountry =0;
    question.options.map((option)=>{
      if(option.name == options.name){
        option.countries.map((cnt,index)=>{
          if(cnt.countryCode == country.value){
            found = true;
            indexCountry = index;
          }
        })
      }
    })
    ReactDOM.findDOMNode(this.refs.comment).value = "";
    Meteor.call("questions.answer", id, rating, options, comments, found, indexOption, indexCountry)
}
  handleOptionChange(changeEvent) {
  this.setState({
    selectedOption: changeEvent.target.value
  });
}

handleThumbsUp(comment,index, ev){
  const id = this.props.question._id;
  Meteor.call("comments.voteUp", id, comment);
  let pasos = this.state.pasos;
  pasos[index] = pasos[index] != undefined ? pasos[index] + 1 : 1;
  this.setState({pasos:pasos});
  if(pasos[index] == 0){
    let isUp = this.state.isUp;
    isUp[index] = undefined;
    this.setState({isUp:isUp});
  }
  if(pasos[index] >= 1){
    let isUp = this.state.isUp;
    isUp[index] = true;
    this.setState({isUp:isUp});
  }
}
handleThumbsDown(comment,index, ev){
  const id = this.props.question._id;
  Meteor.call("comments.voteDown", id, comment);
  let pasos = this.state.pasos;
  pasos[index] = pasos[index] != undefined ? pasos[index] - 1 : -1;
  this.setState({pasos:pasos});
  if(pasos[index] == 0){
    let isUp = this.state.isUp;
    isUp[index] = undefined;
    this.setState({isUp:isUp});
  }
  if(pasos[index] <=-1){
    let isUp = this.state.isUp;
    isUp[index] = false;
    this.setState({isUp:isUp});
  }
}
renderComments(){
  const self = this;
  return (
    <ul>
    {this.props.question.comments.map(function(comment, index){
      const isUp = self.state.isUp[index];
      if(comment.text != ""){
        return(
          <li style={{width:"100%"}}>
            <div className="msj-rta macro">
              <div className="text text-r">
                <p>{comment.text}</p>
                <p>
                  <small>{comment.createdAt.toLocaleString().split(',')[0]}</small>
                </p>
              </div>
              <div className="avatar">
              <p>
                <small>{comment.authorName}</small>
              </p>
              </div>
              <button type="button"
            id="testBtn"
            className="btn btn-success glyphicon glyphicon-thumbs-up"
            data-loading-text=" ... " onClick={(ev) =>self.handleThumbsUp(comment, index, ev)} disabled={isUp!=undefined ? isUp : false}>
              </button>
            <button type="button" id="testBtnDown" className="btn btn-success glyphicon glyphicon-thumbs-down" data-loading-text=" ... " onClick={(ev) =>self.handleThumbsDown(comment, index, ev)} disabled={isUp!=undefined ? !isUp : false}>
            </button>
            <div>
              Puntos: {comment.rating.rating}
            </div>
            </div>
    
          </li>
          )
        }
    })}
    </ul>
  )
}
handleRating(changeEvent) {
  this.setState({
    rating: parseInt(changeEvent.target.value)
  });
}
  
//Se debería crear un componente aparte para manejar los comentarios, así se moduraliza más el código y sería más fácil de manejar y entender.
  render() {
    const question = this.props.question;
    const classes = `comments row`;
    const self = this;
    console.log(question);
    return(
        <div className="container">
          <div>
            <form id="answerQuestion"></form>
              <div className="d-flex w-100 justify-content-between">
                <div className="row">
                  <div className="col-md-10">
                    <h2 className="mb-1">{question.question}</h2>
                  </div>
                  <div className="col-md-2">
                    <h3>{question.rating.rating}/5</h3>
                  </div>
                </div>
                <small>{question.publishedAt.toString()}</small>
              </div>
              <p className="mb-1">{question.description}</p>
              <small>By {question.ownerName}</small>
              <div className="modal-body">
                <ul className="list-group">
                  {question.options.map(function(option){
                  return(
                  <li className="list-group-item">
                    <div className="radio">
                      <label>
                        <input value={option.name} type="radio" name="optionsRadios" checked={self.state.selectedOption === option.name} onChange={self.handleOptionChange.bind(self)} />
                          {option.name}
                      </label>
                    </div>
                  </li>
                  );
                }
              )}
                </ul>
              </div>
              <div className="row">
                <fieldset className="rating">
                  <input onChange={self.handleRating.bind(self)} type="radio" id="star5" name="rating" value="5" /><label htmlFor="star5" title="Rocks!">5 stars</label>
                  <input onChange={self.handleRating.bind(self)} type="radio" id="star4" name="rating" value="4" /><label htmlFor="star4" title="Pretty good">4 stars</label>
                  <input onChange={self.handleRating.bind(self)} type="radio" id="star3" name="rating" value="3" /><label htmlFor="star3" title="Meh">3 stars</label>
                  <input onChange={self.handleRating.bind(self)} type="radio" id="star2" name="rating" value="2" /><label htmlFor="star2" title="Kinda bad">2 stars</label>
                  <input onChange={self.handleRating.bind(self)} type="radio" id="star1" name="rating" value="1" /><label htmlFor="star1" title="Sucks big time">1 star</label>
                </fieldset>
              </div>
              <div className="comment">
                <div>
                    <div className="msj-rta macro" style={{margin:"auto"}}>
                      <div className="text text-r">
                        <input className="mytext" ref="comment" placeholder="Optional comment about the question"/>
                      </div>
                    </div>
                </div>
              </div>
              <div className="row">
                <input className="answer" type="button" value="Answer" form="answerQuestion" onClick={this.handleSubmit.bind(this)} />
              </div>
            </div>
            <hr/>
            <DataMapContainer options={self.props.question.options} />
            <PieChart options = {self.props.question.options}/>
            <BarChart options = {self.props.question.options}/>
            <div className={classes}>
              {this.renderComments()}
            </div>
          </div>
        );
      }
    }

export default createContainer(({id}) => {

  Meteor.subscribe('questions.id',id)

  return {
    question: Questions.findOne({_id:id}),
    currentUser: Meteor.user()
  };
}, Question);
