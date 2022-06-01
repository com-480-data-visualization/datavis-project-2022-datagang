// Pie chart
var width = 150;
height = 150;
margin = 20;

var radius = Math.min(width, height) / 2 - margin;

// Read the data
d3.csv("data/pie.csv", read, function (error, data) {
  // TODO: connect to map timeline
  var year = "1961";

  let slider = document.getElementById("current_year_slider");
  slider.addEventListener("input", function () {
    let val = this.value;
    var currentData = data.filter(function (d) {
      // console.log("Later bitches", (1961 + parseval).toString());
      return d["Year"] == (1961 + parseInt(val)).toString();
    });

    update(currentData);
  });

  //var currentData = data.filter(function(d) {return d["Year"] == (1961 + parseInt(map_state.year)).toString()});
  var currentData = data.filter(function (d) {
    return d["Year"] == year;
  });

  // draw the pie chart with the data from the chosen year
  update(currentData);

  function update(data) {
    // Clear the previous pie chart
    const existing = document.getElementById("piechart");
    if (existing) {
      var child = existing.lastElementChild;
      while (child) {
        existing.removeChild(child);
        child = existing.lastElementChild;
      }
    }

    var svg = d3
      .select("#piechart")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    console.log("Coucou j'update", data);
    // draw the legend
    var feedprop = data.filter(function (d) {
      return d.Element == "Feed";
    })[0].Prop;
    var foodprop = data.filter(function (d) {
      return d.Element == "Food";
    })[0].Prop;

    d3.select("#pielegend").html(
      "<div style='color: red;'>Food: " +
        parseFloat(foodprop * 100).toFixed(2) +
        "%</div>" +
        "<div style='color: orange;'>Feed: " +
        parseFloat(feedprop * 100).toFixed(2) +
        "%</div>"
    );

    // create the pie chart
    var pie = d3.layout
      .pie()
      .value(function (d) {
        return d.value.Prop;
      })
      .sort(function (a, b) {
        return d3.ascending(a.key, b.key);
      });
    var data_pie = pie(d3.entries(data));

    // draw the paths
    var u = svg.selectAll("path").data(data_pie);

    u.enter()
      .append("path")
      .attr("d", d3.svg.arc().innerRadius(0).outerRadius(radius))
      .attr("fill", function (d) {
        if (d.data.value.Element == "Feed") {
          return "red";
        } else return "orange";
      })
      .attr("stroke", "white")
      .style("stroke-width", "2px")
      .style("opacity", 1);

    u.exit().remove();
  }
});

// read in data
function read(d) {
  d.year = d.Year;
  d.cat = d.Element;
  d.prop = +d.prop;
  return d;
}
