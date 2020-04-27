const express = require('express');
const cors = require('cors');
const csv = require('./csv.js');
const data = require('./data.js');
const bodyParser = require('body-parser');

const parseCSV = csv.parseCSV;
const app = express();

const port = 5000;

const currentDataSet = parseCSV("data/USvideos.csv");

// Removes CORS error
app.use(cors());

app.use(bodyParser.json());

app.get('/test', function(req, res) {
    res.status(200).json({ "items": [{"message": "Hello from Backend!"}]});
    console.log('Test data sent to Client.');
    console.log('\nServer is running on PORT:', port);
});


app.get('/data', function(req, res) {
    let [results, resultsIndex] = currentDataSet.searchText(req.query);
    // Output Search Results
    console.log('Search Results:');
    console.log(results);
    
    res.status(200).json({"results": results, "resultsIndex": resultsIndex});

});

app.put('/data', function(req, res) {
    let indexText = req.query["index"];
    if(indexText == undefined || indexText == ""){
      res.status(405).json({"status": "ERROR: request index was blank"});
      return;
    }
    let index = parseInt(indexText, 10);
    if(Number.isNaN(index) || index > currentDataSet.rows.length || index < 0){
      res.status(405).json({"status": "ERROR: request index not valid"});
      return;
    }
    else{
      currentDataSet.updateText(index, req.query);
      res.status(200).json({"status": "updated"});
    }
});

app.post('/data', function(req, res) {
  currentDataSet.createRow(req.query);
  res.status(200).json({"status": "created"});
});

app.delete('/data', function(req, res) {
  let indexesText = req.query["indexes"];
  if(indexesText == undefined){
    res.status(405).json({"status":"ERROR: indexes does not exist"});
  }
  else if(!Array.isArray(indexesText)){
    res.status(405).json({"status":"ERROR: indexes was not an array"});
  }
  else if(indexesText.length == 0){ 
    res.status(405).json({"status":"ERROR: indexes was empty"});
  }
  else{
    let temp = 0;
    let indexes = [];
    for(let i = 0; i < indexesText.length; i++){
      temp = parseInt(indexesText[i], 10);
      if(Number.isNaN(temp)){
        res.status(405).json({"status": "ERROR: at least one index is not a number"});
        return;
      }
      else{
        indexes.push(temp);
      }
    }
    if(!currentDataset.removeRows(indexes)){
      res.status(405).json({"status": "ERROR: indexes out of range"});
    }
    else{
      res.status(200).json({"status": "deleted"});
    }
  }
});

app.listen(port, function() {
    console.log('Server is running on PORT:', port);
});
