$(document).ready(function() {

    d3.json("global-temperature.json", function(error, data) {
        if (error) {
            throw error;
        }

        var baseTemperature = data.baseTemperature;
        var years = [];
        var varianceArray = [];

        // break out data to contain just the montlyVariance array
        data = data.monthlyVariance;

        // convert strings to numbers for each object in data array
        data = data.map(function(item) {
            return {
                year: +item.year,
                month: +item.month,
                variance: +item.variance
            }
        });

        // create unique array of years to be used for x axis and array of all variances + baseTemperature
        data.forEach(function(item) {
            if (years.indexOf(item.year) === -1) {
                years.push(item.year);
            }
            varianceArray.push((item.variance + baseTemperature).toFixed(2));
        });
        varianceArray.sort(function(a,b) { return (a - b);});
        var lowestVariance = varianceArray[0];
        var highestVariance = varianceArray[varianceArray.length - 1];

        var legendElementWidth = 50;
        var legendElementHeight = 25;

        var buckets = 9;
        var colors = ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"]; // alternatively colorbrewer.YlGnBu[9]
        var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        var margin = { top: 100, right: 0, bottom: 100, left: 75 };
        var width = 960 - margin.left - margin.right;
        var height = 700 - margin.top - margin.bottom;

        var axisYLabelX = -65;
        var axisYLabelY = height / 2;

        var axisXLabelX = width / 2;
        var axisXLabelY = height + 45;


        var gridWidth = width / years.length;
        var gridHeight = height / months.length;

        var svg = d3.select("#chart").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var monthLabels = svg.selectAll(".monthLabel")
                .data(months)
                .enter()
                .append("text")
                .text(function (d) { return d; })
                .attr("x", 0)
                .attr("y", function (d, i) { return i * gridHeight; })
                .style("text-anchor", "end")
                .attr("transform", "translate(-6," + gridHeight / 1.5 + ")")
                .attr("class", "monthLabel mono axis axis-workweek" );

        var xScale = d3.time.scale()
                .domain( [new Date(years[0]), new Date(years[years.length-1]) ] )
                .range([0, width]);

        var xAxis = d3.svg.axis()
                .scale(xScale)
                .orient("bottom")
                .ticks(d3.time.years, 10);

        svg.append("g")
                .attr("class", "axis axis-years")
                .attr("transform", "translate(0," + (height + 1) + ")")
                .call(xAxis);

        svg.append('g')
                .attr('transform', 'translate(' + axisYLabelX + ', ' + axisYLabelY + ')')
                .append('text')
                .attr('text-anchor', 'middle')
                .attr('transform', 'rotate(-90)')
                .attr("class", "axislabel")
                .text('Months');

        svg.append('g')
                .attr('transform', 'translate(' + axisXLabelX + ', ' + axisXLabelY + ')')
                .append('text')
                .attr('text-anchor', 'middle')
                .attr("class", "axislabel")
                .text('Years');

        svg.append("text")
                .attr("x", width / 2)
                .attr("y", -50)
                .attr("text-anchor", "middle")
                .attr("class", "title")
                .text("Monthly Global Land-Surface Temperature");

        svg.append("text")
                .attr("x", width / 2)
                .attr("y", -35)
                .attr("text-anchor", "middle")
                .attr("class", "subtitle")
                .text("1753 - 2015");

        svg.append("text")
                .attr("x", width / 2)
                .attr("y", -20)
                .attr("text-anchor", "middle")
                .attr("class", "entry")
                .text("Temperatures are in Celsius and reported as anomalies relative to the Jan 1951-Dec 1980 average.");

        svg.append("text")
                .attr("x", width / 2)
                .attr("y", -5)
                .attr("text-anchor", "middle")
                .attr("class", "entry")
                .text("Estimated Jan 1951-Dec 1980 absolute temperature ℃: 8.66 +/- 0.07");

        var colorScale = d3.scale.quantile()
                .domain([lowestVariance, highestVariance])
                .range(colors);

        var cards = svg.selectAll(".hour")
               .data(data, function(d) { return d.year + ':' + d.month; }); // return d.day+':'+d.hour;

        cards.append("title");

        cards
               .enter()
               .append("rect")
               .attr("x", function(d) { return (d.year - years[0]) * gridWidth; })
               .attr("y", function(d) { return (d.month - 1) * gridHeight; })
               .attr("rx", 0)
               .attr("ry", 0)
               .attr("class", "hour bordered")
               .attr("width", gridWidth)
               .attr("height", gridHeight)
               .style("fill", colors[0]);

        cards.transition().duration(1000)
               .style("fill", function(d) { return colorScale(baseTemperature + d.variance); }); // return colorScale(d.value);

        cards.select("title").text(function(d) { return (baseTemperature + d.variance); }); // return d.value;

        cards.exit().remove();

        var legend = svg.selectAll(".legend")
               .data([0].concat(colorScale.quantiles()), function(d) { return d; });

        legend.enter().append("g")
               .attr("class", "legend");

        legend.append("rect")
               .attr("x", function(d, i) { return legendElementWidth * i; })
               .attr("y", height + 70)
               .attr("width", legendElementWidth)
               .attr("height", legendElementHeight)
               .style("fill", function(d, i) { return colors[i]; });

        legend.append("text")
               .attr("class", "mono")
               .text(function(d) { return "≥ " + Math.round(d); })
               .attr("x", function(d, i) { return legendElementWidth * i; })
               .attr("y", height + 65);

        legend.exit().remove();

    });

});