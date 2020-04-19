const express = require('express');
const cors = require('cors');
const fs = require('fs');
const readline = require('readline');

class Data {
  constructor(columns, rows){
    this.columns = columns;
    this.rows = rows;
  }
  
  searchIndex(columnsIndex, values){
    if(columnsIndex.length != values.length){
      return null;
    }
    let results = [];
    for(let i = 0; i < this.rows.length; i++){
      let j = 0
      for(; j < columnsIndex.length; j++){
        if(this.rows[i][columnsIndex[j]] != values[j]){
          break;
        }
      }
      if(j == columnsIndex.length){
        results.push(this.rows[i]);
      }
    }
    return results;
  }

  //columnsText values are values that are the same as columns, 
  //and they are in the same order as in columns 
  //(if "xxxx" is before "yyyy" in columns, then it has to be the same in columnsText)
  searchText(columnsText, values){
    if(columnsText.length != values.length){
      return null;
    }
    let searchColumns = [];
    let j = 0; 
    for(let i = 0; i < this.columns.length && j < columnsText.length; i++){
      if(this.columns[i] == columnsText[j]){
        searchColumns.push(i);
        j++;
      }
    }
    if( j < columnsText.length){
      return null;
    }
    else{
      return this.searchIndex(searchColumns, values);
    }
  }
}

function parseCSV(filename){
  let data = fs.readFileSync(filename, 'utf-8');
  let rowStrings = data.toString().replace(/\r/gm, "").trim().split("\n"); 
  let columns = rowStrings[0].toString().split(",");
  for(let i = 0; i < columns.length; i++){
    columns[i].trim();
  }
  let rows = [];
  for(let i = 1; i < rowStrings.length; i++){
    let currentLine = [];
    let j = 0;
    while(j < rowStrings[i].length){
      currentValue = "";
      let k = 0;
      let inQuotes = false;
      let cont = true;
      if(rowStrings[i][j] == "\""){
        j++;
        inQuotes = true;
      }
      while(cont){
        if(inQuotes == false && (j + k  >= rowStrings[i].length || rowStrings[i][j+k] == ",")){
          cont = false;
          currentLine.push(rowStrings[i].substring(j,j+k));
          k++;
          j+=k;
        }
        else if(inQuotes == true && (j + k + 1>= rowStrings[i].length || (rowStrings[i][j + k] == "\"" && rowStrings[i][j + k + 1] == ","))){
          cont = false;
          currentLine.push(rowStrings[i].substring(j,j+k));
          k+=2;
          j+=k;
        }
        else if(j+k >= rowStrings[i].length){
          console.log("CSV Parsing Failed");
          return null;
        }
        else{
          k++;
        }
      }
    }
    rows.push(currentLine);
  }
  return new Data(columns, rows);
}

let data = parseCSV("data/USvideos.csv");
console.log(data.searchText(["channel_title"],["Kurzgesagt – In a Nutshell"]));


const app = express();
const port = 5000;

// Removes CORS error
app.use(cors());

app.get('/data', function(req, res) {
    res.status(200).json({ "items": [{"message": "Hello from Backend!"}]});
    console.log('Data sent to Client.');
});

app.listen(port, function() {
    console.log('Server is running on PORT:', port);
});
