// --------------------------------------------------------------------
// raphael.tachometer.js 1.1.0
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
  
  T.drawBoard = function(c, cx, cy, s, r, f) {
    c.circle(cx, cy, r).attr(opt.outerFrameAttr);
    c.circle(cx, cy, r - f).attr(opt.innerFrameAttr);
    c.circle(cx, cy, r - f * 2).attr(opt.boardAttr);
  };  

  T.drawScale = function(c, cx, cy, sb, opt) {
    var w = opt.scaleWidth,
        h = opt.scaleLength,
        m = opt.boardMargin,
        sw = Math.ceil(w / 2),
        sh = Math.ceil(h / 2);
    
    var ss = this.scale(c, cx, cy, sw, sh, sb, m, opt.scaleAngleStart);
    this.cloneScale(ss, cx, cy, opt.shortScaleCount, opt);
    
    var ls = this.scale(c, cx, cy, w, h, sb, m, opt.scaleAngleStart);
    this.cloneScale(ls, cx, cy, opt.longScaleCount, opt);
  };
  
  T.scale = function(c, cx, cy, w, h, sb, m, r) {
    var sx = cx - Math.floor(w / 2),
        sy = sb - h - m;
    
    return c.rect(sx, sy, w, h).attr(opt.scaleAttr).rotate(r, cx, cy);
  };
  
  T.cloneScale = function(s, cx, cy, count, opt) {
    var rad = (opt.scaleAngleEnd - opt.scaleAngleStart) / count;
    
    for (var i=1 ; i <= count ; i++) {
      s.clone().rotate(rad * i, cx, cy);
    }
  };
  
  T.drawNumber = function(c, cx, cy, sb, opt) {
    var lc = opt.longScaleCount,
        rad = (opt.scaleAngleEnd - opt.scaleAngleStart) / lc,
        prec = (opt.numberMax - opt.numberMin) / lc,
        m = opt.numberMargin,
        pos = sb / 2 - m,
        ss = opt.scaleAngleStart,
        label = null,
        x = null,
        y = null;
    
    for (var i=0 ; i <= lc ; i++) {
      label = Math.round(prec * i) + opt.numberMin;
      
      if (i == 0) label = label + opt.numberUnit;
      
      x = cx + Math.floor(pos * Math.cos(Raphael.rad(rad * i + 90 + ss)));
      y = cy + Math.floor(pos * Math.sin(Raphael.rad(rad * i + 90 + ss)));
      
      c.text(x, y, label).attr(opt.numberAttr).toFront();
    }
  };
  
  T.drawNeedle = function(c, cx, cy, sb, val, opt) {
    var xoffset = Math.floor(opt.needlePivotWidth / 2),
        m = opt.needleMargin,
        xpos = {
          start: cx + xoffset,
          middle: cx,
          end: cx - xoffset
        },
        ypos = {
          start: cy,
          end: sb - m
        },
        path = 'M' + xpos.start + ' ' + ypos.start + ' ' +
               'L' + xpos.middle + ' ' + ypos.end + ' ' +
               'L' + xpos.end + ' ' + ypos.start + ' ' +
               'L' + xpos.start + ' ' + ypos.start,
        needle = c.path(path).attr(opt.needleAttr),
        outer = c.circle(cx, cy, m).attr(opt.outerNeedlePivotAttr),
        inner = c.circle(cx, cy, m / 2).attr(opt.innerNeedlePivotAttr),
        hand = c.set(),
        ss = opt.scaleAngleStart,
        se = opt.scaleAngleEnd,
        ns = opt.numberMin,
        ne = opt.numberMax;
    
    hand.push(needle, outer, inner).attr(opt.handAttr).rotate(ss, cx, cy);
    
    this.p = { 
      value: ns,
      hand: hand,
      animation: opt.needleAnimation,
      duration: opt.needleAnimationDuration,
      easing: opt.needleAnimationEasing,
      cx: cx,
      cy: cy,
      ss: ss,
      se: se,
      ns: ns,
      ne: ne
    };
    
    this.set(val);
  };
  
  T.set = function(val, anim) {
    var p = this.p;
    
    // fix value in number between numberMin and numberMax;
    val = (p.ne < val) ? p.ne : ((val < p.ns) ? p.ns : val);
    
    var perc = (p.se - p.ss) * ((val - p.ns) / (p.ne - p.ns)) + p.ss,
        tstr = "r" + perc + " " + p.cx + " " + p.cy;
    
    this.p.value = val;
    
    if (typeof anim != 'undefined' ? anim : p.animation) {
      p.hand.animate({transform: tstr}, p.duration, p.easing);
    }
    else {
      p.hand.transform(tstr);
    }    
  };
  
  T.get = function() {
    return this.p.value;
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
    handAttr: {
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