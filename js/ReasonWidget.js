
import {UIComponent} from "./UIComponent.js";

const plainText=value=>{
 const doc=new DOMParser().parseFromString(String(value||""),"text/html");
 return (doc.body.textContent||"").replace(/\s+/g," ").trim();
};

export class ReasonWidget extends UIComponent{
 constructor(state){
  super({id:"reason",title:"Об игре",icon:"⌁",className:"reason-widget"});
  this.state=state;
  this.game=null;
  this.descriptionController=null;
  this.requestVersion=0;
 }

 render(){
  const el=this.shell();
  this.draw();
  return el;
 }

 setGame(game){
  this.game=game;
  this.requestVersion+=1;
  this.descriptionController?.abort();
  this.draw();
  if(game?.appId && game.source==="cheapshark") this.loadSteamDescription(game,this.requestVersion);
 }

 draw(description){
  if(!this.root)return;
  const b=this.body();
  b.replaceChildren();

  if(!this.game){
   const s=document.createElement("div");
   s.className="status";
   s.textContent="Добавь игры в библиотеку — и здесь появится описание выбранной игры.";
   b.append(s);
   return;
  }

  const title=document.createElement("h3");
  title.className="about-game-title";
  title.textContent=this.game.title;

  const meta=document.createElement("div");
  meta.className="about-game-meta";
  meta.textContent=this.game.genre && this.game.genre!=="Добавлено через поиск"
   ? this.game.genre
   : "Из твоей библиотеки";

  const text=document.createElement("p");
  text.className="about-game-copy";
  text.textContent=description || this.game.blurb ||
   "Эта игра добавлена через поиск. Подробное описание пока недоступно, но она уже участвует в подборе на вечер.";

  b.append(title,meta,text);

  if(this.game.appId){
   const link=document.createElement("a");
   link.className="about-steam-link";
   link.href=`https://store.steampowered.com/app/${encodeURIComponent(this.game.appId)}/`;
   link.target="_blank";
   link.rel="noopener noreferrer";
   link.textContent="Открыть страницу в Steam ↗";
   b.append(link);
  }
 }

 async loadSteamDescription(game,version){
  this.descriptionController=this.controller();
  const controller=this.descriptionController;

  try{
   const endpoint=`https://store.steampowered.com/api/appdetails?appids=${encodeURIComponent(game.appId)}&l=russian&cc=ru`;
   const response=await fetch(endpoint,{signal:controller.signal});
   if(!response.ok) throw new Error(`HTTP ${response.status}`);
   const payload=await response.json();

   if(version!==this.requestVersion || this.game?.id!==game.id) return;

   const entry=payload?.[String(game.appId)];
   const description=plainText(entry?.data?.short_description);
   const genres=entry?.data?.genres?.map(item=>item.description).filter(Boolean).slice(0,3);

   if(genres?.length){
    game.genre=genres.join(" · ");
    this.onMetadataChange?.();
   }

   if(description){
    game.blurb=description;
    this.onMetadataChange?.();
    this.draw(description);
   }
  }catch(error){
   // The local/fallback description stays visible if Steam blocks the browser request.
   if(error.name!=="AbortError" && version===this.requestVersion) this.draw();
  }finally{
   this.controllers.delete(controller);
   if(this.descriptionController===controller) this.descriptionController=null;
  }
 }

 destroy(){
  this.descriptionController?.abort();
  super.destroy();
 }
}
