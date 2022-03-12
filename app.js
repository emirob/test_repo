const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
const AWS = require("aws-sdk");
const mongoose  = require('mongoose');
const { all } = require("express/lib/application");
const { ConnectContactLens } = require("aws-sdk");
const SPACE = " "

var dbUri = 'mongodb+srv://mochs:mochs@cluster0.mfyms.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'

//set uo for cloud lamdba function
AWS.config.update({accessKeyId: 'AKIAQJJOO56QLM5GWZOL', 
    secretAccessKey: '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',
    region: 'us-east-2' })

var lambda = new AWS.Lambda()
var params = { 
    FunctionName: 'random-number-generator'
}

//create mongoose task mobel
var Schema = mongoose.Schema;
ObjectId = Schema.ObjectId

var Task  = new Schema({
    task: String
})

var Task = mongoose.model('Task', Task)

//connect to mongoose db
mongoose.connect(dbUri).then((result) => {
    console.log(result)
}).catch( (err) => {
    console.log(err)
})

//set up express server
var app = express();
app.set("view engine", "jade")
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(cookieParser())

app.get("/", (req, res) => {
    console.log("root page")
    res.render("index", {
        title: "emi hp"
    } )
})

app.get('/lambda', (req, res) => {
    console.log('in /lamdba')
    //invoking lamdba function
    lambda.invoke(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else     console.log(data);           // successful response
      });
})

app.get('/createtask', (req, res) =>{
    res.render('createtask', {
        title: 'create task page'
    })
})

app.post('/addtask', (req, res) => {
    console.log('in /addtask')
    console.log(req.body)

    var task = new Task({
        task: req.body.task + SPACE + new Date()
    })

    task.save().then((result) => {
        console.log(result)
    }).catch((err) => {
        console.log(err)
    })

    res.redirect('/alltasks')
})

app.get('/alltasks', (req, res) => {
    Task.find({}, function(err, results){
        if(err) {
            console.log(err)
            throw err
        }
        console.log(results)
        
        res.render('alltasks', {
            results: results
        })
    })
})

app.get('/task/:id/edit', (req, res) => {
    console.log('id='+req.params.id)
    Task.findById(req.params.id, function(err, result){
        if(result != null){
            res.render('edit', {
                title: 'edit task',
                task: result
            })
        }
    });
})

app.get('/task/:id/delete', (req, res) => {
    console.log('id='+req.params.id)
    Task.findById(req.params.id, function(err, result){
        if(result != null){
            //delete task
            result.remove(function(err){
                if(err) console.log(err)
                else res.redirect('/alltasks')
            })
        }
    });
})


app.post('/task/:id', (req, res) => {
    
    console.log('id='+req.params.id)
    console.log(req.body.task.task)
    
    Task.findById(req.params.id, function(err, result){
        if(err) throw err
        result.task = req.body.task.task
        result.save(function(err){
            if(err) {
                console.log(err)
                res.send('error saving')
            } else {
                res.redirect('/alltasks')
            }
        })
    })
})

app.get('/setcookie/:name', (req, res) => {
    console.log(req.params.name)
    res.cookie('username', req.params.name, {maxAge: 9000, httpOnly: true })
    res.send('cookie has been set')
})

app.get('/getcookie', (req, res) =>{
    var usersname = req.cookies['username']
    if(usersname)
        return res.send('cookie was set to ' + usersname)
    else
        return res.send('no cookie found')
})

app.listen(3000, (req, res) =>{
    console.log("listening")
})



