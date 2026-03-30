console.log('dark mode');

//------------------------------------
// Wait for the DOM to fully load
//------------------------------------

document.addEventListener("DOMContentLoaded", function () {

  //------------------------------------
  // change color of background
  //------------------------------------
  
document.querySelector(".top-left").addEventListener("click", () => {
  document.body.style.background = "rgb(183, 255, 0)";
});

document.querySelector(".top-right").addEventListener("click", () => {
  document.body.style.background = "red";
});

document.querySelector(".bottom-left").addEventListener("click", () => {
  document.body.style.background = "magenta";
});

document.querySelector(".bottom-right").addEventListener("click", () => {
  document.body.style.background = "blue";
});

document.querySelector("p").addEventListener("click", () => {
  document.body.style.background = "black";
});

});



//------------------------------------
  // note to self: make each circle click change for a different demo
  //------------------------------------
  