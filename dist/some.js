!function t(s,e,i){function o(n,h){if(!e[n]){if(!s[n]){var a="function"==typeof require&&require;if(!h&&a)return a(n,!0);if(r)return r(n,!0);var c=new Error("Cannot find module '"+n+"'");throw c.code="MODULE_NOT_FOUND",c}var p=e[n]={exports:{}};s[n][0].call(p.exports,function(t){var e=s[n][1][t];return o(e?e:t)},p,p.exports,t,s,e,i)}return e[n].exports}for(var r="function"==typeof require&&require,n=0;n<i.length;n++)o(i[n]);return o}({1:[function(t,s,e){"use strict";window.some=t("./src/some.core"),t("./src/some.random"),t("./src/some.noise"),t("./src/some.vec2"),t("./src/some.drawable"),t("./src/some.shape"),t("./src/some.grid"),t("./src/some.spine"),t("./src/some.colorspool"),t("./src/some.drawablespool"),t("./src/some.group"),s.exports=some},{"./src/some.colorspool":2,"./src/some.core":3,"./src/some.drawable":4,"./src/some.drawablespool":5,"./src/some.grid":6,"./src/some.group":7,"./src/some.noise":8,"./src/some.random":9,"./src/some.shape":10,"./src/some.spine":11,"./src/some.vec2":12}],2:[function(t,s,e){"use strict";var i=t("./some.core"),o=function(t,s){this.world=t,this.colors=[],this.index=-1,s=s||{},"undefined"!=typeof s.select};o.prototype.add=function(t,s){if(s=s||1,t instanceof i.color)for(;s--;)this.colors[this.colors.length]=t;return this},o.prototype.remove=function(t){return t>-1&&(this.colors=this.colors.splice(t,1)),this},o.prototype.clear=function(){return this.colors=[],this},o.prototype.next=function(){return this.index+1!==this.colors.length?this.index++:this.index=0,!0},o.prototype.get=function(){return{stroke:this.colors[this.index+1],fill:this.colors[this.index]}},o.prototype.reset=function(){return this.index=-1,this},i.colorsPool=o,s.exports=i},{"./some.core":3}],3:[function(t,s,e){"use strict";var i=function(){};i.Array="undefined"!=typeof Float32Array?Float32Array:Array,i.toRadians=Math.PI/180,i.toDegrees=1/i.toDegrees,s.exports=i},{}],4:[function(t,s,e){"use strict";var i=t("./some.core"),o=function(t){this.world=t,this.position=new i.vec2,this.size=new i.vec2(1,0),this.axis=new i.vec2(1,0),this.scale=1,this.anchor=new i.vec2(1,0),this.originalAxis=new i.vec2(1,0),this.from=new i.vec2,this.to=new i.vec2};o.prototype.setPosition=function(t,s){return this.position.set(t,s),this},o.prototype.setSize=function(t,s){return this.size.set(t,s),this},o.prototype.setAnchor=function(t,s){return this.anchor.set(t,s),this},o.prototype.setAxis=function(t,s){return this.axis.set(t,s),this.originalAxis.set(t,s),this},o.prototype.setRotation=function(t){return t*=i.toRadians,this.axis.rotate(this.originalAxis.heading()-this.axis.heading()+t),this},o.prototype.setScale=function(t){return this.scale=t||1,this},o.prototype.draw=function(t,s,e,i){"undefined"!=typeof e&&"undefined"!=typeof i?(this.from.set(t,s),this.to.set(e,i)):(this.from.set(t||this.position),this.to.set(s||this.size));this.to.len()/this.axis.len();return this.world.push(),this.world.translate(this.from.x,this.from.y),this.world.rotate(this.to.heading()-this.axis.heading()),this.world.translate(this.anchor.x,this.anchor.y),this.world.scale(this.scale),this.world.strokeWeight(1/this.scale),this.representation(),DEBUG&&(this.world.rotate(this.to.heading()+this.axis.heading()),this.world.stroke(255,100,250),this.world.strokeWeight(2),this.world.line(0,0,this.to.x,this.to.y),this.world.noStroke(),this.world.fill(0,100,80),this.world.rect(-4,-4,8,8),this.world.fill(150,150,100),this.world.rect(this.to.x-4,this.to.y-4,8,8),this.world.fill(200,150,100),this.world.rect(this.anchor.x-4,this.anchor.y-4,8,8),this.world.rotate(this.to.heading()),this.world.stroke(0,0,0),this.world.line(0,0,this.axis.x,this.axis.y)),this.world.pop(),this},o.prototype.representation=function(){},i.drawable=o,s.exports=i},{"./some.core":3}],5:[function(t,s,e){"use strict";var i=t("./some.core");drawablesPool=function(t,s){this.world=t,this.drawables=[],this.drawablesFunctions=[],this.drawFunction=!1,this.index=-1,s=s||{},s.select,s.draw&&(this.drawFunction=s.draw)},drawablesPool.prototype.add=function(t,s,e){if(s=s||1,t instanceof i.drawable)for(;s--;)this.drawables[this.drawables.length]=t,this.drawablesFunctions[this.drawablesFunctions.length]=e||function(){};return this},drawablesPool.prototype.remove=function(t){return t>-1&&(this.drawables=this.drawables.splice(t,1),this.drawablesFunctions=this.drawablesFunctions.splice(t,1)),this},drawablesPool.prototype.clear=function(){return this.drawables=[],this.drawablesFunctions=[],this},drawablesPool.prototype.next=function(){return this.index+1!==this.drawables.length?(this.index++,!0):(this.index=-1,!1)},drawablesPool.prototype.get=function(){return{drawable:this.drawables[this.index],fn:this.drawFunction?this.drawFunction:this.drawablesFunctions[this.index]}},drawablesPool.prototype.reset=function(){return this.index=-1,this},i.drawablesPool=drawablesPool,s.exports=i},{"./some.core":3}],6:[function(t,s,e){"use strict";var i=t("./some.core"),o=function(t,s,e,i){return this.world=t,this.fromVerts=[],this.toVerts=[],this.index=-1,this.originVerts=[],this.originHeadings=[],this.width=s,this.count=e,i=i||{},this.horizontal=i.horizontal||1,this.vertical=i.vertical||1,this.generate(s,e,i.bend||0),this};o.prototype=Object.create(i.drawable.prototype),o.prototype.generate=function(t,s,e){this.fromVerts=[],this.toVerts=[],this.originVerts=[],this.originHeadings=[];for(var o=0;s>o;o++)this.fromVerts[o]=new i.vec2(this.horizontal*(o%t),this.vertical*Math.floor(o/t)),this.toVerts[o]=new i.vec2(1,0),this.originVerts[o]=this.fromVerts[o].copy(),this.originHeadings[o]=this.toVerts[o].heading(),this.toVerts[o].normalize(),1===e?this.toVerts[o].mult(-1):2===e&&(this.fromVerts[o+t]=this.fromVerts[o].copy(),this.toVerts[o+t]=this.toVerts[o].copy());return this},o.prototype.rotateVerts=function(t){t*=i.toRadians;for(var s=0,e=this.toVerts.length;e>s;s++)this.toVerts[s].rotate(this.originHeadings[s]+t-this.toVerts[s].heading());return this},o.prototype.moveVerts=function(t){for(var s,e=0,o=this.toVerts.length;o>e;e++)s=this.toVerts[e].heading()-Math.abs(t.heading()),t.rotate(s),this.fromVerts[e]=i.vec2.add(this.originVerts[e],t),t.rotate(-s);return this},o.prototype.setMargin=function(t,s,e){this.horizontal=t||this.horizontal,this.vertical=s||t||this.vertical,this.generate(this.width,this.count,e||0)},o.prototype.next=function(){return this.index+1!==this.fromVerts.length?this.index++:this.index=0,!0},o.prototype.get=function(){return{from:{x:this.fromVerts[this.index].x,y:this.fromVerts[this.index].y},to:{x:this.toVerts[this.index].x,y:this.toVerts[this.index].y}}},o.prototype.reset=function(){return this.index=-1,this},i.grid=o,s.exports=i},{"./some.core":3}],7:[function(t,s,e){"use strict";var i=t("./some.core"),o=function(t,s){return i.drawable.call(this,t),this.layout={next:function(){}},this.colorsPool={next:function(){}},this.drawablesPool={},s=s||{},"undefined"!=typeof s.layout&&(this.layout=s.layout),"undefined"!=typeof s.colorsPool&&(this.colorsPool=s.colorsPool),"undefined"!=typeof s.drawablesPool&&(this.drawablesPool=s.drawablesPool),this};o.prototype=Object.create(i.drawable.prototype),o.prototype.setDrawablesPool=function(t){return this.drawablesPool=t,this},o.prototype.setColorsPool=function(t){return this.colorsPool=t,this},o.prototype.setLayout=function(t){return this.layout=t,this},o.prototype.representation=function(){var t,s,e;for(this.layout.reset();this.drawablesPool.next();)t=this.drawablesPool.get(),this.layout.next()&&(e=this.layout.get(),t.drawable.setPosition(e.from.x,e.from.y),t.drawable.setSize(e.to.x,e.to.y)),this.colorsPool.next()&&(s=this.colorsPool.get(),s.fill?this.world.fill(s.fill):this.world.noFill(),s.stroke?this.world.stroke(s.stroke):this.world.noStroke()),t.fn(this.world,t.drawable)||t.drawable.draw()},i.group=o,s.exports=i},{"./some.core":3}],8:[function(t,s,e){"use strict";var i=t("./some.core"),o=function(){.5*(Math.sqrt(3)-1),(3-Math.sqrt(3))/6,(Math.sqrt(5)-1)/4,(5-Math.sqrt(5))/20;this.aPerm,this.iOctaves=1,this.fPersistence=.5,this.aOctFreq,this.aOctPers,this.fPersMax,this.random=new i.random;this.setPerm(),this.octFreqPers()};o.prototype.setPerm=function(){var t,s=[];for(t=0;256>t;t++)s[t]=Math.floor(256*this.random.uniform());for(this.aPerm=[],t=0;512>t;t++)this.aPerm[t]=s[255&t]},o.prototype.setSeed=function(t){this.random=new i.random(t)},o.prototype.octFreqPers=function(){var t,s;this.aOctFreq=[],this.aOctPers=[],this.fPersMax=0;for(var e=0;e<iOctaves;e++)t=Math.pow(2,e),s=Math.pow(fPersistence,e),this.fPersMax+=s,this.aOctFreq.push(t),this.aOctPers.push(s);this.fPersMax=1/this.fPersMax},o.prototype.noise=function(t,s,e,i){var o,r,n;n=0;for(var h=0;h<this.iOctaves;h++)switch(o=this.aOctFreq[h],r=this.aOctPers[h],arguments.length){case 4:n+=r*noise4d(o*t,o*s,o*e,o*i);break;case 3:n+=r*noise3d(o*t,o*s,o*e);break;default:n+=r*noise2d(o*t,o*s)}return.5*(n*this.fPersMax+1)},o.prototype.noiseDetail=function(t,s){this.iOctaves=t||this.iOctaves,this.fPersistence=s||this.fPersistence,this.octFreqPers()},o.prototype.toString=function(){return"[object noise "+this.iOctaves+" "+this.fPersistence+"]"},i.noise=o,s.exports=i},{"./some.core":3}],9:[function(t,s,e){"use strict";var i=t("./some.core"),o=function(t){this.s=new i.Array(256),this.i=0,this.j=0;for(var s=0;256>s;s++)this.s[s]=s;t&&this.mix(t)};o.getStringBytes=function(t){for(var s=[],e=0;e<t.length;e++){var i=t.charCodeAt(e),o=[];do o.push(255&i),i>>=8;while(i>0);s=s.concat(o.reverse())}return s},o.prototype._swap=function(t,s){var e=this.s[t];this.s[t]=this.s[s],this.s[s]=e},o.prototype.mix=function(t){for(var s=o.getStringBytes(t),e=0,i=0;i<this.s.length;i++)e+=this.s[i]+s[i%s.length],e%=256,this._swap(i,e)},o.prototype.next=function(){return this.i=(this.i+1)%256,this.j=(this.j+this.s[this.i])%256,this._swap(this.i,this.j),this.s[(this.s[this.i]+this.s[this.j])%256]};var r=function(t){"undefined"==typeof t?t=""+Math.random()+Date.now():"function"==typeof t?(this.uniform=t,this.nextByte=function(){return~~(256*this.uniform())},t=null):"[object String]"!==Object.prototype.toString.call(t)&&(t=JSON.stringify(t)),this._normal=null,t?this._state=new o(t):this._state=null};r.prototype.nextByte=function(){return this._state.next()},r.prototype.uniform=function(){for(var t=7,s=0,e=0;t>e;e++)s*=256,s+=this.nextByte();return s/(Math.pow(2,8*t)-1)},r.prototype.random=function(t,s){return"undefined"==typeof t?this.uniform():("undefined"==typeof s&&(s=t,t=0),t+Math.floor(this.uniform()*(s-t)))},r.prototype.normal=function(){if(null!==this._normal){var t=this._normal;return this._normal=null,t}var s=this.uniform()||Math.pow(2,-53),e=this.uniform();return this._normal=Math.sqrt(-2*Math.log(s))*Math.sin(2*Math.PI*e),Math.sqrt(-2*Math.log(s))*Math.cos(2*Math.PI*e)},r.prototype.exponential=function(){return-Math.log(this.uniform()||Math.pow(2,-53))},r.prototype.poisson=function(t){var s=Math.exp(-(t||1)),e=0,i=1;do e++,i*=this.uniform();while(i>s);return e-1},r.prototype.gamma=function(t){var s=(1>t?1+t:t)-1/3,e=1/Math.sqrt(9*s);do{do var i=this.normal(),o=Math.pow(e*i+1,3);while(0>=o);var r=this.uniform(),n=Math.pow(i,2)}while(r>=1-.0331*n*n&&Math.log(r)>=.5*n+s*(1-o+Math.log(o)));return 1>t?s*o*Math.exp(this.exponential()/-t):s*o},i.random=r,s.exports=i},{"./some.core":3}],10:[function(t,s,e){"use strict";var i=t("./some.core"),o=function(t,s,e){i.drawable.call(this,t),this.shape=[],this.c1=[],this.c2=[],this.shapeSize=s.length,e instanceof i.vec2?this.axis=e:this.axis=new i.vec2(e.shift(),e.shift()),this.size=this.axis.copy(),this.shapeSize=Math.floor(this.shapeSize/6),this.shape.push(new i.vec2(s.shift(),s.shift()));for(var o=0;o<this.shapeSize;o++)this.c1.push(new i.vec2(s.shift(),s.shift())),this.c2.push(new i.vec2(s.shift(),s.shift())),this.shape.push(new i.vec2(s.shift(),s.shift()));return this};o.prototype=Object.create(i.drawable.prototype),o.prototype.representation=function(){this.world.beginShape(),this.world.vertex(this.shape[0].x,this.shape[0].y);for(var t=0;t<this.shapeSize;t++)this.world.bezierVertex(this.c1[t].x,this.c1[t].y,this.c2[t].x,this.c2[t].y,this.shape[t+1].x,this.shape[t+1].y);this.world.endShape()},i.shape=o,s.exports=i},{"./some.core":3}],11:[function(t,s,e){"use strict";var i=t("./some.core");spine=function(t,s,e,i,o){return shape.call(this,t,s,e),this.drawables=[],this.fromVerts=[],this.toVerts=[],this.index=-1,this.originVerts=[],this.shapeLength=[],this.shapePoints=[],this.shapeTotalLength=0,this.init(),"undefined"!=typeof i&&this.generate(i,o||0),this},spine.prototype=Object.create(i.drawable.prototype),spine.prototype.init=function(t){var s,e,o,r,n,h;t=t||70;for(var a=0;a<this.shapeSize;a++){this.shapeLength[a]=0,this.shapePoints[a]={},this.shapePoints[a].t=[],this.shapePoints[a].s=[],s=1/(Math.floor(i.vec2.sub(this.shape[a+1],this.shape[a]).mag()/25*t)+1),r=this.shape[a].x,n=this.shape[a].y;for(var c=0;1>=c;c+=s)e=this.world.bezierPoint(this.shape[a].x,this.c1[a].x,this.c2[a].x,this.shape[a+1].x,c),o=this.world.bezierPoint(this.shape[a].y,this.c1[a].y,this.c2[a].y,this.shape[a+1].y,c),h=Math.sqrt((e-r)*(e-r)+(o-n)*(o-n)),this.shapeLength[a]+=h,this.shapePoints[a].s.push(this.shapeLength[a]),this.shapePoints[a].t.push(c),r=e,n=o;this.shapeTotalLength+=this.shapeLength[a]}return this},spine.prototype._findClosestT=function(t,s){var e,i,o,r=this.shapePoints[t];if(r.s[0]>=s)return r.t[0];for(e=0,i=r.s.length;i>e;e++)if(r.s[e]>s){if(r.s[e]-s>s-r.s[e-1]){o=r.t[e-1];break}o=r.t[e];break}return e===i?r.t[e-1]:o},spine.prototype.generate=function(t,s){var e,o,r=0,n=.001,h=0,a=this.shapeTotalLength/t;this.fromVerts=[],this.toVerts=[],this.originVerts=[],this.originHeadings=[];for(var c=0;t>c;c++,n+=a)n-r>this.shapeLength[h]&&(r+=this.shapeLength[h],h++,h===this.shapeSize&&(h=0)),o=n-r,e=this._findClosestT(h,o),this.fromVerts[c]=new i.vec2(this.world.bezierPoint(this.shape[h].x,this.c1[h].x,this.c2[h].x,this.shape[h+1].x,e),this.world.bezierPoint(this.shape[h].y,this.c1[h].y,this.c2[h].y,this.shape[h+1].y,e)),this.toVerts[c]=new i.vec2(this.world.bezierTangent(this.shape[h].x,this.c1[h].x,this.c2[h].x,this.shape[h+1].x,e),this.world.bezierTangent(this.shape[h].y,this.c1[h].y,this.c2[h].y,this.shape[h+1].y,e)),this.originVerts[c]=this.fromVerts[c].copy(),this.originHeadings[c]=this.toVerts[c].heading(),this.toVerts[c].mag()>0&&this.toVerts[c].normalize(),1===s?this.toVerts[c].mult(-1):2===s&&(this.fromVerts[c+t]=this.fromVerts[c].copy(),this.toVerts[c+t]=this.toVerts[c].copy());return this},spine.prototype.rotateVerts=function(t){t=this.world.radians(t);for(var s=0,e=this.toVerts.length;e>s;s++)this.toVerts[s].rotate(this.originHeadings[s]+t-this.toVerts[s].heading());return this},spine.prototype.moveVerts=function(t){for(var s,e=0,o=this.toVerts.length;o>e;e++)s=this.toVerts[e].heading()-Math.abs(t.heading()),t.rotate(s),this.fromVerts[e]=i.vec2.add(this.originVerts[e],t),t.rotate(-s);return this},spine.prototype.next=function(){return this.index+1!==this.fromVerts.length?this.index++:this.index=0,!0},spine.prototype.get=function(){return{from:{x:this.fromVerts[this.index].x,y:this.fromVerts[this.index].y},to:{x:this.toVerts[this.index].x,y:this.toVerts[this.index].y}}},spine.prototype.reset=function(){return this.index=-1,this},i.spine=spine,s.exports=i},{"./some.core":3}],12:[function(t,s,e){"use strict";var i=t("./some.core"),o=function(t,s){return this.x=t,this.y=s,this};o.create=function(t,s){var e=new i.Array(2);return e[0]=t||0,e[1]=s||0,e},o.prototype.clone=function(){return new o(this.x,this.y)},o.clone=function(t){var s=new i.Array(2);return s[0]=t[0],s[1]=t[1],s},o.prototype.copy=function(t){return this.x=t.x,this.y=t.y,this},o.copy=function(t,s){s[0]=t[0],s[1]=t[1]},o.prototype.set=function(t,s){return this.x=t||0,this.y=s||0,this},o.set=function(t,s,e){e[0]=t,e[1]=s},o.prototype.len=function(){var t=this.x,s=this.y;return Math.sqrt(t*t+s*s)},o.len=function(t){var s=t[0],e=t[1];return Math.sqrt(s*s+e*e)},o.prototype.setLen=function(t){return this.normalize().mult(t)},o.setLen=function(t,s,e){o.normalize(t,e),o.scale(e,s,e)},o.prototype.normalize=function(){var t=this.len();return t>0&&(t=1/t,this.x*=t,this.y*=t),this},o.normalize=function(t,s){var e=o.len(t);e>0&&(e=1/e,s[0]=t[0]*e,s[1]=t[1]*e)},o.prototype.add=function(t){return this.x+=t.x,this.y+=t.y,this},o.add=function(t,s,e){e[0]=t[0]+s[0],e[1]=t[1]+s[1]},o.prototype.subtract=function(t){return this.x-=t.x,this.y-=t.y,this},o.subtract=function(t,s,e){e[0]=t[0]-s[0],e[1]=t[1]-s[1]},o.prototype.sub=o.prototype.subtract,o.sub=o.subtract,o.prototype.scale=function(t){return this.x*=t,this.y*=t,this},o.scale=function(t,s,e){e[0]=t[0]*s,e[1]=t[1]*s},o.prototype.mult=o.prototype.scale,o.mult=o.scale,o.prototype.min=function(t,s){var e=Math.min(t.x,s.x),i=Math.min(t.y,s.y);return new o(e,i)},o.min=function(t,s,e){e[0]=Math.min(t[0],s[0]),e[1]=Math.min(t[1],s[1])},o.prototype.max=function(t,s){var e=Math.max(t.x,s.x),i=Math.max(t.y,s.y);return new o(e,i)},o.max=function(t,s,e){e[0]=Math.max(t[0],s[0]),e[1]=Math.max(t[1],s[1])},o.prototype.distance=function(t){var s=t.x-this.x,e=t.y-this.y;return Math.sqrt(s*s+e*e)},o.distance=function(t,s){var e=s[0]-t[0],i=s[1]-t[1];return Math.sqrt(e*e+i*i)},o.prototype.dist=o.prototype.distance,o.dist=o.distance,o.prototype.negate=function(){return this.x=-this.x,this.y=-this.y,this},o.negate=function(t,s){s[0]=-t[0],s[1]=-t[1]},o.prototype.inverse=function(){return this.x=1/this.x,this.y=1/this.y,this},o.inverse=function(t,s){s[0]=1/t[0],s[1]=1/t[1]},o.prototype.dot=function(t){return this.x*t.x+this.y*t.y},o.dot=function(t,s){return t[0]*s[0]+t[1]*s[1]},o.prototype.heading=function(){return Math.atan2(this.x,this.y)},o.heading=function(t){return Math.atan2(t[0],t[1])},o.prototype.rotate=function(t){var s=this.heading()+t,e=this.len();return this.x=Math.cos(s)*e,this.y=Math.sin(s)*e,this},o.rotate=function(t,s,e){var i=o.heading(t)+s,r=o.len(t);return e[0]=Math.cos(i)*r,e[1]=Math.sin(i)*r,this},o.prototype.lerp=function(t,s){var e=this.x,i=this.y;return e+=s*(t.x-e),i+=s*(t.y-i),new o(e,i)},o.lerp=function(t,s,e,i){var o=t[0],r=t[1];return i[0]=o+e*(s[0]-o),i[1]=r+e*(s[1]-r),i},i.vec2=o,s.exports=i},{"./some.core":3}]},{},[1]);