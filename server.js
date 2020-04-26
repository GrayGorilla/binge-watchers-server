const express = require('express');
const cors = require('cors');
const csv = require('./csv.js');
const bodyParser = require('body-parser');

const parseCSV = csv.parseCSV;

const start = Date.now();
let data = parseCSV("data/USvideos.csv");
console.log("Search time: ", Date.now()- start);


var app = express();
const port = 5000;

//const start = Date.now()
//data.searchText(["channel_title"],["Vox"]);
//console.log("Search time: ", Date.now()- start);

// Removes CORS error
app.use(cors());

app.use(bodyParser.json());

app.get('/test', function(req, res) {
    res.status(200).json({ "items": [{"message": "Hello from Backend!"}]});
    console.log('Data sent to Client.');
});


app.get('/data', function(req, res) {
    let columns = [];
    let values = [];
    for(const key in req.query){
      columns.push(key);
      values.push(req.query[key]);
    }
    let results = data.searchText(columns, values);
    res.status(200).json({"results": results});
});

app.put('/data', function(req, res) {
    let video_id = req.query["video_id"];
    console.log(video_id);
    if(video_id == undefined){
      res.status(405).json({"error": "request video_id was blank"});
    }
    console.log(video_id);
    let index = data.searchIndex([0], [video_id]);
    console.log(index);
    if(index.length != 1){
      res.status(405).json({"error": "request video_id not found"});
    }
    else{
      res.status(200).json({"results": "Nothing Happened Yet"});
    }
});

app.listen(port, function() {
    console.log('Server is running on PORT:', port);
});
