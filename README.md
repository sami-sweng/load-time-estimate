# load-time-estimate
Provides a simple blackbox mean of estimating algorithms / IO / functions time to completion.
The goal is to report an accurate estimation of the remaining time to the end user.

## Setup

### Install

```bash
npm install load-time-estimate
```

### First run setup
During the first run the library will need to learn roughly how the time is distributed between the various steps of the algorithm.

```js
var Lte = require("load-time-estimate");
var lte = new Lte("estimate");

/*
 * Run the algorithm once to produce estimates
 */

var estimatedTimeDistribution = lte.produceSettings();
//  then you need to save this object somewhere,
//  as it will be required in production mode to make the estimations
```

### Production setup
In the production setup the library will be able to give estimate of the time remaining (even between steps).

```js
var Lte = require("load-time-estimate");
// pass the object saved previously to the constructor
var lte = new Lte(estimatedTimeDistribution);

setInterval(() => {
    // get an estimation of the remaining time in human readable format
    lte.getRemainingTimeEstimate()

    // get an estimation of the number of ms remaining
    lte.getRemainingMsEstimate()

    // get an estimation of the percentage of the task accomplished
    lte.getPcEstimate()
}, 500);

```

---

## Add the steps in the algorithm

### Add a fixed step
```js
lte.addStep();
```

### Add variable number of iteration loop
If the amount of work to do is roughly consistent during the loop it will help the library
make more accurate estimations during the loop. If not, just add a fixed step at the beginning and the end of the loop.
```js
lte.addLoop(numberOfIterations);

for (var i = 0; i < numberOfIterations; i++) {
    lte.addLoopIteration();
    /*
     * loop iternals
     */
}
```

---

## Options

### Ever increasing
If no progress are made, it is possible that the estimated time to completion increases.
By default the reported estimated percent will not reduce and the estimated time will not increase.
Unless this option is set to `false`.
```js
lte.everIncreasing = false; // (defaults to true)
```
