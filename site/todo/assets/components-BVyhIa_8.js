import{a as B,g as v,r as $}from"./index-D_K-KuAo.js";import{c as H,m as J}from"./Field-CDg_JgxE.js";import{c as L}from"./topics-CN__0wQI.js";import{m as O}from"./LessonNav-D5-tj-y_.js";import{r as R}from"./index-DXhhABGW.js";const F=L("components"),z=H({title:{value:"Jacaré field",validate:n=>n.trim()?void 0:"Required"}}),j="export <view>",G=`// Field.jcr
${j}
  <label class="field">
    <span>\${label}</span>
    <input bind-value=\${field} />
  </label>
</view>`,I=`import Field from './Field.jcr'

${j}
  <Field
    :label=\${'Title'}
    :field=\${form.fields.title}
    :type=\${'text'}
    :placeholder=\${'Enter a title'}
  />
</view>`;function X(n){n.setAttribute("data-jacare-s","744fhv");const t=[],o=document.createDocumentFragment(),e=document.createElement("section");e.className="page tutorial-lesson";const c=document.createElement("a");c.className="text-link",c.setAttribute("jacare-go","/tutorial"),c.setAttribute("href",String(B("/tutorial")));const k=document.createTextNode("← Tutorial");c.appendChild(k),e.appendChild(c);const p=document.createElement("h2");p.className="page-title";const w=document.createTextNode("Components");p.appendChild(w),e.appendChild(p);const a=document.createElement("p");a.className="lead";const y=document.createTextNode("PascalCase tags compile to function calls. Props use the ");a.appendChild(y);const f=document.createElement("code"),D=document.createTextNode(":");f.appendChild(D),a.appendChild(f);const A=document.createTextNode("prefix.");a.appendChild(A),e.appendChild(a);const l=document.createElement("article");l.className="lesson";const i=document.createElement("h3");i.className="lesson-heading";const S=document.createTextNode("Define a component");i.appendChild(S),l.appendChild(i);const r=document.createElement("pre");r.className="code-block";const C=document.createElement("code"),_=document.createTextNode("");C.appendChild(_),t.push(v(()=>{_.data=String(G)}).dispose),r.appendChild(C),l.appendChild(r),e.appendChild(l);const d=document.createElement("article");d.className="lesson";const m=document.createElement("h3");m.className="lesson-heading";const P=document.createTextNode("Use it");m.appendChild(P),d.appendChild(m);const u=document.createElement("pre");u.className="code-block";const x=document.createElement("code"),N=document.createTextNode("");x.appendChild(N),t.push(v(()=>{N.data=String(I)}).dispose),u.appendChild(x),d.appendChild(u),e.appendChild(d);const s=document.createElement("article");s.className="lesson";const h=document.createElement("h3");h.className="lesson-heading";const U=document.createTextNode("Live demo");h.appendChild(U),s.appendChild(h);const E=document.createElement("div");s.appendChild(E);let g;$(()=>{g=J(E,{label:"Title",field:z.fields.title,type:"text",placeholder:"Try typing here"})}),t.push(g),e.appendChild(s);const T=document.createElement("div");e.appendChild(T);let b;return $(()=>{b=O(T,{prev:F.prev,next:F.next})}),t.push(b),o.appendChild(e),n.appendChild(o),()=>{for(const q of t)q()}}function Y(n,t){const o=R(n,t);return()=>{for(const e of o)e()}}export{X as default,X as mount,Y as resume};
