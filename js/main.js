function runScript () {
    
    //set some constants that will be used to determine the size of the map
    var mapheight = 300;
    var mapwidth = 400;
    
    //set some constants that will be used to determine the size of the graphic
    var graphheight = 400;
    var graphwidth = 400;
    var xpadding = 20;
    var ypadding = 25;
    
    //set the inital characertistics of the map svg
    var map = d3.select("#map")
        .attr("height" , mapheight)
        .attr("width", mapwidth);
    
    //set the intial charactersitcs of the graph svg
    var graph = d3.select("#master-graph")
        .attr("height" , graphheight)
        .attr("width" , graphwidth);
    
    
    //ajax function that starts to load data
    
    
    
    console.log("testing");
    
}

window.onload = runScript;