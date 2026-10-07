
import {UIComponent} from "./UIComponent.js";
import {gameImage, normalizeLibraryGame} from "./data.js";

export class LibraryWidget extends UIComponent{
  constructor(state,onChange,onLibraryChange){
    super({id:"library",title:"Моя библиотека",icon:"🎮",className:"library-widget"});
    this.state=state;
    this.onChange=onChange;
    this.onLibraryChange=onLibraryChange;
    this.searchController=null;
    this.searchTimer=null;
    this.justAddedId=null;
  }

  render(){
    const el=this.shell(), b=this.body();
    b.id="library";

    const list=document.createElement("div");
    list.className="list library-list";
    b.append(list);

    const searchWrap=document.createElement("div");
    searchWrap.className="library-search";

    const searchLine=document.createElement("div");
    searchLine.className="library-search-line";

    const input=document.createElement("input");
    input.className="text-input";
    input.placeholder="Найти игру по названию…";
    input.autocomplete="off";
    input.setAttribute("aria-label","Поиск игры");

    const clear=document.createElement("button");
    clear.className="square-btn search-clear";
    clear.type="button";
    clear.textContent="×";
    clear.setAttribute("aria-label","Очистить поиск");

    const popover=document.createElement("div");
    popover.className="search-popover";
    popover.hidden=true;

    searchLine.append(input,clear);
    searchWrap.append(searchLine,popover);
    b.append(searchWrap);

    const renderList=()=>{
      list.replaceChildren();

      if(!this.state.libraryGames.length){
        const empty=document.createElement("div");
        empty.className="library-empty";
        empty.innerHTML="<strong>Библиотека пока пустая</strong><span>Начни вводить название игры ниже — найдём её и добавим красивой карточкой.</span>";
        list.append(empty);
        return;
      }

      this.state.libraryGames.forEach(raw=>{
        const game=normalizeLibraryGame(raw);
        const row=document.createElement("article");
        row.className="game-row library-card";
        if(this.justAddedId===game.id) row.classList.add("is-new");

        const imageBox=document.createElement("div");
        imageBox.className="game-cover-wrap";
        const image=gameImage(game);
        if(image){
          const img=document.createElement("img");
          img.src=image;
          img.alt="";
          img.loading="lazy";
          img.addEventListener("error",()=>imageBox.classList.add("no-image"),{once:true});
          imageBox.append(img);
        } else {
          imageBox.classList.add("no-image");
        }

        const txt=document.createElement("div");
        txt.className="game-row-copy";
        const st=document.createElement("strong");
        st.textContent=game.title;
        const sm=document.createElement("small");
        sm.textContent=game.genre || "Из твоей библиотеки";
        txt.append(st,sm);

        const actions=document.createElement("div");
        actions.className="library-row-actions";

        const fav=document.createElement("button");
        fav.className="heart";
        fav.type="button";
        fav.setAttribute("aria-label",`Добавить ${game.title} в избранное`);
        const isFav=this.state.favoriteIds.includes(game.id);
        fav.textContent=isFav?"♥":"♡";
        fav.classList.toggle("is-fav",isFav);

        const del=document.createElement("button");
        del.className="delete-game";
        del.type="button";
        del.textContent="×";
        del.setAttribute("aria-label",`Удалить ${game.title} из библиотеки`);

        this.listen(fav,"click",()=>{
          const i=this.state.favoriteIds.indexOf(game.id);
          i>=0?this.state.favoriteIds.splice(i,1):this.state.favoriteIds.push(game.id);
          this.onChange();
          renderList();
        });

        this.listen(del,"click",()=>{
          this.state.libraryGames=this.state.libraryGames.filter(item=>item.id!==game.id);
          this.state.favoriteIds=this.state.favoriteIds.filter(id=>id!==game.id);
          if(this.state.currentGame===game.id) this.state.currentGame=null;
          this.onChange();
          renderList();
          this.onLibraryChange?.();
        });

        actions.append(fav,del);
        row.append(imageBox,txt,actions);
        list.append(row);
      });

      this.justAddedId=null;
    };

    const setPopoverMessage=(message,kind="status")=>{
      popover.replaceChildren();
      const box=document.createElement("div");
      box.className=`search-message ${kind}`;
      box.textContent=message;
      popover.append(box);
      popover.hidden=false;
    };

    const addFromResult=result=>{
      const id=`cheap-${result.gameID}`;
      const duplicate=this.state.libraryGames.some(game =>
        game.id===id ||
        (result.steamAppID && Number(game.appId)===Number(result.steamAppID)) ||
        game.title?.toLowerCase()===result.external?.toLowerCase()
      );

      if(duplicate){
        setPopoverMessage("Эта игра уже есть в библиотеке ♥","success");
        return;
      }

      const game={
        id,
        gameID:result.gameID,
        title:result.external,
        appId:result.steamAppID ? Number(result.steamAppID) : null,
        thumb:result.thumb || "",
        genre:"Добавлено через поиск",
        source:"cheapshark",
        party:["solo","duo","group"],
        time:["quick","medium","long"],
        mood:[]
      };

      this.state.libraryGames.push(game);
      this.justAddedId=id;
      this.onChange();
      renderList();
      this.onLibraryChange?.();

      input.value="";
      popover.replaceChildren();
      const done=document.createElement("div");
      done.className="search-message success";
      done.textContent=`✓ ${game.title} добавлена в библиотеку`;
      popover.append(done);
      popover.hidden=false;
      setTimeout(()=>{ if(!input.value) popover.hidden=true },1300);
    };

    const renderResults=results=>{
      popover.replaceChildren();

      if(!results.length){
        setPopoverMessage("Ничего не нашлось. Попробуй написать название по-английски.");
        return;
      }

      const caption=document.createElement("div");
      caption.className="search-caption";
      caption.textContent="Выбери игру";
      popover.append(caption);

      results.slice(0,6).forEach(result=>{
        const button=document.createElement("button");
        button.type="button";
        button.className="search-result";

        const cover=document.createElement("div");
        cover.className="search-result-cover";
        if(result.thumb){
          const img=document.createElement("img");
          img.src=result.thumb;
          img.alt="";
          img.loading="lazy";
          cover.append(img);
        }

        const copy=document.createElement("div");
        const title=document.createElement("strong");
        title.textContent=result.external;
        const meta=document.createElement("small");
        const bits=[];
        if(result.cheapest) bits.push(`от $${result.cheapest}`);
        if(result.steamAppID) bits.push("есть в Steam");
        meta.textContent=bits.join(" · ") || "игра из каталога";
        copy.append(title,meta);

        const plus=document.createElement("span");
        plus.className="search-result-plus";
        plus.textContent="+";

        button.append(cover,copy,plus);
        this.listen(button,"click",()=>addFromResult(result));
        popover.append(button);
      });

      popover.hidden=false;
    };

    const doSearch=async query=>{
      if(this.searchController) this.searchController.abort();
      this.searchController=this.controller();
      setPopoverMessage("Ищем игру…","loading");

      try{
        const url=`https://www.cheapshark.com/api/1.0/games?title=${encodeURIComponent(query)}&limit=6`;
        const response=await fetch(url,{signal:this.searchController.signal});
        if(!response.ok) throw new Error(`HTTP ${response.status}`);
        const data=await response.json();
        renderResults(Array.isArray(data)?data:[]);
      }catch(error){
        if(error.name!=="AbortError"){
          setPopoverMessage("Каталог сейчас не ответил. Попробуй ещё раз чуть позже.","error");
        }
      }
    };

    this.listen(input,"input",()=>{
      clearTimeout(this.searchTimer);
      const query=input.value.trim();

      if(query.length<2){
        if(this.searchController) this.searchController.abort();
        popover.hidden=true;
        popover.replaceChildren();
        return;
      }

      this.searchTimer=setTimeout(()=>doSearch(query),320);
    });

    this.listen(input,"focus",()=>{
      if(input.value.trim().length>=2 && popover.childElementCount) popover.hidden=false;
    });

    this.listen(clear,"click",()=>{
      input.value="";
      if(this.searchController) this.searchController.abort();
      popover.hidden=true;
      input.focus();
    });

    this.listen(document,"click",event=>{
      if(!searchWrap.contains(event.target)) popover.hidden=true;
    });

    renderList();
    return el;
  }

  destroy(){
    clearTimeout(this.searchTimer);
    this.searchController?.abort();
    super.destroy();
  }
}
