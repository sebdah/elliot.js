/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;

  // The base Class implementation (does nothing)
  this.Class = function(){};
 
  // Create a new Class that inherits from this class
  Class.extend = function(prop) {
    var _super = this.prototype;
   
    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;
   
    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" &&
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;
           
            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];
           
            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);
            this._super = tmp;
           
            return ret;
          };
        })(name, prop[name]):
        prop[name];
    }
   
    // The dummy class constructor
    function Class() {
      // All construction is actually done in the init method
      if ( !initializing && this.init )
        this.init.apply(this, arguments);
    }
   
    // Populate our constructed prototype object
    Class.prototype = prototype;
   
    // Enforce the constructor to be what we expect
    Class.prototype.constructor = Class;

    // And make this class extendable
    Class.extend = arguments.callee;
   
    return Class;
  };
})("Class");

/*
 * Elliot graphing library implementation
 *
 */
var Elliot = Class.extend({
	init: function (canvas_id, config) {
		// Canvas and context
		this.canvas = document.getElementById(canvas_id);
		this.context = this.canvas.getContext('2d');

		// Config object
		this.config = config;

		// Check that the user has defined width and height on the canvas
		if (isNaN(this.canvas.width) || isNaN(this.canvas.height)) {
			this.logError('You must set both width and height on your canvas');
		} else {
			// Height and width
			this.graphWidth = this.canvas.width;
			this.graphHeight = this.canvas.height;
			this.logDebug('Canvas dimensions set to ' + this.graphWidth + 'x' + this.graphHeight);
		}
	},
	logDebug: function (message) { console.log('DEBUG - ' + message); },
	logError: function (message) { console.log('ERROR - ' + message); },
	logInfo: function (message) { console.log('INFO - ' + message); },
	logWarning: function (message) { console.log('WARN - ' + message); },
	drawBackground: function () {
		this.context.fillStyle = this.config['general']['background'];
		this.context.fillRect(0, 0, this.graphWidth, this.graphHeight);
	}
});

var ElliotMovingBarGraph = Elliot.extend({
	init: function (canvas_id, config) {
		// Add config to the super class
		this._super(canvas_id, config);

		// Bar graph settings
		this.barWidth = 5;
		this.barSpacing = 5;
		
		// Updated barData
		this.updatedBarData = [];
		this.nextValue = 0;

		// Distinguish the first iteration
		this.first = true;

		// Incremental values
		if (typeof(this.config['barGraph']['incrementalValues']) === 'undefined') {
			this.incrementalValues = false;
		} else {
			this.incrementalValues = this.config['barGraph']['incrementalValues'];
		}

		// Offset for bar marker counting
		this.offset = 0;

		// Update frequency
		if (typeof(this.config['barGraph']['updateFrequency']) === 'undefined') {
			this.updateFrequency = 500;
		} else {
			this.updateFrequency = this.config['barGraph']['updateFrequency'];
		}

		// Update the graph continously
		this.drawBarGraph();
		this.drawInterval = setInterval((function (self) {
			return function () {
				self.drawBarGraph();
			};
		})(this), this.updateFrequency);
	},
	add: function (count) {
		if (typeof(count) === 'undefined') {
			this.nextValue += 1;
		} else {
			this.nextValue += count;
		}
	},
	drawBarGraph: function () {
		// Calculate how many bars we have
		var numBars = this.graphWidth / (this.barSpacing + this.barWidth);

		// Add the last data point to the data list
		if (!this.first) {
			this.updatedBarData.splice(0, 1);
			this.updatedBarData.push(this.nextValue);
			if (!this.incrementalValues) {
				this.nextValue = 0;
			}
		} else {
			this.first = false;
		}

		// Update the incoming data to match the graph
		if (this.updatedBarData.length > numBars + 1) {
			while (this.updatedBarData.length > numBars) {
				this.updatedBarData.splice(0, 1);
			}
		} else if (this.updatedBarData.length <= numBars) {
			while (this.updatedBarData.length <= numBars) {
				this.updatedBarData.push(0); // Add 0 to the data
			}
		}

		// Fill the background
		this.context.save();
		this.context.clearRect(0, 0, this.graphWidth, this.graphHeight);
		this.drawBackground();
		this.context.restore();

		// Add a header
		this.context.save();
		this.context.font = 'bold ' + this.config['general']['titleFontSize'] + ' pt calibri';
		this.context.fillStyle = "#ffffff";
		this.context.fillText(
			this.config['general']['title'],
			(this.graphWidth - this.config['general']['title'].length * 4) / 2,
			this.config['general']['titleFontSize']);
		this.context.restore();

		// Calculate spacing and bar width
		this.context.save();
		var currentBar = numBars;
		var i = 0;
		for (var x = 0; x < this.graphWidth - this.barSpacing; x += this.barSpacing + this.barWidth) {
			// Draw the rectangle
			if (currentBar % this.config['barGraph']['markerPosition'] - this.offset === 0) {
				this.context.fillStyle = this.config['barGraph']['markerColor'];
			} else {
				this.context.fillStyle = this.config['barGraph']['barBackgroundColor'];
			}

			this.context.fillRect(
				x + this.barSpacing, 
				this.config['general']['titleFontSize'] + (this.config['general']['titleFontSize'] * 0.5), // Increase the title bar height slightly
				this.barWidth, 
				this.graphHeight);

			// Add bottom line
			this.context.fillStyle = this.config['barGraph']['barColor'];
			this.context.fillRect(
				x + this.barSpacing,
				this.graphHeight - 1,
				this.barWidth,
				this.graphHeight);

			// Add data rect
			this.context.fillStyle = this.config['barGraph']['barColor'];
			this.context.fillRect(
				x + this.barSpacing, 
				this.graphHeight - this.updatedBarData[i], 
				this.barWidth, 
				this.graphHeight);

			// Back one bar every time
			currentBar--;
			i++;
		}
		this.context.restore();

		// Update the offset
		if (this.offset < this.config['barGraph']['markerPosition'] - 1) {
			this.offset++;
		} else {
			this.offset = 0;
		}
	},
	remove: function (count) {
		if (typeof(count) === 'undefined') {
			this.nextValue -= 1;
		} else {
			this.nextValue -= count;
		}
	},
});
