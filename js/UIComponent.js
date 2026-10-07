
export class UIComponent {
  constructor({id,title,icon="",className=""}){
    if(new.target===UIComponent) throw new Error("UIComponent — базовый класс");
    this.id=id; this.title=title; this.icon=icon; this.className=className;
    this.root=null; this.cleanups=[]; this.controllers=new Set();
  }
  shell(){
    const section=document.createElement("section");
    section.className=`widget ${this.className}`; section.dataset.widgetId=this.id;
    section.innerHTML=`<header class="widget-head"><h2 class="widget-title"><span aria-hidden="true">${this.icon}</span>${this.title}</h2><div class="widget-actions"><button data-min aria-label="Свернуть">−</button><button data-close aria-label="Убрать блок">×</button></div></header><div class="widget-body"></div>`;
    const min=section.querySelector("[data-min]"), close=section.querySelector("[data-close]");
    this.listen(min,"click",()=>{section.dataset.minimized=section.dataset.minimized!=="true";min.textContent=section.dataset.minimized==="true"?"+":"−"});
    this.listen(close,"click",()=>this.onRequestRemove?.(this.id));
    this.root=section; return section;
  }
  body(){return this.root.querySelector(".widget-body")}
  listen(el,event,fn,opts){el.addEventListener(event,fn,opts);this.cleanups.push(()=>el.removeEventListener(event,fn,opts))}
  controller(){const c=new AbortController();this.controllers.add(c);return c}
  destroy(){this.cleanups.forEach(fn=>fn());this.controllers.forEach(c=>c.abort());this.cleanups=[];this.controllers.clear();this.root?.remove()}
}
