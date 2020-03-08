let configs = {
    calcButton: "#button_calc",
    formData: "#form_tests_data",
    averageResult: "#results_average",
    medianResult: "#results_median",
    modeResult: "#results_mode",
    varianceResult: "#results_variance",
    deviationResult: "#results_deviation",
    elapsedTime: "#elapsed_time",
    firstNumber: "input_first_number",
    lastNumber: "input_last_number",
    numbersCount: "input_numbers_count",
    threads: "input_threads",
    chartCanvas: "chart",
    avgLabel: "#avg_label",
    medLabel: "#med_label",
    modLabel: "#mod_label",
    varLabel: "#var_label",
    stdLabel: "#std_label",
    elaLabel: "#ela_label",
    resLabel: "#res_label",
    variableLabel: "#variable_label"
};

let i18n = {
    chartTitle: "Histogram",
    average: "Average",
    median: "Median",
    mode: "Mode",
    variance: "Variance",
    standardDeviation: "Standard deviation",
    elapsedTime: "Elapsed time",
    results: "Results",
};

let i18nPtBR = {
    chartTitle: "Histograma",
    average: "Média",
    median: "Mediana",
    mode: "Moda",
    variance: "Variância",
    standardDeviation: "Desvio padrão",
    elapsedTime: "Tempo",
    results: "Resultados",
};

let histogramChart;
let $calButton;
let $formData;
let $evenResults;
let $oddResults;
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

const calcAverage = arr => {
    return arr.reduce((a, b) => a + b) / arr.length;
};

const calcMedian = arr => {
    const mid = Math.floor(arr.length / 2), nums = [...arr].sort((a, b) => a - b);
    return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
};

const calcMode = (arr) => {
    const map = new Map();
    let maxFreq = 0;
    let mode;

    for (const item of arr) {
        let freq = map.has(item) ? map.get(item) : 0;
        freq++;

        if (freq > maxFreq) {
            maxFreq = freq;
            mode = item;
        }

        map.set(item, freq);
    }

    return mode;
};

const calcVariance = (arr, avg) => {
    return calcAverage(arr.map((num) => {
        return Math.pow(num - avg, 2);
    }));
};

const calcStandardDeviation = (arr, vari) => {
    return Math.sqrt(vari);
};

function round(number) {
    return Math.round(number * 100) / 100;
}

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }

    return color;
}

function checkAllFinished() {
    for (let i = 0; i < threadsCount; i++) {
        if (!threadFinished[i]) {
            // Thread not finished
            return;
        }
    }

    let dataLabels = [];
    let dataValues = [];
    let numbersArray = [];
    let dataBackgroundColors = [];
    let dataBorderColors = [];
    for (let property in allSelectedNumbers) {
        if (allSelectedNumbers.hasOwnProperty(property)) {
            let intProperty = parseInt(property);
            dataLabels.push(intProperty);
            dataValues.push(allSelectedNumbers[property]);

            let randomColor = getRandomColor()
            dataBackgroundColors.push(randomColor + "55");
            dataBorderColors.push(randomColor);

            for (let i = 0; i < allSelectedNumbers[property]; i++) {
                numbersArray.push(intProperty);
            }
        }
    }

    let aver = calcAverage(numbersArray);
    let medi = calcMedian(numbersArray);
    let mode = calcMode(numbersArray);
    let vari = calcVariance(numbersArray, aver);
    let devi = calcStandardDeviation(numbersArray, vari);

    $averageResult.html(round(aver));
    $medianResult.html(round(medi));
    $modeResult.html(round(mode));
    $varianceResult.html(round(vari));
    $deviationResult.html(round(devi));

    // update chart
    histogramChart.data.labels = dataLabels;
    histogramChart.data.datasets = [{
        data: dataValues,
        backgroundColor: dataBackgroundColors,
        borderColor: dataBorderColors,
        fill: false,
        borderWidth: 1
    }];
    histogramChart.update();


    let endTime = new Date();
    let seconds = Math.round((endTime - startTime) / 1000);

    $elapsedTime.html(seconds + " s");
    $calButton.removeAttr("disabled");
}

function findGetParameter(parameterName) {
    let result = null,
        tmp = [];
    location.search
        .substr(1)
        .split("&")
        .forEach(function (item) {
          tmp = item.split("=");
          if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
        });
    return result;
}

$(function() {
    if (findGetParameter("lang") == "ptBR") {
        i18n = {...i18n, ...i18nPtBR};
    }

    let variable = findGetParameter("variable");
    if (variable != null) {
        $(configs.variableLabel).html(variable);
    }

    $(configs.avgLabel).html(i18n.average);
    $(configs.medLabel).html(i18n.median);
    $(configs.modLabel).html(i18n.mode);
    $(configs.varLabel).html(i18n.variance);
    $(configs.stdLabel).html(i18n.standardDeviation);
    $(configs.elaLabel).html(i18n.elapsedTime);
    $(configs.resLabel).html(i18n.results);

    $calButton = $(configs.calcButton);
    $formData = $(configs.formData);
    $averageResult = $(configs.averageResult);
    $medianResult = $(configs.medianResult);
    $modeResult = $(configs.modeResult);
    $varianceResult = $(configs.varianceResult);
    $deviationResult = $(configs.deviationResult);
    $elapsedTime = $(configs.elapsedTime);

    let chartCtx = document.getElementById(configs.chartCanvas).getContext('2d');
    histogramChart = new Chart(chartCtx, {
        type: 'bar',
        options: {
            legend: {
                display: false
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            },
            title: {
                display: true,
                text: i18n.chartTitle
            },
            events: false,
            tooltips: {
                enabled: false
            },
            hover: {
                animationDuration: 0
            },
            animation: {
                duration: 1,
                onComplete: function () {
                    let chartInstance = this.chart;
                    let ctx = chartInstance.ctx;
                    ctx.font = Chart.helpers.fontString(Chart.defaults.global.defaultFontSize,
                        Chart.defaults.global.defaultFontStyle, Chart.defaults.global.defaultFontFamily);
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'bottom';

                    this.data.datasets.forEach(function (dataset, i) {
                        let meta = chartInstance.controller.getDatasetMeta(i);
                        meta.data.forEach(function (bar, index) {
                            let data = dataset.data[index];                            
                            ctx.fillText(data, bar._model.x, bar._model.y - 5);
                        });
                    });
                }
            }
        }
    });

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
