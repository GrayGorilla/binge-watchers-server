const express = require('express');
const cors = require('cors');
const csv = require('./csv.js');
const bodyParser = require('body-parser');

const parseCSV = csv.parseCSV;

let data = parseCSV("data/USvideos.csv");

var app = express();
const port = 5000;

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
    console.log('Data sent to Client.');
});

app.listen(port, function() {
    console.log('Server is running on PORT:', port);
});
