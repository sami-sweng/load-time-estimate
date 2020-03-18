var moment = require("moment");
require('moment-precise-range-plugin');

module.exports = function(settings) {
    var timeline = [];
    var planned = [];

    var lastTimePer100Percent = settings.avgTimePer100Percent || Number.MAX_VALUE;
    var convergenceRate = 0.6;

    var lastEstimatedPc = 0;

    if (settings != "estimate") {
        planned = settings.planned;
    }

    this.everIncreasing = true;

    this.addStep = function() {
        var now = Date.now();
        timeline.push({
            type: "step",
            time: now
        });

        if (settings != "estimate") {
            if (timeline.length > 1) {
                var lastItem = timeline.length - 1;
                var ratioDiff = planned[lastItem] - planned[lastItem - 1];

                var previousStepStartTime = timeline[lastItem - 1].time;
                lastStepDuration = now - previousStepStartTime;

                var newLastTimePer100Percent = lastStepDuration / ratioDiff;

                lastTimePer100Percent = lastTimePer100Percent * (1 - convergenceRate) + newLastTimePer100Percent * convergenceRate;
            }
        }
    }

    this.addLoop = function(numberOfIterations) {
        timeline.push({
            type: "loop",
            time: Date.now(),
            numberOfIterations: numberOfIterations,
            done: 0
        });
    }

    this.addLoopIteration = function() {
        var lastItem = timeline[timeline.length - 1];
        lastItem.done++;
    }

    var getPc_ = function() {
        var lastItem = timeline.length - 1;
        if (lastItem < 0) lastItem = 0;
        return planned[lastItem];
    }
    this.getPc = getPc_;

    var getPcEstimate_ = function() {
        var lastItem = timeline.length - 1;
        if (lastItem < 0) return 0;
        if (lastItem >= planned.length - 1) return 1;

        var ratioDiff = planned[lastItem + 1] - planned[lastItem];
        if (ratioDiff == 0) ratioDiff = Number.MIN_VALUE;

        let newEstimatedPc;

        if (timeline[lastItem].type == "step") {
            var thisStepDurationEstimation = ratioDiff * lastTimePer100Percent;

            var now = Date.now();
            var thisStepDuration = now - timeline[timeline.length - 1].time;

            newEstimatedPc = Math.min(1, planned[lastItem] + (thisStepDuration / thisStepDurationEstimation) * ratioDiff);
        } else {
            var loopRatio = timeline[lastItem].done / timeline[lastItem].numberOfIterations;
            newEstimatedPc = Math.min(1, planned[lastItem] + loopRatio * ratioDiff);
        }
        if (newEstimatedPc < lastEstimatedPc && this.everIncreasing) {
            newEstimatedPc = lastEstimatedPc;
        }
        lastEstimatedPc = newEstimatedPc;
        return newEstimatedPc;
    }

    this.getPcEstimate = getPcEstimate_;

    var getRemainingMsEstimate_ = function() {
        var remainingPc = 1 - getPcEstimate_();
        return remainingPc * lastTimePer100Percent;
    }
    this.getRemainingMsEstimate = getRemainingMsEstimate_;

    var getRemainingMs_ = function() {
        var remainingPc = 1 - getPc_();
        return remainingPc * lastTimePer100Percent;
    }
    this.getRemainingMs = getRemainingMs_;

    this.getRemainingTimeEstimate = function() {
        var ms = getRemainingMsEstimate_();
        return moment.preciseDiff(0, ms)
    }

    this.getRemainingTime = function() {
        var ms = getRemainingMs_();
        return moment.preciseDiff(0, ms)
    }

    this.produceSettings = function() {
        planned = [];

        var startTime = timeline[0].time;
        var totalDuration = timeline[timeline.length - 1].time - startTime;

        for (var i = 0; i < timeline.length; i++) {
            var thisDuration = timeline[i].time - startTime;
            var thisRatio = thisDuration / totalDuration;
            planned.push(thisRatio);
        }

        // remove too flat zones
        planned = planned.map((n, i) => {
            n = 0.99 * n + 0.01 * (i / (planned.length - 1))
            n = Math.min(n, 1);
            n = Math.max(n, 0);
            return n
        }).sort()

        return {
            planned: planned,
            avgTimePer100Percent: totalDuration / 100
        };
    }
}
