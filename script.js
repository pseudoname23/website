// This code is legacy code from when I was just learning JavaScript.
// I'm leaving it mostly untouched to show my progress from the beginning.
// Also, it Just Works, and I don't want to fuck with it or it might break.
// The journey of a thousand miles begins with a single step.

var clientScreenWidth = $(window).width();
var clientScreenHeight = $(window).height();

function setNavWidth() {
  var nav = document.getElementById("nav");
  nav.style.width = `${clientScreenWidth}px`;
} // Sets the navbar to be as wide as the screen

function capDescWidth() {
  if (clientScreenWidth >= 810) {
    var content = document.getElementById("content");
    content.style.width = "800px";
  }
} // Sets the max description width to 800px

function showAll() {
  var things = document.getElementsByClassName("hiddenBeforeLoad");
  const initialLength = things.length;
  for (let i = 0; i < initialLength; i++) {
    things[0].classList.remove("hiddenBeforeLoad");
  }
} // Unhides all hidden elements

function onload() {
  setNavWidth();
  capDescWidth();
  showAll();
} // Fires the 3 above functions in order

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
} // For use in other functions

function prankd() {
  alert(
    "This button doesn't actually do anything. Hover over the link for my discord username"
  );
} // Discord "link" easter egg

function newColor() {
  const hex = [
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "A",
    "B",
    "C",
    "D",
    "E",
    "F"
  ];
  var color = "#";
  for (let i = 0; i < 6; i++) {
    color += hex[Math.floor(Math.random() * 16)];
  }
  return color;
} // Returns a random hex code

function changeColor(x) {
  var elem = document.getElementById(x);
  var color = newColor();
  elem.style.color = color;
} /* Sets an element's color to a random
color, given the element's ID*/
async function splashText() {
  var title = document.getElementById("title");
  var tempText = [
    "What?",
    "Quit clicking me",
    "play infinitode 2",
    "Why are you like this",
    "H̷̞̋i̴̻̿,̴̜̏ ̸̖͑Ỉ̴͜'̴̞͑m̸̪̓ ̵̫̏p̸̩̑ṡ̴ͅę̶̐u̴̼͒d̴̺̿ö̷́ͅń̷̦a̴̹͘m̶͊ͅe̸̱̍.̴͉́",
    "for (;;) {console.log('L');};",
    ".emanoduesp m'I ,iH",
    "You write an about me then, if you're so goddamn smart."
  ];
  var eventNumber = Math.floor(Math.random() * 9);
  switch (eventNumber) {
    case 8:
      for (let i = 0; i < 80; ++i) {
        changeColor("title");
        await sleep(25);
      }
      title.style.color = "#000000";
      break;
    default:
      title.innerText = tempText[eventNumber];
      await sleep(1500);
      title.innerText = "Hi, I'm pseudoname.";
  }
} // Really dumb and long function
