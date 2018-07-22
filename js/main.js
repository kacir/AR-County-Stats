function runScript () {
    
    //set some constants that will be used to determine the size of the map
    var mapheight = 300;
    var mapwidth = 400;
    
    //set some constants that will be used to determine the size of the graphic
    var graphheight = 400;
    var graphwidth = 400;
    var xpadding = 20;
    var ypadding = 25;
    var barpadding = 2;
    
    var dataList = [];//array that will hold all of the master joined data, d3 will have to work with this array
    //array with the field name of interest in the master non-spatial table
    var attrArray = ["Bachelors" , "GISCountyName" , "LessthanHighschool" , "Miles of Interstate", "OnlyHighschool", "PovertyPer", "medianIncome", "someCollege", "unempolymentPer"];
    var selectedField = attrArray[0];//the field that is currently selected in the dropdown
    
    var projection = d3.geoConicEqualArea()
        .center([3.64, 33.60])
        .rotate([95.55, 0, 0])
        .parallels([22.91, 55.02])
        .scale(2573.74)
        .translate(mapwidth / 2, mapheight / 2);
    
    var pathGenerator = d3.geoPath().projection(projection);
    
    //get the dropdown populated with field names
    var dropdown = d3.select(".dropdown");
    dropdown.selectAll(".dropdownItem")
        .data(attrArray)
        .enter()
        .append("option")
        .text(function (d) {return d})
        .attr("value" , function (d) {return d});
    
    //change the selected value when the dropdown is changed
    dropdown.on("change", function () {
        
        console.log("change dropdown event triggered, starting to change graph");
        selectedField = this.options[this.selectedIndex].value;
        console.log("new field is " + selectedField);
        
        modifyScales();//update the scales to deal with the newly selected field
        changeVariable();//change the graphs information
        console.log("finished update");
    });
    
    //set the inital characertistics of the map svg
    var map = d3.select("#map")
        .attr("height" , mapheight)
        .attr("width", mapwidth);
    
    //set the intial charactersitcs of the graph svg
    var graph = d3.select("#master-graph")
        .attr("height" , graphheight)
        .attr("width" , graphwidth);
    
    //graph title shown inside of svg
    var graphTitle = d3.select(".graphTitle")
        .text(selectedField);
    
    //set scales that will be used inside of the graph to scale the bars correctly
    var xScale = d3.scaleOrdinal();
    var colorScale = d3.scaleLinear();
    var heightScale = d3.scaleLinear();
    
    
    
    
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
    
    //adds the bars into the bar graph and gives them approprate color coding
    function createGraph () {
        console.log("create graph called");
        
        var fistAttr = attrArray[0];
        
        var bars = graph.selectAll(".bars")
            .data(dataList)
            .enter()
            .append("rect")
            .attr("class" , "bars")
            .style("fill" , function (d) {
                return colorScale(d[selectedField]);
            })
            .attr("width" , graphwidth / dataList.length)
            .attr("height" , function (d) {
                return heightScale(d[selectedField]);
            })
            .attr("y" , function (d) {
                return graphheight - heightScale(d[selectedField]);
            })
            .attr("x" , function (d) {
                return xScale(d[selectedField]);
            })
            ;
        
    }
    
    function modifyScales() {
        
        //define function to help d3 find min and max values for a selected field
        function returnValue (d) {
            return d[selectedField];
        }
        
            
        var fieldPositionsList = d3.range(0 , graphwidth, graphwidth / dataList.length);
        
        //generate the min and max 
        var max = d3.max(dataList , returnValue);
        var min = d3.min(dataList, returnValue);
        var inputDomain = [min, max];
        
        var tempList = [];
        for (var i=0; i < dataList.length; i++) {
            tempList.push(dataList[i][selectedField]);
        }
        
        //update the input domains for each of the different graphic scales
        xScale.domain(tempList).range(fieldPositionsList);
        colorScale.domain(inputDomain).range(["red" , "blue"]);
        heightScale.domain(inputDomain).range([0 , graphheight]);
    }
    
    function changeVariable () {
        
        //change the graph title information on the top of graph
        graphTitle.text(selectedField);
        
        d3.selectAll(".bars")
            .data(dataList)
            .transition()
            .duration(1000)
            .style("fill" , function (d) {
                return colorScale(d[selectedField]);
            })
            .attr("width" , graphwidth / dataList.length)
            .attr("height" , function (d) {
                return heightScale(d[selectedField]);
            })
            .attr("y" , function (d) {
                return graphheight - heightScale(d[selectedField]);
            })
            .attr("x" , function (d) {
                return xScale(d[selectedField]);
            })
            ;
    }
    
    function highlight () {
        
    }
    
    function dehighlight () {
        
    }
    
    
    //ajax function that starts to load data
    Promise.all([
        d3.csv("data/counties-nonspatial.csv"),
        d3.json("data/Counties.json")
    ]).then(function (files) {
        joinData(files);//merge data from the two different files together
        modifyScales();//modify the 3d scales according to the currently selected datafield
        createMap();//add all of the geometry into the map
        createGraph();//add all of the bars into the graph and style accordingly

        
    }).catch( function (error) {
        console.log("Something has failed: " + error);
    });
        
    
    
    console.log("testing, testing my test!");
    
}

window.onload = runScript;