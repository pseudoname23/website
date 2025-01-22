const $ = id => document.getElementById(id);

const title = $("title");
title.addEventListener("pointerup", () => {
    title.innerText = "Shadow President Musk's term ends in:"
}, {once: true});

const inaugurationDate = new Date("January 20, 2025 11:00:00 GMT-06:00");
const endDate = new Date("January 20, 2029 11:00:00 GMT-06:00");
const daysPerMonth = [
    31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31
]
const daysPerMonthReversed = [
    31, 30, 31, 30, 31, 31, 30, 31, 30, 31, 28, 31
]
const timeRemaining = {
    years: 4,
    months: 0,
    weeks: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    percent: 0
};

function setTimeRemaining() {
    const now = Date.now(); // ms
    const msRemaining = endDate - now;

    let daysRemaining = msRemaining/1000/60/60/24;
    let isLeapYear = false;
    if (daysRemaining < 366) {
        timeRemaining.years = 0;
        isLeapYear = true;
    } else {
        let yearsRemaining = 1;
        daysRemaining -= 366;
        yearsRemaining += Math.floor(daysRemaining / 365);
        daysRemaining = daysRemaining % 365;
        timeRemaining.years = yearsRemaining;
    } // years: check

    let monthsRemaining = 0;
    for (const n of daysPerMonthReversed) {
        let leapDay = 0;
        if (n === 28 && isLeapYear) {
            leapDay = 1;
        }
        if (daysRemaining > n + leapDay) {
            daysRemaining -= (n + leapDay);
            ++monthsRemaining;
        } else {
            timeRemaining.months = monthsRemaining;
            break;
        }
    } // months: check

    timeRemaining.weeks = Math.floor(daysRemaining / 7);
    timeRemaining.days = Math.floor(daysRemaining % 7)
    let hoursRemaining = (daysRemaining % 1) * 24;
    timeRemaining.hours = Math.floor(hoursRemaining);
    let minutesRemaining = (hoursRemaining % 1) * 60;
    timeRemaining.minutes = Math.floor(minutesRemaining);
    let secondsRemaining = (minutesRemaining % 1) * 60;
    timeRemaining.seconds = Math.floor(secondsRemaining);

    const termDuration = endDate - inaugurationDate;
    timeRemaining.percent = 1 - (msRemaining / termDuration);
}


function updateUI() {
    // update counters
    $("years").innerText = timeRemaining.years;
    $("months").innerText = timeRemaining.months;
    $("weeks").innerText = timeRemaining.weeks;
    $("days").innerText = timeRemaining.days;
    $("hours").innerText = timeRemaining.hours;
    $("minutes").innerText = timeRemaining.minutes;
    $("seconds").innerText = timeRemaining.seconds;

    // update percent
    const formattedPercent = Math.floor(timeRemaining.percent * 10000) / 100;
    $("percent").innerText = `${formattedPercent}%`;
    $("progress").value = timeRemaining.percent;

    // update plurals
    $("yearplural").innerText = (timeRemaining.years === 1 ? "" : "s");
    $("monthplural").innerText = (timeRemaining.months === 1 ? "" : "s");
    $("weekplural").innerText = (timeRemaining.weeks === 1 ? "" : "s");
    $("dayplural").innerText = (timeRemaining.days === 1 ? "" : "s");
    $("hourplural").innerText = (timeRemaining.hours === 1 ? "" : "s");
    $("minuteplural").innerText = (timeRemaining.minutes === 1 ? "" : "s");
    $("secondplural").innerText = (timeRemaining.seconds === 1 ? "" : "s");
}

function tick() {
    setTimeRemaining();
    updateUI();
}

tick();
setInterval(tick, 250);