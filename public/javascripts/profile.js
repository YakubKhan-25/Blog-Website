

Shery.mouseFollower();
Shery.makeMagnet(".magnet");
Shery.hoverWithMediaCircle(".hvr",{videos:["/hover images/video1.mp4","/hover images/video1.mp4","/hover images/video1.mp4"]});
Shery.makeMagnet(".closemenubar");
Shery.makeMagnet(".menu")


gsap.from(".nav",{
  opacity:0,
  scale:0,
  y:-100,
  delay:0.4,
  duration:1,
  stagger:1
})

gsap.from(".subpage1 h2",{
  x:200,
  opacity:0,
  delay:0.3,
  duration:0.5
})

gsap.from(".paragraph p",{
  y:200,
  opacity:0,
  delay:0.3,
  duration:0.9
})

gsap.from(".subpage1heading h1",{
  y:-100,
  opacity : 0,
  delay:0.5,
  duration:0.6,
  stagger : 0.2
})

// locomotives();
function showmenubar(){
  const menubar = document.querySelector(".menubar")
  menubar.style.display = 'flex'
  gsap.from(menubar,{
    x: -30,
    opacity: 0,
    duration: 0.1
  })
}
function closemenubar(){
  const closemenubar = document.querySelector(".menubar")
  closemenubar.style.display = 'none'
}
