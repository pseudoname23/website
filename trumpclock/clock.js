const $ = id => document.getElementById(id);

const title = $("title");
title.addEventListener("pointerup", () => {
    title.innerText = "Shadow President Musk's term ends in"
}, {once: true});

const inaugurationDate = new Date(2025, 0, 20, 11);
const endDate = new Date(2029, 0, 20, 11);