
//(A=greater than 0 but less than or equal to 0.25 acres, B=0.26-9.9 acres, C=10.0-99.9 acres, D=100-299 acres, E=300 to 999 acres, F=1000 to 4999 acres, and G=5000+ acres).

// Define SVG area dimensions
// ==============================
var svgWidth = 1000;
var svgHeight = 550;

// Define the chart's margins as an object
// ==============================
var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Select body, append SVG area to it, and set the dimensions
// ==============================
var svg = d3.select("#line")
  .append("svg")
  .attr("height", svgHeight)
  .attr("width", svgWidth)


// Append an SVG group
// ==============================
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);


//Load data from us-widlfires.csv
// ==============================
d3.csv("data/us-wildfires.csv").then(function(data) {

  console.log(data[0])

  data.forEach(function(d) {
    d.Year = d.FIRE_YEAR;
    d.Size = d.FIRE_SIZE/1000000
    d.Class = d.FIRE_SIZE_CLASS;

  });

  

//D3.nest
// ==============================
var sum = d3.nest()
  .key(function(d) { return d.Year; }).sortKeys(d3.ascending)
  .rollup(function(values) { return d3.sum(values, function(d) {return +d.Size; }) })
  .entries(data)

  //console.log(sum[0]);

  console.log(sum);

var num_fires_year = d3.nest()
  
  .key(function(d) { return d.Year; }).sortKeys(d3.ascending)
  .rollup(function(v) { return v.length; })
  .entries(data)

console.log(num_fires_year);



var fires_scale = d3.nest()
  
  .key(function (d) { return d.Class; }).sortKeys(d3.ascending)
  .key(function(d) { return d.Year; }).sortKeys(d3.ascending)

  .rollup(function(v) { return v.length; })
  .entries(data)

console.log(fires_scale);




// ==============================
var allGroup = d3.map(fires_scale, function(d){return (d.key)}).keys()

  d3.select("#selectButton")
      .selectAll('myOptions')
      .datum(allGroup)
      .enter()
      .append('option')
      .text(function (d) { return d; }) 
      .attr("values", function (d) { return d.value; })


  // A color scale: one color for each group
var myColor = d3.scaleOrdinal()
      .domain(allGroup)
      .range(d3.schemeSet2);


// Create a scale for your independent (x) coordinates
var xLinearScale = d3.scaleLinear()
    .domain(d3.extent(sum, d => d.keys))
    .range([0, width])
    .nice();
    
    

// Create a scale for your dependent (y) coordinates
var yLinearScale = d3.scaleLinear()
    .range([height, 0])
    .domain(0, d3.max(fires_scale, d => d.value));
   

// Create axis functions
// ======================
var bottomAxis = d3.axisBottom(xLinearScale);
var leftAxis = d3.axisLeft(yLinearScale);

    
        
// Append Axes to the chart
  // ==============================
  chartGroup.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  chartGroup.append("g")
    .call(leftAxis);   

     
// Add the area
// ==============================
var area = chartGroup.append("path")
    .datum(fires_scale.filter(function(d){return d.key == allGroup[0]}))
    .attr("fill", "#E97451")
    .attr("stroke", "#FF5F1F")
    .attr("stroke-width", 1.5)
    .attr("d", d3.area()
        .curve(d3.curveMonotoneX)
        .x(d => xLinearScale(d.key) )
        .y0(height)
        .y1(d => yLinearScale(d.value) ))

    
// Add the line
// ==============================
var line = chartGroup.append("path")
      .datum(fires_scale.filter(function(d){return d.key == allGroup[0]}))
      .attr("d", d3.line()
        .curve(d3.curveMonotoneX) 
        .x(d => xLinearScale(d.key) )
        .y(d => yLinearScale(d.value) ))
        .style("stroke-width", 4)
        .style("fill", "none")
        
 
// append circles
// ==============================
var circle = chartGroup.selectAll("circle")
    .data(fires_scale.filter(function(d){return d.key == allGroup[0]}))
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d.key) )
    .attr("cy", d => yLinearScale(d.value) )
    .attr("r", "5")
    .attr("fill", "white")
    .attr("stroke-width", "1")
    .attr("stroke", "red")

// Create axes labels
// ==============================
  chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left +40)
    .attr("x", 0 - (height /2))
    .attr("dy", "1em")
    .attr("class", "axisText")
    .style("font-weight" , "bold")
    .attr("text-anchor", "middle")
    .text("Number of Fires by Scale");
    

  chartGroup.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
      .attr("class", "axisText")
      .style("font-weight" , "bold")
      .attr("text-anchor", "middle")
      .text("Year");

// A function that update the chart
  function update(selectedGroup) {
      
      var dataFilter =fires_scale.filter(function(d){return d.key=selectedGroup})


      area.append("path")
          .datum(dataFilter)
          .attr("d", d3.area()
              .curve(d3.curveMonotoneX)
              .x(d => xLinearScale(d.key) )
              .y0(height)
              .y1(d => yLinearScale(d.value) ))
          .attr("stroke", function(d){ return myColor(selectedGroup) })

      line.datum(dataFilter)
          .transition()
          .duration(500)
          .attr("d", d3.line()
          .x(d => xLinearScale(d.key) )
          .y(d => yLinearScale(d.value) ))
          .attr("stroke", function(d){ return myColor(selectedGroup) })
          
      
      circle.data(dataFilter)
          .transition()
          .duration(1000)
          .attr("cx", d => xLinearScale(d.key) )
          .attr("cy", d => yLinearScale(d.value) )
          .attr("stroke", function(d){ return myColor(selectedGroup) })
    }

// When the button is changed, run the updateChart function
    d3.select("#selectButton").on("change", function(d) {
        
        var selectedOption = d3.select(this).property("value")
        
        update(selectedOption)
    })
        
        

}).catch(function(error) {
  console.log(error);
});