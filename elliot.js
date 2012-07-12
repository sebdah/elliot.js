function Elliot (canvas_id, config) {
	// Canvas and context
	this.canvas = document.getElementById(canvas_id);
	this.context = this.canvas.getContext('2d');

	// Bar data array
	this.barData = [{'title': '', 'value': this.canvas.height}];

	// Logging functions
	this.logDebug = function (message) { console.log('DEBUG - ' + message); };
	this.logError = function (message) { console.log('ERROR - ' + message); };
	this.logInfo = function (message) { console.log('INFO - ' + message); };
	this.logWarning = function (message) { console.log('WARN - ' + message); };

	// Draw the background color
	this.drawBackground = function () {
		this.context.fillStyle = config['general']['background'];
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
	};

	this.addBarGraphData = function (barData) {
		this.barData = barData;
	};

	this.drawBarGraph = function () {
		this.logInfo('Drawing bar graph');

		// Fill the background
		this.context.save();
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.drawBackground();
		this.context.restore();

		// TODO - Calculate spacing
		// TODO - Calculate bar width
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
	};

	// Check that the user has defined width and height on the canvas
	if (isNaN(this.canvas.width) || isNaN(this.canvas.height))
		this.logError('You must set both width and height on your canvas');
	else
		this.logDebug('Canvas dimensions set to ' + this.canvas.width + 'x' + this.canvas.height);

	// Add data to the graph
	this.dataInterval = setInterval((function (self) {
		return function () {
			barData = [
				{'title': 'Apple', 'value': Math.floor((Math.random()*500)+1)},
				{'title': 'Pear', 'value': Math.floor((Math.random()*500)+1)},
				{'title': 'Strawberries', 'value': Math.floor((Math.random()*500)+1)},
				{'title': 'Melon', 'value': Math.floor((Math.random()*500)+1)},
				{'title': 'Dragon fruit', 'value': Math.floor((Math.random()*500)+1)},
				{'title': 'Papaya', 'value': Math.floor((Math.random()*500)+1)}
				];
			self.addBarGraphData(barData);
		};
	})(this), 1000);

	// Update the graph continously
	this.drawInterval = setInterval((function (self) {
		return function () {
			self.drawBarGraph();
		};
	})(this), 50);
}
