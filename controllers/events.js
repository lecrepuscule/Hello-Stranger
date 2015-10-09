module.exports = function(io){
  var Event = require("../models/event");
  var User = require("../models/user");
  var Message = require("../models/message");

  function show(req, res){
    console.log('show in controller:')
    console.log(req.params)
    console.log(req.params.id)
    User.findById(req.session.passport.user, function(err, user){
      if (err) console.log(err);
      Event.findById(req.params.id, function(err, event){
        if (err) console.log(err);
        console.log(user);
        var penName = user.joinEvent(event);
        event.getChatRoom(io, user, penName);
        Message.find({event: event}, function(err, messages){
          res.json({
            title: event.title,
            imageUrl: event.imageUrl,
            messages: messages
          });
        })
      })
    });
  }

  function create(req, res){
    console.log("the user id within the passport is: " + req.session.passport.user);
    var eventLineupId = req.body.lineupId;

    var eventData = {
      title: req.body.title,
      lineupId: eventLineupId,
      description: req.body.description,
      startDate: req.body.startDate,
      imageUrl: req.body.imageUrl,
      venue: {
        name: req.body.venueName,
        latitude: Number(req.body.venueLatitude),
        longitude: Number(req.body.venueLongitude)
      }
    }

    User.findById(req.session.passport.user, function(err, user){
      if (err) console.log(err);
      Event.findOne({lineupId: eventLineupId}, function(err, storedEvent){
        if (err) console.log(err);
        console.log(user);
        if (storedEvent) {
          var penName = user.joinEvent(storedEvent);
          console.log("event already exists in DB");
          console.log(user.events);
          storedEvent.getChatRoom(io, user, penName);
          Message.find({event: storedEvent}, function(err, messages){
            res.json({
              messages: messages, 
              title: storedEvent.title, 
              imageUrl: storedEvent.imageUrl
            });
          })
        } else {
          newEvent = new Event(eventData);
          newEvent.save(function(err, newEvent){
            if (err) console.log(err);
            console.log("event being created in DB");
            console.log(user);
            var penName = user.joinEvent(newEvent);
            console.log(user.events);
            newEvent.getChatRoom(io, user, penName);
            Message.find({event: newEvent}, function(err, messages){
              res.json({
                messages: messages, 
                title: newEvent.title, 
                imageUrl: newEvent.imageUrl
              });
            })
          })
        }
        // Message.find({event: storedEvent}, function(err, messages){
        //   res.json({
        //     messages: messages, 
        //     title: storedEvent.title, 
        //     imageUrl: storedEvent.imageUrl
        //   });
        // })
      })
    });
  }

  function index(req, res) {
    User.findById(req.session.passport.user).populate('events.attendedEvent').exec(function(err, user) {
      console.log('this is a populated user')
      console.log(user)
      var attendedEvents = user.events.filter(function(event) { 
        console.log('inside filter iterator')
        console.log(event.attendedEvent)
        return event.attendedEvent;
      })
      console.log('these are attendedEvents')
      console.log(attendedEvents);
      console.log("req.xhr is: " + req.xhr);
      if (req.xhr) {
        res.json(attendedEvents);
      } else {
        res.render("home");
      }
    });
  }
  
  return {
    create: create, 
    index: index,
    show: show
  };
}