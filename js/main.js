function runScript () {
    
    //set some constants that will be used to determine the size of the map
    var mapheight = 400;
    var mapwidth = 400;
    
    //set some constants that will be used to determine the size of the graphic
    var graphheight = 400;
    var graphwidth = 400;
    
    var graphPaddingRight = 20;
    var graphPaddingLeft = 2;
    var graphPaddingBottom = 5;
    
    var chartInnerWidth = graphwidth - graphPaddingRight - graphPaddingLeft;
    var chartInnerHeight = graphheight - graphPaddingBottom;
    var translate = "translate(" + graphPaddingLeft + "," + graphPaddingBottom + ")";
    
    var barpadding = 2;
    
    var dataList = [];//array that will hold all of the master joined data, d3 will have to work with this array
    //array with the field name of interest in the master non-spatial table
    var attrArray = ["Bachelors" , "LessthanHighschool" , "Miles of Interstate", "OnlyHighschool", "PovertyPer", "medianIncome", "someCollege", "unempolymentPer"];
    var selectedField = attrArray[0];//the field that is currently selected in the dropdown
    var attrArrayLabel = ["Percent of Population with Bachlors Degree" , "Percent of Population with less than a High school education" , "miles of Interstate" , "Percent of Popualtion a high school education" , "Percent of population in poverty" , "Median Household Income" , "Percent of Population with some college" , "Percent of population unemployed"];
    var selectedLabel = attrArrayLabel[0];
    
    //make the projection object which will help tranlate the json into an svg
    var projection = d3.geoAlbers()
        .rotate([95.55, 0, 0])
        .parallels([22.91, 55.02])
        .scale(4073.74)
        .translate( [mapwidth / 10 ,  -(mapheight / 8)]);

    var pathGenerator = d3.geoPath().projection(projection);

    
    //get the dropdown populated with field names
    var dropdown = d3.select(".dropdown");
    dropdown.selectAll(".dropdownItem")
        .data(attrArray)
        .enter()
        .append("option")
        .text(function (d , i) {return attrArrayLabel[i]})
        .attr("value" , function (d) {return d});
    
    //change the selected value when the dropdown is changed
    dropdown.on("change", function () {
        
        console.log("change dropdown event triggered, starting to change graph");
        selectedField = this.options[this.selectedIndex].value;
        selectedLabel = attrArrayLabel[attrArray.indexOf(selectedField)];
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
    var heightScaleReversed = d3.scaleLinear();
    
    var yAxis = d3.axisLeft()
        .scale(heightScaleReversed);
    
    
    
    
    
    
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
                  
                  spatialCounty.name = nonSpatialKey;
                  
                  //join the two datasets together and push the object into the new master array
                  attrArray.forEach(function (attr){
                      var val = parseFloat(nonSpatialCounty[attr]);
                      spatialCounty[attr] = val;
                  });
                  
                  dataList.push(spatialCounty);
              }
          }
        }
        
        console.log("Logging joined data!");
        console.log(dataList);
    }
    
    //function populates map svg with elements
    function createMap () {
        console.log("create map called");
        
                //give the graph a background color of some kind using a recangle coverting the background of the entire svg
        map.append("rect")
            .attr("width" , graphwidth)
            .attr("height", graphheight)
            .style("fill" , "white");
        
        //add and style county geometries
        var counties = map
            .append("g")
            .attr("class" , "mapCanvas")
            .selectAll(".countyGeo")
            .data(dataList)
            .enter()
            .append("path")
            .attr("d", pathGenerator)
            .attr("class" , function(d) {
                return "countyGeo" + " "  + d.name
            })
            .style("stroke" , "grey")
            .attr("stroke-width" , "0.5px")
            .style("fill" , function (d) {
                return colorScale(d[selectedField]);
            })
            .on("mouseover", highlight)
            .on("mouseout" , dehighlight);//apply event binding so quick popups will show up on each element
        
        //add title elements to each svg element
        counties.append("title")
            .attr("class" , "tooltip")
            .text(function(d) {
                return d.name + " County: " + d[selectedField];
        })
        
        
    }
    
    //adds the bars into the bar graph and gives them approprate color coding
    function createGraph () {
        console.log("create graph called");
        
        var fistAttr = attrArray[0];
        
        //give the graph a background color of some kind using a recangle coverting the background of the entire svg
        graph.append("rect")
            .attr("width" , graphwidth)
            .attr("height", graphheight)
            .style("fill" , "white");
        
        var bars = graph
            .append("g")
            .attr("class" , "barSpace")
            .attr("transform" , "translate(20, 0) scale(0.9,1)")
            .selectAll(".bars")
            .data(dataList)
            .enter()
            .append("rect")
            .attr("class" , function (d) {
                return "bars " + d.name
            })
            .style("fill" , function (d) {
                return colorScale(d[selectedField]);
            })
            .attr("width" , graphwidth / dataList.length)
            .attr("height" , function (d) {
                return heightScale(d[selectedField]);
            })
            .attr("y" , function (d) {
                return graphheight  - heightScale(d[selectedField]);
            })
            .attr("x" , function (d) {
                return xScale(d[selectedField]);
            })
            .attr("stroke" , "white")
            .attr("stroke-width" , 0.5)
            .on("mouseover", highlight)
            .on("mouseout" , dehighlight)
            ;
        
        //add a tooltip to each bar element
        bars.append("title")
            .attr("class" , "tooltip")
            .text(function(d) {
                return d.name + " County: " + d[selectedField];
        });
        
        //add an axis to the bargraph
        graph.append("g")
            .attr("class" , "yAxis")
            .attr("transform" , "translate(20, 0)")
            .call(yAxis);
        
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
        colorScale.domain(inputDomain).range(["yellow" ,"green"]);
        heightScale.domain(inputDomain).range([0 , graphheight]);
        heightScaleReversed.domain([max, min]).range([0 , graphheight]);
        
        //modify and update the yAxis scale to match to updated underlaying scale for height
        yAxis.scale(heightScaleReversed);
        d3.selectAll(".yAxis")
            .transition()
            .duration(1000)
            .call(yAxis);
        
    }
    
    function changeVariable () {
        
        //change the graph title information on the top of graph
        graphTitle.text(selectedLabel);
        
        //change the style of the bar elemenets in graph
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
            .selectAll(".tooltip")//chanage the contents of the tooltip for each bar
            .text(function(d) {
                return d.name + " County: " + d[selectedField];
            })
            ;
        
        //change the map based elemeents
        d3.selectAll(".countyGeo")
            .data(dataList)
            .transition()
            .duration(1000)
            .style("fill" , function (d) {
                return colorScale(d[selectedField]);
            })
            .selectAll(".tooltip")
            .text(function(d) {
                return d.name + " County: " + d[selectedField];
            });
        
    }
    
    //function that highlights both bar and county geometry and places cooresponding div popup
    function highlight (d) {
        //get the second class in the object of svg element that called function, the second class in the list is the county name
        var countyClass = "." + d3.select(this).attr("class").split(" ")[1];
        
        //select both the county geometry and bar elements and color code them
        d3.selectAll(countyClass)
            .transition()
            .style("fill" , "red");
        
        var coords = d3.mouse(this);//retrieve the relitive position of the mouse to the svg geometry or bar element
        
        //there are two different divs for popups which are identical. one is for the map and one is for the graph.
        //I tried to have just one and change the poistion but it did not work correctly. The positions are relitive to the object
        //the div is inside. I worked around this by having two divs inside the colums for each svg. for the code to work
        //properly I need to determine which type of object is calling this function, a map geometry or a bar.
        //depending on which is calling I will set up the popup for either the map or graph but not both.
        if (d3.select(this).attr("class").split(" ")[0] == "countyGeo") {
            var divPopup = d3.select("#tooltip-popup-map");
        } else {
            var divPopup = d3.select("#tooltip-popup-graph");
        }
        
        //change the content of the popup header
        divPopup.select("h4")
            .text(d.name + " County: ");
        
        //change the number values inside of the popup.
        divPopup.select("p")
            .text( selectedLabel + " Value is " + d[selectedField]);
        
        //remove the .hidden class so the CSS rules making it not display are removed. Then place according the the mouse position
        divPopup.classed("hidden", false)
            .transition()
            .style("left" , coords[0] + "px")
            .style("top" , coords[1] + "px");
        
    }
    
    //function that removes hightlight coloring and popups when either map or graph are moused out
    function dehighlight () {
        //get the second class in the object of svg element that called function, the second class in the list is the county name
        var countyClass = "." + d3.select(this).attr("class").split(" ")[1];
        
        console.log(countyClass);
        
        //select both the map geometry and bar with the same corresponding county class, then apply colors for highlighting
        d3.selectAll(countyClass)
            .transition()
            .style("fill" , function (d) {
                return colorScale(d[selectedField]);
            });
        
        //change the class for both div popups of they both are not shown
        var divPopup = d3.selectAll(".tooltip-popup")
            .classed("hidden", true);//hide div through css rules applyed to the .hidden class
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