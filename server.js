  const express = require('express') //links the express module and requires
  const app = express() //stores express in a variable to run 
  const bodyParser = require('body-parser') //this line the body parser its role is to parse incoming http requests
  const MongoClient = require('mongodb').MongoClient //brings in the MongoDB module which connects to the MongoDB Client Database 

  var db, collection; // here we create two empty variables to store the collection and database

  const url = "mongodb+srv://demo:demo@cluster0-q2ojb.mongodb.net/test?retryWrites=true"; //this is the connection string to get to your MongoDB database
  const dbName = "demo"; //this is the name of the MongoDB database that we give it

  app.listen(3000, () => {
      MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (error, client) => {
          if(error) {
              throw error;
          }
          db = client.db(dbName);
          console.log("Connected to `" + dbName + "`!");
      });
  });

  app.set('view engine', 'ejs')
  app.use(bodyParser.urlencoded({extended: true}))
  app.use(bodyParser.json())
  app.use(express.static('public'))

  //here we set up a path for the http get request
  app.get('/', (req, res) => {
    //ab.collection is refering to the mongo database of messages 
    //then we use the find method to get those messages
    //using sort and putting thumbUp -1 we sort the likes from descending order
    //then we convert the whole thing into an array
    //the err and result are call back functions
    db.collection('messages').find().sort({thumbUp: -1}).toArray((err, result) => { 
      //so if err runs we return error
      if (err) return console.log(err)
      //and if result runs we pass the messages: result into our html file and dynamically post it
      res.render('index.ejs', {messages: result})
    })
  })
  

  app.post('/messages', (req, res) => {
    console.log(req)
    db.collection('messages').insertOne({name: req.body.name, msg: req.body.msg, thumbUp: 0, thumbDown:0}, (err, result) => {
      if (err) return console.log(err)
      console.log('saved to database')
      res.redirect('/')
    })
  })

  app.put('/messages', (req, res) => {
    db.collection('messages')
    .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
      $set: {
        thumbUp:req.body.thumbUp + 1
      }
    }, {
      sort: {_id: -1},
      upsert: true
    }, (err, result) => {
      if (err) return res.send(err)
      res.send(result)
    })
  })

  app.put('/messages/down', (req, res) => {
    db.collection('messages')
    .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
      $set: {
        thumbUp:req.body.thumbUp - 1
      }
    }, {
      sort: {_id: -1},
      upsert: true
    }, (err, result) => {
      if (err) return res.send(err)
      res.send(result)
    })
  })








  app.delete('/messages', (req, res) => {
    db.collection('messages').findOneAndDelete({name: req.body.name, msg: req.body.msg}, (err, result) => {
      if (err) return res.send(500, err)
      res.send('Message deleted!')
    })
  })
