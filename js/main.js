function runScript () {
    
    //set some constants that will be used to determine the size of the map
    var mapheight = 300;
    var mapwidth = 400;
    
    //set some constants that will be used to determine the size of the graphic
    var graphheight = 400;
    var graphwidth = 400;
    var xpadding = 20;
    var ypadding = 25;
    
    var dataList = [];
    
    
    //set the inital characertistics of the map svg
    var map = d3.select("#map")
        .attr("height" , mapheight)
        .attr("width", mapwidth);
    
    //set the intial charactersitcs of the graph svg
    var graph = d3.select("#master-graph")
        .attr("height" , graphheight)
        .attr("width" , graphwidth);
    
    
    //ajax function that starts to load data
    Promise.all([
        d3.csv("data/counties-nonspatial.csv"),
        d3.json("data/Counties.json")
    ]).then(function (files) {
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
                  
                  //join the two datasets together and push the object into the new master array
                  
              }
              
          }
        }
        
    }).catch( function (error) {
        console.log("Something has failed" + error);
        
    });
        
    
    
    console.log("testing");
    
}

window.onload = runScript;