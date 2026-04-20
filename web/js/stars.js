// Stars
(function () {
  const sky = document.getElementById('stars');
  for (let i = 0; i < 120; i++) {
    const s = document.createElement('div');
    const size = Math.random() * 2.5 + 0.5;
    s.className = 'star';
    s.style.cssText =
      `left:${Math.random()*100}%;top:${Math.random()*100}%;` +
      `width:${size}px;height:${size}px;` +
      `--d:${(Math.random()*2.5+1).toFixed(1)}s;` +
      `--dl:${(Math.random()*4).toFixed(1)}s;`;
    sky.appendChild(s);
  }
})();

// Floating sparkles around the genie
(function () {
  const container = document.getElementById('sparkles');
  const positions = [
    { top: '5%',  left: '10%' }, { top: '10%', left: '80%' },
    { top: '30%', left: '4%'  }, { top: '25%', left: '88%' },
    { top: '55%', left: '8%'  }, { top: '60%', left: '85%' },
    { top: '75%', left: '20%' }, { top: '70%', left: '72%' },
    { top: '15%', left: '45%' }, { top: '80%', left: '48%' },
  ];
  positions.forEach(({ top, left }, i) => {
    const sp = document.createElement('div');
    sp.className = 'sp';
    sp.style.cssText =
      `top:${top};left:${left};` +
      `--sd:${(2.5 + Math.random() * 2).toFixed(1)}s;` +
      `--sdl:${(i * 0.4).toFixed(1)}s;` +
      `width:${6 + Math.random() * 6}px;height:${6 + Math.random() * 6}px;`;
    container.appendChild(sp);
  });
})();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
