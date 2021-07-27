//(A=greater than 0 but less than or equal to 0.25 acres, B=0.26-9.9 acres, C=10.0-99.9 acres, D=100-299 acres, E=300 to 999 acres, F=1000 to 4999 acres, and G=5000+ acres).

// Define SVG area dimensions
// ==============================
var svgWidth = 960;
var svgHeight = 550;

var margin = {
  top:80,
  right:40,
  bottom: 110,
  left:120
};


var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;


// Select body, append SVG area to it, and set the dimensions
// ==============================
var svg = d3.select("#chart2").classed('chart2', true)

  .append("svg")
  .attr("height", svgHeight)
  .attr("width", svgWidth)



// Append an SVG group
// ==============================
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);


//Load data from us-widlfires.csv
// ==============================
d3.csv("data/us-wildfires.csv").then(function(fireData) {
  
  //console.log("fireData", fireData);
  //console.table(fireData[0]);

  var sum = d3.nest()
  .key(function(d) { return d.FIRE_YEAR; }).sortKeys(d3.ascending)
  .rollup(function(values) { return d3.sum(values, function(d) {return +d.FIRE_SIZE; }) })
  .entries(fireData)

 //console.log(sum[0]);

 console.table(sum);

var num_fires_year = d3.nest()
  
  .key(function(d) { return d.FIRE_YEAR; }).sortKeys(d3.ascending)
   
  .rollup(function(v) { return v.length; })
  .entries(fireData)

console.table(num_fires_year);

var fires_scale = d3.nest()
  .key(function(d) { return d.FIRE_YEAR; }).sortKeys(d3.ascending)
  .key(function (d) { return d.FIRE_SIZE_CLASS; }).sortKeys(d3.ascending)
  .key(function(d) { return d.FIRE_YEAR; }).sortKeys(d3.ascending)

  .rollup(function(v) { return v.length; })
  .entries(fireData)

//console.log(fires_scale);
console.table(fires_scale)
  

// Char 2 - Bar Chart 

var xBandScale = d3.scaleBand()
    .domain(num_fires_year.map(d => d.key))
    .range([0, width])
    .padding(0.3);

  // Create a linear scale for the vertical axis.
var yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(num_fires_year, d => d.value)])
    .range([height, 0])

;

var bottomAxis = d3.axisBottom(xBandScale);
var leftAxis = d3.axisLeft(yLinearScale).ticks(10)
      .tickFormat(d => `${d / 1000}`);;

  // Append two SVG group elements to the chartGroup area,
  // and create the bottom and left axes inside of them
  chartGroup.append("g")
    .call(leftAxis);

  chartGroup.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);


// Append Bar
chartGroup.selectAll(".bar")
    .data(num_fires_year)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", d => xBandScale(d.key))
    .attr("y", d => yLinearScale(d.value))
    .attr("width", xBandScale.bandwidth())
    .attr("height", d => height - yLinearScale(d.value))
    .attr("fill" , "orange")
 
 
// Label
chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 40)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("class", "axisText")
      .attr("text-anchor", "middle")
      .style("font-weight" , "bold")
      .text("Number of Fires (Thousands)");

chartGroup.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
      .attr("class", "axisText")
      .style("font-weight" , "bold")
      .attr("text-anchor", "middle")
      .text("Year"); 



 }).catch(function(error) {
  console.log(error);
});