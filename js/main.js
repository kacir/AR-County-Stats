function runScript () {
    
    //set some constants that will be used to determine the size of the map
    var mapheight = 300;
    var mapwidth = 400;
    
    //set some constants that will be used to determine the size of the graphic
    var graphheight = 400;
    var graphwidth = 400;
    var xpadding = 20;
    var ypadding = 25;
    
    var dataList = [];//array that will hold all of the master joined data, d3 will have to work with this array
    //array with the field name of interest in the master non-spatial table
    var attrArray = ["Bachelors" , "GISCountyName" , "LessthanHighschool" , "Miles of Interstate", "OnlyHighschool", "PovertyPer", "medianIncome", "someCollege", "unempolymentPer"];
    
    var projection = d3.geoConicEqualArea()
        .center([3.64, 33.60])
        .rotate([95.55, 0, 0])
        .parallels([22.91, 55.02])
        .scale(2573.74)
        .translate(mapwidth / 2, mapheight / 2);
    
    var pathGenerator = d3.geoPath().projection(projection);
    
    
    //set the inital characertistics of the map svg
    var map = d3.select("#map")
        .attr("height" , mapheight)
        .attr("width", mapwidth);
    
    //set the intial charactersitcs of the graph svg
    var graph = d3.select("#master-graph")
        .attr("height" , graphheight)
        .attr("width" , graphwidth);
    
    //set scales that will be used inside of the graph to scale the bars correctly
    var ycord = "";
    var xcord = '';
    var color = '';
    var height = '';
    
    
    
    
    //merges the spatial and non-spatial data together into a single list of joined objects.
    //function is called after ajax request has been filled.
    function joinData (files) {
        console.log("This appears to work!");
        
        var nonSpatialData = files[0];
        var spatialData = files[1].features;
        
        console.log("logging non-spatial data");
        console.log(nonSpatialData);
        console.log("logging spatial data");
        console.log(spatialData);
        
        //join the spatial and non spatial data together
        for (var i=0; i < nonSpatialData.length; i++) {
            var nonSpatialCounty = nonSpatialData[i];
            var nonSpatialKey = nonSpatialCounty.GISCountyName;
            
          for (var a=0; a < spatialData.length; a++){
              
              var spatialCounty = spatialData[a];
              var spatialKey = spatialCounty.properties.name;
              
              if (spatialKey == nonSpatialKey){
                  console.log("The Keys Match!");
                  
                  var newRecord = {};
                  newRecord.spatial = spatialCounty;
                  
                  //join the two datasets together and push the object into the new master array
                  attrArray.forEach(function (attr){
                      var val = parseFloat(nonSpatialCounty[attr]);
                      newRecord[attr] = val;
                      
                      
                  });
                  
                  dataList.push(newRecord);
              }
          }
        }
        
        console.log("Logging joined data!");
        console.log(dataList);
    }
    
    function createMap () {
        console.log("create map called");
        
        var counties = map.selectAll(".counties")
            .append("path")
            .data(dataList)
            .enter()
            .append("path")
            .attr("class" , ".counties");
        
    }
    
    function createGraph () {
        console.log("create graph called");
        
        var fistAttr = attrArray[0];
        
        var bars = graph.selectAll(".bars")
            .data(dataList)
            .enter()
            .append("rect")
            .attr("class" , ".bars")
            .attr("style", "fill:rgb(0,0,255);stroke-width:3;stroke:rgb(0,0,0)")
            .attr("width" , "50")
            .attr("height" , "100")
            ;
        
    }
    
    
    
    //ajax function that starts to load data
    Promise.all([
        d3.csv("data/counties-nonspatial.csv"),
        d3.json("data/Counties.json")
    ]).then(function (files) {
        joinData(files);//merge data from the two different files together
        createMap();
        createGraph();

        
    }).catch( function (error) {
        console.log("Something has failed" + error);
        
    });
        
    
    
    console.log("testing, testing my test!");
    
}

window.onload = runScript;