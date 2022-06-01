/**
 * Handles the main map component using Leaflet.
 * The data has been parsed previously and encoded as a GeoJson object.
 */

var map = L.map("map").setView([0, 0], 2);

/**
 * Map settings
 */
const PALETTE = [
  "#FFFFFF",
  "#FFFFB2",
  "#FECC5C",
  "#FD8D3C",
  "#F03B20",
  "#BD0026",
];

const AVAILABLE_MODES = [
  {
    data_key: "prop_food",
    label: "Food: Aliment for feeding people",
    grades: [800, 1200, 1400, 1800],
    unit: "tons/capita",
  },
  {
    data_key: "prop_feed",
    label: "Feed: Aliment for feeding livestock",
    grades: [200, 400, 800, 1000],
    unit: "tons/capita",
  },
  {
    data_key: "food_supply",
    label: "Overall: overall aliment supply",
    grades: [2300, 2600, 3100, 3400],
    unit: "kcal/capita/day",
  },
];

/**
 * Event listeners
 */
// The display mode and the current year displayed can be changed dynamically
const map_state = {
  mode: AVAILABLE_MODES[2],
  year: 57,
};

// Update map display mode
document.getElementsByName("scales").forEach((el) => {
  el.addEventListener("change", function () {
    map_state.mode = AVAILABLE_MODES[parseInt(this.value)];
    reset_geojson();
  });
});

// Handle year slider events. Update the map and label on input
let slider = document.getElementById("current_year_slider");
slider.addEventListener("input", function () {
  map_state.year = this.value;
  document.getElementById("current_year").innerHTML =
    "Year: " + (1961 + parseInt(this.value));
  reset_geojson();
});

/**
 * Map UTILS functions
 */

// Returns the color for a given cell
function getColor(d, feature) {
  let thresholds = map_state.mode.grades;

  return d === 0
    ? PALETTE[0]
    : d > thresholds[3]
    ? PALETTE[5]
    : d > thresholds[2]
    ? PALETTE[4]
    : d > thresholds[1]
    ? PALETTE[3]
    : d > thresholds[0]
    ? PALETTE[2]
    : d < thresholds[0]
    ? PALETTE[1]
    : PALETTE[0];
}

// Style for each country
const style = (feature) => {
  const property = feature.properties[map_state.mode.data_key];
  return {
    fillColor: getColor(property ? property[map_state.year] : 0, "food_supply"),
    weight: 1,
    opacity: 1,
    color: "white",
    dashArray: "1",
    fillOpacity: 0.7,
  };
};

/**
 * Map Setup
 */
var geojson, info, legend;

// On country hover, change the border style.
function highlightFeature(e) {
  var layer = e.target;

  layer.setStyle({
    weight: 2,
    color: "#666",
  });

  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
    layer.bringToFront();
  }

  info.update(layer.feature.properties);
}

// On country unhover, reset
function resetHighlight(e) {
  geojson.resetStyle(e.target);
  info.update();
}

// On country click, zoom to it
function zoomToFeature(e) {
  map.fitBounds(e.target.getBounds());
}

// Setup the event listeners for each feature
function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: zoomToFeature,
  });
}

// Called every time the map needs to be redrawn with new data
function reset_geojson() {
  if (geojson) map.removeLayer(geojson);

  geojson = L.geoJson(worldData, { style, onEachFeature }).addTo(map);

  if (info) info.update();
  if (legend) legend.addTo(map);
}

var tiles = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  className: "map-tiles",
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

reset_geojson();

/**
 * TOP RIGHT INFO CONTROL
 * Displays the hovered state's value
 */
info = L.control();

info.onAdd = function (map) {
  this._div = L.DomUtil.create("div", "info");
  this.update();

  return this._div;
};

info.update = function (props) {
  console.log(props);
  let value =
    props && props[map_state.mode.data_key]
      ? Math.round(props[map_state.mode.data_key][map_state.year])
      : 0;

  this._div.innerHTML = `
    <h4>${map_state.mode.label}</h4>
    ${
      props
        ? `<b>${props.NAME_LONG}</b><br/>${value} ${map_state.mode.unit}`
        : "Hover over a state"
    }
  `;
};
info.addTo(map);

/**
 * BOTTOM RIGHT LEGEND CONTROL
 * Displays the current grades scale
 */
legend = L.control({ position: "bottomright" });
legend.onAdd = function (map) {
  let div = L.DomUtil.create("div", "info legend");
  let grades = map_state.mode.grades;

  // Colored square for each grade
  for (var i = 0; i < grades.length; i++) {
    div.innerHTML += `
      <div>
        <i style="background: ${getColor(grades[i] + 1)}"></i>
        ${grades[i]}${grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br/>" : "+"}
      </div>
    `;
  }

  return div;
};

legend.addTo(map);





// Pie chart

var width = 150
    height = 150
    margin = 20;

var radius = Math.min(width, height) / 2 - margin;

var svg = d3.select("#piechart")
  .append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");


// Read the data
d3.csv("data/pie.csv", read, function(error, data) {

// TODO: connect to map timeline
  var year = "1961";
  //var currentData = data.filter(function(d) {return d["Year"] == (1961 + parseInt(map_state.year)).toString()});
  var currentData = data.filter(function(d) {return d["Year"] == year});

// draw the pie chart with the data from the chosen year
 update(currentData);


 function update(data) {
   // draw the legend
   var feedprop = data.filter( function(d) {return d.Element == 'Feed'})[0].Prop;
   var foodprop = data.filter( function(d) {return d.Element == 'Food'})[0].Prop;

   d3.select('#pielegend')
       .text("Food: " + parseFloat(foodprop*100).toFixed(2)+"%" + "\nFeed: " + parseFloat(feedprop*100).toFixed(2)+"%");

    // create the pie chart
    var pie = d3.layout.pie()
      .value(function(d) {return d.value.Prop; })
      .sort(function(a, b) { return d3.ascending(a.key, b.key);} )
    var data_pie = pie(d3.entries(data))

    // draw the paths
    var u = svg.selectAll("path")
      .data(data_pie)

    u.enter()
      .append('path')
      .attr('d', d3.svg.arc()
        .innerRadius(0)
        .outerRadius(radius))
      .attr('fill', function(d){
        if (d.data.value.Element == "Feed") {
          return "red"
        }
        else return "orange"
     })
      .attr("stroke", "white")
      .style("stroke-width", "2px")
      .style("opacity", 1)

    u.exit()
      .remove()


  }



});

// read in data
function read(d) {
  d.year = d.Year;
  d.cat = d.Element;
  d.prop = +d.prop;
  return d;
}






// Calorie Bars

d3.csv("data/foodsupply.csv", function(d) {

  var dictionary = {};

  for (var i = 0, entry; i < d.length; i++) {
    entry = d[i];
    dictionary[entry.Year.concat(entry.Continent)] =
      entry.Value;
  }

  var max = 2500;
  var year = "1961";

  update(year);

  function update(year) {


    // max calories and calories for the given year
    var asia_data = [2500, dictionary[year.concat("Asia")]];
    var africa_data = [2500, dictionary[year.concat("Africa")]];
    var eur_data = [2500, dictionary[year.concat("Europe")]];
    var na_data = [2500, dictionary[year.concat("North America")]];
    var sa_data = [2500, dictionary[year.concat("South America")]];
    var o_data = [2500, dictionary[year.concat("Oceania")]];


    // create svgs for each continent
    var asia_bar = d3.select("#asia", ".supply-stickman").append("svg")
     .attr("class", "chart")
     .attr("width", 200)
     .attr("height", 40);

    var europe_bar = d3.select("#eur", ".supply-stickman").append("svg")
     .attr("class", "chart")
     .attr("width", 200)
     .attr("height", 40);

    var oceania_bar = d3.select("#oce", ".supply-stickman").append("svg")
     .attr("class", "chart")
     .attr("width", 200)
     .attr("height", 40);

    var na_bar = d3.select("#northam", ".supply-stickman").append("svg")
     .attr("class", "chart")
     .attr("width", 200)
     .attr("height", 40);

    var sa_bar = d3.select("#southam", ".supply-stickman").append("svg")
     .attr("class", "chart")
     .attr("width", 200)
     .attr("height", 40);

    var africa_bar = d3.select("#afr", ".supply-stickman").append("svg")
     .attr("class", "chart")
     .attr("width", 200)
     .attr("height", 40);

    var x = d3.scale.linear()
     .domain([0, max])
     .range([0, 200]);


     // create two bars for each continent
    asia_bar.selectAll("rect")
     .data(asia_data)
    .enter().append("rect")
     .attr("width", x)
     .attr("height", 20);


   africa_bar.selectAll("rect")
     .data(africa_data)
   .enter().append("rect")
     .attr("width", x)
     .attr("height", 20);


   europe_bar.selectAll("rect")
     .data(eur_data)
   .enter().append("rect")
     .attr("width", x)
     .attr("height", 20);

   na_bar.selectAll("rect")
     .data(na_data)
   .enter().append("rect")
     .attr("width", x)
     .attr("height", 20);

   sa_bar.selectAll("rect")
     .data(sa_data)
   .enter().append("rect")
     .attr("width", x)
     .attr("height", 20);


   oceania_bar.selectAll("rect")
     .data(o_data)
   .enter().append("rect")
     .attr("width", x)
     .attr("height", 20);
}

    });
