function drawRadialChart(svgClass, data) {
  let svg = d3.select(svgClass);
  let tooltip = addTooltipToVis(svgClass);

  let svgWidth = 1000;
  let svgHeight = 700;
  let arcMin = 50;
  let arcWidth = 2;
  let centerWidth = svgWidth*0.675;
  let centerHeight = svgHeight*0.55;

  let ringCounter = 0;
  let currentDate = 0;
  let dateToRingArr = [31, 28, 31, 10];
  let totalDays = 31 + 28 + 31 + 10;

  let textColor = "#696969";
  let blueArcColor = "#7389AE";
  let allNighterColor = "#F4B266";
  let backgroundColor = "#e8e8e8";
  let darkGreyColor = "#282828";

  console.log(calculateAvgHours(data));

  var arc = d3.arc()
    .startAngle(function(d) {
      var str = d["Hours"].split("-");
      return (convertTimeStrToFrac(str[0])/24 * 360 * PI / 180);
    })
    .endAngle(function(d) {
      var str = d["Hours"].split("-");
      return (convertTimeStrToFrac(str[1])/24 * 360 * PI / 180);
    })
    .innerRadius(function(d) {
      if (d["Date"] != currentDate) {
        ringCounter = ringCounter + 1;
        currentDate = d["Date"];
      }
      return arcMin + ringCounter*arcWidth;
    })
    .outerRadius(function(d) {
      return arcMin + (ringCounter+1)*arcWidth;
    });

  let allNighterArc = d3.arc()
    .startAngle(0)
    .endAngle((360 * PI / 180))
    .innerRadius(function(d) {
      var counter = (dateToRingArr.slice(0, Number(d["Month"])-1)).reduce((a, b) => a + b, 0) + Number(d["Day"]);
      return arcMin + counter*arcWidth;
    })
    .outerRadius(function(d) {
      var counter = (dateToRingArr.slice(0, Number(d["Month"])-1)).reduce((a, b) => a + b, 0) + Number(d["Day"]);
      return arcMin + (counter+1)*arcWidth;
    });

  // draw background pie
  svg.append('path')
    .attr('d', d3.arc()
      .innerRadius(arcMin)
      .outerRadius(arcMin + (totalDays)*arcWidth) // hardcoded
      .startAngle(0)
      .endAngle(360 * PI / 180)
    )
    .attr('fill', backgroundColor)
    .attr('transform', "translate(" + centerWidth + ", " + centerHeight + ")")
    .style('opacity', 0.75);

  // draw all nighters arcs
  svg.selectAll('.allNighterArcs')
    .data(getAllNighters())
    .enter()
    .append("path")
    .attr('d', allNighterArc)
    .attr('fill', allNighterColor)
    .attr('transform', "translate(" + centerWidth + ", " + centerHeight + ")")
    .style('opacity', 0.65);

  // draw sleep arcs
  svg.selectAll('.allSleepArcs')
    .data(data)
    .enter()
    .append('path')
    .attr('d', arc)
    .attr('transform', "translate(" + centerWidth + ", " + centerHeight + ")") 
    .attr('fill', blueArcColor)
    .on("mouseover", function(d) {
      let tooltipText = "<b>DAY: </b>" + d["Month"] + "/" + d["Date"] +
        "<br/><b> HOURS SLEPT: </b>" + d["Hours"];
      updateToolTipText(tooltip, tooltipText, 70, 150);
    })
    .on("mouseout", function() {
      hideTooltip(tooltip);
    });

  // draw x-axis
  var axisScale = d3.scaleLinear()
    .domain([0, 24])
    .range([0, 2*Math.PI]);

  svg.append("text")
    .attr("x", centerWidth)
    .attr("y", 85)
    .text("24 hr time ???")
    .style("font-family", "Rubik")
    .style("font-size", "12");

  svg.append('g')
    .call(d3.axisRadialOuter(
      axisScale, 
      arcMin + (ringCounter+5)*arcWidth)
    .tickFormat(function(d) {
      if (d == "24") return "";
      return d + ":00";
    })
    ).attr('transform', "translate(" + centerWidth + ", " + centerHeight + ")") 
    .style("opacity", 0.6)
    .selectAll("text")
      .style("font-family", "Rubik")
      .style("font-size", "12")
      .attr("text-anchor", function(d) {
        if (axisScale(d) < Math.PI) return "start";
        else return "end";
      });

  // add title
  addTitleText(svg, 25, 100, darkGreyColor, ["Sleep Patterns from", "Jan 2021 - April 2021"]);
  addBodyText(svg, 25, 200, textColor, 
    [
      "I have been recording my sleep schedule",
      "every day in a bullet journal and visualizing",
      "that data leads to some interesting patterns."
    ]);

  addBodyText(svg, 25, 300, textColor, 
    [
      "Although I sleep at strange times,",
      "I do get on average 6.84 hours of sleep",
      "per day."
    ]);

  // add legend
  svg.append('path')
    .attr('d', d3.arc()
      .innerRadius(15)
      .outerRadius(15 + (20)*arcWidth) // hardcoded
      .startAngle(0)
      .endAngle(360 * PI / 180)
    )
    .attr('fill', backgroundColor)
    .attr('transform', "translate(" + 100 + ", " + 550 + ")")
    .style('opacity', 0.75);

  let allNighterLegendArc = d3.arc()
    .startAngle(0)
    .endAngle((360 * PI / 180))
    .innerRadius(function(d) {
      return 15 + d*arcWidth;
    })
    .outerRadius(function(d) {
      return 15 + (d+1)*arcWidth;
    });

  let sleepLegendArc = d3.arc()
    .startAngle(function(d) {
      var str = d["Hours"].split("-");
      return (convertTimeStrToFrac(str[0])/24 * 360 * PI / 180);
    })
    .endAngle(function(d) {
      var str = d["Hours"].split("-");
      return (convertTimeStrToFrac(str[1])/24 * 360 * PI / 180);
    })
    .innerRadius(function(d) {
      return 15 + d["Counter"]*arcWidth;
    })
    .outerRadius(function(d) {
      return 15 + (d["Counter"]+1)*arcWidth;
    });

  svg.selectAll('.allNighterLegendArcs')
    .data([2, 5, 12])
    .enter()
    .append("path")
    .attr('d', allNighterLegendArc)
    .attr('fill', allNighterColor)
    .attr('transform', "translate(" + 100 + ", " + 550 + ")")
    .style('opacity', 0.65);

  svg.selectAll('.allSleepLegendArcs')
    .data(getLegendSleepArcs())
    .enter()
    .append('path')
    .attr('d', sleepLegendArc)
    .attr('transform', "translate(" + 100 + ", " + 550 + ")") 
    .attr('fill', blueArcColor)

  addAnnotationText(svg, 75, 465, textColor,
    [
      "Blue arcs represent",
      "hours when I am asleep"
    ]);

  addAnnotationText(svg, 25, 625, textColor,
    [
      "Orange rings represent",
      "days with an all nighter"
    ]);

  addAnnotationText(svg, 175, 535, textColor,
    [
      "One ring represents one day,",
      "with Jan 1st at the center", 
      "and days progressing outward"
    ]);
}