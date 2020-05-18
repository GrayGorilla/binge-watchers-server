const express = require('express');
const cors = require('cors');
const csv = require('./csv.js');
const data = require('./data.js');
const bodyParser = require('body-parser');

const map_to_object = data.map_to_object
const parseCSV = csv.parseCSV;
const app = express();



const port = 5000;


let currentUniqueVideos;
let uniqueVideos = new Map();
{
  let currentDataSet = parseCSV("CAvideos");
  currentUniqueVideos = currentDataSet.uniqueVideos();
  for(key of currentUniqueVideos){
    let temp = uniqueVideos.get(key);
    if(temp != undefined){
      uniqueVideos.set(key, temp + 1);
    }
    else{
      uniqueVideos.set(key, 1);
    }
  }
}
console.log("parsed CAvideos");
{
  let currentDataSet = parseCSV("DEvideos");
  currentUniqueVideos = currentDataSet.uniqueVideos();
  for(key of currentUniqueVideos){
    let temp = uniqueVideos.get(key);
    if(temp != undefined){
      uniqueVideos.set(key, temp + 1);
    }
    else{
      uniqueVideos.set(key, 1);
    }
  }
}
console.log("parsed DEvideos");
/*
{
  let currentDataSet = parseCSV("FRvideos");
  currentUniqueVideos = currentDataSet.uniqueVideos();
  for(key of currentUniqueVideos){
    let temp = uniqueVideos.get(key);
    if(temp != undefined){
      uniqueVideos.set(key, temp + 1);
    }
    else{
      uniqueVideos.set(key, 1);
    }
  }
}
console.log("parsed FRvideos");
*/
{ 
  let currentDataSet = parseCSV("GBvideos");
  currentUniqueVideos = currentDataSet.uniqueVideos();
  for(key of currentUniqueVideos){
    let temp = uniqueVideos.get(key);
    if(temp != undefined){
      uniqueVideos.set(key, temp + 1);
    }
    else{
      uniqueVideos.set(key, 1);
    }
  }
}
console.log("parsed GBvideos");
/*
let currentDataSet = parseCSV("INvideos");
currentUniqueVideos = currentDataSet.uniqueVideos();
for(key of currentUniqueVideos){
  let temp = uniqueVideos.get(key);
  if(temp != undefined){
    uniqueVideos.set(key, temp + 1);
  }
  else{
    uniqueVideos.set(key, 1);
  }
}
console.log("parsed INvideos");

currentDataSet = parseCSV("JPvideos");
currentUniqueVideos = currentDataSet.uniqueVideos();
for(key of currentUniqueVideos){
  let temp = uniqueVideos.get(key);
  if(temp != undefined){
    uniqueVideos.set(key, temp + 1);
  }
  else{
    uniqueVideos.set(key, 1);
  }
}
console.log("parsed JPvideos");

currentDataSet = parseCSV("KRvideos");
currentUniqueVideos = currentDataSet.uniqueVideos();
for(key of currentUniqueVideos){
  let temp = uniqueVideos.get(key);
  if(temp != undefined){
    uniqueVideos.set(key, temp + 1);
  }
  else{
    uniqueVideos.set(key, 1);
  }
}
console.log("parsed KRvideos");

currentDataSet = parseCSV("MXvideos");
currentUniqueVideos = currentDataSet.uniqueVideos();
for(key of currentUniqueVideos){
  let temp = uniqueVideos.get(key);
  if(temp != undefined){
    uniqueVideos.set(key, temp + 1);
  }
  else{
    uniqueVideos.set(key, 1);
  }
}
console.log("parsed MXvideos");

currentDataSet = parseCSV("RUvideos");
currentUniqueVideos = currentDataSet.uniqueVideos();
for(key of currentUniqueVideos){
  let temp = uniqueVideos.get(key);
  if(temp != undefined){
    uniqueVideos.set(key, temp + 1);
  }
  else{
    uniqueVideos.set(key, 1);
  }
}
console.log("parsed RUvideos");
*/
currentDataSet = parseCSV("USvideos");
currentUniqueVideos = currentDataSet.uniqueVideos();
for(key of currentUniqueVideos){
  let temp = uniqueVideos.get(key);
  if(temp != undefined){
    uniqueVideos.set(key, temp + 1);
  }
  else{
    uniqueVideos.set(key, 1);
  }
}
console.log("parsed USvideos");

// Removes CORS error
app.use(cors());

app.use(bodyParser.json());

app.get('/test', function(req, res) {
    res.status(200).json({ "items": [{"message": "Hello from Backend!"}]});
    console.log('Test data sent to Client.');
    console.log('\nServer is running on PORT:', port);
});


app.get('/data', function(req, res) {
    let json = currentDataSet.searchText(req.query);
    res.status(200).json(json);
    // Output Search Results
    console.log('Search Results:');
    console.log(json);
    console.log('\nServer is running on PORT:', port);
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
      // Output request query
      console.log('Put successful, entry updated:');
      console.log(req.query);
      console.log('\nServer is running on PORT:', port);
    }
});

app.post('/data', function(req, res) {
  currentDataSet.createRow(req.query);
  res.status(200).json({"status": "created"});
  // Output request query
  console.log('Post successful, entry inserted:');
  console.log(req.query);
  console.log('\nServer is running on PORT:', port);
});

app.delete('/data', function(req, res) {
  console.log(req.query);
  let indexesText = req.query["indexes"];
  if(indexesText == undefined){
    res.status(405).json({"status":"ERROR: indexes does not exist"});
  }
  else if(!Array.isArray(indexesText)){
    let temp = parseInt(indexesText, 10);
    if(Number.isNaN(temp)){
      res.status(405).json({"status": "ERROR: at least one index is not a number"});
    }
    else{
      currentDataSet.deleteRow(temp);
      res.status(200).json({"status":"deleted row"});
      // Output request query
      console.log('Delete successful, entry deleted:');
      console.log(req.query);
      console.log('\nServer is running on PORT:', port);
    }
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
    if(!currentDataSet.removeRows(indexes)){
      res.status(405).json({"status": "ERROR: indexes out of range"});
    }
    else{
      res.status(200).json({"status": "deleted rows"});
      // Output request query
      console.log('Delete successful, entries deleted:');
      console.log(req.query);
      console.log('\nServer is running on PORT:', port);
    }
  }
});

app.get('/backup', function(req, res) {
  let filename = req.query["filename"];
  if(filename == undefined){
    res.status(405).json({"status":"ERROR: filename does not exist"});
  }
  else{
    currentDataSet = parseCSV(filename);
    res.status(200).json({"status": "loaded"});
    // Output request query
    console.log('Get successful, file loaded:');
    console.log(req.query);
    console.log('\nServer is running on PORT:', port);
  }
});

app.put('/backup', function(req, res) {
  let filename = req.query["filename"];
  if(filename == undefined){
    res.status(405).json({"status":"ERROR: filename does not exist"});
  }
  else{
    currentDataSet.storeCSV(filename);
    res.status(200).json({"status": "stored"});
    // Output request query
    console.log('Put successful, file stored:');
    console.log(req.query);
    console.log('\nServer is running on PORT:', port); 
  }
});

app.get('/world_videos', function(req, res){
  console.log(uniqueVideos);
  let temp = new Map();
  temp.set("unique_videos", uniqueVideos);
  res.status(200).json(map_to_object(temp));
});

app.listen(port, function() {
    console.log('Server is running on PORT:', port);
});
