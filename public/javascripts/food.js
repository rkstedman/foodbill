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
  },
  '6': {
    short: 'Jul',
    full: 'July'
  },
  '7': {
    short: 'Aug',
    full: 'August'
  },
  '8': {
    short: 'Sep',
    full: 'September'
  },
  '9': {
    short: 'Oct',
    full: 'October'
  }
};

jQuery(function($) {

  var dietPie = dc.pieChart('#diet');
  var storeChart = dc.rowChart('#store');
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
        store: $.trim(row.Retailer.toLowerCase()),
        cost: parseInt(costRe.exec(row.Cost)[0], 10),
        desc: $.trim(row.Item.toLowerCase()),
        category: $.trim(row.Category.toLowerCase()),
        month: months[new Date(row.Date).getMonth()].short,
        monthFull: months[new Date(row.Date).getMonth()].full,
        day: (new Date(row.Date)).getDate(),
        date: new Date(row.Date),
        week: moment(row.Date).format('ggggww'),
        diet: $.trim(row.Diet.toLowerCase())
      };
    });
    
    var food = crossfilter(data),
        dietDimension  = food.dimension(function(e) { return e.diet; }),
        itemDimension  = food.dimension(function(e) { return e.desc; }),
        storeDimension = food.dimension(function(e) { return e.store;}),
        monthDimension = food.dimension(function(e) { return e.month;}),
        weekDimension  = food.dimension(function(e) { return e.week;}),
        storeCostGroup = storeDimension.group().reduceSum( function(e) {
          return e.cost;
        }),
        monthCostGroup = monthDimension.group().reduceSum( function(e) {
          return e.cost;
        }),
        dietCostGroup = dietDimension.group();
        
    var weekGroup = weekDimension.group().reduce( 
      function (p, v) {
        if(p.days[v.day]) {
          p.total = p.total;
        } else {
          p.days[v.day] = true;
          p.total = p.total + 1;
        }
        return p;
      },
      function (p, v) {
        if(p.days[v.day]) {
          p.total = p.total - 1;
          p.days[v.day] = false;
        } else {
          p.total = p.total;
        }
        return p;
      },
      function () {
        return {days: {}, total: 0};
      }
    );
        
    dietPie
      .width(pieWidth)
      .height(pieWidth)
      .radius(pieRadius)
      .renderLabel(true)
      .dimension(dietDimension)
      .group(dietCostGroup)
      .title(function (d) { return d.key + ': $' + d.value; })
      .renderlet(function (chart) {
        // console.log(chart.filters());
      });
    
    storeChart
        .width(490)
        .height(300)
        .margins({top: 20, left: 10, right: 10, bottom: 20})
        .renderLabel(true)
        .dimension(storeDimension)
        .group(storeCostGroup)
        .title(function(d){return d.key + ': $' + d.value;})
        .elasticX(true)
        .xAxis().ticks(4);
    
    monthPie
        .width(pieWidth)
        .height(pieWidth)
        .radius(pieRadius)
        .dimension(monthDimension)
        .group(monthCostGroup)
        .title(function(d){return d.key + ': $' + d.value;})
        .renderlet(function (chart) {
          // console.log(chart.filters());
        });
    
    // visits per week
    visitFreqChart
      .width(980)
      .height(250)
      .transitionDuration(1500)
      .margins({top: 10, right: 50, bottom: 30, left: 40})
      .dimension(weekDimension)
      .group(weekGroup)
      .valueAccessor(function (d) {
        return d.value.total;
      })
      .elasticY(true)
      .centerBar(true)
      .x(d3.scale.linear().domain([201306, 201352]))
      .xAxis().tickFormat(
        function (v) { 
          return moment(v, 'ggggww').format('MM/DD');
      });
    
    dataTable.dimension(storeDimension)
      .group(function (d) {
            return d.monthFull;
      })
      .size(25)
      .sortBy(function(d) { return d.category; })
      .columns([
        function(d) { return d.desc; },
        function(d) { return d.category; },
        function(d) { return d.store; },
        function(d) { return '$' + d.cost; },
        function(d) { return d.month + ' ' + d.day; }  
      ]).renderlet(function (table) {
        // console.log(table);
        table.selectAll(".dc-table-group").classed("info", true);
      });

    var all = food.groupAll();
    dc.dataCount(".dc-data-count")
      .dimension(food)
      .group(all);
      
    dc.renderAll();
    
  });
  
    
});