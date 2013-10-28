"use strict";

jQuery(function($) {

  
  var storePie = dc.pieChart('#store');
  var monthPie = dc.pieChart('#month');
  var dataTable = dc.dataTable('.dc-data-table');
  
  var pieWidth = 180;
  var pieInnerRadius = 40;
  var pieRadius = 80;

    
  d3.csv('/data/food.csv', function (err, data) {
    var costRe = /\d+\.?\d?/;
    
    data = $.map( data, function (row, i) {
      return {
        store: row.store.toLowerCase(),
        cost: parseInt(costRe.exec(row.Cost)[0], 10),
        desc: row.Item.toLowerCase(),
        category: row.Category,
        month: new Date(row.Date).getMonth(),
        day: new Date(row.Date)
      };
    });
    
    var food = crossfilter(data),
        storeDimension = food.dimension(function(e) { return e.store;}),
        monthDimension = food.dimension(function(e) { return e.month;}),
        storeCostGroup = storeDimension.group().reduceSum( function(e) {
          return e.cost;
        }),
        monthCostGroup = monthDimension.group().reduceSum( function(e) {
          return e.cost;
        });
        
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
        .innerRadius(pieInnerRadius)
        .dimension(monthDimension)
        .group(monthCostGroup)
        .title(function(d){return d.key + ': $' + d.value;})
        .renderlet(function (chart) {
          console.log(chart.filters());
        });

    
    dataTable.dimension(storeDimension)
      .group(function (d) {
            return d.month;
      })
      .size(10)
      .sortBy(function(d) { return d.desc; })
      .columns([
        function(d) { return d.desc; },
        function(d) { return d.category; },
        function(d) { return '$' + d.cost; },
        function(d) { return d.month; }  
      ]).renderlet(function (table) {
        console.log(table);
        table.selectAll(".dc-table-group").classed("info", true);
      });

    dc.renderAll();
    
  });
  
    
});