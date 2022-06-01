function typesOfFoodBarPlot(agg_data, year) {
  // set the dimensions and margins of the graph
  var margin = { top: 10, right: 30, bottom: 120, left: 50 },
    width = 620 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  $("#my_dataviz").empty();

  var data = agg_data.map((row) => ({
    group: row.group.split("-")[0].split("and products")[0],
    feed: row.feed[year] || 0,
    food: row.food[year] || 0,
  }));

  // append the svg object to the body of the page
  var svg = d3
    .select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // List of subgroups = header of the csv files = soil condition here
  var groups = data.map((row) => row.group);

  var subgroups = ["food", "feed"];

  // Add X axis
  var x = d3.scaleBand().domain(groups).range([0, width]).padding([0.4]);
  svg
    .append("g")
    .attr("class", "axisWhite")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).tickSize(0))
    .selectAll("text")
    .attr("class", "rotated_label");

  const max = data.reduce((acc, curr) => {
    return Math.max(curr.feed, curr.food, acc);
  }, 0);

  // console.log("Hejjj", max);

  // Add Y axis
  var y = d3.scaleLinear().domain([0, max]).range([height, 0]);
  svg.append("g").attr("class", "axisWhite").call(d3.axisLeft(y));

  // Another scale for subgroup position?
  var xSubgroup = d3
    .scaleBand()
    .domain(subgroups)
    .range([0, x.bandwidth()])
    .padding([0.05]);

  // color palette = one color per subgroup
  var color = d3
    .scaleOrdinal()
    .domain(subgroups)
    .range(["red", "orange", "#4daf4a"]);

  // Show the bars
  svg
    .append("g")
    .selectAll("g")
    // Enter in data = loop group per group
    .data(data)
    .enter()
    .append("g")
    .attr("transform", function (d) {
      return "translate(" + x(d.group) + ",0)";
    })
    .selectAll("rect")
    .data(function (d) {
      return subgroups.map(function (key) {
        return { key: key, value: d[key] < 2 ? 2 : d[key] };
      });
    })
    .enter()
    .append("rect")
    .attr("x", function (d) {
      return xSubgroup(d.key);
    })
    .attr("width", xSubgroup.bandwidth())
    .attr("fill", function (d) {
      return color(d.key);
    });

  svg
    .selectAll("rect")
    .transition()
    .duration(600)
    .attr("y", function (d) {
      return y(d.value);
    })
    .attr("height", function (d) {
      return height - y(d.value);
    })
    .delay(function (d, i) {
      console.log(i);
      return i * 10;
    });
}
