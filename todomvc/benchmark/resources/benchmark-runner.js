// FIXME: Use the real promise if available.
// FIXME: Make sure this interface is compatible with the real Promise.
function SimplePromise() {
    this._chainedPromise = null;
    this._callback = null;
}

SimplePromise.prototype.then = function (callback) {
    if (this._callback)
        throw "SimplePromise doesn't support multiple calls to then";
    this._callback = callback;
    this._chainedPromise = new SimplePromise;
    
    if (this._resolved)
        this.resolve(this._resolvedValue);

    return this._chainedPromise;
}

SimplePromise.prototype.resolve = function (value) {
    if (!this._callback) {
        this._resolved = true;
        this._resolvedValue = value;
        return;
    }

    var result = this._callback(value);
    if (result instanceof SimplePromise) {
        var chainedPromise = this._chainedPromise;
        result.then(function (result) { chainedPromise.resolve(result); });
    } else
        this._chainedPromise.resolve(result);
}

function BenchmarkTestStep(testName, testFunction) {
    this.name = testName;
    this.run = testFunction;
}

function BenchmarkRunner(suites, client) {
    this._suites = suites;
    this._prepareReturnValue = null;
    this._measuredValues = {};
    this._client = client;
}

BenchmarkRunner.prototype.waitForElement = function (selector) {
    var promise = new SimplePromise;
    var contentDocument = this._frame.contentDocument;

    function resolveIfReady() {
        var element = contentDocument.querySelector(selector);
        if (element)
            return promise.resolve(element);
        setTimeout(resolveIfReady, 50);
    }

    resolveIfReady();
    return promise;
}

BenchmarkRunner.prototype._removeFrame = function () {
    if (this._frame) {
        this._frame.parentNode.removeChild(this._frame);
        this._frame = null;
    }
}

BenchmarkRunner.prototype._appendFrame = function (src) {
    var frame = document.createElement('iframe');
    frame.style.width = '800px';
    frame.style.height = '600px'
    document.body.appendChild(frame);
    this._frame = frame;
    return frame;
}

BenchmarkRunner.prototype._waitAndWarmUp = function () {
    var startTime = Date.now();

    function Fibonacci(n) {
        if (Date.now() - startTime > 100)
            return;
        if (n <= 0)
            return 0;
        else if (n == 1)
            return 1;
        return Fibonacci(n - 2) + Fibonacci(n - 1);
    }

    var promise = new SimplePromise;
    setTimeout(function () {
        Fibonacci(100);
        promise.resolve();
    }, 200);
    return promise;
}

// This function ought be as simple as possible. Don't even use SimplePromise.
BenchmarkRunner.prototype._runTest = function(suite, test, prepareReturnValue, callback)
{
	var testFunction = test.run
    var now = window.performance && window.performance.now ? function () { return window.performance.now(); } : Date.now;

    var contentWindow = this._frame.contentWindow;
    var contentDocument = this._frame.contentDocument;

    var startTime = now();
    testFunction(prepareReturnValue, contentWindow, contentDocument);
    var endTime = now();
    var syncTime = endTime - startTime;

    var startTime = now();
    setTimeout(function () {
        setTimeout(function () {
            var endTime = now();
			
			//if the DOM count is wrong after a test, don't report its results
			//numberOfItemsToAdd is a global from test.js
			if (test.name.indexOf("Adding") > -1 || test.name.indexOf("Completing") > -1) {
				var count = contentDocument.querySelectorAll(".view").length
				if (count != numberOfItemsToAdd) {
					console.error([suite.name, test.name, "expected", numberOfItemsToAdd, "got", count])
					syncTime = startTime = endTime = NaN
				}
			}
			if (test.name.indexOf("Deleting") > -1) {
				var count = contentDocument.querySelectorAll(".view").length
				if (count != 0) {
					console.error([suite.name, test.name, "expected", 0, "got", count])
					syncTime = startTime = endTime = NaN
				}
			}
			
            callback(syncTime, endTime - startTime);
        }, 0)
    }, 0);
}

function BenchmarkState(suites) {
    this._suites = suites;
    this._suiteIndex = -1;
    this._testIndex = 0;
    this.next();
}

BenchmarkState.prototype.currentSuite = function() {
    return this._suites[this._suiteIndex];
}

BenchmarkState.prototype.currentTest = function () {
    var suite = this.currentSuite();
    return suite ? suite.tests[this._testIndex] : null;
}

BenchmarkState.prototype.next = function () {
    this._testIndex++;

    var suite = this._suites[this._suiteIndex];
    if (suite && this._testIndex < suite.tests.length)
        return this;

    this._testIndex = 0;
    do {
        this._suiteIndex++;
    } while (this._suiteIndex < this._suites.length && this._suites[this._suiteIndex].disabled);

    return this;
}

BenchmarkState.prototype.isFirstTest = function () {
    return !this._testIndex;
}

BenchmarkState.prototype.prepareCurrentSuite = function (runner, frame) {
    var suite = this.currentSuite();
    var promise = new SimplePromise;
    frame.onload = function () {
        suite.prepare(runner, frame.contentWindow, frame.contentDocument).then(function (result) { promise.resolve(result); });
    }
    frame.src = suite.url;
    return promise;
}

BenchmarkRunner.prototype.step = function (state) {
    if (!state)
        state = new BenchmarkState(this._suites);

    var suite = state.currentSuite();
    if (!suite) {
        this._finalize();
        var promise = new SimplePromise;
        promise.resolve();
        return promise;
    }

    if (state.isFirstTest()) {
        this._masuredValuesForCurrentSuite = {};
        var self = this;
        return state.prepareCurrentSuite(this, this._appendFrame()).then(function (prepareReturnValue) {
            self._prepareReturnValue = prepareReturnValue;
            return self._runTestAndRecordResults(state);
        });
    }

    return this._runTestAndRecordResults(state);
}

BenchmarkRunner.prototype._runTestAndRecordResults = function (state) {
    var promise = new SimplePromise;
    var suite = state.currentSuite();
    var test = state.currentTest();

    if (this._client && this._client.willRunTest)
        this._client.willRunTest(suite, test);

    var self = this;
    setTimeout(function () {
        self._runTest(suite, test, self._prepareReturnValue, function (syncTime, asyncTime) {
            var suiteResults = self._measuredValues[suite.name] || {tests:{}, total: 0};
            self._measuredValues[suite.name] = suiteResults;
            suiteResults.tests[test.name] = {'Sync': syncTime, 'Async': asyncTime};
            suiteResults.total += syncTime + asyncTime;

            if (self._client && self._client.willRunTest)
                self._client.didRunTest(suite, test);

            state.next();
            if (state.currentSuite() != suite)
                self._removeFrame();
            promise.resolve(state);
        });
    }, 0);
    return promise;
}

BenchmarkRunner.prototype._finalize = function () {
    this._removeFrame();

    if (this._client && this._client.didRunSuites)
        this._client.didRunSuites(this._measuredValues);

    // FIXME: This should be done when we start running tests.
    this._measuredValues = {};
}
