'use strict';
// Original teaching model: controllable promises, no network, timers or dependencies.
function deferred(){let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};}
function createSearch(load){
  let generation=0,disposed=false;
  const state={query:'',results:[],loading:false,error:null};
  const history=[];
  const publish=()=>history.push(structuredClone(state));
  async function search(value){
    if(disposed)return;
    const current=++generation;
    const query=String(value).trim();
    Object.assign(state,{query,results:[],error:null,loading:Boolean(query)});publish();
    if(!query)return;
    try{
      const results=await load(query);
      if(disposed||current!==generation)return;
      if(!Array.isArray(results))throw new TypeError('Expected an array');
      state.results=results;
    }catch(error){
      if(disposed||current!==generation)return;
      state.error=error instanceof Error?error.message:'Search failed';
    }finally{
      if(!disposed&&current===generation){state.loading=false;publish();}
    }
  }
  function dispose(){disposed=true;++generation;state.loading=false;}
  return {state,history,search,dispose};
}
async function reproduceBug(){
  const old=deferred(),recent=deferred();let shown=[];
  const oldTask=old.promise.then(data=>{shown=data;});
  const recentTask=recent.promise.then(data=>{shown=data;});
  recent.resolve(['Berlin']);await recentTask;const intermediate=[...shown];
  old.resolve(['Bonn']);await oldTask;
  return {intermediate,final:shown};
}
module.exports={deferred,createSearch,reproduceBug};
