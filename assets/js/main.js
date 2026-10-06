(()=>{
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Fallback de diagramação: une as duas últimas palavras de cada bloco (sem viúvas) */
(function(){const sel='h1,h2,h3,h4,h5,p,li,summary,small,.mention,.ben span,.tagline';
  document.querySelectorAll(sel).forEach(el=>{if(el.closest('svg'))return;
    const w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);let n,last=null;while(n=w.nextNode()){if(n.nodeValue.trim())last=n}
    if(!last)return;const v=last.nodeValue.replace(/\s+$/,'');const i=v.lastIndexOf(' ');
    if(i>0&&v.slice(i+1).length<=16)last.nodeValue=v.slice(0,i)+'\u00A0'+v.slice(i+1)+last.nodeValue.slice(v.length);});
})();

/* ---------- Menu hamburguer ---------- */
const burger=$('#burger'),mmenu=$('#mmenu');
const setMenu=open=>{document.body.classList.toggle('menu-open',open);document.body.classList.toggle('lock',open);
  burger.setAttribute('aria-expanded',open);burger.setAttribute('aria-label',open?'Fechar menu':'Abrir menu');mmenu.setAttribute('aria-hidden',!open);};
burger.addEventListener('click',()=>setMenu(!document.body.classList.contains('menu-open')));
mmenu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
addEventListener('keydown',e=>{if(e.key==='Escape')setMenu(false)});
matchMedia('(min-width:1025px)').addEventListener('change',e=>{if(e.matches)setMenu(false)});

/* ---------- Header, progresso, CTA fixo, parallax ---------- */
const hdr=$('#hdr'),mcta=$('#mcta'),demo=$('#demonstracao'),bar=$('#progress'),mock=$('#mockPar'),dots=$('#dotsBg');
let lastY=0,ticking=false;
const parallaxOK=!reduce&&matchMedia('(hover:hover) and (min-width:1025px)').matches;
function frame(){
  const y=scrollY,h=document.documentElement.scrollHeight-innerHeight;
  hdr.classList.toggle('scrolled',y>30);
  hdr.classList.toggle('hide',y>lastY&&y>500&&!document.body.classList.contains('menu-open'));
  lastY=y;
  bar.style.transform=`scaleX(${h>0?y/h:0})`;
  const r=demo.getBoundingClientRect();
  mcta.classList.toggle('show',y>500&&r.top>innerHeight*.85);
  if(parallaxOK&&y<innerHeight*1.2){mock.style.transform=`translate3d(0,${y*-.06}px,0)`;dots.style.transform=`translate3d(0,${y*.18}px,0)`}
  ticking=false;
}
addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(frame);ticking=true}},{passive:true});frame();

/* Link ativo do menu conforme a seção */
const links=$$('.nav-links a');
const secIO=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){links.forEach(l=>l.classList.toggle('active',l.getAttribute('href')==='#'+e.target.id))}}),{rootMargin:'-45% 0px -50% 0px'});
links.forEach(l=>{const s=$(l.getAttribute('href'));s&&secIO.observe(s)});

/* ---------- Animações de entrada no scroll ---------- */
$$('[data-stagger]').forEach(p=>{const step=parseFloat(p.dataset.step||.1);
  [...p.children].forEach((c,i)=>{if(!c.style.getPropertyValue('--d'))c.style.setProperty('--d',(i*step).toFixed(2)+'s')})});
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);
  e.target.querySelectorAll('[data-count]:not([data-auto])').forEach(count)}}),{threshold:.12,rootMargin:'0px 0px -8% 0px'});
$$('[data-a],[data-in]').forEach(el=>io.observe(el));
/* Segurança: se algo ficar fora do observer (ex.: print), mostra tudo */
addEventListener('beforeprint',()=>$$('[data-a],[data-in]').forEach(el=>el.classList.add('in')));

/* Contadores numéricos */
function count(el){if(el.dataset.done)return;el.dataset.done=1;const to=+el.dataset.count;
  if(reduce){el.textContent=to;return}
  const t0=performance.now(),dur=1600;
  (function tick(t){const p=Math.min((t-t0)/dur,1),e=1-Math.pow(1-p,3);el.textContent=Math.round(to*e);if(p<1)requestAnimationFrame(tick)})(t0);}
setTimeout(()=>$$('[data-count][data-auto]').forEach(count),900);

/* Rótulos do gráfico: largura ajustada ao texto e centralizada no ponto */
function layoutLabels(){document.querySelectorAll('.schart .lab').forEach(g=>{const tx=g.querySelector('text'),r=g.querySelector('rect');
  const len=tx.getComputedTextLength();if(!len)return;const w=len+24;let cx=+g.dataset.cx;cx=Math.min(Math.max(cx,44+w/2),636-w/2);
  tx.setAttribute('x',cx);r.setAttribute('x',cx-w/2);r.setAttribute('width',w)})}
layoutLabels();document.fonts&&document.fonts.ready.then(layoutLabels);addEventListener('resize',layoutLabels);

/* ---------- Ruído → sinal ---------- */
const noise=$('#noise'),btn=$('#noiseBtn');
const items=[["Portal local",0],["#tendência",0],["Comentário",0],["Post no X",1],["YouTube",0],["Menção direta",0],["Blog regional",0],["Crítica no Instagram",1],["Notícia nacional",0],["Grupo de bairro",0],["Live",0],["Repost",0],["Enquete",0],["Portal local · PL 45",1],["Story",0],["Podcast",0],["Coluna",0],["Thread",0]];
const chips=items.map(([t,k])=>{const c=document.createElement('span');c.className='chip'+(k?' key':'');c.textContent=t;noise.appendChild(c);return c});
const focus=document.createElement('div');focus.className='focus';focus.innerHTML='<small>SINAL RELEVANTE IDENTIFICADO</small><p>3 menções conectadas ao tema <b>Projeto de Lei 45</b> em canais diferentes, com crescimento de tom crítico.</p>';noise.appendChild(focus);
const rnd=(a,b)=>a+Math.random()*(b-a);
function scatter(){const w=noise.clientWidth,h=noise.clientHeight;chips.forEach(c=>{const cw=c.offsetWidth||120;c.style.left=rnd(10,Math.max(12,w-cw-10))+'px';c.style.top=rnd(60,h-44)+'px';c.style.transform=`rotate(${rnd(-8,8)}deg)`})}
function sort(){let i=0;chips.forEach(c=>{if(c.classList.contains('key')){c.style.left='20px';c.style.top=(64+i*44)+'px';c.style.transform='none';i++}})}
scatter();
btn.addEventListener('click',()=>{const on=noise.classList.toggle('sorted');btn.textContent=on?'Ver sem o Radar':'Ver com o Radar';on?sort():scatter()});
new IntersectionObserver((es,o)=>es.forEach(e=>{if(e.isIntersecting){setTimeout(()=>{if(!noise.classList.contains('sorted'))btn.click()},1800);o.disconnect()}}),{threshold:.5}).observe(noise);
let rw=innerWidth;addEventListener('resize',()=>{if(innerWidth===rw)return;rw=innerWidth;noise.classList.contains('sorted')?sort():scatter()});

/* ---------- FAQ com abertura suave ---------- */
$$('.faq details').forEach(d=>{const s=d.querySelector('summary'),a=d.querySelector('.ans');
  s.addEventListener('click',e=>{if(reduce)return;e.preventDefault();
    if(d.open){a.style.height=a.scrollHeight+'px';requestAnimationFrame(()=>a.style.height='0px');a.addEventListener('transitionend',()=>{d.open=false;a.style.height=''},{once:true})}
    else{d.open=true;const h=a.scrollHeight;a.style.height='0px';requestAnimationFrame(()=>a.style.height=h+'px');a.addEventListener('transitionend',()=>a.style.height='',{once:true})}});});

/* ---------- Formulário ---------- */
const ufs="AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO".split(' ');
const ufSel=$('#uf');ufs.forEach(u=>ufSel.add(new Option(u,u)));
const tel=$('#tel');
tel.addEventListener('input',()=>{let v=tel.value.replace(/\D/g,'').slice(0,11);
  tel.value=v.length>10?v.replace(/(\d{2})(\d{5})(\d{0,4})/,'($1) $2-$3'):v.length>6?v.replace(/(\d{2})(\d{4})(\d{0,4})/,'($1) $2-$3'):v.length>2?v.replace(/(\d{2})(\d{0,5})/,'($1) $2'):v;});
const form=$('#leadForm');
const invalid=f=>f.type==='checkbox'?!f.checked:f.type==='email'?!/^\S+@\S+\.\S+$/.test(f.value):f.id==='tel'?f.value.replace(/\D/g,'').length<10:!f.value.trim();
form.querySelectorAll('input,select').forEach(f=>f.addEventListener(f.tagName==='SELECT'||f.type==='checkbox'?'change':'input',()=>{const w=f.closest('.fld')||f.closest('.consent');if(w.classList.contains('err')&&!invalid(f))w.classList.remove('err')}));
form.addEventListener('submit',e=>{
  e.preventDefault();let first=null;
  form.querySelectorAll('[required]').forEach(f=>{const bad=invalid(f),w=f.closest('.fld')||f.closest('.consent');
    w.classList.remove('err');void w.offsetWidth;w.classList.toggle('err',bad);if(bad&&!first)first=f;});
  if(first){first.focus({preventScroll:true});first.scrollIntoView({behavior:reduce?'auto':'smooth',block:'center'});return}
  // TODO: integrar com CRM / RD Station / webhook aqui
  $('#formBody').style.display='none';$('#formOk').style.display='block';
});
})();
