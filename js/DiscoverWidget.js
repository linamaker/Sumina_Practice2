import {UIComponent} from "./UIComponent.js";

const platformOptions=[
 ["pc","PC"],
 ["steam","Steam"],
 ["epic-games-store","Epic Games"],
 ["gog","GOG"]
];

const safeUrl=value=>{
 try{
  const url=new URL(value);
  return ["http:","https:"].includes(url.protocol)?url.href:"";
 }catch{return ""}
};

export class DiscoverWidget extends UIComponent{
 constructor(){
  super({id:"discover",title:"Бесплатно сейчас",icon:"✧",className:"discover-widget"});
  this.platform="pc";
  this.currentIndex=0;
  this.items=[];
 }

 render(){
  const el=this.shell(),b=this.body();
  b.id="discover";

  const select=document.createElement("select");
  select.className="select";
  select.setAttribute("aria-label","Платформа для бесплатных игр");
  platformOptions.forEach(([value,label])=>{
   const option=document.createElement("option");
   option.value=value;
   option.textContent=label;
   select.append(option);
  });
  select.value=this.platform;
  this.listen(select,"change",()=>{
   this.platform=select.value;
   this.currentIndex=0;
   this.load();
  });

  const hint=document.createElement("p");
  hint.className="discover-hint";
  hint.textContent="Только активные раздачи полных игр — без вечного free-to-play каталога.";

  const result=document.createElement("div");
  result.className="discover-result";
  result.style.marginTop="10px";
  this.result=result;

  b.append(select,hint,result);
  this.load();
  return el;
 }

 showStatus(message,retry=false){
  this.result.replaceChildren();
  const status=document.createElement("div");
  status.className="status";
  status.textContent=message;
  this.result.append(status);
  if(retry){
   const button=document.createElement("button");
   button.className="soft-btn retry";
   button.textContent="Попробовать ещё";
   this.listen(button,"click",()=>this.load());
   this.result.append(button);
  }
 }

 renderItem(item){
  this.result.replaceChildren();
  const card=document.createElement("div");
  card.className="api-card giveaway-card";

  const imageUrl=safeUrl(item.image)||safeUrl(item.thumbnail);
  if(imageUrl){
   const img=document.createElement("img");
   img.className="api-thumb";
   img.src=imageUrl;
   img.alt="";
   img.loading="lazy";
   card.append(img);
  }

  const badges=document.createElement("div");
  badges.className="hero-meta giveaway-badges";
  ["Бесплатно",item.platforms,item.worth&&item.worth!=="N/A"?`обычно ${item.worth}`:null]
   .filter(Boolean)
   .slice(0,3)
   .forEach(text=>{
    const badge=document.createElement("span");
    badge.className="pill";
    badge.textContent=text;
    badges.append(badge);
   });

  const title=document.createElement("h3");
  title.className="api-title";
  title.textContent=item.title||"Игра без названия";

  const description=document.createElement("p");
  description.className="api-copy";
  description.textContent=item.description||"Сейчас эту игру можно забрать бесплатно.";

  const meta=document.createElement("div");
  meta.className="giveaway-meta";
  const pieces=[];
  if(item.end_date && item.end_date!=="N/A") pieces.push(`до ${item.end_date}`);
  if(item.users) pieces.push(`${Number(item.users).toLocaleString("ru-RU")} забрали`);
  meta.textContent=pieces.join(" · ") || "Активная раздача";

  const actions=document.createElement("div");
  actions.className="giveaway-actions";

  const next=document.createElement("button");
  next.type="button";
  next.className="soft-btn";
  next.textContent="↻ Ещё";
  this.listen(next,"click",()=>{
   if(!this.items.length)return;
   this.currentIndex=(this.currentIndex+1)%this.items.length;
   this.renderItem(this.items[this.currentIndex]);
  });
  actions.append(next);

  const giveawayUrl=safeUrl(item.open_giveaway_url)||safeUrl(item.gamerpower_url);
  if(giveawayUrl){
   const open=document.createElement("a");
   open.className="primary-link";
   open.href=giveawayUrl;
   open.target="_blank";
   open.rel="noopener noreferrer";
   open.textContent="Забрать ↗";
   actions.append(open);
  }

  const note=document.createElement("div");
  note.className="source-note";
  const label=document.createTextNode("Данные: ");
  const source=document.createElement("a");
  source.href="https://www.gamerpower.com/";
  source.target="_blank";
  source.rel="noopener noreferrer";
  source.textContent="GamerPower";
  note.append(label,source);

  card.append(badges,title,description,meta,actions,note);
  this.result.append(card);
 }

 async load(){
  this.controllers.forEach(controller=>controller.abort());
  this.controllers.clear();
  this.showStatus("Проверяем свежие раздачи…");
  const controller=this.controller();

  try{
   const endpoint=`https://www.gamerpower.com/api/giveaways?platform=${encodeURIComponent(this.platform)}&type=game&sort-by=popularity`;
   const response=await fetch(endpoint,{signal:controller.signal});
   if(!response.ok && response.status!==201) throw new Error(`HTTP ${response.status}`);

   const raw=await response.text();
   let data=[];
   if(raw.trim()){
    const parsed=JSON.parse(raw);
    if(Array.isArray(parsed)) data=parsed;
   }

   this.items=data.filter(item=>item?.status!=="Expired").slice(0,30);
   if(!this.items.length){
    this.showStatus("Прямо сейчас для этой платформы активных раздач полных игр не нашлось.");
    return;
   }

   this.currentIndex=Math.min(this.currentIndex,this.items.length-1);
   this.renderItem(this.items[this.currentIndex]);
  }catch(error){
   if(error.name!=="AbortError"){
    this.showStatus("Не удалось получить свежие раздачи. Остальные блоки продолжают работать.",true);
   }
  }
 }
}
