(function () {

	window.onload = function () {

	  let publishedDataPath = 'https://raw.githubusercontent.com/openZH/covid_19/master/COVID19_Fallzahlen_Kanton_ZH_alter_geschlecht.csv';
	  let dataPath = 'data/COVID19_Cases_Cantons_CH_total.csv';
	  let metadataPath = 'https://opendata.swiss/en/dataset/covid_19-fallzahlen-kanton-zuerich';

		if (location.protocol !== "file:") {
			 dataPath = publishedDataPath;
			 dataPath2 = productionBaseUrlData+projectFolder+dataPath2;
		}


	var margin = {top: 10, right: 70, bottom: 45, left: 70},
	  width = parseInt(d3.select('#d3vis').style('width')) - margin.left - margin.right,
	  height = 400,
	  anzahlLinien;


	//Formatierung Schweiz
	var ch_DE = {
		"decimal": ".",
		"thousands": "'",
		"grouping": [3],
		"currency": ["CHF", " "],
		"dateTime": "%a %b %e %X %Y",
		"date": "%d.%m.%Y",
		"time": "%H:%M:%S",
		"periods": ["AM", "PM"],
		"days": ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
		"shortDays": ["So", "Mo", "Di", "M", "Do", "Fr", "Sa"],
		"months": ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
		"shortMonths": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
	};

	d3.formatDefaultLocale(ch_DE);

	var yearParser = d3.timeParse('%Y');
	var dateParser = d3.timeParse('%d.%m.%Y');

	//Konstanten
  var mouseJahr = 0;


	var svg = d3.select('#d3vis').append('svg').attr('id','svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    	//.call(responsify)
  	.append('g')
  	.attr('id','chartCanvas')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  var mouseBack = svg.append('rect')
  		.attr('class', 'mouseBack')
  		.attr('id', 'mouseBackR')
   		.attr('x', 0)
   		.attr('y', 0)
   		.attr('width', width)
   		.attr('height', height);

  var chartGroup = svg.append('g')
  		.attr('id', 'chartGroup')
  		.attr('pointer-events', 'none');

  var mouseGroup = svg.append('g')
  		.attr('id', 'mouseGroup')

	var xScale = d3.scaleTime().range([0,width]);

	var yScale = d3.scaleLinear().range([height,0]);

	var color = d3.scaleOrdinal()
  	.range(['#3F7A9F','#8AC473','#EFCF7C','#F3AC92']);

	var yAxis = d3.axisLeft();
	var xAxis = d3.axisBottom();

	var line = d3.line()
	  .x(function(d) { return xScale(d[xValues]); })
	  .y(function(d) { return yScale(d[yValues]); });

	Promise.all([
		d3.csv(dataPath)
	]).then(function(data) {
		var data0 = data[0];

   	data0.forEach(function(d) {
	    d.Date = dateParser(d.Date);
	  });
		console.log(data0);
		let dataSumDate = d3.nest()
	    .key(function(d) { return d.Date; }).sortKeys(d3.ascending)
		  .rollup(function(v) { return {
			  count: v.length,
			  totalNewConf: d3.sum(v, function(d) { return d.NewConfCases; }),
			  totalNewCured: d3.sum(v, function(d) { return d.NewCured; }),
			  totalNewDeaths: d3.sum(v, function(d) { return d.NewDeaths; }),
			  totalNewPostTests1: d3.sum(v, function(d) { return d.NewPosTests1; }),
			  avg: d3.mean(v, function(d) { return d.amount; })
				}; })
	    .entries(data0);
	  console.log(dataSumDate);
		var yMax = d3.max(data0, function(d) { return +d[yValues];});
		var xExtent = d3.extent(data0, function(d) { return +d[xValues];});

		xScale.domain(xExtent);
		yScale.domain([0, yMax]);

		yAxis.scale(yScale).tickSize(width+5);
		xAxis.scale(xScale);

  	chartGroup.append('g')
      .attr('class', 'y axis')
      .call(yAxis)
			.attr('transform', 'translate('+(width)+',' + 0 + ')');

  	chartGroup.append('g')
			.attr('class', 'x axis')
			.call(xAxis)
			.attr("transform", "translate(0," + height + ")");

		//nest categories
		var dataNest = d3.nest()
	    .key(function(d) { return d[categories] }).sortKeys(d3.ascending)
	    .entries(data0);

		categoryArray = [];
		for(i=0;i<dataNest.length;i++) {
			categoryArray.push(dataNest[i].key);
		}
		color.domain(categoryArray)

		anzahlLinien = categoryArray.length;
		var lineGroup = chartGroup.selectAll('g.lineGroup')
 			.data(dataNest);


		lineDraw(lineGroup);

		mouseBack.on("touchmove mousemove", function() {
		  var mouseJahrN = xScale.invert(d3.mouse(this)[0]);



		  //Damit Wechsel bei Mouseover nicht erst am 31.12. sondern in der Mitte zwischen den Jahren wechselt:
		  if (mouseJahrN.getMonth()>=7) {
		  	mouseJahrN = mouseJahrN.getFullYear()+1;
		  } else {
		  	mouseJahrN = mouseJahrN.getFullYear();
		  }

	  	var dataFilter = [];
	  	dataNest.forEach(function(obj) {
		    dataFilter.push(obj.values.filter(function(d) {
		    	return d[xValues].getFullYear() == mouseJahrN;
		    }));
		  });

			textLabelDouble(dataFilter, mouseGroup);
			marker(dataFilter, mouseGroup);

		  mouseJahr = mouseJahrN;
		});

    drawLabels(dataNest)
		// Call the resize function
		resize();
	});

	function calculateYpos(yPositions, fontS) {
		//sortyPositions
		yPos0 = yPositions[0];
		yPos1 = yPositions[1];
		yPos2 = yPositions[2];
		yPos3 = yPositions[3];
		//

	}
	function marker(data,group) {

		d3.select('#markerLine').remove();
		d3.select('#jahrText').remove();
		d3.select('#jahrRect').remove();
		var yMax = d3.max(data, function(d) { return d[0][yValues]; })

		var line = group.append('line')
			.attr('id','markerLine')
  		.attr('class','tipL')
  		.attr('x1', xScale(data[0][0][xValues]))
  		.attr('x2', xScale(data[0][0][xValues]))
  		.attr('y1', yScale(0))
  		.attr('y2', yScale(yMax))
  		.attr('stroke', 'grey');

  	var jahrRect =  group.append('rect')
			.attr('id','jahrRect')
  		.attr('class','axis')
  		.attr('x', xScale(data[0][0][xValues])-40/2)
  		.attr('y', yScale(0)+5)
  		.attr('width', 40)
  		.attr('height', 15)
  		.style('fill', 'whitesmoke');


  	var jahrText =  group.append('text')
			.attr('id','jahrText')
  		.attr('class','axis')
  		.attr('x', xScale(data[0][0][xValues]))
  		.attr('y', yScale(0)+16)
  		.style('text-anchor', 'middle')
  		.style('font-weight', 'bold')
  		.style('font-size', '12px')
  		.text(data[0][0][xValues].getFullYear());

		var circles = group.selectAll('circle.tip')
  		.data(data, function(d) { return d.INDIKATOR_ID; });

  	circles.enter().append('circle')
  		.attr('class','tip')
  		.attr('cx', function(d) { return xScale(d[0][xValues]); })
  		.attr('cy', function(d) { return yScale(d[0][yValues]); })
  		.attr('r', 4)
  		.attr('fill', function(d) { return color(d[0].INDIKATOR_NAME); })
  		.attr('stroke', 'grey')

  	circles
  		.attr('cx', function(d) { return xScale(d[0][xValues]); })
  		.attr('cy', function(d) { return yScale(d[0][yValues]); })
  		.attr('fill', function(d) { return color(d[0].INDIKATOR_NAME); })

  	circles.exit().remove();


	}

	function textLabelDouble(data, group) {
		var textGrB = group.selectAll('text.tipTback')
  		.data(data, function(d) { return d.INDIKATOR_ID; });
		var textGr = group.selectAll('text.tipT')
  		.data(data, function(d) { return d.INDIKATOR_ID; });

  	textLabel('tipTback',textGrB);
  	textLabel('tipT',textGr);

		function textLabel(klasse,holder) {
	  	holder.enter()
	  		.append('text')
	  		.attr('class', klasse+' axis')
	  		.attr('pointer-events', 'none')
	  		.attr('dx', function(d) {
	  			if(xScale(d[0][xValues])>= width/2) {
	  				return -6;
	  			} else {
	  				return 6
	  			}
	  		})
	  		.attr('dy', 3)
	  		.attr('x', function(d) { return xScale(d[0][xValues]); })
	  		.attr('y', function(d) { return yScale(d[0][yValues]); })
	  		.style('text-anchor', function(d) {
	  			if(xScale(d[0][xValues])>= width/2) {
	  				return 'end'
	  			} else {
	  				return 'start'
	  			}
	  		})
	  		.text(function(d) { return d[0][categories]+': '+d3.format(",")(d[0][yValues]); });

	  	holder
	  		.text(function(d) { return d[0][categories]+': '+d3.format(",")(d[0][yValues]); })
	  		.attr('x', function(d) { return xScale(d[0][xValues]); })
	  		.attr('dx', function(d) {
	  			if(xScale(d[0][xValues])>= width/2) {
	  				return -6;
	  			} else {
	  				return 6
	  			}
	  		})
	  		.attr('y', function(d) { return yScale(d[0][yValues]); })
	  		.style('text-anchor', function(d) {
	  			if(xScale(d[0][xValues])>= width/2) {
	  				return 'end'
	  			} else {
	  				return 'start'
	  			}
	  		});

  		holder.exit().remove();
		}
	}

	function lineDraw(holder) {

		var lineGr = holder.enter().append('g')
 			.attr('class', 'lineGroup')
 			.attr('id', function(d) { return color(d.values[0].INDIKATOR_ID); });

		holder
 			.attr('class', 'lineGroup')
 			.attr('id', function(d) { return color(d.key); });

 		holder.exit().remove();

 		lineGr.append('path')
      .attr("class", "line")
      .attr("d", function(d) { return line(d.values); })
      .style("stroke", function(d) { return color(d.key); });

 		lineGr
      .attr("d", function(d) { return line(d.values); });


    //noch machen: umbrechen wenn kein Platz
    //http://bl.ocks.org/enjalot/1829187
	}

	function drawLabels(data) {
		d3.selectAll('.labelGr').remove();
		var group = svg.append('g').attr('class', 'labelGr');
		for(i=0;i<data.length;i++) {
			var text = group.append('text')
	    	.attr('id', 'labelT_'+i)
	    	.attr('class', 'axis')
	    	.text(data[i].values[0].INDIKATOR_NAME);

	    var circle = group.append('circle')
	    	.attr('id', 'labelC_'+i)
	    	.attr('class', 'axis')
	    	.attr('r', 5)
	    	.attr('fill', color(data[i].values[0].INDIKATOR_NAME));

		}
	}

	function resize() {
	  var width = parseInt(d3.select("#d3vis").style("width")) - margin.left - margin.right;
  		//height = parseInt(d3.select("#d3vis").style("height")) - margin.top - margin.bottom;

		d3.select('svg').attr('width', width + margin.left + margin.right);

		d3.select("#mouseGroup").selectAll("*").remove();

  	xScale.range([0, width]);

		xAxis.scale(xScale);

		yAxis.scale(yScale).tickSize(width+5);

		//back Rect für Mouseover resize
		d3.select('#mouseBackR')
	 		.attr('width', width)
	 		.attr('height', height);

  	svg.select(".y.axis")
      .call(yAxis)
			.attr('transform', 'translate('+(width)+',' + 0 + ')');

  	svg.select(".x.axis")
	    .call(xAxis.ticks(width/50));
	    //.attr("transform", "translate(0," + height + ")")
	  svg.selectAll('.line')
      .attr("d", function(d) { return line(d.values); })

		var totalWidth = 0,
			counterY =0,
			counterX=0;
    for(i=0;i<anzahlLinien;i++) {
	    var bBox = d3.select('#labelT_'+i).node().getBBox();
	    if ((totalWidth+bBox.width)<=width) {
		    d3.select('#labelT_'+i)
		    	.attr('x', totalWidth+25)
		    	.attr('y', height+40+counterY*25)

		    d3.select('#labelC_'+i)
		    	.attr('cx', totalWidth+15)
		    	.attr('cy', height+40-3+counterY*25)

	    	totalWidth +=bBox.width+25;
	    } else {
	    	counterY+=1;
	    	totalWidth = 0;
		    d3.select('#labelT_'+i)
		    	.attr('x', totalWidth+25)
		    	.attr('y', height+40+counterY*25)


		    d3.select('#labelC_'+i)
		    	.attr('cx', totalWidth+15)
		    	.attr('cy', height+40-3+counterY*25)

	    	totalWidth =bBox.width+25;
	    }
			d3.select('svg').attr('height', height + (counterY)*30+margin.bottom + margin.top);
	  }
	}

	// Call the resize function whenever a resize event occurs
	d3.select(window).on('resize', resize);



	};
}());
