// --------------------------------------------------------------------
// raphael.tachometer.js 1.0.0
// 
// Copyright (c) 2011 Code Front (http://code-front.com)
// Licensed under the MIT license.
// --------------------------------------------------------------------

Raphael.fn.tachometer = function(value, opt) {

  function Tachometer() {
    this.initialize.apply(this,arguments);
  }
  
  var T = Tachometer.prototype;
  
  T.initialize = function(canvas, value, opt) {
    var w = canvas.canvas.clientWidth || canvas.width,
        h = canvas.canvas.cliendHeight || canvas.height,  
        cx = Math.floor(w / 2),
        cy = Math.floor(h / 2),
        s = Math.min(w, h),         // short side of canvas rect
        sb = s - opt.frameSize * 2, // side of board (exclude farme)
        r = Math.floor(s / 2);      // radius of rest board (include frame)
    
    this.drawBoard(canvas, cx, cy, s, r, opt.frameSize);
    this.drawScale(canvas, cx, cy, sb, opt);
    
    if (opt.number) {
      this.drawNumber(canvas, cx, cy, sb, opt);
    }
    
    this.drawNeedle(canvas, cx, cy, sb, value, opt);
  };
  
  T.drawBoard = function(c, x, y, s, r, f) {
    c.circle(x, y, r).attr(opt.outerFrameAttr);
    c.circle(x, y, r - f).attr(opt.innerFrameAttr);
    c.circle(x, y, r - f * 2).attr(opt.boardAttr);
  };  

  T.drawScale = function(c, x, y, sb, opt) {
    var w = opt.scaleWidth,
        h = opt.scaleLength,
        m = opt.boardMargin,
        sw = Math.ceil(w / 2),
        sh = Math.ceil(h / 2);
    
    var ss = this.scale(c, x, y, sw, sh, sb, m, opt.scaleAngleStart);
    this.cloneScale(ss, x, y, opt.shortScaleCount, opt);
    
    var ls = this.scale(c, x, y, w, h, sb, m, opt.scaleAngleStart);
    this.cloneScale(ls, x, y, opt.longScaleCount, opt);
  };
  
  T.scale = function(c, x, y, w, h, sb, m, r) {
    var sx = x - Math.floor(w / 2),
        sy = sb - h - m;
    
    return c.rect(sx, sy, w, h).attr(opt.scaleAttr).rotate(r, x, y);
  };
  
  T.cloneScale = function(s, x, y, count, opt) {
    var rad = (opt.scaleAngleEnd - opt.scaleAngleStart) / count;
    
    for (var i=1 ; i <= count ; i++) {
      s.clone().rotate(rad * i, x, y);
    }
  };
  
  T.drawNumber = function(c, x, y, sb, opt) {
    var lc = opt.longScaleCount,
        rad = (opt.scaleAngleEnd - opt.scaleAngleStart) / lc,
        prec = (opt.numberMax - opt.numberMin) / lc,
        m = opt.numberMargin,
        pos = sb / 2 - m,
        ss = opt.scaleAngleStart,
        label = null,
        cx = null,
        cy = null;
    
    for (var i=0 ; i <= lc ; i++) {
      label = Math.round(prec * i) + opt.numberMin;
      
      if (i == 0) label = label + opt.numberUnit;
      
      cx = x + Math.floor(pos * Math.cos(Raphael.rad(rad * i + 90 + ss)));
      cy = y + Math.floor(pos * Math.sin(Raphael.rad(rad * i + 90 + ss)));
      
      c.text(cx, cy, label).attr(opt.numberAttr).toFront();
    }
  };
  
  T.drawNeedle = function(c, x, y, sb, val, opt) {
    var xoffset = Math.floor(opt.needlePivotWidth / 2),
        m = opt.needleMargin,
        xpos = {
          start: x + xoffset,
          middle: x,
          end: x - xoffset
        },
        ypos = {
          start: y,
          end: sb - m
        },
        path = 'M' + xpos.start + ' ' + ypos.start + ' ' +
               'L' + xpos.middle + ' ' + ypos.end + ' ' +
               'L' + xpos.end + ' ' + ypos.start + ' ' +
               'L' + xpos.start + ' ' + ypos.start,
        needle = c.path(path).attr(opt.needleAttr),
        outer = c.circle(x, y, m).attr(opt.outerNeedlePivotAttr),
        inner = c.circle(x, y, m / 2).attr(opt.innerNeedlePivotAttr),
        set = c.set(),
        ss = opt.scaleAngleStart,
        se = opt.scaleAngleEnd,
        ns = opt.numberMin,
        ne = opt.numberMax,
        perc = (se - ss) * ((val - ns) / (ne - ns)) + ss;
    
    needle.rotate(ss, x, y);
    set.push(needle, outer, inner).attr(opt.needleSetAttr);
    
    if (opt.needleAnimation) {
      set.animate({
        transform: "r" + perc + " " + x + " " + y
      }, 700, 'bounce');
    }
    else {
      set.rotate(perc, x, y);
    }
  };
  
  function merge(dest, src) {
    for (var p in src) {
      if (src.hasOwnProperty(p)) {
        dest[p] = src[p] === Object(src[p]) ? merge(dest[p], src[p]) : src[p];
      }
    }
    return dest;
  };
  
  opt = merge({
    boardMargin: 6,
    boardAttr: {
      'stroke': 0,
      'fill': 'r#333:85-#000'
    },
    frameSize: 6,
    outerFrameAttr: {
      'stroke': '#b3b3b3',
      'stroke-width': 0.3,
      'fill': '45-#ccc-#fff:50-#ccc'
    },
    innerFrameAttr: {
      'stroke': '#ccc',
      'stroke-width': 0.3,
      'fill': '45-#666-#fff:50-#666'
    },
    
    needleMargin: 6,
    needlePivotWidth: 6,
    needleAttr: {
      'fill': '#f00',
      'stroke-width': 0
    },
    outerNeedlePivotAttr: {
      'fill': '#f00',
      'stroke-width': 0
    },
    innerNeedlePivotAttr: {
      'fill': '#fff',
      'stroke-width': 0
    },
    needleSetAttr: {
      'stroke-width': 0.3,
      'stroke': '#fff'
    },
    needleAnimation: true,
    needleAnimationDuration: 700,
    needleAnimationEasing: 'bounce',
    
    number: true,
    numberMargin: 34,
    numberAttr: {
      fill: '#fff',
      'font-family': '"Palatino Linotype", "Book Antiqua", Palatino, serif',
      'font-size': 10
    },
    numberMin: 0,
    numberMax: 100,
    numberUnit: '%',
    
    scaleLength: 10,
    scaleWidth: 3,
    scaleAttr: {
      fill: '#fff'
    },
    scaleAngleStart: 0,
    scaleAngleEnd: 270,
    longScaleCount: 10,
    shortScaleCount: 50,
    
    interactive: false
  }, opt);
  
  var t = new Tachometer(this, value, opt);
  
  return opt.interactive ? t : this;
};