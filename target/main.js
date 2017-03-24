$(function() {
  var randomScalingFactor = function() {
    return Math.round(Math.random() * 100);
  };
  var randomColorFactor = function() {
    return Math.round(Math.random() * 255);
  };

  function bezier(b1, b2) {
    //Final stage which takes p, p+1 and calculates the rotation, distance on the path and accumulates the total distance
    this.rad = Math.atan(b1.point.mY / b1.point.mX);
    this.b2 = b2;
    this.b1 = b1;
    dx = (b2.x - b1.x);
    dx2 = (b2.x - b1.x) * (b2.x - b1.x);
    this.dist = Math.sqrt(((b2.x - b1.x) * (b2.x - b1.x)) + ((b2.y - b1.y) * (b2.y - b1.y)));
    xDist = xDist + this.dist;
    this.curve = {
      rad: this.rad,
      dist: this.dist,
      cDist: xDist
    };
  };

  function bezierT(t, startX, startY, control1X, control1Y, control2X, control2Y, endX, endY) {
    //calculates the tangent line to a point in the curve; later used to calculate the degrees of rotation at this point.
    this.mx = (3 * (1 - t) * (1 - t) * (control1X - startX)) + ((6 * (1 - t) * t) * (control2X - control1X)) + (3 * t * t * (endX - control2X));
    this.my = (3 * (1 - t) * (1 - t) * (control1Y - startY)) + ((6 * (1 - t) * t) * (control2Y - control1Y)) + (3 * t * t * (endY - control2Y));
  };

  function bezier2(t, startX, startY, control1X, control1Y, control2X, control2Y, endX, endY) {
    //Quadratic bezier curve plotter
    this.Bezier1 = new bezier1(t, startX, startY, control1X, control1Y, control2X, control2Y);
    this.Bezier2 = new bezier1(t, control1X, control1Y, control2X, control2Y, endX, endY);
    this.x = ((1 - t) * this.Bezier1.x) + (t * this.Bezier2.x);
    this.y = ((1 - t) * this.Bezier1.y) + (t * this.Bezier2.y);
    this.slope = new bezierT(t, startX, startY, control1X, control1Y, control2X, control2Y, endX, endY);

    this.point = {
      t: t,
      x: this.x,
      y: this.y,
      mX: this.slope.mx,
      mY: this.slope.my
    };
  };

  function bezier1(t, startX, startY, control1X, control1Y, control2X, control2Y) {
    //linear bezier curve plotter; used recursivly in the quadratic bezier curve calculation
    this.x = ((1 - t) * (1 - t) * startX) + (2 * (1 - t) * t * control1X) + (t * t * control2X);
    this.y = ((1 - t) * (1 - t) * startY) + (2 * (1 - t) * t * control1Y) + (t * t * control2Y);

  };

  function FillRibbon(text, Ribbon, color) {

    var textCurve = [];
    var ribbon = text.substring(0, Ribbon.maxChar);
    var curveSample = 1000;


    xDist = 0;
    var i = 0;
    for (i = 0; i < curveSample; i++) {
      a = new bezier2(i / curveSample, Ribbon.startX, Ribbon.startY, Ribbon.control1X, Ribbon.control1Y, Ribbon.control2X, Ribbon.control2Y, Ribbon.endX, Ribbon.endY);
      b = new bezier2((i + 1) / curveSample, Ribbon.startX, Ribbon.startY, Ribbon.control1X, Ribbon.control1Y, Ribbon.control2X, Ribbon.control2Y, Ribbon.endX, Ribbon.endY);
      c = new bezier(a, b);
      textCurve.push({
        bezier: a,
        curve: c.curve
      });
    }

    letterPadding = ctx.measureText(" ").width / 10;
    w = ribbon.length;
    ww = Math.round(ctx.measureText(ribbon).width);


    totalPadding = (w - 1) * letterPadding;
    totalLength = ww + totalPadding;
    p = 0;

    cDist = textCurve[curveSample - 1].curve.cDist;

    z = (cDist / 2) - (totalLength / 2);

    for (i = 0; i < curveSample; i++) {
      if (textCurve[i].curve.cDist >= z) {
        p = i;
        break;
      }
    }

    for (i = 0; i < w; i++) {
      ctx.save();
      ctx.translate(textCurve[p].bezier.point.x, textCurve[p].bezier.point.y);
      ctx.rotate(textCurve[p].curve.rad);
      ctx.fillStyle = color;
      ctx.fillText(ribbon[i], 0, 0);
      ctx.restore();

      x1 = ctx.measureText(ribbon[i]).width + letterPadding;
      x2 = 0;
      for (j = p; j < curveSample; j++) {
        x2 = x2 + textCurve[j].curve.dist;
        if (x2 >= x1) {
          p = j;
          break;
        }
      }
    }
  }; //end FillRibon

  function renderBezierText(ctx, points, text, bottomAlign, color) {
    Ribbon = {
      maxChar: 50,
      startX: points[0],
      startY: points[1],
      control1X: points[2],
      control1Y: points[3],
      control2X: points[4],
      control2Y: points[5],
      endX: points[6],
      endY: points[7]
    };

    
    ctx.save();
    ctx.beginPath();
      
    ctx.moveTo(Ribbon.startX,Ribbon.startY);
    ctx.bezierCurveTo(Ribbon.control1X,Ribbon.control1Y,
                   Ribbon.control2X,Ribbon.control2Y,
                   Ribbon.endX,Ribbon.endY);
      
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.restore();
    
    if (bottomAlign) {
      ctx.textBaseline = 'top';
    } else {
      ctx.textBaseline = "bottom";
    }
    FillRibbon(text, Ribbon, color);
  }

  function generateDatasets() {
    var datasets = [];

    for (var i=0; i<colors.length; i++) {
      datasets.push({data: quadrants, backgroundColor: colors[i].slice(0)});
    }

    return datasets;
  }

  var config = {
    type: 'doughnut',
    data: {
      datasets: generateDatasets()
    },
    options: {
      responsive: true,
      tooltips: false,
      layout: {
        padding: 50
      },
      cutoutPercentage: 10,
      animation: {
        duration: 1000,
        easing: "easeOutQuart",
        onProgress: function() {

          var ctx = this.chart.ctx;
          var pixelSize = Math.round(this.chart.width / 25);
          ctx.font = pixelSize + "px arial black";
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          var counter = 4;
          this.data.datasets.forEach(function(dataset) {

            for (var i = 0; i < dataset.data.length; i++) {
              var model = dataset._meta[Object.keys(dataset._meta)[0]].data[i]._model,
                total = dataset._meta[Object.keys(dataset._meta)[0]].total,
                mid_radius = model.innerRadius + (model.outerRadius - model.innerRadius) / 2,
                start_angle = model.startAngle,
                end_angle = model.endAngle,
                mid_angle = start_angle + (end_angle - start_angle) / 2;

              var x = (mid_radius * Math.cos(mid_angle));
              var y = (mid_radius * Math.sin(mid_angle)) + (pixelSize / 2);

              ctx.fillStyle = '#fff';
              ctx.fillText(counter, model.x + x, model.y + y);
            }
            counter--;
          });

          var originX = 58;
          var originY = 62;
          var chartWidth = this.chart.width - 115;
          var chartHeight = this.chart.height - 115;
          var handleMultiplier = 0.5523;

          ctx.textAlign = "left";

          renderBezierText(ctx, [
            originX + (chartWidth / 2), originY,
            originX + ((chartWidth + (handleMultiplier * chartWidth)) / 2), originY,
            chartWidth + originX, originY + ((chartHeight - (handleMultiplier * chartHeight)) / 2),
            chartWidth + originX, originY + (chartHeight / 2)
          ], "Relationships", false, colors[3][0]);

          renderBezierText(ctx, [
            originX + (chartWidth / 2), originY + chartHeight,
            originX + (chartWidth + (handleMultiplier * chartWidth)) / 2, originY + chartHeight,
            originX + chartWidth, originY + ((chartHeight + (handleMultiplier * chartHeight)) / 2),
            originX + chartWidth, originY + (chartHeight / 2)
          ], "Personal growth/health", true, colors[3][1]);

          renderBezierText(ctx, [
            originX, originY + (chartHeight / 2),
            originX, originY + ((chartHeight + (handleMultiplier * chartHeight)) / 2),
            originX + ((chartWidth - (handleMultiplier * chartWidth)) / 2), originY + chartHeight,
            originX + (chartWidth / 2), originY + chartHeight
          ], "Leisure", true, colors[3][2]);

          renderBezierText(ctx, [
            originX, originY + (chartHeight / 2),
            originX, originY + ((chartHeight - (handleMultiplier * chartHeight)) / 2),
            originX + ((chartWidth - (handleMultiplier * chartWidth)) / 2), originY,
            originX + (chartWidth / 2), originY
          ], "Work/education", false, colors[3][3]);
        }
      },

      onClick: function(evt, item) {

        if (item.length === 0) {
          return;
        }

        var i,j,k;
        var selectedIndex = item[0]._datasetIndex;
        var selectedQuadrant = item[0]._index;
        var tmp = marked.slice(0);
        marked = [];

        for (i=0; i<colors.length; i++) {
          for (j=0; j<colors[i].length; j++) {
            config.data.datasets[i].backgroundColor[j] = colors[i][j];
          }
        }

        for (var i=0; i<tmp.length; i++) {
          if (tmp[i].index !== selectedIndex && tmp[i].quadrant !== selectedQuadrant) {
            marked.push({
              quadrant: tmp[i].quadrant,
              index: tmp[i].index
            })
          }
        }  

        marked.push({
          quadrant: selectedQuadrant,
          index: selectedIndex
        });              

        for (i=0; i<4; i++) {
          for (j=0; j<4; j++) {

            var disabled = false;
            //if is the selected segment, ignore
            if (selectedIndex === j && selectedQuadrant === i)
            {
              continue;
            }

            //if there's a marked item in the current quadrant, then grey
            //or if there's a marked item with the current index, then grey
            for (k=0; k<marked.length; k++) {
              if ((marked[k].quadrant === i || marked[k].index === j) && !(marked[k].quadrant === i && marked[k].index === j)) {
                disabled = true;
                break;
              }
            }

            if (disabled) {
              config.data.datasets[j].backgroundColor[i] = "#D8D8D8";
            }
          }
        }

        if (marked.length === quadrants.length) {
          $("#btn-submit").removeAttr("disabled");
        }
        else {
          $("#btn-submit").attr("disabled", "disabled");
        }

        myDoughnut.update();
      }
    }
  };

  var ctx = document.getElementById("chart-area").getContext("2d");
  var myDoughnut = new Chart(ctx, config);

});

var marked = [];
var quadrants = [90, 90, 90, 90];
var colors = [
      [
        "#E4B79D",
        "#A4C6E2",
        "#99C2C2",
        "#C2A7CD"
      ],
      [
        "#D69370",
        "#77A9D4",
        "#66A3A3",
        "#A37CB4"
      ],
      [
        "#C86F46",
        "#4A8DC5",
        "#338585",
        "#85509B"
      ],
      [
        "#BB4D24",
        "#1D70B7",
        "#006666",
        "#662482"
      ]
];
