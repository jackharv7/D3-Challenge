var svgWidth = 970;
var svgHeight = 550;

var margin = {
  top: 20,
  right: 40,
  bottom: 90,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("style", 'background-color: white')
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "obesity"; 

// function used for updating x-scale var upon click on axis label
function xScale(Data, chosenXAxis) {
// create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(Data, d => d[chosenXAxis]) * 0.9,
    d3.max(Data, d => d[chosenXAxis]) * 1.1
    ])
    .range([0, width]);

  return xLinearScale;
}
// function used for updating y-scale var upon click on axis label
function yScale(Data, chosenYAxis) {
    // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(Data, d => d[chosenYAxis]) * 0.9,
    d3.max(Data, d => d[chosenYAxis]) * 1.1
    ])
    .range([height, 0]);

  return yLinearScale;
    
}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}
//identify and update axes
function renderAxesY(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {

  circlesGroup
    .transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .html(function(d) {
      //tooltip box
      if (chosenXAxis === "poverty") {
        return (`<strong>${d.state}</strong><br>${chosenXAxis}: ${d[chosenXAxis]}% <br> ${chosenYAxis}: ${d[chosenYAxis]}%`);
      }
      else if (chosenXAxis === "income") {
        return (`<strong>${d.state}</strong><br>${chosenXAxis}: $${d[chosenXAxis].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} <br>${chosenYAxis}: ${d[chosenYAxis]}%`);
      }
      else {
        return (`<strong>${d.state}</strong><br>${chosenXAxis}: ${d[chosenXAxis]} <br> ${chosenYAxis}: ${d[chosenYAxis]}%`);
      }
   
  });
  
  circlesGroup.call(toolTip);
  //mouseover event
  circlesGroup.on("mouseover", function(data, index, selection) {
    var circle = selection[index];
    d3.select(circle).classed("active", true);
    d3.select(circle).attr("opacity", "0.75")
    d3.select(circle).attr("r", 20);
    toolTip.show(data, circle);
  })
    // on mouseout event
    .on("mouseout", function(data, index, selection) {
      var circle = selection[index];
      d3.select(circle).classed("active", false);
      d3.select(circle).attr("opacity", "0.5")
      d3.select(circle).attr("r", 10);
      toolTip.hide(data);
    });

  return circlesGroup;

}
//update position of circle state label
function renderText(textGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
  textGroup
    .transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]))
    .attr("y", d => newYScale(d[chosenYAxis]));

  return textGroup;
}
//bold axis label when selected
function activateLabel(label) {
  return label
    .classed("active", true)
    .classed("inactive", false);
}
function deactivateLabel(label) {
  return label
    .classed("active", false)
    .classed("inactive", true);
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(data, err) {
    if (err) throw err;
    console.log(data);
    // parse data
    data.forEach(function(d) {
      d.poverty = +d.poverty;
      d.age = +d.age;
      d.income = +d.income;
      d.obesity = +d.obesity;
      d.smokes =+ d.smokes;
      d.healthcare = +d.healthcare;
    });
  
    // xLinearScale function above csv import
    var xLinearScale = xScale(data, chosenXAxis);
  
    // Create y scale function
    var yLinearScale = yScale(data, chosenYAxis);
  
    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);
  
    // append x axis
    var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);
  
    // append y axis
    var yAxis = chartGroup.append("g")
      .classed("y-axis", true)
      .call(leftAxis);
  
    // append initial circles

    var textGroup = chartGroup.selectAll()
      .exit()
      .data(data)
      .enter()
      .append("text")
      .attr("x", d => xLinearScale(d[chosenXAxis]))
      .attr("y", d => yLinearScale(d[chosenYAxis]))
      .attr("dy", d => 4)
      .classed("stateText", true)
      .text(d => (d.abbr));

    var circlesGroup = chartGroup.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("r", 10)
      .style("stroke", "blue")//border
      .attr("opacity", "0.5")
      .classed("stateCircle", true);

    renderCircles(circlesGroup, xLinearScale,yLinearScale,chosenXAxis, chosenYAxis);
  
    // Create group for  2 axis labels
    var xlabelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var ylabelsGroup = chartGroup.append("g");
  // append x axis labels
    var povertyLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "poverty") // value to grab for event listener
      .classed("active", true)
      .text("In Poverty (%)");
  
    var ageLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "age")
      .classed("inactive", true)
      .text("Age (Median)");

    var incomeLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 60)
      .attr("value", "income") 
      .classed("inactive", true)
      .text("Household Income (Median)");
  
    // append y axis labels
    var obesityLabel = ylabelsGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("value", "obesity")// value to grab for event listener
      .classed("active", true)
      .text("Obesity (%)");

    var smokesLabel = ylabelsGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 20 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("value", "smokes")
      .classed("inactive", true)
      .text("Smokes (%)");
    
    var healthcareLabel = ylabelsGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 40 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .classed("inactive", true)
      .attr("value", "healthcare")
      .text("Lacks Healthcare (%)");
  
    // x axis labels event listener
    xlabelsGroup.selectAll("text")
      .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {
  
          // replaces chosenXAxis with value
          chosenXAxis = value;
          // updates x/y scale for new data
          xLinearScale = xScale(data, chosenXAxis);
          yLinearScale = yScale(data, chosenYAxis);
          
          // updates x axis with transition
          xAxis = renderAxes(xLinearScale, xAxis);
  
          // updates circles with new x values
          circlesGroup = renderCircles(circlesGroup, xLinearScale,yLinearScale,chosenXAxis,chosenYAxis);
          textGroup = renderText(textGroup, xLinearScale,yLinearScale,chosenXAxis,chosenYAxis);

          // changes classes to change bold text
          if (chosenXAxis === "age") {
            deactivateLabel(povertyLabel);
            activateLabel(ageLabel);
            deactivateLabel(incomeLabel);
          }
          else if (chosenXAxis === "income") {
            deactivateLabel(povertyLabel);
            deactivateLabel(ageLabel);
            activateLabel(incomeLabel);
          } 
          else {
            activateLabel(povertyLabel);
            deactivateLabel(ageLabel);
            deactivateLabel(incomeLabel);
          }
        }
      });
      ylabelsGroup.selectAll("text")
        .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenYAxis) {

        // replaces chosenYAxis with value
          chosenYAxis = value;
          // updates x/y scale for new data
          xLinearScale = xScale(data, chosenXAxis);
          yLinearScale = yScale(data, chosenYAxis);
  
          // updates y axis with transition
          yAxis = renderAxesY(yLinearScale, yAxis);
  
          // updates circles with new y values
          circlesGroup = renderCircles(circlesGroup, xLinearScale,yLinearScale,chosenXAxis,chosenYAxis);
          textGroup = renderText(textGroup, xLinearScale,yLinearScale,chosenXAxis,chosenYAxis);
  
          // changes classes to change bold text
          if (chosenYAxis === "smokes") {
            deactivateLabel(obesityLabel);
            activateLabel(smokesLabel);
            deactivateLabel(healthcareLabel);
          }
          else if (chosenYAxis === "healthcare") {
            deactivateLabel(obesityLabel);
            deactivateLabel(smokesLabel);
            activateLabel(healthcareLabel);
          }
          else {
            activateLabel(obesityLabel);
            deactivateLabel(smokesLabel);
            deactivateLabel(healthcareLabel);
          }
        }
      });
  }).catch(function(error) {
    console.log(error);
});