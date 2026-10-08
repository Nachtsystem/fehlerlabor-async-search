'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {deferred,createSearch,reproduceBug}=require('./search-lab.cjs');
test('The flawed search really overwrites the newer result',async()=>{
  assert.deepEqual(await reproduceBug(),{intermediate:['Berlin'],final:['Bonn']});
});
test('Latest intent survives both completion orders',async()=>{
  for(const newerFirst of [true,false]){
    const a=deferred(),b=deferred(),lab=createSearch(q=>q==='bo'?a.promise:b.promise);
    const first=lab.search('bo'),second=lab.search('ber');
    if(newerFirst){b.resolve(['Berlin']);await second;a.resolve(['Bonn']);await first;}
    else{a.resolve(['Bonn']);await first;assert.equal(lab.state.loading,true);b.resolve(['Berlin']);await second;}
    assert.deepEqual(lab.state,{query:'ber',results:['Berlin'],loading:false,error:null});
  }
});
test('An obsolete failure cannot remove the current spinner or add an error',async()=>{
  const a=deferred(),b=deferred(),lab=createSearch(q=>q==='old'?a.promise:b.promise);
  const first=lab.search('old'),second=lab.search('new');a.reject(new Error('obsolete'));await first;
  assert.equal(lab.state.loading,true);assert.equal(lab.state.error,null);
  b.resolve(['new result']);await second;assert.deepEqual(lab.state.results,['new result']);
});
test('Clearing input invalidates a running request without starting another',async()=>{
  const a=deferred();let calls=0;const lab=createSearch(()=>{++calls;return a.promise;});
  const task=lab.search('old');await lab.search('  ');a.resolve(['obsolete']);await task;
  assert.equal(calls,1);assert.deepEqual(lab.state,{query:'',results:[],loading:false,error:null});
});
test('Disposal prevents asynchronous publication and subsequent new loads',async()=>{
  const a=deferred();let calls=0;const lab=createSearch(()=>{++calls;return a.promise;});
  const task=lab.search('old');lab.dispose();const count=lab.history.length;a.resolve(['obsolete']);await task;
  await lab.search('new');assert.equal(calls,1);assert.equal(lab.history.length,count);assert.deepEqual(lab.state.results,[]);
});
test('The current failure is displayed and the next search recovers',async()=>{
  const lab=createSearch(q=>q==='bad'?Promise.reject(new Error('Current failure')):Promise.resolve(['Recovered']));
  await lab.search('bad');assert.equal(lab.state.error,'Current failure');assert.equal(lab.state.loading,false);
  await lab.search('good');assert.equal(lab.state.error,null);assert.deepEqual(lab.state.results,['Recovered']);
});
test('Invalid payload becomes a current error rather than unchecked data',async()=>{
  const lab=createSearch(()=>Promise.resolve({results:[]}));await lab.search('query');
  assert.equal(lab.state.error,'Expected an array');assert.equal(lab.state.loading,false);
});
