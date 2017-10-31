import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { check } from "meteor/check";
import SimpleSchema from "simpl-schema";

//Faltan algunos test que prueben que los componentes de React Renderizan correctamente.
//El botón de inicio de sesión puede mejorarse, la letra es muy pequeña y el color de fondo no contrasta bien con la imagen de fondo.

const countryOptSchema = new SimpleSchema({
  countryCode: String,
  countryName: String,
  count: SimpleSchema.Integer
});

const optionSchema = new SimpleSchema({
  name: String,
  count: SimpleSchema.Integer,
  countries: [countryOptSchema]
});

const ratingSchema = new SimpleSchema({
  rating:Number,
  count:SimpleSchema.Integer,
});
const votesSchema = new SimpleSchema({
  result:SimpleSchema.Integer,
  votersUp:[String],
  votersDown:[String]
});

const commentSchema = new SimpleSchema({
  authorId: String,
  authorName: String,
  text: String,
  createdAt: Date,
  votes: votesSchema
});

const questionSchema = new SimpleSchema({
  question: String,
  description:String,
  publishedAt: Date,
  options: [optionSchema],
  ownerId: String,
  ownerName: String,
  comments: [commentSchema],
  categories: [String],
  rating:ratingSchema,
  canAdd:Boolean,

});

export const Questions = new Mongo.Collection("questions");

if (Meteor.isServer) {
  // This code only runs on the server
  Meteor.publish('questions.query', function(query) {
    return Questions.find({$or:[{question:{$regex:".*" + query +".*"}},{categories:{$regex:".*" + query + ".*"}}]});
  });
  Meteor.publish('questions.id', function(id) {
    return Questions.find({_id:{$regex:".*" + id +".*"}});
  });
  Meteor.publish('questions', function() {
    return Questions.find({});
  });
   Meteor.publish('questions.myself', function(id) {
    return Questions.find({ownerId:id});
  });

}

Meteor.methods({
  'questions.insert'(question, description, categories, options, canAdd, collections) {

    // Make sure the user is logged in before inserting a task
    if (! Meteor.user()._id) {
      throw new Meteor.Error('not-authorized');
    }

    return Questions.insert({
      question: question,
      publishedAt: new Date(),
      description:description,
      categories:categories,
      ownerId:Meteor.user()._id,
      ownerName:Meteor.user().username,
      rating:{rating:3.5,count:0},
      options:options,
      comments:[],
      canAdd:canAdd
    }
  )
    Meteor.call('collections.questions.insert', question_id, collections);

  },
  'questions.answer'(id,rating, options,comments, found, idOption, idCountry){
    // Make sure the user is logged in before inserting a task
    if (! Meteor.user()._id) {
      throw new Meteor.Error('not-authorized');
    }
    if(comments != null)
    Questions.update({_id:id},{
      $addToSet:{comments:comments}
    })
    Questions.update({_id:id},{
      $set: { rating: rating}
    })
    Questions.findAndModify({
      query: { _id: id, options: { $elemMatch: { name: options.name} } },
      update: { $inc: { "options.$.count": 1 } }
    })
    var find = "options." + idOption + ".countries." + idCountry + ".count";
    var obj={};
    obj[find] = 1; 
    if(found){
    Questions.update(
      { _id: id},
      { $inc: obj}
      )
    }
    else{
    Questions.update(
      {_id:id, "options.name":options.name,"options.$.countries.countryCode":{$ne:options.countries.countryCode}},
      {$push: {"options.$.countries": {"countryCode":options.countries.countryCode, "countryName":options.countries.countryName,"count":1}}}
      )
  }
  },
  "comments.voteUp"(id, comment){
    if (! Meteor.user()._id) {
      throw new Meteor.Error('not-authorized');
    }
    Questions.update(
      { _id: id, "comments.authorId": comment.authorId},
      {$inc: { "comments.$.votes.result":1},$push:{"comments.$.votes.votersUp":comment.authorId}}
      )
  },
  "comments.removeVoteUp"(id,comment){
    if (! Meteor.user()._id) {
      throw new Meteor.Error('not-authorized');
    }
    Questions.update(
      { _id: id, "comments.authorId": comment.authorId, "comments.createdAt": comment.createdAt},
      {$inc: { "comments.$.votes.result":-1},$pull:{"comments.$.votes.votersUp":comment.authorId}}
      )
  },
  "comments.voteDown"(id, comment){
    if (! Meteor.user()._id) {
      throw new Meteor.Error('not-authorized');
    }
    Questions.update(
      { _id: id, "comments.authorId": comment.authorId, "comments.createdAt": comment.createdAt},
      {$inc: { "comments.$.votes.result":-1},$push:{"comments.$.votes.votersDown":comment.authorId}}
      )
  },
  "comments.removeVoteDown"(id,comment){
    if (! Meteor.user()._id) {
      throw new Meteor.Error('not-authorized');
    }
    Questions.update(
      { _id: id, "comments.authorId": comment.authorId, "comments.createdAt": comment.createdAt},
      {$inc: { "comments.$.votes.result":1},$pull:{"comments.$.votes.votersDown":comment.authorId}}
      )
  },
  'questions.addOption'(id, option) {

    // Make sure the user is logged in before inserting a task
    if (! Meteor.user()._id) {
      throw new Meteor.Error('not-authorized');
    }

    Questions.update(
      {_id:id},
      {$push: {"options":option}}
      )
  },
  "questions.remove"(id){
    Questions.remove({_id:id});
  }
});
