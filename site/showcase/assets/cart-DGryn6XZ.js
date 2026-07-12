import{d as ut,r as le,s as He,c,m as Re,g as Me,e as x,a as ht,b as _t}from"./index-CkEUp_W4.js";import{r as Ct}from"./index-CCmW2FzX.js";import{b as xt}from"./bind-model-D4ZxmwMG.js";function N(e){return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(e)}const Oe=[{id:"mug",name:"Jacaré Mug",price:24.9,tag:"gear"},{id:"tee",name:"Logo T-Shirt",price:39.9,tag:"apparel"},{id:"sticker",name:"Sticker Pack",price:9.9,tag:"gear"},{id:"hoodie",name:"Forest Hoodie",price:64.9,tag:"apparel"},{id:"cap",name:"Canvas Cap",price:29.9,tag:"apparel"},{id:"notebook",name:"Dev Notebook",price:18.5,tag:"gear"}].map(e=>({...e,priceLabel:N(e.price)})),q=He([]),Y=He(""),Pe=c(()=>q().map(e=>{const n=Oe.find(t=>t.id===e.productId);if(!n)return null;const o=n.price*e.qty;return{...e,product:n,lineTotal:o,unitLabel:n.priceLabel,totalLabel:N(o)}}).filter(Boolean)),he=c(()=>q().reduce((e,n)=>e+n.qty,0)),E=c(()=>Pe().reduce((e,n)=>e+n.lineTotal,0)),gt=c(()=>E()>=100?E()*.1:0),bt=c(()=>{const e=Y().trim().toUpperCase();return e&&e==="JACARE10"?E()*.1:0}),Je=c(()=>Math.min(E(),gt()+bt())),Ke=c(()=>Math.max(0,E()-Je())),Be=c(()=>Ke()*.08),Qe=c(()=>he()===0||Y().trim().toUpperCase()==="SHIPFREE"||E()>=75?0:6.9),ft=c(()=>Ke()+Be()+Qe()),Ue=c(()=>he()===0),ie=c(()=>N(E())),Et=c(()=>N(Je())),pe=c(()=>N(Be())),me=c(()=>N(Qe())),ue=c(()=>N(ft()));function Nt(e){q.update(n=>n.find(t=>t.productId===e)?n.map(t=>t.productId===e?{...t,qty:t.qty+1}:t):[...n,{productId:e,qty:1}])}function ze(e,n){q.update(o=>o.map(t=>t.productId===e?{...t,qty:t.qty+n}:t).filter(t=>t.qty>0))}function vt(e){q.update(n=>n.filter(o=>o.productId!==e))}function yt(){q.set([]),Y.set("")}function wt(e){e.setAttribute("data-jacare-s","1ajdcqr"),ut("1ajdcqr",`[data-jacare-s="1ajdcqr"] .cart-layout {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
}
[data-jacare-s="1ajdcqr"] .product-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.65rem;
}
[data-jacare-s="1ajdcqr"] .product-card {
  display: grid;
  gap: 0.65rem;
  padding: 0.85rem;
  border: 1px solid #b8e0c4;
  border-radius: 12px;
  background: #f8fcf9;
}
[data-jacare-s="1ajdcqr"] .product-meta {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
}
[data-jacare-s="1ajdcqr"] .product-name {
  color: #003030;
}
[data-jacare-s="1ajdcqr"] .product-price {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: #189030;
}
[data-jacare-s="1ajdcqr"] .cart-line {
  flex-wrap: wrap;
}
[data-jacare-s="1ajdcqr"] .cart-line-info {
  display: grid;
  gap: 0.15rem;
  min-width: 8rem;
}
[data-jacare-s="1ajdcqr"] .cart-qty {
  font-size: 1rem;
  min-width: 1.5rem;
  text-align: center;
}
[data-jacare-s="1ajdcqr"] .cart-line-total {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: #003030;
  min-width: 4.5rem;
  text-align: right;
}
[data-jacare-s="1ajdcqr"] .cart-summary {
  margin: 0;
  display: grid;
  gap: 0.45rem;
}
[data-jacare-s="1ajdcqr"] .cart-summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  font-size: 0.9rem;
}
[data-jacare-s="1ajdcqr"] .cart-summary-row dt {
  margin: 0;
  color: #3d6b52;
}
[data-jacare-s="1ajdcqr"] .cart-summary-row dd {
  margin: 0;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: #003030;
}
[data-jacare-s="1ajdcqr"] .cart-summary-total {
  padding-top: 0.5rem;
  border-top: 1px solid #b8e0c4;
  font-size: 1.05rem;
}
[data-jacare-s="1ajdcqr"] .cart-summary-total dd {
  color: #189030;
  font-size: 1.25rem;
}
@media (max-width: 768px) {[data-jacare-s="1ajdcqr"] .cart-layout {
    grid-template-columns: 1fr;
  }
[data-jacare-s="1ajdcqr"] .cart-line {
    align-items: stretch;
  }
[data-jacare-s="1ajdcqr"] .cart-line .demo-row {
    flex-wrap: wrap;
    width: 100%;
  }
[data-jacare-s="1ajdcqr"] .cart-line-total {
    flex: 1 1 100%;
    text-align: left;
    margin-top: 0.25rem;
  }}`);const n=[],o=document.createDocumentFragment(),t=document.createElement("section");t.className="page";const G=document.createElement("div"),V=document.createElement("h1");V.className="section-title";const Ye=document.createTextNode("Shopping cart");V.appendChild(Ye),G.appendChild(V);const w=document.createElement("p");w.className="section-lead";const Ge=document.createTextNode("Add products, adjust quantities, and watch ");w.appendChild(Ge);const _e=document.createElement("code"),Ve=document.createTextNode("computed()");_e.appendChild(Ve),w.appendChild(_e);const We=document.createTextNode(`recalculate subtotal,
        discounts, tax, and shipping in real time.
      `);w.appendChild(We),G.appendChild(w),t.appendChild(G);const R=document.createElement("div");R.className="cart-layout";const Ce=document.createElement("div");R.appendChild(Ce);const Xe=k=>{const d=[],r=document.createElement("ul");r.className="product-grid";const v=document.createComment("each");return r.appendChild(v),d.push(Me({parent:r,anchor:v,items:()=>Oe,getKey:(l,M)=>l.id,render:(l,M,y)=>{const g=[],p=document.createElement("li");p.className="product-card";const s=document.createElement("div");s.className="product-meta";const u=document.createElement("strong");u.className="product-name";const S=document.createTextNode("");u.appendChild(S),g.push(x(()=>{S.data=String(l.name)}).dispose),s.appendChild(u);const L=document.createElement("span");L.className="product-price";const I=document.createTextNode("");L.appendChild(I),g.push(x(()=>{I.data=String(l.priceLabel)}).dispose),s.appendChild(L),p.appendChild(s);const h=document.createElement("div");h.className="demo-row";const j=document.createElement("div");h.appendChild(j);let b;le(()=>{b=ht(j,{text:l.tag})}),g.push(b);const _=document.createElement("button");_.className="btn btn-primary";const U=()=>Nt(l.id);g.push((_.addEventListener("click",U),()=>_.removeEventListener("click",U)));const z=document.createTextNode("Add");return _.appendChild(z),h.appendChild(_),p.appendChild(h),y(p),()=>{for(const H of g)H()}}})),k.appendChild(r),()=>{for(const l of d)l()}};let xe;le(()=>{xe=Re(Ce,{title:"Catalog",subtitle:"Click Add to put items in the cart",children:Xe})}),n.push(xe);const ge=document.createElement("div");R.appendChild(ge);const Ze=k=>{const d=[],r=document.createElement("div");r.className="demo-panel";const v=document.createElement("p");v.className="demo-label";const l=document.createTextNode("");v.appendChild(l),d.push(x(()=>{l.data=`${he()} items in cart`}).dispose),r.appendChild(v);const M=document.createComment("if");r.appendChild(M),d.push(_t(M,a=>{const we=[];if(Ue()){const i=document.createElement("p");i.className="demo-label";const K=document.createTextNode("Cart is empty — add something from the catalog.");i.appendChild(K),a(i)}else{const i=document.createElement("ul");i.className="list";const K=document.createComment("each");i.appendChild(K),we.push(Me({parent:i,anchor:K,items:()=>Pe(),getKey:(m,rt)=>m.productId,render:(m,rt,st)=>{const C=[],B=document.createElement("li");B.className="list-item cart-line";const Q=document.createElement("div");Q.className="cart-line-info";const ke=document.createElement("strong"),Se=document.createTextNode("");ke.appendChild(Se),C.push(x(()=>{Se.data=String(m.product.name)}).dispose),Q.appendChild(ke);const oe=document.createElement("span");oe.className="demo-label";const Le=document.createTextNode("");oe.appendChild(Le),C.push(x(()=>{Le.data=`${m.unitLabel} each`}).dispose),Q.appendChild(oe),B.appendChild(Q);const f=document.createElement("div");f.className="demo-row";const F=document.createElement("button");F.className="btn btn-outline";const Ie=()=>ze(m.productId,-1);C.push((F.addEventListener("click",Ie),()=>F.removeEventListener("click",Ie)));const lt=document.createTextNode("−");F.appendChild(lt),f.appendChild(F);const re=document.createElement("span");re.className="demo-value cart-qty";const Ae=document.createTextNode("");re.appendChild(Ae),C.push(x(()=>{Ae.data=String(m.qty)}).dispose),f.appendChild(re);const D=document.createElement("button");D.className="btn btn-outline";const Fe=()=>ze(m.productId,1);C.push((D.addEventListener("click",Fe),()=>D.removeEventListener("click",Fe)));const it=document.createTextNode("+");D.appendChild(it),f.appendChild(D);const se=document.createElement("span");se.className="cart-line-total";const De=document.createTextNode("");se.appendChild(De),C.push(x(()=>{De.data=String(m.totalLabel)}).dispose),f.appendChild(se);const $=document.createElement("button");$.className="btn btn-outline";const $e=()=>vt(m.productId);C.push(($.addEventListener("click",$e),()=>$.removeEventListener("click",$e)));const pt=document.createTextNode("Remove");return $.appendChild(pt),f.appendChild($),B.appendChild(f),st(B),()=>{for(const mt of C)mt()}}})),a(i)}return()=>{for(const i of we)i()}}));const y=document.createElement("label");y.className="demo-label";const g=document.createTextNode(`Coupon
            `);y.appendChild(g);const p=document.createElement("input");p.className="input",p.setAttribute("placeholder","Try JACARE10 or SHIPFREE"),d.push(xt(p,"value",Y)),y.appendChild(p),r.appendChild(y);const s=document.createElement("dl");s.className="cart-summary";const u=document.createElement("div");u.className="cart-summary-row";const S=document.createElement("dt"),L=document.createTextNode("Subtotal");S.appendChild(L),u.appendChild(S);const I=document.createElement("dd"),h=document.createTextNode("");I.appendChild(h);let j=ie.peek;h.data=String(j),d.push(ie.subscribe(()=>{const a=ie.peek;Object.is(a,j)||(j=a,h.data=String(a))})),u.appendChild(I),s.appendChild(u);const b=document.createElement("div");b.className="cart-summary-row";const _=document.createElement("dt"),U=document.createTextNode("Discount");_.appendChild(U),b.appendChild(_);const z=document.createElement("dd"),H=document.createTextNode("");z.appendChild(H),d.push(x(()=>{H.data=`−${Et()}`}).dispose),b.appendChild(z),s.appendChild(b);const O=document.createElement("div");O.className="cart-summary-row";const Ee=document.createElement("dt"),tt=document.createTextNode("Tax (8%)");Ee.appendChild(tt),O.appendChild(Ee);const Ne=document.createElement("dd"),X=document.createTextNode("");Ne.appendChild(X);let Z=pe.peek;X.data=String(Z),d.push(pe.subscribe(()=>{const a=pe.peek;Object.is(a,Z)||(Z=a,X.data=String(a))})),O.appendChild(Ne),s.appendChild(O);const P=document.createElement("div");P.className="cart-summary-row";const ve=document.createElement("dt"),nt=document.createTextNode("Shipping");ve.appendChild(nt),P.appendChild(ve);const ye=document.createElement("dd"),ee=document.createTextNode("");ye.appendChild(ee);let te=me.peek;ee.data=String(te),d.push(me.subscribe(()=>{const a=me.peek;Object.is(a,te)||(te=a,ee.data=String(a))})),P.appendChild(ye),s.appendChild(P);const J=document.createElement("div");J.className="cart-summary-row cart-summary-total";const je=document.createElement("dt"),at=document.createTextNode("Total");je.appendChild(at),J.appendChild(je);const Te=document.createElement("dd"),ne=document.createTextNode("");Te.appendChild(ne);let ae=ue.peek;ne.data=String(ae),d.push(ue.subscribe(()=>{const a=ue.peek;Object.is(a,ae)||(ae=a,ne.data=String(a))})),J.appendChild(Te),s.appendChild(J),r.appendChild(s);const A=document.createElement("div");A.className="demo-row";const T=document.createElement("button");T.className="btn btn-primary";const qe=yt;d.push((T.addEventListener("click",qe),()=>T.removeEventListener("click",qe))),T.setAttribute("disabled",String(Ue));const ct=document.createTextNode("Clear cart");T.appendChild(ct),A.appendChild(T);const ce=document.createElement("span");ce.className="pill";const dt=document.createTextNode("10% off orders over $100");ce.appendChild(dt),A.appendChild(ce);const de=document.createElement("span");de.className="pill";const ot=document.createTextNode("Free shipping over $75");return de.appendChild(ot),A.appendChild(de),r.appendChild(A),k.appendChild(r),()=>{for(const a of d)a()}};let be;le(()=>{be=Re(ge,{title:"Your cart",subtitle:"Live totals update as you shop",children:Ze})}),n.push(be),t.appendChild(R);const W=document.createElement("pre");W.className="code";const fe=document.createElement("code"),et=document.createTextNode(`const subtotal = computed(() =>
  lines().reduce((sum, line) => sum + line.lineTotal, 0))
const total = computed(() => taxable() + tax() + shipping())`);return fe.appendChild(et),W.appendChild(fe),t.appendChild(W),o.appendChild(t),e.appendChild(o),()=>{for(const k of n)k()}}function kt(e,n){const o=Ct(e,n);return()=>{for(const t of o)t()}}export{wt as default,wt as mount,kt as resume};
