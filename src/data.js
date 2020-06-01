const fs = require('fs');

var SortedMap = require("collections/sorted-map");
var Set = require("collections/set");

function insert_sorted(the_array, number){
  let i = 0;
  while(i < the_array.length && number > the_array[i]){
    i++;
  }
  if(i == the_array.length){
    the_array.push(number);
  }
  else{
    the_array.splice(i, 0, number);
  }
}

function statistics(the_array){
  let sum = 0;
  for(let i = 0; i < the_array.length; i++){
    sum += the_array[i];
  }
  let mean = sum / the_array.length;
  let median;
  if(the_array.length % 2 == 0){
    median = (the_array[the_array.length / 2] + the_array[the_array.length / 2 + 1]) / 2;
  }
  else{
    median = the_array[Math.floor(the_array.length / 2)];
     
  }
  let min = the_array[0];
  let max = the_array[the_array.length - 1];
  return [mean, median, min, max];
}

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
    this.dirtyBits = [true, true, true, true, true, true];
    this.caches = [null, null, null, null, null, null];
    for(let i = 0; i < this.columns.length; i++){
      this.maps.push(new SortedMap());
    }
    for(let i = 0; i < this.rows.length; i++){
      for(let j = 0; j < this.columns.length; j++){
        if( this.maps[j].has(rows[i][j])){
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
  uniqueVideos(){
    let uniqueVideos = new Set();
    for(let i = 0; i < this.rows.length; i++){
      if(!uniqueVideos.has(this.rows[i][0])){
        uniqueVideos.add(this.rows[i][0]);
      }     
    }
    return uniqueVideos;
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
        let temp;
        if(this.dirtyBits[0] == true){    
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
                  let temp2 = buzzwords.get(lowerCase);
                  if(temp2 == undefined){
                    buzzwords.set(lowerCase,1);
                  }
                  else{
                    buzzwords.set(lowerCase,temp2+1);
                  }
                }
              }
            }
          }
          temp = new Map().set("buzzwords", buzzwords);
          this.caches[0] = temp;
          this.dirtyBits[0] = false;
        }
        else{
          temp = this.caches[0]
        }
        return map_to_object(temp);
      }
      else if(json["individual_tags"] == "true" ){
        let temp;
        if(this.dirtyBits[1] == true){
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
                  let temp2 = tags.get(lowerCase);
                  if(temp2 == undefined){
                    tags.set(lowerCase,1);
                  }
                  else{
                    tags.set(lowerCase,temp2+1);
                  }
                }
              }
            }
          }
          temp = new Map().set("individual_tags", tags);
          this.caches[1] = temp;
          this.dirtyBits[1] = false;
        }
        else{
          temp = this.caches[1];
        }
        return map_to_object(temp);
      } 
      else if(json["categories_count"] == "true" ){
        let output;
        if(this.dirtyBits[2] == true){
          let category_count = new Map();
          let categoriesJSON = JSON.parse(fs.readFileSync('data/US_category_id.json'));
          let categoriesMap = new Map();
          let value;
          for(value of categoriesJSON["items"]){
            categoriesMap.set(value["id"],value["snippet"]["title"]); 
          }
          let uniqueVideos = new Set();
          for(let i = 0; i < this.rows.length; i++){
            if(!uniqueVideos.has(this.rows[i][0])){
              uniqueVideos.add(this.rows[i][0]);
              let categoryid = this.rows[i][4];
              let temp = category_count.get(categoriesMap.get(categoryid));
              if(temp == undefined){
                category_count.set(categoriesMap.get(categoryid), 1);
              }
              else{
                category_count.set(categoriesMap.get(categoryid),temp+1);
              }
            }
          }
          output = new Map().set("category_count", category_count);
          this.caches[2] = output;
          this.dirtyBits[2] = false;
        }
        else{
          output = this.caches[2];
        }
        return map_to_object(output);
      }
      else if(json["day_of_the_week"] == "true" ){
        let output;
        if(this.dirtyBits[3] == true){
          let days = new Map();
          let daysOfTheWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
          let temp;
          for(temp of daysOfTheWeek){
            days.set(temp, 0);
          }
          let uniqueVideos = new Set();
          for(let i = 0; i < this.rows.length; i++){
            if(!uniqueVideos.has(this.rows[i][0])){
              uniqueVideos.add(this.rows[i][0]);
              let dateText = this.rows[i][1].match(/[^.]+/gi);
              temp = new Date(parseInt("20" + dateText[0]),parseInt(dateText[2])-1, parseInt(dateText[1]));
              let dayString = daysOfTheWeek[temp.getDay()];
              days.set(dayString, days.get(dayString)+1);
            }
          }
          output = new Map().set("day_of_the_week", days);
          this.caches[3] = output;
          this.dirtyBits[3] = false;
        }
        else{
          output = this.caches[3];
        }
        return map_to_object(output);
      }
      else if(json["days_til_trending"] == "true" ){
        let output;
        if(this.dirtyBits[4] == true){
          let days_til_trending_list = [];
          let uniqueVideos = new Set();
          for(let i = 0; i < this.rows.length; i++){
            if(!uniqueVideos.has(this.rows[i][0])){
              uniqueVideos.add(this.rows[i][0]);
              let trendingDateText = this.rows[i][1].match(/[^.]+/gi);
              let trendingDate = new Date(parseInt("20" + trendingDateText[0]),parseInt(trendingDateText[2])-1, parseInt(trendingDateText[1]));
              let publishDateText = this.rows[i][5].match(/[0-9]+/gi);
              let publishDate = new Date(parseInt(publishDateText[0]), parseInt(publishDateText[1])-1, parseInt(publishDateText[2]));
              let millisecondDifference = trendingDate.getTime() - publishDate.getTime();
              let dayDifference = Math.floor(millisecondDifference / (24 * 3600000));
              insert_sorted(days_til_trending_list, dayDifference);
            }
          }
          let [mean, median, min, max] = statistics(days_til_trending_list);
          output = new Map().set("days_til_trending", new Map().set("mean", mean).set("median", median).set("min", min).set("max", max));
          this.caches[4] = output;
          this.dirtyBits[4] = false;
        }
        else{
          output = this.caches[4];
        }
        return map_to_object(output);
      }
      else if(json["comments_data"] == "true" ){
        let output;
        if(this.dirtyBits[5] == true){
          let comments_data = [];
          let uniqueVideos = new Set();
          for(let i = this.rows.length-1; i >=0; i--){
            if(!uniqueVideos.has(this.rows[i][0])){
              uniqueVideos.add(this.rows[i][0]);
              comments_data.push([this.rows[i][7],parseInt(this.rows[i][8])/(parseInt(this.rows[i][8])+parseInt(this.rows[i][9])), this.rows[i][12]]);
            }
          }
          output = new Map().set("comments_data", comments_data);
          this.caches[5] = output;
          this.dirtyBits[5] = false;
        }
        else{
          output = this.caches[5];
        }
        return map_to_object(output);
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
      else if(json["categories_count"] == "true" ){
        let [results, resultsIndex] = this.searchIndex(searchColumns, values);
        let category_count = new Map();
        let categoriesJSON = JSON.parse(fs.readFileSync('data/US_category_id.json'));
        let categoriesMap = new Map();
        let value;
        for(value of categoriesJSON["items"]){
          categoriesMap.set(value["id"],value["snippet"]["title"]); 
        }
        let uniqueVideos = new Set();
        for(let i = 0; i < results.length; i++){
          if(!uniqueVideos.has(results[i][0])){
            uniqueVideos.add(results[i][0]);
            let categoryid = results[i][4];
            let temp = category_count.get(categoriesMap.get(categoryid));
            if(temp == undefined){
              category_count.set(categoriesMap.get(categoryid), 1);
            }
            else{
              category_count.set(categoriesMap.get(categoryid),temp+1);
            }
          }
        }
        let temp = new Map().set("results",results).set("resultsIndex",resultsIndex).set("category_count", category_count);
        return map_to_object(temp);
      }
      else if(json["day_of_the_week"] == "true" ){
        let [results, resultsIndex] = this.searchIndex(searchColumns, values);
        let days = new Map();
        let daysOfTheWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        let temp;
        for(temp of daysOfTheWeek){
          days.set(temp, 0);
        }
        let uniqueVideos = new Set();
        for(let i = 0; i < results.length; i++){
          if(!uniqueVideos.has(results[i][0])){
            uniqueVideos.add(results[i][0]);
            let dateText = results[i][1].match(/[^.]+/gi);
            temp = new Date(parseInt("20" + dateText[0]),parseInt(dateText[2])-1, parseInt(dateText[1]));
            let dayString = daysOfTheWeek[temp.getDay()];
            days.set(dayString, days.get(dayString)+1);
          }
        }
        temp = new Map().set("results",results).set("resultsIndex",resultsIndex).set("day_of_the_week", days);
        return map_to_object(temp);
      }
      else if(json["days_til_trending"] == "true" ){
        let [results, resultsIndex] = this.searchIndex(searchColumns, values);
        let days_til_trending_list = [];
        let uniqueVideos = new Set();
        for(let i = 0; i < results.length; i++){
          if(!uniqueVideos.has(results[i][0])){
            uniqueVideos.add(results[i][0]);
            let trendingDateText = results[i][1].match(/[^.]+/gi);
            let trendingDate = new Date(parseInt("20" + trendingDateText[0]),parseInt(trendingDateText[2])-1, parseInt(trendingDateText[1]));
            let publishDateText = results[i][5].match(/[0-9]+/gi);
            let publishDate = new Date(parseInt(publishDateText[0]), parseInt(publishDateText[1])-1, parseInt(publishDateText[2]));
            let millisecondDifference = trendingDate.getTime() - publishDate.getTime();
            let dayDifference = Math.floor(millisecondDifference / (24 * 3600000));
            insert_sorted(days_til_trending_list, dayDifference);
          }
        }
        let [mean, median, min, max] = statistics(days_til_trending_list);
        let temp = new Map().set("results",results).set("resultsIndex", resultsIndex).set("days_til_trending", new Map().set("mean", mean).set("median", median).set("min", min).set("max", max));
        return map_to_object(temp);
      }
      else if(json["comments_data"] == "true" ){
        let [results, resultsIndex] = this.searchIndex(searchColumns, values);
        let comments_data = [];
        let uniqueVideos = new Set();
        for(let i = 0; i < results.length; i++){
          if(!uniqueVideos.has(results[i][0])){
            uniqueVideos.add(results[i][0]);
            comments_data.push([results[i][7],parseInt(results[i][8])/(parseInt(results[i][8])+parseInt(results[i][9])), results[i][12]]);
          }
        }
        let temp = new Map().set("results", results).set("resultsIndex", resultsIndex).set("comments_data", comments_data);
        return map_to_object(temp);
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
    for(let i = 0; i < this.dirtyBits.length; i++){
      this.dirtyBits[i] = true;
    }
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
      for(let i = 0; i < this.dirtyBits.length; i++){
        this.dirtyBits[i] = true;
      }
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
    for(let i = 0; i < this.dirtyBits.length; i++){
      this.dirtyBits[i] = true;
    }
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
    for(let i = 0; i < this.dirtyBits.length; i++){
      this.dirtyBits[i] = true;
    }
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
    Data: Data,
    map_to_object: map_to_object
}
