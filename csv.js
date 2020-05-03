const fs = require('fs');
const data = require('./data.js');

var Data = data.Data

function parseCSV(filename){
  let data = fs.readFileSync("data/" + filename + ".csv", 'utf-8');
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

module.exports = {
  parseCSV: parseCSV
}
