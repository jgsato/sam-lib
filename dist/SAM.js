(function(a,b){"object"==typeof exports&&"undefined"!=typeof module?module.exports=b():"function"==typeof define&&define.amd?define(b):(a=a||self,a.tp=b())})(this,function(){'use strict';var b=Math.floor,c=Number.isNaN;function a(a={}){const{max:b}=d(a.timetravel),{hasAsyncActions:e=!0,instanceName:j="global",synchronize:k=!1,clone:m=!1,requestStateRepresentation:c}=a,{synchronizeInterval:o=5}=d(k);let p;const r=new w(j),s=(a=[],b=[],c=r)=>b.map(b=>a.push(b(c)));let u;const x=[({__error:a})=>{a&&(0>a.stack.indexOf("AssertionError")?r.__error=a:(console.log("--------------------------------------"),console.log(a)))}],B=[()=>{r.hasNext(!!p&&p.hasNext())}],C=[];let D=a=>a.flush(),E=a=>a.flush(),F=E;const G=()=>{try{B.forEach(z),C.map(z).reduce(l,!1)||D(m?r.clone():r),r.renderNextTime()}catch(a){if(0>a.stack.indexOf("AssertionError"))setTimeout(()=>K({__error:a}),0);else throw a}},H=a=>{if(i(a.__name)){const b=a.__name;delete a.__name;const c=r.__formatBehavior?r.__formatBehavior(b,a,r):`${b}(${y(a)}) ==> ${y(r)}`;r.__behavior.push(c)}},I=a=>{if(a.__startTime){if(a.__startTime<=r.__lastProposalTimestamp)return!1;a.__startTime=r.__lastProposalTimestamp}return!0},J={_queue:[],_rendering:!1,add(a){this._queue.push(a)},synchronize(a){const b=this;return this._interval=setInterval(async()=>{if(!b._rendering&&0<b._queue.length){b._rendering=!0;const[c]=b._queue.slice(0,1);b._queue.shift(),c.__rendering=b._rendering,await a(...c),b._rendering=!1}},o),(...a)=>J.add(a)},clear(){clearInterval(this._interval)}};let K=k?async(a,b)=>{I(a)&&(r.resetEventQueue(),await Promise.all(x.map((await A(a)))),H(a),G(),b&&b())}:(a,b)=>{I(a)&&(x.forEach(A(a)),H(a),G(),b&&b())};k&&(K=J.synchronize(K));const L=(a={})=>{r.update(a),p&&p.snap(r,0),r.resetBehavior()},M=(a=[])=>a.map(a=>b=>()=>{const c=a.expression(b);return!!c&&(b.log({error:{name:a.name,model:b}}),p&&(b.update(p.last()),D(b)),!0)}),N=b=>(!r.__blockUnexpectedActions&&0===r.allowedActions().length||r.allowedActions().map(c=>"string"==typeof c?c===b.__actionName:c===b).reduce(l,!1))&&!r.disallowedActions().map(c=>"string"==typeof c?c===b.__actionName:c===b).reduce(l,!1),O=a=>{i(a.name)&&r.setComponentState(a)},P=(a={})=>{const{ignoreOutdatedProposals:c=!1,debounce:j=0,retry:b}=a.options||{};b&&(b.max=h(b.max),b.delay=g(b.delay));const k=j;O(a),u=e?f(a.actions).map(a=>{let e=!1,f=0;if("object"==typeof a){const b=a.label||a[0],c=i(a)&&i(a[2])?a[2].id:void 0;a=a.action||a[1],a.__actionName=b,a.__stateMachineId=c}const g=async(...h)=>{const i=new Date().getTime();if(N(a)){if(0<k&&e)return void(e=!d(h[0]).__resetDebounce);let j={};try{j=await a(...h),j.__actionName=a.__actionName,j.__stateMachineId=a.__stateMachineId}catch(a){if(b)return f+=1,void(f<b.max&&setTimeout(()=>g(...h),b.delay));if(0>a.stack.indexOf("AssertionError"))j.__error=a;else throw a}c&&(j.__startTime=i);try{N(a)&&(K(j),f=0)}catch(a){if(0>a.stack.indexOf("AssertionError"))K({__error:a});else throw a}0<k&&(e=!0,setTimeout(()=>g({__resetDebounce:!0}),k))}};return g.__actionName=a.__actionName,g.__stateMachineId=a.__stateMachineId,g}):f(a.actions).map(a=>(...b)=>{try{if(N(a)){const c=a(...b);K(c)}else K({__error:`unexpected action ${a.__actionName||""}`})}catch(a){if(0>a.stack.indexOf("AssertionError"))K({__error:a});else throw a}}),s(x,a.acceptors,a.localState),s(B,a.reactors,a.localState),s(C,M(a.safety),a.localState),s(C,a.naps,a.localState)},Q=a=>{const b=b=>{b.flush&&b.flush(),a&&a(b)};D=p?n(b,a=>p?p.snap(a):a):b,E=a},R=a=>{r.setLogger(a)},S=a=>{p=new t(a,{max:b}),r.hasNext(p.hasNext()),r.resetBehavior(),D=n(E,a=>p?p.snap(a):a)},T=(a={})=>{let b={};i(p)&&(a.reset&&(a.index=0,r.__behavior=[]),b=a.next?p.next():a.endOfTime?p.last():p.travel(a.index)),D(Object.assign(r,b))},U=({begin:b={},end:a})=>{const{render:c}=b;i(c)&&(F=D,D=c),i(a)&&(D=F)},V=({actions:a=[],clear:b=!1})=>(b&&r.clearAllowedActions(),0<a.length&&r.addAllowedActions(a),r.__allowedActions),W=([a,b])=>v.on(a,b);return({initialState:a,component:b,render:c,history:d,travel:e,logger:f,check:g,allowed:h,clearInterval:i,event:j})=>(u=[],q(d,S).on(a,L).on(b,P).on(c,Q).on(e,T).on(f,R).on(g,U).on(h,V).on(i,()=>J.clear()).on(j,W),{hasNext:r.hasNext(),hasError:r.hasError(),errorMessage:r.errorMessage(),error:r.error(),intents:u,state:a=>r.state(a,m)})}const d=(a,b={})=>a&&"object"==typeof a?a:b,f=(a,b=[])=>a&&Array.isArray(a)?a:b,g=(a,b=0)=>c(a)?b:a,h=(a,b=1)=>0===a||c(a)?0===b?1:b:a,j=(a,b=()=>null)=>a||b,k=(a=[])=>a[0],l=(a,b)=>a||b,m=(a,b)=>a&&b,n=(a,b)=>c=>a(b(c)),o=a=>Array.isArray(a)?a.map(o).reduce(m,!0):!0===a||null!==a&&a!==void 0,e=(a,b)=>{switch(typeof a){case"string":return"string"==typeof b&&a.includes(b);case"object":return Array.isArray(a)?a.includes(b):"string"==typeof b&&o(a[b]);}return a===b},i=(a,b)=>o(a)&&o(b)?e(a,b):o(a),p=(a,b,c=!0)=>(o(a)&&c&&b(a),r(o(a))),q=(a,b,c=!0)=>(o(a)&&c&&b(a),{on:q}),r=(a=!0)=>({oneOf:a?()=>r():p}),s=a=>{const b=a.__components;delete a.__components;const d=JSON.parse(JSON.stringify(a));return b&&(d.__components=[],0<b.length&&b.forEach(a=>{delete a.parent,d.__components.push(Object.assign(s(a),{parent:d}))})),d};class t{constructor(a=[],b={}){this.currentIndex=0,this.history=a,this.max=b.max}snap(a,b){const c=s(a);return b?this.history[b]=c:(this.history.push(c),this.max&&this.history.length>this.max&&this.history.shift()),a}travel(a=0){return this.currentIndex=a,this.history[a]}next(){return this.history[this.currentIndex++]}hasNext(){return i(this.history[this.currentIndex])}last(){return this.currentIndex=this.history.length-1,this.history[this.currentIndex]}}const u={};var v={on:(a,b)=>{i(u[a])||(u[a]=[]),u[a].push(b)},off:(a,b)=>{f(u[a]).forEach((c,d)=>{c===b&&u[a].splice(d,1)})},emit:(a=[],b)=>{Array.isArray(a)?a.forEach(a=>f(u[a]).forEach(a=>a(b))):f(u[a]).forEach(a=>a(b))}};class w{constructor(a){this.__components={},this.__behavior=[],this.__name=a,this.__lastProposalTimestamp=0,this.__allowedActions=[],this.__disallowedActions=[],this.__eventQueue=[]}localState(a){return i(a)?this.__components[a]:{}}hasError(){return i(this.__error)}error(){return this.__error||void 0}errorMessage(){return d(this.__error).message}clearError(){return delete this.__error}allowedActions(){return this.__allowedActions}disallowedActions(){return this.__disallowedActions}clearAllowedActions(){this.__allowedActions=[]}clearDisallowedActions(){this.__disallowedActions=[]}addAllowedActions(b){this.__allowedActions.push(b)}addDisallowedActions(b){this.__disallowedActions.push(b)}allow(b){this.__allowedActions=this.__allowedActions.concat(b)}resetBehavior(){this.__behavior=[]}update(a={}){Object.assign(this,a)}setComponentState(a){this.__components[a.name]=Object.assign(d(a.localState),{parent:this}),a.localState=a.localState||this.__components[a.name]}hasNext(a){return i(a)&&(this.__hasNext=a),this.__hasNext}continue(){return!0===this.__continue}renderNextTime(){delete this.__continue}doNotRender(){this.__continue=!0}setLogger(a){this.__logger=a}log({trace:a,info:b,warning:c,error:d,fatal:e}){this.logger&&p(a,this.logger.trace(a)).oneOf(b,this.logger.info(b)).oneOf(c,this.logger.waring(c)).oneOf(d,this.logger.error(c)).oneOf(e,this.logger.fatal(c))}prepareEvent(a,b){this.__eventQueue.push([a,b])}resetEventQueue(){this.__eventQueue=[]}flush(){!1===this.continue()&&(f(this.__eventQueue).forEach(([a,b])=>v.emit(a,b)),this.__eventQueue=[])}clone(a=this){const b=a.__components;delete a.__components;const d=JSON.parse(JSON.stringify(a));return b&&(d.__components={},Object.keys(b).forEach(a=>{const e=b[a];delete e.parent,d.__components[a]=Object.assign(this.clone(e),{parent:d})})),d}state(a,b){const c=a=>i(this[a])?this[a]:i(this.__components[a])?this.__components[a]:this;let d;return d=Array.isArray(a)?a.map(a=>c(a)):c(a),b&&d?this.clone(d):d}}const x=(a,b)=>b?JSON.stringify(a,null,4):JSON.stringify(a),y=(a={},b=!1)=>{const c=Object.keys(a);return`${c.map(c=>"string"==typeof c?0===c.indexOf("__")?"":x(a[c],b):"").filter(a=>""!==a).join(", ")}`},z=a=>a(),A=b=>async c=>c(b),B=a();var C=(a=B)=>({addInitialState:b=>a({initialState:b}),addComponent:b=>a({component:b}),setRender:b=>{if(Array.isArray(b)){const[a,c]=b;b=b=>a("function"==typeof c?c(b):b)}a({render:j(b)})},addHandler:(b,c)=>a({event:[b,c]}),getIntents:b=>a({component:{actions:b}}),addAcceptors:(b,c)=>a({component:{acceptors:b,privateModel:c}}),addReactors:(b,c)=>a({component:{reactors:b,privateModel:c}}),addNAPs:(b,c)=>a({component:{naps:b,privateModel:c}}),addSafetyConditions:(b,c)=>a({component:{safety:b,privateModel:c}}),hasError:()=>a({}).hasError,allow:b=>a({allowed:{actions:b}}),clearAllowedActions:()=>a({allowed:{clear:!0}}),allowedActions:()=>a({allowed:{}}),addTimeTraveler:(b=[])=>a({history:b}),travel:(b=0)=>a({travel:{index:b}}),next:()=>a({travel:{next:!0}}),last:()=>a({travel:{endOfTime:!0}}),hasNext:()=>a({}).hasNext,reset:b=>b?a({initialState:b}):a({travel:{reset:!0}}),beginCheck:b=>a({check:{begin:{render:b}}}),endCheck:()=>a({check:{end:!0}})});const D=(a,b,c,d,e,f)=>{const g=[];return 0===b.length?a.forEach(a=>{if(0<f.length){const b=f.map(b=>a.name!==b).reduce(m,!0);b&&g.push([a])}else g.push([a])}):b.forEach(b=>a.forEach(a=>{const c=b.concat([a]);e?b[b.length-1]!==a&&g.push(c):g.push(c)})),c++,c<d?D(a,g,c,d,e,f):g.filter(a=>a.length===d)},E=a=>{const c=a.map(a=>f(d(a).values).length),e=c.map((a,b)=>{let d=1;for(let e=b;e<c.length;e++)d*=c[e];return d}),g=c.reduce((a,b)=>a*b,1);if(0===g)throw new Error("Checker: invalid dataset, one of the intents values has no value.\nIf an intent has no parameter, add an empty array to its values");return{increment:a=>e.map((d,f)=>f===e.length-1?a%c[f]:b(a/e[f+1])%c[f]),kmax:g}},F=(a=[],b,c)=>{a.forEach(a=>{let d=0;const{increment:e,kmax:f}=E(a);do{const f=e(d++),g=a.map((a,b)=>a.values[f[b]]);b(),c([]),a.forEach((a,b)=>a.intent(...g[b]))}while(d<f)})},{addInitialState:G,addComponent:H,setRender:I,addSafetyConditions:J,getIntents:K,addAcceptors:L,addReactors:M,addNAPs:N}=C();var O={SAM:B,createInstance:a,api:C,addInitialState:G,addComponent:H,addAcceptors:L,addReactors:M,addNAPs:N,addSafetyConditions:J,getIntents:K,setRender:I,step:()=>({}),doNotRender:a=>()=>!0===a.continue(),first:k,match:(a,b)=>k(a.map((a,c)=>a?b[c]:null).filter(o)),on:q,oneOf:p,utils:{O:d,A:f,N:g,NZ:h,S:(a,b="")=>a&&"string"==typeof a?a:b,F:j,E:i,or:l,and:m,log:a=>(...b)=>{console.log(b),a(...b)}},events:{on:v.on,off:v.off,emit:v.emit},checker:({instance:a,initialState:f={},intents:g=[],reset:b,liveness:c,safety:d,options:e},h=()=>null,j=()=>null)=>{const{beginCheck:k,endCheck:l}=C(a),{depthMax:n=5,noDuplicateAction:o=!1,doNotStartWith:p=[],format:m}=e,[q,r]=a({component:{actions:[a=>({__behavior:a}),a=>({__setFormatBehavior:a})],acceptors:[a=>({__behavior:b})=>{i(b)&&(a.__behavior=b)},a=>({__setFormatBehavior:b})=>{i(b)&&(a.__formatBehavior=b)}]}}).intents;r(m);const s=[];return k(a=>{c&&c(a)&&(s.push({liveness:a.__behavior}),h(a.__behavior)),d&&d(a)&&(s.push({safety:a.__behavior}),j(a.__behavior))}),F(D(g,[],0,n,o,p),()=>b(f),q),l(),s}};return O});