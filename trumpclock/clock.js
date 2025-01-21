const $ = id => document.getElementById(id);

const title = $("title");
title.addEventListener("pointerup", () => {
    title.innerText = "Shadow President Musk's term ends in"
}, {once: true});

const inaugurationDate = new Date("January 20, 2025 11:00:00 GMT-06:00");
const endDate = new Date("January 20, 2029 11:00:00 GMT-06:00");
const timeRemaining = {
    years: 4,
    months: 0,
    weeks: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
};

function setTimeRemaining() {
    const now = Date.now();
}