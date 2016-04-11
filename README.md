# load-time-estimate
Provide a simple blackbox mean of estimating algorithms/loading/function time to completion

##Setup

###Install

`npm install load-time-estimate`

### First run setup
```
var Lte = require("../lib/index.js");
var lte = new Lte("estimate");

/*
    Run the algorithm once to produce estimates
*/

var settings = lte.produceSettings();
```

###Production setup
```
var Lte = require("../lib/index.js");
var lte = new Lte(settings);
```

##Usage

###Add fixed step
`lte.addStep();`

###Add variable number of iteration loop
```
lte.addLoop(numberOfIterations);

for (var i = 0; i < numberOfIterations; i++) {
    lte.addLoopIteration();
    /*
    loop iternals
    */
}
```

##Get estimates

###Get human readble estimate

`lte.getRemainingTimeEstimate()`

###Get ms estimate

`lte.getRemainingMsEstimate()`

###Get pc (0-1) estimate

`lte.getPcEstimate()`
