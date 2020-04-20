const express = require('express');
const cors = require('cors');
const csv = require('./csv.js');
const bodyParser = require('body-parser');

const parseCSV = csv.parseCSV;
const data = parseCSV("data/USvideos.csv");
const app = express();
const port = 5000;

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
    let results = data.searchText(columns, values);

    // Output Search Results
    console.log('Search Results:');
    console.log(results);
    
    res.status(200).json({"results": results});
    console.log('\nServer is running on PORT:', port);
});

app.listen(port, function() {
    console.log('Server is running on PORT:', port);
});
