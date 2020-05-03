const fs = require('fs');

var SortedMap = require("collections/sorted-map");
var Set = require("collections/set");


//davemackintosh's map to json gist
function map_to_object(map) {
    const out = Object.create(null)
    map.forEach((value, key) => {
      if (value instanceof Map) {
        out[key] = map_to_object(value)
      }
      else {
        out[key] = value
      }
    })
    return out
}

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
          this.maps[j].get(this.rows[i][j]).add(i);
        }
        else{
          var temp = new Set();
          temp.add(i);
          this.maps[j].set(this.rows[i][j], temp);
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
    let resultsIndex = [];
    if(columnsIndex.length == 1){
      let possibleResultsSet = this.maps[columnsIndex[0]].get(values[0]);
      if(possibleResultsSet != undefined){
        possibleResults = Array.from(possibleResultsSet.values());
        possibleResults.sort(function(a,b){return a-b});
        for(let i = 0; i < possibleResults.length; i++){
          results.push(this.rows[possibleResults[i]]);
        }
        return [results, possibleResults];
      }
      else{
        return [[],[]];
      }
    }
    for(let i = 0; i < columnsIndex.length; i++){
      let newResults = this.maps[columnsIndex[i]].get(values[i]);
      if(newResults != undefined){
        possibleResults = possibleResults.concat(Array.from(newResults.values()));
      }
    }
    possibleResults.sort(function(a,b){return a-b});
    for(let i = 0; i < possibleResults.length; i++){
      let j = 1;
      while(i+j < possibleResults.length && possibleResults[i+j] == possibleResults[i]){
        j++;
      }
      if(j >= columnsIndex.length){
        results.push(this.rows[possibleResults[i]]);
        resultsIndex.push(possibleResults[i]);
      }
    }
    return [results, resultsIndex];
  }

  searchText(json){
    let searchColumns = [];
    let values = [];
    for(let i = 0; i < this.columns.length; i++){
      let temp = json[this.columns[i]];
      if(temp != undefined){
        searchColumns.push(i);
        values.push(temp);
      }
    }
    if( searchColumns.length == 0){
      if(json["buzzwords"] == "true" ){
        let buzzwords = new Map();
        let uniqueVideos = new Set();
        for(let i = 0; i < this.rows.length; i++){
          if(!uniqueVideos.has(this.rows[i][0])){
            uniqueVideos.add(this.rows[i][0]);
            let words = this.rows[i][2].match(/[a-z]+(([\'\-]?[a-z]+)+)?/gi);
            let word;
            if(words != null){
              for(word of words){
                let lowerCase = word.toLowerCase();
                let temp = buzzwords.get(lowerCase);
                if(temp == undefined){
                  buzzwords.set(lowerCase,1);
                }
                else{
                  buzzwords.set(lowerCase,temp+1);
                }
              }
            }
          }
        }
        let temp = new Map().set("buzzwords", buzzwords);
        return map_to_object(temp);
      }
      else if(json["individual_tags"] == "true" ){
        let tags = new Map();
        let uniqueVideos = new Set();
        for(let i = 0; i < this.rows.length; i++){
          if(!uniqueVideos.has(this.rows[i][0])){
            uniqueVideos.add(this.rows[i][0]);
            let tagsText = this.rows[i][6].match(/[^\"\|\"]+/gi);
            let tag;
            if(tagsText != null){
              for(tag of tagsText){
                let lowerCase = tag.toLowerCase();
                let temp = tags.get(lowerCase);
                if(temp == undefined){
                  tags.set(lowerCase,1);
                }
                else{
                  tags.set(lowerCase,temp+1);
                }
              }
            }
          }
        }
        let temp = new Map().set("individual_tags", tags);
        return map_to_object(temp);
      } 
      else{
        return undefined;
      }
    }
    else{
      if(json["buzzwords"] == "true" ){
        let [results, resultsIndex] = this.searchIndex(searchColumns, values);
        let buzzwords = new Map();
        let uniqueVideos = new Set();
        for(let i = 0; i < results.length; i++){
          if(!uniqueVideos.has(results[i][0])){
            uniqueVideos.add(results[i][0]);
            let words = results[i][2].match(/[a-z]+(([\'\-]?[a-z]+)+)?/gi);
            let word;
            if(words != null){
              for(word of words){
                let lowerCase = word.toLowerCase();
                let temp = buzzwords.get(lowerCase);
                if(temp == undefined){
                  buzzwords.set(lowerCase,1);
                }
                else{
                  buzzwords.set(lowerCase,temp+1);
                }
              }
            }
          }
        }
        return map_to_object(new Map().set("results",results).set("resultsIndex",resultsIndex).set("buzzwords", buzzwords));
      }
      else if(json["individual_tags"] == "true" ){
        let [results, resultsIndex] = this.searchIndex(searchColumns, values);
        let tags = new Map();
        let uniqueVideos = new Set();
        for(let i = 0; i < results.length; i++){
          if(!uniqueVideos.has(results[i][0])){
            uniqueVideos.add(results[i][0]);
            let tagsText = results[i][6].match(/[^\"\|\"]+/gi);
            let tag;
            if(tagsText != null){
              for(tag of tagsText){
                let lowerCase = tag.toLowerCase();
                let temp = tags.get(lowerCase);
                if(temp == undefined){
                  tags.set(lowerCase,1);
                }
                else{
                  tags.set(lowerCase,temp+1);
                }
              }
            }
          }
        }
        return map_to_object(new Map().set("results",results).set("resultsIndex",resultsIndex).set("individual_tags", tags));
      }
      else{
        let [results, resultsIndex] = this.searchIndex(searchColumns, values);
        return map_to_object(new Map().set("results", results).set("resultsIndex", resultsIndex));
      }
    } 
  }
  

  updateIndex(index, row){
    if(row.length != this.columns.length || (index > this.rows.length || index < 0)){
      return null;
    }
    else{
      for(let i = 0; i < this.maps.length; i++){
        this.maps[i].get(this.rows[index][i]).delete(index);
        let temp = this.maps[i].get(row[i]);
        if(temp == undefined){
          let tempSet = new Set();
          tempSet.add(index);
          this.maps[i].set(row[i], tempSet)
        }
        else{
          temp.add(index);
        }
      }
      this.rows[index] = row;
    }
  }

  updateText(index, json){
    let row = [];
    
    for(let i = 0; i < this.columns.length; i++){
      let temp = json[this.columns[i]];
      if(temp == undefined){
        row.push(this.rows[index][i]);
      }
      else{
        row.push(temp);
      }
    }
    this.updateIndex(index, row);
  }
  
  insertRow(row){
    if(row.length != this.columns.length){
      return null;
    }
    else{ 
      let index = this.rows.length;
      this.rows.push(row);
      for(let i = 0; i < this.columns.length; i++){
        let temp = this.maps[i].get(row[i]);
        if(temp == undefined){
          let tempSet = new Set();
          tempSet.add(index);
          this.maps[i].set(row[i], tempSet)
        }
        else{
          temp.add(index);
        }
      }
    }
  }
  
  createRow(json){
    let temp = 0;
    let row = [];
    for(let i = 0; i < this.columns.length; i++){
      temp = json[this.columns[i]];
      if(temp == undefined){
        row.push("");
      }
      else{
        row.push(temp);
      }
    }
    this.insertRow(row);
  }
  
  deleteRow(index){
    this.updateIndex(index, this.rows[this.rows.length - 1]);
    index = this.rows.length - 1;
    let temp = 0;
    for(let i = 0; i < this.columns.length; i++){
      temp = this.maps[i].get(this.rows[index][i]);
      if (temp.size == 0){
        this.maps[i].delete(this.rows[index][i]);
      }
      else{
        temp.delete(index);
      }
    }
    this.rows.splice(index, 1);
  }

  removeRows(indexes){
    indexes.sort(function(a,b){return a-b}).reverse();

    if(indexes[0] < 0 || indexes[0] > this.rows.length || indexes[indexes.length - 1] < 0){
      return false;
    }
    for(let i = 0; i < indexes.length; i++){
      this.deleteRow(indexes[i]);
    }
    console.log("Data size: ", this.rows.length);
    return true;
  }
  
  storeCSV( filename ){
    var writer = fs.createWriteStream("data/" + filename + ".csv", { flags: 'w'});
    for(let i = 0; i < this.columns.length; i++){
      writer.write(this.columns[i]);
      if(i < this.columns.length-1){
        writer.write(",");
      }
      else{
        writer.write("\n");
      }
    }
    for(let i = 0; i < this.rows.length; i++){
      for(let j = 0; j < this.columns.length; j++){
        writer.write("\"");
        writer.write(this.rows[i][j]);
        writer.write("\"");
        if(j < this.columns.length-1){
          writer.write(",");
        }
        else{
          writer.write("\n");
        }
      }
    }
    writer.end();
  }

}

module.exports = {
    Data: Data
}
