let configs = {
    calcButton: "#button_calc",
    formData: "#form_tests_data",
	averageResult: "#results_average",
	medianResult: "#results_median",
	modeResult: "#results_mode",
	varianceResult: "#results_variance",
	deviationResult: "#results_deviation",
	allResults: "#results_all",
	elapsedTime: "#elapsed_time",
    firstNumber: "input_first_number",
    lastNumber: "input_last_number",
    numbersCount: "input_numbers_count",
    threads: "input_threads"
};

let $calButton;
let $formData;
let $evenResults;
let $oddResults;
let $allResults;
let $elapsedTime;

let allSelectedNumbers;
let threadFinished;
let threadsCount;
let totalNumbersCount;
let startTime;

function calculate(initialNumber, lastNumber, numbersCount, threads) {
	allSelectedNumbers = {};
	threadFinished = [];
	totalNumbersCount = numbersCount;
	threadsCount = threads;

	for (let i = initialNumber; i <= lastNumber; i++) {
		allSelectedNumbers[i] = 0;
	}

	for (let i = 0; i < threads; i++) {
		threadFinished[i] = false;
	}

	let numbersCountForThread = numbersCount / threads;
	startTime = new Date();
	for (let i = 0; i < threads; i++) {
		let threadIndex = i;
		
		if (window.Worker) {
			let data = [initialNumber, lastNumber, numbersCountForThread, threadIndex];
			let worker = new Worker("js/calculate.js");
			worker.postMessage(data);
			worker.onmessage = function(e) {
				threadFinished[e.data[0]] = true;
				let workerResults = e.data[1];
				for (let i = initialNumber; i <= lastNumber; i++) {
					allSelectedNumbers[i] += workerResults[i];
				}

				checkAllFinished();
			};
		} else {
			setTimeout(function() {
				calculateThread(initialNumber, lastNumber, numbersCountForThread, threadIndex);
			}, 50);
		}
	}
}

const median = arr => {
    const mid = Math.floor(arr.length / 2), nums = [...arr].sort((a, b) => a - b);
    return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
};

const average = arr => {
    return arr.reduce((a, b) => a + b) / arr.length;
};

const mode = (arr) => {
    const map = new Map();
    let maxFreq = 0;
    let mode;

    for(const item of arr) {
        let freq = map.has(item) ? map.get(item) : 0;
        freq++;

        if(freq > maxFreq) {
            maxFreq = freq;
            mode = item;
        }

        map.set(item, freq);
    }

    return mode;
};

function checkAllFinished() {
	for (let i = 0; i < threadsCount; i++) {
		if (!threadFinished[i]) {
			// Thread not finished
			return;
		}
	}

    let numbersArray = [];
    for (let property in allSelectedNumbers) {
        if (allSelectedNumbers.hasOwnProperty(property)) {
            let intProperty = parseInt(property);
            for (let i = 0; i < allSelectedNumbers[property]; i++) {
                numbersArray.push(intProperty);
            }
        }
    }

    let avg = average(numbersArray);
    let med = median(numbersArray);
    let mod = mode(numbersArray);

    // TODO:
    $averageResult.html(avg);
	$medianResult.html(med);
	$modeResult.html(mod);
	$varianceResult;
	$deviationResult;

	$allResults.html(JSON.stringify(allSelectedNumbers).replace(/,/g, ", "));

	let endTime = new Date();
	let seconds = Math.round((endTime - startTime) / 1000);

	$elapsedTime.html(seconds + " s");
	$calButton.removeAttr("disabled");
}

$(function() {
	$calButton = $(configs.calcButton);
	$formData = $(configs.formData);
	$averageResult = $(configs.averageResult);
	$medianResult = $(configs.medianResult);
	$modeResult = $(configs.modeResult);
	$varianceResult = $(configs.varianceResult);
	$deviationResult = $(configs.deviationResult);
	$allResults = $(configs.allResults);
	$elapsedTime = $(configs.elapsedTime);

	$formData.submit(function(e) {
		let $inputs = $(':input', $formData);
		let values = {};
		$inputs.each(function() {
			values[this.name] = $(this).val();
		});
		calculate(values[configs.firstNumber], values[configs.lastNumber], values[configs.numbersCount], values[configs.threads]);
		$calButton.attr("disabled", true);
		e.preventDefault();
	});

	document.addEventListener("keypress", function(event) {
        if (event.keyCode === 13) {
            $calButton.click();
        }
    });
});
