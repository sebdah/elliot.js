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

		// Check that the user has defined width and height on the canvas
		if (isNaN(this.canvas.width) || isNaN(this.canvas.height))
			this.logError('You must set both width and height on your canvas');
		else
			this.logDebug('Canvas dimensions set to ' + this.canvas.width + 'x' + this.canvas.height);
	},
	logDebug: function (message) { console.log('DEBUG - ' + message); },
	logError: function (message) { console.log('ERROR - ' + message); },
	logInfo: function (message) { console.log('INFO - ' + message); },
	logWarning: function (message) { console.log('WARN - ' + message); },
	drawBackground: function () {
		this.context.fillStyle = config['general']['background'];
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
	}
});

var ElliotBarGraph = Elliot.extend({
	init: function (canvas_id, config) {
		this._super(canvas_id, config);

		// Bar data array
		this.barData = [{'title': '', 'value': this.canvas.height}];

		// Update the graph continously
		this.drawInterval = setInterval((function (self) {
			return function () {
				self.drawBarGraph();
			};
		})(this), 1000);
	},
	addBarGraphData: function (barData) {
		this.barData = barData;
	},
	drawBarGraph: function () {
		this.logInfo('Drawing bar graph');

		// Fill the background
		this.context.save();
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.drawBackground();
		this.context.restore();

		// Calculate spacing and bar width
		var bar_width = (this.canvas.width / this.barData.length) * 0.4;
		var bar_spacing = (this.canvas.width / this.barData.length) * 0.5;
		this.context.save();
		var last_x = 0;
		for (var i = 0 ; i < this.barData.length; i++) {
			// Calculate x and y coordinates
			var from_x = last_x + bar_spacing;
			var from_y = this.canvas.height;

			// Update last x position
			last_x = from_x + bar_width;

			// Draw the rectangle
			this.context.fillStyle = config['general']['graphColors'][i % config['general']['graphColors'].length];
			this.context.fillRect(from_x, from_y, bar_width, -(this.canvas.height - this.barData[i]['value']));
		}
		this.context.restore();
	}
});

var ElliotMovingBarGraph = Elliot.extend({
	init: function (canvas_id, config) {
		// Add config to the super class
		this._super(canvas_id, config);
		
		// Updated barData
		this.updatedBarData = [];

		// Offset for bar marker counting
		this.offset = 0;

		// Update the graph continously
		this.drawInterval = setInterval((function (self) {
			return function () {
				self.drawBarGraph();
			};
		})(this), 500);
	},
	drawBarGraph: function () {
		this.logInfo('Updating moving bar graph');

		// Calculate how many bars we have
		var barWidth = 5;
		var barSpacing = 5;
		var numBars = this.canvas.width / (barSpacing + barWidth);

		// Update the incoming data to match the graph
		if (this.updatedBarData.length === 0) {
			for (var i = 0; i < numBars; i++) {
				this.updatedBarData.unshift(0); // Add 0 to the data
			}
		} else if (this.updatedBarData.length > 0 && this.updatedBarData.length < numBars) {
			for (var i = 0; i < numBars - updatedBarData.length; i++) {
				this.updatedBarData.unshift(0); // Add 0 to the data
			}
		} else if (this.updatedBarData.length > numBars) {
			for (var i = 0; i < this.updatedBarData.length - numBars; i++) {
				this.updatedBarData.shift();
			}
		}

		// Fill the background
		this.context.save();
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.drawBackground();
		this.context.restore();

		// Calculate spacing and bar width
		this.context.save();
		var currentBar = numBars;
		for (var x = 0; x < this.canvas.width - barSpacing; x += barSpacing + barWidth) {
			// Draw the rectangle
			if (currentBar % config['barGraph']['markerPosition'] - this.offset === 0) {
				this.context.fillStyle = "#777777";
			} else {
				this.context.fillStyle = "#555555";
			}
			this.context.fillRect(x + barSpacing, 0, barWidth, this.canvas.height);

			// Add bottom line
			this.context.fillStyle = "#4BFFFF";
			this.context.fillRect(x + barSpacing, this.canvas.height - 1, barWidth, this.canvas.height);

			// Add data rect
			//this.context.fillStyle = "#4BFFFF";
			//this.context.fillRect(x + barSpacing, this.canvas.height - this.updatedBarData[currentBar], barWidth, this.canvas.height);

			// Back one bar every time
			currentBar--;
		}
		this.context.restore();

		// Update the offset
		if (this.offset < config['barGraph']['markerPosition'] - 1) {
			this.offset++;
		} else {
			this.offset = 0;
		}
	}
});
