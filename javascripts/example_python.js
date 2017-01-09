var PythonShell = require('python-shell');

var Python = function () {

	var that = Object.create(Python.prototype);

	var options = {
		mode: 'json',
		scriptPath: './scheduler/',
		args: [JSON.stringify({'A': [1, 2, "Bingo"]}), 'hello world!', 3]
	}

	that.helloWorld = function () {
		PythonShell.run('helloWorld.py', options, function (err, results) {
		  if (err) {
		  	throw err;
		  }
		  // results is an array consisting of messages collected during execution
		  console.log('results:', typeof results, results);
		});
	}

	Object.freeze(that);
	return that;
};

module.exports = Python();

// https://docs.python.org/3/library/argparse.html#type