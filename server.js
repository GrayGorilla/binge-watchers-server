const express = require('express');
const cors = require('cors');
const csv = require('./csv.js');
const data = require('./data.js');
const bodyParser = require('body-parser');

const parseCSV = csv.parseCSV;

const USvideos = parseCSV("data/USvideos.csv");
const app = express();

const port = 5000;

//const start = Date.now()
//data.searchText(["channel_title"],["Vox"]);
//console.log("Search time: ", Date.now()- start);

// Removes CORS error
app.use(cors());

app.use(bodyParser.json());

app.get('/test', function(req, res) {
    res.status(200).json({ "items": [{"message": "Hello from Backend!"}]});
    console.log('Test data sent to Client.');
    console.log('\nServer is running on PORT:', port);
});


app.get('/data', function(req, res) {
    let columns = [];
    let values = [];
    for(const key in req.query){
      columns.push(key);
      values.push(req.query[key]);
    }
    let results = USvideos.searchText(columns, values);

    // Output Search Results
    console.log('Search Results:');
    console.log(results);
    
    res.status(200).json({"results": results});

});

app.put('/data', function(req, res) {
    let indexText = req.query["index"];
    console.log("index: ", indexText);
    if(indexText == undefined || indexText == ""){
      res.status(405).json({"error": "request index was blank"});
      return;
    }
    let index = parseInt(indexText, 10);
    console.log("index: ", index);
    if(Number.isNaN(index) || index > USvideos.rows.length || index < 0){
      res.status(405).json({"error": "request index not valid"});
      return;
    }
    else{
      let columns = [];
      let rows = [];
      for(key in req.query){
        if(key != "index"){
          columns.push(key);
          rows.push(req.query[key]);
        }
      }
      
    }
});

app.listen(port, function() {
    console.log('Server is running on PORT:', port);
});
