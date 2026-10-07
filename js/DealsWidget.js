
import {UIComponent} from "./UIComponent.js";
import {coverUrl} from "./data.js";

export class DealsWidget extends UIComponent{
 constructor(){super({id:"deals",title:"Выгодная находка",icon:"↘",className:"deals-widget"})}

 render(){const el=this.shell();this.load();return el}

 status(msg,retry=false){
  const b=this.body();
  b.replaceChildren();
  const s=document.createElement("div");
  s.className="status";
  s.textContent=msg;
  b.append(s);
  if(retry){
   const x=document.createElement("button");
   x.className="soft-btn retry";
   x.textContent="Попробовать ещё";
   this.listen(x,"click",()=>this.load());
   b.append(x);
  }
 }

 async load(){
  this.controllers.forEach(c=>c.abort());
  this.controllers.clear();
  this.status("Ищем хорошую скидку…");
  const controller=this.controller();

  try{
   const response=await fetch(
    "https://www.cheapshark.com/api/1.0/deals?storeID=1&pageSize=12&sortBy=DealRating&onSale=1&steamRating=80",
    {signal:controller.signal}
   );
   if(!response.ok) throw new Error(`HTTP ${response.status}`);

   const data=await response.json();
   if(!Array.isArray(data)||!data.length){
    this.status("Сейчас ничего интересного не нашлось.");
    return;
   }

   const deal=data[Math.floor(Math.random()*Math.min(data.length,8))];
   const b=this.body();
   b.replaceChildren();

   const card=document.createElement("div");
   card.className="api-card deal-card";

   const media=document.createElement("div");
   media.className="media-frame deal-media";
   const imageUrl=coverUrl(deal.steamAppID)||deal.thumb||"";
   if(imageUrl){
    const img=document.createElement("img");
    img.className="natural-game-image";
    img.src=imageUrl;
    img.alt=`Обложка ${deal.title}`;
    img.loading="lazy";
    media.append(img);
   }else{
    const fallback=document.createElement("div");
    fallback.className="natural-image-placeholder";
    fallback.textContent="🎮";
    media.append(fallback);
   }

   const h=document.createElement("h3");
   h.className="api-title";
   h.textContent=deal.title;

   const meta=document.createElement("div");
   meta.className="api-meta";
   const rating=deal.steamRatingPercent ? ` · Steam ${deal.steamRatingPercent}%` : "";
   meta.textContent=`$${deal.salePrice} вместо $${deal.normalPrice} · скидка ${Math.round(Number(deal.savings))}%${rating}`;

   const btn=document.createElement("button");
   btn.className="primary-btn";
   btn.textContent="↻ Другая находка";
   this.listen(btn,"click",()=>this.load());

   const note=document.createElement("div");
   note.className="source-note";
   note.textContent="Данные: CheapShark API";

   card.append(media,h,meta,btn,note);
   b.append(card);
  }catch(error){
   if(error.name!=="AbortError"){
    this.status("Не удалось загрузить скидки. Остальная часть сайта продолжает работать.",true);
   }
  }
 }
}
