const ROOT_VAR='--page-scroll-progress';

let frame=0;

function updateScrollProgress(){
  cancelAnimationFrame(frame);
  frame=requestAnimationFrame(()=>{
    const root=document.documentElement;
    const max=Math.max(0,root.scrollHeight-window.innerHeight);
    const value=max===0?0:Math.min(1,Math.max(0,window.scrollY/max));
    root.style.setProperty(ROOT_VAR,`${(value*100).toFixed(3)}%`);
  });
}

function startScrollProgress(){
  updateScrollProgress();
  window.addEventListener('scroll',updateScrollProgress,{passive:true});
  window.addEventListener('resize',updateScrollProgress,{passive:true});
  window.addEventListener('load',updateScrollProgress,{once:true});

  if('ResizeObserver' in window){
    const observer=new ResizeObserver(updateScrollProgress);
    observer.observe(document.documentElement);
    if(document.body)observer.observe(document.body);
  }
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',startScrollProgress,{once:true});
}else{
  startScrollProgress();
}
