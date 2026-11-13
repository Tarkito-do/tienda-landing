/* Mi Tienda - navegación responsive, búsqueda, filtros y carrito ilustrativo */
'use strict';
const mediaMovil = window.matchMedia('(max-width: 760px)');
const botonMenu = document.querySelector('#boton-menu');
const navegacion = document.querySelector('#navegacion');
const desplegable = document.querySelector('#submenu-categorias');
function cambiarMenu(abrir) {
  navegacion.hidden = mediaMovil.matches && !abrir;
  botonMenu.setAttribute('aria-expanded',String(abrir));
  botonMenu.setAttribute('aria-label', abrir ? 'Cerrar menú':'Abrir menú');
  if(!abrir) desplegable.open=false;
}
botonMenu.addEventListener('click',()=>cambiarMenu(botonMenu.getAttribute('aria-expanded')!=='true'));
mediaMovil.addEventListener('change',()=>cambiarMenu(false));
// En escritorio siempre visible; en celular inicialmente cerrado.
cambiarMenu(false);
// Productos: HTML estático; Javascript filtra y permite añadir productos.
const cards=[...document.querySelectorAll('.product-card')];
const buscar=document.querySelector('#buscar-productos');
const contador=document.querySelector('#resultados-count');
const sinResultados=document.querySelector('#sin-resultados');
let filtro='Todos';
function aplicarFiltro(){
 const consulta=buscar.value.trim().toLocaleLowerCase('es'); let visibles=0;
 cards.forEach(card=>{const coincide=(filtro==='Todos'||card.dataset.category===filtro)&&card.dataset.search.includes(consulta);card.hidden=!coincide;if(coincide)visibles++;});
 contador.textContent=`Mostrando ${visibles} ${visibles===1?'producto':'productos'}`;
 sinResultados.hidden=visibles!==0;
 document.querySelectorAll('[data-filter]').forEach(b=>{const activo=b.dataset.filter===filtro;b.classList.toggle('active',activo);b.setAttribute('aria-pressed',String(activo));});
}
function elegirFiltro(valor){filtro=valor;buscar.value='';aplicarFiltro();}
document.querySelectorAll('[data-filter]').forEach(btn=>btn.addEventListener('click',()=>elegirFiltro(btn.dataset.filter)));
document.querySelectorAll('[data-filter-link]').forEach(a=>a.addEventListener('click',()=>elegirFiltro(a.dataset.filterLink)));
[buscar].forEach(el=>el.addEventListener('input',aplicarFiltro));
document.querySelector('#reset-busqueda').addEventListener('click',()=>elegirFiltro('Todos'));
// Al seguir un enlace, cerrar el menú hamburguesa.
navegacion.addEventListener('click',e=>{if(e.target.closest('a'))cambiarMenu(false);});
document.addEventListener('click',e=>{if(mediaMovil.matches&&!e.target.closest('.nav-row'))cambiarMenu(false);});
// Carrito demostrativo persistido localmente, sin ninguna solicitud al servidor.
const productos=Object.fromEntries(cards.map(card=>[card.dataset.product,{nombre:card.querySelector('h3').textContent,presentacion:card.querySelector('.product-body p').textContent.replace('Presentación: ',''),precio:Number(card.dataset.price)}]));
const KEY='mi-tienda-carrito-demo';
let carrito={};
try{const guardado=JSON.parse(localStorage.getItem(KEY)||'{}');if(guardado&&typeof guardado==='object')for(const [id,qty] of Object.entries(guardado)){if(productos[id]&&Number.isInteger(qty)&&qty>0&&qty<=99)carrito[id]=qty;}}catch(_e){}
function guardar(){try{localStorage.setItem(KEY,JSON.stringify(carrito));}catch(_e){}}
const panel=document.querySelector('#cart-panel'); const overlay=document.querySelector('#cart-overlay');
const lines=document.querySelector('#cart-lines'); const botonCopiar=document.querySelector('#copiar-pedido');
let ultimoFoco=null;
function abrirCarrito(){ultimoFoco=document.activeElement;panel.hidden=false;overlay.hidden=false;panel.focus();document.body.style.overflow='hidden';}
function cerrarCarrito(){panel.hidden=true;overlay.hidden=true;document.body.style.overflow='';if(ultimoFoco?.focus)ultimoFoco.focus();}
document.querySelector('#abrir-carrito').addEventListener('click',abrirCarrito);
document.querySelector('#cerrar-carrito').addEventListener('click',cerrarCarrito);
overlay.addEventListener('click',cerrarCarrito);
const dinero=valor=>`S/ ${valor.toFixed(2)}`;
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function dibujarCarrito(){
 const entries=Object.entries(carrito).filter(([id,n])=>productos[id]&&n>0);
 const totalItems=entries.reduce((acc,[id,n])=>acc+n,0);
 const subtotal=entries.reduce((acc,[id,n])=>acc+n*productos[id].precio,0);
 document.querySelector('#cart-count').textContent=totalItems;
 document.querySelector('#cart-items-count').textContent=`(${totalItems})`;
 document.querySelector('#cart-subtotal').textContent=dinero(subtotal);
 botonCopiar.disabled=totalItems===0;
 if(!entries.length){lines.innerHTML='<div class="cart-empty"><span class="empty-icon" aria-hidden="true">🛒</span><strong>Tu carrito está vacío</strong><p>Explora productos y agrega tus favoritos.</p></div>';return;}
 lines.innerHTML=entries.map(([id,n])=>{const p=productos[id];return `<div class="cart-item"><div><h3>${escapeHtml(p.nombre)}</h3><p>Presentación: ${escapeHtml(p.presentacion)}</p><strong>${dinero(p.precio*n)}</strong></div><div class="cart-qty"><button type="button" data-change="${id}" data-step="-1" aria-label="Quitar una unidad de ${escapeHtml(p.nombre)}">−</button><span>${n}</span><button type="button" data-change="${id}" data-step="1" aria-label="Agregar una unidad de ${escapeHtml(p.nombre)}">+</button></div></div>`;}).join('');
}
let toastTimer; function notificar(mensaje){const t=document.querySelector('#toast');t.textContent=mensaje;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),2500);}
document.querySelector('#product-grid').addEventListener('click',e=>{
 const btn=e.target.closest('[data-add]');if(!btn)return;
 const id=btn.dataset.add;if(!productos[id])return;
 carrito[id]=Math.min(99,(carrito[id]||0)+1);guardar();dibujarCarrito();notificar(`${productos[id].nombre} añadido al carrito`);
});
lines.addEventListener('click',e=>{const btn=e.target.closest('[data-change]');if(!btn)return;const id=btn.dataset.change;carrito[id]=Math.max(0,Math.min(99,(carrito[id]||0)+Number(btn.dataset.step)));if(!carrito[id])delete carrito[id];guardar();dibujarCarrito();});
document.querySelectorAll('[name="entrega"]').forEach(r=>r.addEventListener('change',()=>{document.querySelector('#entrega-aviso').textContent=r.value==='Delivery'?'Cobertura, costo de envío y horario por coordinar; no están incluidos en el subtotal.':'El retiro se coordina directamente con la tienda.';}));
function textoResumen(){const entrega=document.querySelector('[name="entrega"]:checked').value;let total=0;const rows=Object.entries(carrito).filter(([id,n])=>productos[id]&&n>0).map(([id,n])=>{const p=productos[id];total+=p.precio*n;return `- ${p.nombre} (${p.presentacion}) x${n}: ${dinero(p.precio*n)}`;});return ['MI TIENDA — RESUMEN ILUSTRATIVO','',...rows,'',`Subtotal referencial: ${dinero(total)}`,`Entrega: ${entrega}`,'','DEMO ACADÉMICA: NO ES UN PEDIDO REAL. Precio, stock y envío deben confirmarse con el negocio.'].join('\n');}
botonCopiar.addEventListener('click',async()=>{const resumen=textoResumen();try{await navigator.clipboard.writeText(resumen);notificar('Resumen copiado. No se realizó ningún pedido.');}catch(_e){const ta=document.createElement('textarea');ta.value=resumen;ta.style.position='fixed';ta.style.left='-9999px';document.body.appendChild(ta);ta.select();const ok=document.execCommand('copy');ta.remove();if(ok)notificar('Resumen copiado. No se realizó ningún pedido.');else{notificar('No se pudo copiar automáticamente: revisa los permisos del navegador.');}}});
// Cerrar el menú o el carrito presionando Escape.
document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;if(!panel.hidden){cerrarCarrito();return;}if(desplegable.open){desplegable.open=false;return;}if(mediaMovil.matches&&!navegacion.hidden){cambiarMenu(false);botonMenu.focus();}});
dibujarCarrito();aplicarFiltro();
