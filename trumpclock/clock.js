const $ = id => document.getElementById(id);

const title = $("title");
title.addEventListener("pointerup", () => {
    console.log(this);
})