Shery.mouseFollower();
Shery.makeMagnet(".magnet");
Shery.makeMagnet(".msg");
gsap.from(".linksec",{
    y:-100,
    opacity :0,
    duration: 1,
    delay: 0.1,
    stagger:0.3,
})
gsap.from(".magnet",{
    scale:0,
    opacity:0,
    delay:0.1,
    duration:0.4,
})
gsap.from(".oo",{
    y:50,
    opacity:0,
    stagger:0.2,
    delay:0.1,
    duration:0.5,
})
gsap.from("#txt",{
    x:150,
    opacity:0,
    delay:0.1,
    duration:0.5,
})