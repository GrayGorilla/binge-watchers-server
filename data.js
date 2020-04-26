var SortedMap = require("collections/sorted-map");
var Set = require("collections/set");

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
      if(possibleResults != undefined){
        for(let i = 0; i < possibleResults.length; i++){
          results.push(this.rows[possibleResults[i]]);
        }
        return results;
      }
      else{
        return null;
      }
    }
    for(let i = 0; i < columnsIndex.length; i++){
      let newResults = this.maps[i].get(values[i]);
      if(newResults != undefined){
        possibleResults.concat(newResults);
      }
    }
    possibleResults.sort();
    for(let i = 0; i < possibleResults.length; i++){
      numberOfResults = 0;
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

module.exports = {
    Data: Data
}
