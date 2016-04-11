var Lte = require("../lib/index.js");
var lte = new Lte("estimate");

lte.addLoop(10000);

var num = 0;
for (var i = 0; i < 10000; i++) {
    lte.addLoopIteration();
    num += Math.random();
}

lte.addStep();

var next = function(i, cb) {
    if (i > 0) {
        setTimeout(function() {
            lte.addStep();
            next(i - 1, cb);
        }, 500);
    } else {
        cb();
    }
}

next(100, function() {
    lte.addStep();
    console.log(lte.produceSettings());
})
