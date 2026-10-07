
import {UIComponent} from "./UIComponent.js";
export class PlansWidget extends UIComponent{
 constructor(state,onChange){super({id:"plans",title:"Игровые планы",icon:"✓",className:"plans-widget"});this.state=state;this.onChange=onChange}
 render(){const el=this.shell(),b=this.body();b.id="plans";
  const form=document.createElement("form");form.className="plans-form";form.innerHTML=`<input class="text-input" placeholder="Например: добить босса…" aria-label="Новый игровой план"><button class="square-btn">+</button>`;
  const list=document.createElement("div");list.className="todo-list";b.append(form,list);
  const draw=()=>{list.replaceChildren();if(!this.state.plans.length){const s=document.createElement("div");s.className="status";s.textContent="Пока пусто. Можно записать цель на следующий игровой вечер.";list.append(s)}
   this.state.plans.forEach((t,i)=>{const row=document.createElement("div");row.className=`todo ${t.done?"done":""}`;const cb=document.createElement("input");cb.type="checkbox";cb.checked=t.done;const span=document.createElement("span");span.textContent=t.text;const del=document.createElement("button");del.textContent="×";del.setAttribute("aria-label","Удалить");
    this.listen(cb,"change",()=>{t.done=cb.checked;this.onChange();draw()});this.listen(del,"click",()=>{this.state.plans.splice(i,1);this.onChange();draw()});row.append(cb,span,del);list.append(row)})};
  this.listen(form,"submit",e=>{e.preventDefault();const inp=form.querySelector("input");const v=inp.value.trim();if(v){this.state.plans.push({text:v,done:false});inp.value="";this.onChange();draw()}});
  draw();return el
 }
}
