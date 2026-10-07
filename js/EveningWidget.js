
import {UIComponent} from "./UIComponent.js";
export class EveningWidget extends UIComponent{
 constructor(state,onChange,onFilter){super({id:"evening",title:"Какой сегодня вечер?",icon:"◉",className:"evening-widget"});this.state=state;this.onChange=onChange;this.onFilter=onFilter}
 render(){
  const el=this.shell(),b=this.body();el.querySelector("[data-close]").remove();
  b.innerHTML=`<div class="filter-grid">
   <div class="filter-block"><h3>Количество игроков</h3><div class="segment" data-kind="party">
    <button data-value="solo">Одна</button><button data-value="duo">Вдвоём</button><button data-value="group">Компания</button>
   </div></div>
   <div class="filter-block"><h3>Сколько времени?</h3><div class="segment" data-kind="time">
    <button data-value="quick">До 30 мин</button><button data-value="medium">1–2 часа</button><button data-value="long">Весь вечер</button>
   </div></div>
   <div class="filter-block"><h3>Настроение</h3><div class="mood-grid" data-kind="mood">
    <button data-value="relax">Расслабиться</button><button data-value="survive">Выживать</button><button data-value="build">Строить</button>
    <button data-value="explore">Исследовать</button><button data-value="laugh">Поржать</button><button data-value="suffer">Пострадать</button>
   </div></div>
  </div>`;
  const update=()=>b.querySelectorAll("[data-kind]").forEach(group=>group.querySelectorAll("button").forEach(btn=>btn.classList.toggle("is-active",this.state.filters[group.dataset.kind]===btn.dataset.value)));
  update();
  b.querySelectorAll("[data-kind] button").forEach(btn=>this.listen(btn,"click",()=>{const g=btn.closest("[data-kind]");this.state.filters[g.dataset.kind]=btn.dataset.value;this.onChange();update();this.onFilter()}));
  return el;
 }
}
