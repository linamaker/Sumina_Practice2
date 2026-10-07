import {LibraryWidget} from "./LibraryWidget.js";
import {RecommendationWidget} from "./RecommendationWidget.js";
import {ReasonWidget} from "./ReasonWidget.js";
import {EveningWidget} from "./EveningWidget.js";
import {DealsWidget} from "./DealsWidget.js";
import {DiscoverWidget} from "./DiscoverWidget.js";
import {PlansWidget} from "./PlansWidget.js";

export class Dashboard{
 constructor(root,state,onChange){
  this.root=root;
  this.state=state;
  this.onChange=onChange;
  this.instances=new Map();
  this.order=["library","recommendation","reason","evening","deals","discover","plans"];
 }

 registry(){
  return {
   library:()=>new LibraryWidget(this.state,this.onChange,()=>this.libraryChanged()),
   recommendation:()=>new RecommendationWidget(this.state,this.onChange),
   reason:()=>new ReasonWidget(this.state),
   evening:()=>new EveningWidget(this.state,this.onChange,()=>this.applyFilters()),
   deals:()=>new DealsWidget(),
   discover:()=>new DiscoverWidget(),
   plans:()=>new PlansWidget(this.state,this.onChange)
  };
 }

 insertAtPlannedPlace(type,node){
  const targetIndex=this.order.indexOf(type);
  const laterNode=[...this.root.children].find(child=>{
   const childType=child.dataset.widgetId;
   return this.order.indexOf(childType)>targetIndex;
  });
  if(laterNode) this.root.insertBefore(node,laterNode);
  else this.root.append(node);
 }

 addWidget(type){
  if(this.instances.has(type))return;
  const factory=this.registry()[type];
  if(!factory)return;
  const widget=factory();
  widget.onRequestRemove=id=>this.removeWidget(id);
  this.instances.set(type,widget);
  const node=widget.render();
  this.insertAtPlannedPlace(type,node);
  if(!this.state.activeWidgets.includes(type)){
   this.state.activeWidgets.push(type);
   this.onChange();
  }
  this.wire();
 }

 removeWidget(type){
  this.instances.get(type)?.destroy();
  this.instances.delete(type);
  this.state.activeWidgets=this.state.activeWidgets.filter(item=>item!==type);
  this.onChange();
 }

 render(){
  this.root.replaceChildren();
  this.instances.clear();
  this.order.filter(type=>this.state.activeWidgets.includes(type)).forEach(type=>this.addWidget(type));
  this.wire();
 }

 wire(){
  const rec=this.instances.get("recommendation");
  const reason=this.instances.get("reason");
  if(rec&&reason){
   rec.onRecommended=game=>reason.setGame(game);
   const current=rec.library?.().find(game=>game.id===this.state.currentGame);
   reason.setGame(current||null);
  }
 }

 libraryChanged(){
  const rec=this.instances.get("recommendation");
  if(rec) rec.refresh();
  else this.instances.get("reason")?.draw();
 }

 applyFilters(){
  this.instances.get("reason")?.draw();
  this.instances.get("recommendation")?.refresh();
 }
}
