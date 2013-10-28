"use strict";

var months = {
  '0': {
    short: 'Jan',
    full: 'January'
  },
  '1': {
    short: 'Feb',
    full: 'February'
  },
  '2': {
    short: 'Mar',
    full: 'March'
  },
  '3': {
    short: 'Apr',
    full: 'April'
  },
  '4': {
    short: 'May',
    full: 'May'
  },
  '5': {
    short: 'Jun',
    full: 'June'
  }
};

jQuery(function($) {

  
  var storePie = dc.pieChart('#store');
  var monthPie = dc.pieChart('#month');
  var dataTable = dc.dataTable('.dc-data-table');
  var visitFreqChart = dc.barChart('#visitFreq');
  
  var pieWidth = 180;
  var pieInnerRadius = 40;
  var pieRadius = 80;

    
  d3.csv('/data/food.csv', function (err, data) {
    var costRe = /\d+\.?\d?/;
    
    data = $.map( data, function (row, i) {
      return {
        store: row.Retailer.toLowerCase(),
        cost: parseInt(costRe.exec(row.Cost)[0], 10),
        desc: row.Item.toLowerCase(),
        category: row.Category.toLowerCase(),
        month: months[new Date(row.Date).getMonth()].short,
        monthFull: months[new Date(row.Date).getMonth()].full,
        day: (new Date(row.Date)).getDate(),
        week: moment(row.Date).week()
        
      };
    });
    
    var food = crossfilter(data),
        itemDimension  = food.dimension(function(e) { return e.desc; }),
        storeDimension = food.dimension(function(e) { return e.store;}),
        monthDimension = food.dimension(function(e) { return e.month;}),
        weekDimension = food.dimension(function(e) { return e.week;}),
        storeCostGroup = storeDimension.group().reduceSum( function(e) {
          return e.cost;
        }),
        monthCostGroup = monthDimension.group().reduceSum( function(e) {
          return e.cost;
        });
        
        var weekGroup = weekDimension.group();
        
    storePie
        .width(pieWidth)
        .height(pieWidth)
        .radius(pieRadius)
        // .innerRadius(pieInnerRadius)
        .renderLabel(true)
        .dimension(storeDimension)
        .group(storeCostGroup)
        .title(function(d){return d.key + ': $' + d.value;})
        .renderlet(function (chart) {
          console.log(chart.filters());
        });
    
    monthPie
        .width(pieWidth)
        .height(pieWidth)
        .radius(pieRadius)
        .dimension(monthDimension)
        .group(monthCostGroup)
        .title(function(d){return d.key + ': $' + d.value;})
        .renderlet(function (chart) {
          console.log(chart.filters());
        });
    
    // visits per week
    visitFreqChart
      .width(990)
      .height(250)
      .transitionDuration(1500)
      .margins({top: 10, right: 50, bottom: 30, left: 40})
      .dimension(storeDimension)
      .group(weekGroup)
      .elasticY(true)
      .centerBar(true)
      .x(d3.scale.linear().domain([6, 30]))
      .renderHorizontalGridLines(true);
    
    dataTable.dimension(storeDimension)
      .group(function (d) {
            return d.monthFull;
      })
      .size(100)
      .sortBy(function(d) { return d.category; })
      .columns([
        function(d) { return d.desc; },
        function(d) { return d.category; },
        function(d) { return d.store; },
        function(d) { return '$' + d.cost; },
        function(d) { return d.month + ' ' + d.day; }  
      ]).renderlet(function (table) {
        console.log(table);
        table.selectAll(".dc-table-group").classed("info", true);
      });

    var all = food.groupAll();
    dc.dataCount(".dc-data-count")
      .dimension(food)
      .group(all);
      
    dc.renderAll();
    
  });
  
    
});