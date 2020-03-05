let localAllSelectedNumbers = [];

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function calculateThread(initialNumber, lastNumber, iterations, threadIndex, isWorker) {
    for (let i = initialNumber; i <= lastNumber; i++) {
        localAllSelectedNumbers[i] = 0;
    }

    for (let i = 0; i < iterations; i++) {
        localAllSelectedNumbers[getRandomInt(initialNumber, lastNumber)]++;
    }

    if (!isWorker) {
        threadFinished[threadIndex] = true;
        checkAllFinished();
    }
}

onmessage = function(e) {
    var arr = e.data;
    calculateThread(arr[0], arr[1], arr[2], arr[3], true);

    var result = [arr[3], localAllSelectedNumbers];
    postMessage(result);
}
