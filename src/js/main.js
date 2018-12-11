"use strict";
function menuHandler() {
  var menuBtn = $('.header__button');
  var dropdown = $('.header__nav');
  menuBtn.on('click', function () {
    dropdown.slideToggle();
  });
}
function stickyHeader() { 
  $(window).on("scroll", function() {
    if($(window).scrollTop() > 150) {
        $("#header").addClass("header--color");
    } else {
       $("#header").removeClass("header--color");
    }
  });
 }

 function smoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});
 }

$(document).ready(function () {
  menuHandler();
  stickyHeader();
  smoothScroll();
});