/* main.js — theme, mobile menu, reveal-on-scroll, hero dev scene, enquiry form */
(function(){
'use strict';
var root = document.documentElement;
var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---- theme: device default, manual override saved ---- */
var themeBtn = document.getElementById('themeBtn');
function paintTheme(){ if(themeBtn) themeBtn.textContent = root.dataset.theme === 'dark' ? '☀' : '☾'; }
paintTheme();
if(themeBtn) themeBtn.addEventListener('click', function(){
  var next = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
  localStorage.setItem('theme', next);
  paintTheme();
});
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e){
  if(!localStorage.getItem('theme')){
    root.dataset.theme = e.matches ? 'dark' : 'light';
    paintTheme();
  }
});

/* ---- mobile menu ---- */
var menuBtn = document.getElementById('menuBtn');
var mobileNav = document.getElementById('mobileNav');
function setMenu(open){
  mobileNav.classList.toggle('open', open);
  menuBtn.setAttribute('aria-expanded', open);
  menuBtn.textContent = open ? '✕' : '☰';
  menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
}
if(menuBtn && mobileNav){
  menuBtn.addEventListener('click', function(){ setMenu(!mobileNav.classList.contains('open')); });
  mobileNav.addEventListener('click', function(e){ if(e.target.tagName === 'A') setMenu(false); });
  addEventListener('keydown', function(e){ if(e.key === 'Escape' && mobileNav.classList.contains('open')) setMenu(false); });
}

/* ---- topbar backdrop once scrolled past the hero top ---- */
var topbar = document.querySelector('.topbar');
function paintBar(){ topbar.classList.toggle('scrolled', scrollY > 40); }
addEventListener('scroll', paintBar, {passive:true});
paintBar();

/* ---- reveal on scroll ---- */
var els = document.querySelectorAll('.reveal');
if('IntersectionObserver' in window){
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, {threshold:.12});
  els.forEach(function(el,i){ el.style.transitionDelay = (i%6*.06)+'s'; el && io.observe(el); });
}else{
  els.forEach(function(el){ el.classList.add('in'); });
}

/* ---- hero dev scene: staggered line reveal, loops ---- */
var codeLines = [].slice.call(document.querySelectorAll('.code .ln'));
var termLines = [].slice.call(document.querySelectorAll('.term-lines .tl'));
function playScene(){
  var sceneVisible = matchMedia('(min-width: 1021px)').matches;
  codeLines.concat(termLines).forEach(function(l){ l.classList.remove('show'); });
  codeLines.forEach(function(l,i){ setTimeout(function(){ l.classList.add('show'); }, 400 + i*380); });
  /* on small screens the editor is hidden, so the terminal starts right away */
  var tStart = sceneVisible ? 400 + codeLines.length*380 + 300 : 500;
  termLines.forEach(function(l){
    var i = Array.prototype.indexOf.call(l.parentNode.children, l);
    setTimeout(function(){ l.classList.add('show'); }, tStart + i*520);
  });
}
if(reduce){
  codeLines.concat(termLines).forEach(function(l){ l.classList.add('show'); });
}else{
  playScene();
  setInterval(playScene, 14000);
}

/* ---- enquiry form → FormSubmit ---- */
var form = document.getElementById('enquiryForm');
if(form) form.addEventListener('submit', function(e){
  e.preventDefault();
  var btn = document.getElementById('fSubmit');
  btn.disabled = true; btn.textContent = 'Sending…';
  var data = {};
  new FormData(form).forEach(function(v,k){ data[k] = v; });
  fetch('https://formsubmit.co/ajax/parixitc9@gmail.com', {
    method: 'POST',
    headers: {'Content-Type':'application/json','Accept':'application/json'},
    body: JSON.stringify(Object.assign({}, data, {
      _subject: 'New Project Enquiry — ' + data.project_type + ' — ' + data.name,
      _template: 'table',
      _captcha: 'false',
      _replyto: data.email,
      _autoresponse: 'Hi ' + data.name + '! I got your project details (' + data.project_type + ') and will review them right away. Expect a personal reply from me within 24-48 hours. — Parixit (parixit.dev)'
    }))
  }).then(function(res){
    if(!res.ok) throw new Error('send failed');
    form.style.display = 'none';
    document.getElementById('fSuccess').style.display = 'block';
  }).catch(function(){
    btn.disabled = false; btn.textContent = 'Try again ↗';
    alert('Could not send right now. Please email me directly at parixitc9@gmail.com');
  });
});
})();
