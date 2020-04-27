const fs = require('fs');
var SortedMap = require("collections/sorted-map");

class Data {
  constructor(columns, rows){
    this.columns = columns;
    this.rows = rows;
    this.maps = [];
    for(let i = 0; i < this.columns.length; i++){
      this.maps.push(new SortedMap());
    }
    for(let i = 0; i < this.rows.length; i++){
      for(let j = 0; j < this.rows[i].length; j++){
        if(this.maps[j].has(rows[i][j])){
          this.maps[j].get(this.rows[i][j]).push(i);
        }
        else{
          this.maps[j].set(this.rows[i][j], [i]);
        }
      }
    }
    for(let i = 0; i < this.maps.length; i++){
      for(let j = 0; j < this.maps[i].length; j++){
        if(this.maps[i].has(j)){
          this.maps[i].get(j).sort();
        }
      }
    }
  }
  
  searchIndex(columnsIndex, values){
    if(columnsIndex.length != values.length){
      return null;
    }
    let possibleResults = [];
    let results = [];
    if(columnsIndex.length == 1){
      possibleResults = this.maps[columnsIndex[0]].get(values[0]);
      for(let i = 0; i < possibleResults.length; i++){
        results.push(this.rows[possibleResults[i]]);
      }
      return results;
    }
    for(let i = 0; i < columnsIndex.length; i++){
      let newResults = this.maps[columnsIndex[i]].get(values[i]);
      if(newResults != undefined){
        possibleResults = possibleResults.concat(newResults);

      }
    }
    possibleResults.sort();
    for(let i = 0; i < possibleResults.length; i++){
      let j = 1;
      while(i+j < possibleResults.length && possibleResults[i+j] == possibleResults[i]){
        j++;
      }
      if(j >= columnsIndex.length){
        results.push(this.rows[possibleResults[i]]);
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

module.exports = {
  Data: Data,
  parseCSV: parseCSV
}
