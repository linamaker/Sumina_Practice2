
import {GAMES} from "./data.js";

const KEY="cozy-yard-v5";
const defaultLibrary = GAMES.slice(0,5).map(game => ({...game}));

const defaults={
  filters:{party:"group",time:"long",mood:"survive"},
  favoriteIds:["valheim","stardew"],
  libraryGames:defaultLibrary,
  extraGames:[],
  plans:[],
  activeWidgets:["library","recommendation","reason","evening","deals","discover","plans"],
  currentGame:"valheim"
};

const clone = value => JSON.parse(JSON.stringify(value));

export function loadState(){
  let stored={};
  try{ stored=JSON.parse(localStorage.getItem(KEY)||"{}") }
  catch{ stored={} }

  const state={...clone(defaults),...stored};

  // Migration from the previous v5 shape.
  if(!Array.isArray(stored.libraryGames)){
    state.libraryGames=clone(defaultLibrary);
    if(Array.isArray(stored.extraGames)){
      stored.extraGames.forEach((title,index)=>{
        if(typeof title==="string" && title.trim()){
          state.libraryGames.push({
            id:`manual-${Date.now()}-${index}`,
            title:title.trim(),
            genre:"Добавлено вручную",
            source:"manual"
          });
        }
      });
    }
  }

  if(!Array.isArray(state.favoriteIds)) state.favoriteIds=[];
  if(!Array.isArray(state.plans)) state.plans=[];
  if(!Array.isArray(state.activeWidgets)) state.activeWidgets=clone(defaults.activeWidgets);
  return state;
}

export function saveState(s){localStorage.setItem(KEY,JSON.stringify(s))}
