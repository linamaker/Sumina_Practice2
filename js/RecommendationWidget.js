
import {UIComponent} from "./UIComponent.js";
import {gameImage,normalizeLibraryGame} from "./data.js";

export class RecommendationWidget extends UIComponent{
  constructor(state,onChange){
    super({id:"recommendation",title:"Сегодня играем?",icon:"✦",className:"recommendation-widget"});
    this.state=state;
    this.onChange=onChange;
  }

  library(){
    return (this.state.libraryGames||[]).map(normalizeLibraryGame);
  }

  score(game){
    const f=this.state.filters;
    const moodScore=game.mood?.length ? (game.mood.includes(f.mood)?4:0) : 3;
    return (game.party.includes(f.party)?4:0)+
      (game.time.includes(f.time)?3:0)+
      moodScore+
      (this.state.favoriteIds.includes(game.id)?1:0);
  }

  pick(exclude){
    const games=this.library();
    if(!games.length) return null;

    const ranked=games.map(game=>({game,score:this.score(game)})).sort((a,b)=>b.score-a.score);
    const best=ranked[0].score;
    const pool=ranked
      .filter(item=>item.score>=best-1)
      .map(item=>item.game)
      .filter(game=>game.id!==exclude);

    return pool[Math.floor(Math.random()*pool.length)] || ranked[0].game;
  }

  render(){
    const el=this.shell();
    const draw=game=>{
      const b=this.body();
      b.replaceChildren();

      if(!game){
        const empty=document.createElement("div");
        empty.className="recommend-empty";
        const icon=document.createElement("div");
        icon.className="recommend-empty-icon";
        icon.textContent="🎮";
        const h=document.createElement("h3");
        h.textContent="Сначала добавь пару игр";
        const p=document.createElement("p");
        p.textContent="Библиотека пустая, поэтому выбирать пока не из чего. Найди игру слева — и она сразу сможет участвовать в подборе.";
        empty.append(icon,h,p);
        b.append(empty);
        this.onRecommended?.(null);
        return;
      }

      const image=gameImage(game);
      const media=document.createElement("div");
      media.className="media-frame recommendation-media";
      if(image){
        const img=document.createElement("img");
        img.className="natural-game-image";
        img.src=image;
        img.alt=`Обложка ${game.title}`;
        img.loading="lazy";
        media.append(img);
      }else{
        const art=document.createElement("div");
        art.className="natural-image-placeholder";
        art.textContent="🎮";
        media.append(art);
      }
      b.append(media);

      const meta=document.createElement("div");
      meta.className="hero-meta";
      (game.genre||"Из библиотеки").split(" · ").forEach(label=>{
        const pill=document.createElement("span");
        pill.className="pill";
        pill.textContent=label;
        meta.append(pill);
      });

      const h=document.createElement("h3");
      h.className="hero-name";
      h.textContent=game.title;

      const p=document.createElement("p");
      p.className="hero-copy";
      p.textContent=game.blurb;

      const btn=document.createElement("button");
      btn.className="primary-btn";
      btn.textContent="↻ Подобрать другую";
      this.listen(btn,"click",()=>{
        const next=this.pick(game.id);
        if(!next) return;
        this.state.currentGame=next.id;
        this.onChange();
        draw(next);
        this.onRecommended?.(next);
      });

      b.append(meta,h,p,btn);
      this.onRecommended?.(game);
    };

    const games=this.library();
    const current=games.find(game=>game.id===this.state.currentGame) || this.pick();
    if(current && this.state.currentGame!==current.id){
      this.state.currentGame=current.id;
      this.onChange();
    }
    draw(current);

    this.refresh=()=>{
      const next=this.pick();
      this.state.currentGame=next?.id||null;
      this.onChange();
      draw(next);
      this.onRecommended?.(next);
    };

    return el;
  }
}
