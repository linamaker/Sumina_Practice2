
import {loadState,saveState} from "./js/state.js";
import {Dashboard} from "./js/Dashboard.js";

const state=loadState();
const persist=()=>saveState(state);
const dashboard=new Dashboard(document.querySelector("#dashboard"),state,persist);
dashboard.render();

const labels={
 library:["Моя библиотека","Свои игры и избранное"],
 recommendation:["Сегодня играем?","Главная рекомендация на вечер"],
 reason:["Об игре","Описание выбранной игры"],
 evening:["Какой сегодня вечер?","Фильтры рекомендации"],
 deals:["Выгодная находка","Скидки из CheapShark"],
 discover:["Бесплатно сейчас","Актуальные игровые раздачи из GamerPower"],
 plans:["Игровые планы","Тематический ToDo"]
};

const dialog=document.querySelector("#widgetDialog"),choices=document.querySelector("#widgetChoices");
function drawChoices(){
 choices.replaceChildren();
 Object.entries(labels).forEach(([id,[name,desc]])=>{
  const b=document.createElement("button");b.type="button";b.className="choice";b.disabled=dashboard.instances.has(id);
  const strong=document.createElement("strong");strong.textContent=name;const small=document.createElement("small");small.textContent=b.disabled?"Уже на странице":desc;b.append(strong,small);
  b.addEventListener("click",()=>{dashboard.addWidget(id);dialog.close();drawChoices()});choices.append(b)
 })
}
document.querySelector("#addWidgetBtn").addEventListener("click",()=>{drawChoices();dialog.showModal()});

document.querySelectorAll("[data-scroll]").forEach(btn=>btn.addEventListener("click",()=>{
 const map={dashboard:"#dashboard",library:"#library",discover:"#discover",plans:"#plans"};
 document.querySelector(map[btn.dataset.scroll]||"#dashboard")?.scrollIntoView({behavior:"smooth",block:"center"})
}));
