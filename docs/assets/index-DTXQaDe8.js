const __vite__fileDeps=["./index-BRPZfaMA.js","./vendor-G6F9539m.js","./antd-deps-DFfZDYn9.js","./StickyHeader-DQFqK3uo.js","./antd-YYL4R1sS.js","./mathjs-DmADWV5u.js","./index-C9ZdwULu.js","./chartjs-6CJBGIh6.js","./index-BNUuy9lw.js"],__vite__mapDeps=i=>i.map(i=>__vite__fileDeps[i]);
import{ak as S,aC as _n,aD as kn,at as On,aE as $n,aF as l,r as s,aG as Dn,aH as An,aI as f,aJ as n,aK as j,aL as In,aM as Rn,aN as Mn,aO as Sn,aP as Bn,aQ as Qt,aR as Nn,aS as Pn,aT as vt,aU as zn,aV as Ln,aW as Yn,aX as Pe,aY as Hn,aZ as Jt,a_ as Fn,C as Kn,a$ as Et,i as Gn,b0 as Un,b1 as Wn,b2 as jn,b3 as qn,b4 as Xn,b5 as Zn,b6 as Vn,b7 as Rt,b8 as Oe,b9 as Qn,ba as Jn,bb as ea,bc as ta,bd as na}from"./vendor-G6F9539m.js";import{F as Re,B as Ue,a as K,D as Mt,T as Ct,S as J,b as en,c as et,d as aa,I as ra,M as tn,e as oa,f as We,s as sa,E as ia,g as Ee,h as ca,A as la,i as da,C as pa}from"./antd-YYL4R1sS.js";import{c as ua,e as ma}from"./mathjs-DmADWV5u.js";import"./antd-deps-DFfZDYn9.js";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))i(o);new MutationObserver(o=>{for(const r of o)if(r.type==="childList")for(const c of r.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&i(c)}).observe(document,{childList:!0,subtree:!0});function a(o){const r={};return o.integrity&&(r.integrity=o.integrity),o.referrerPolicy&&(r.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?r.credentials="include":o.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function i(o){if(o.ep)return;o.ep=!0;const r=a(o);fetch(o.href,r)}})();S.extend(_n);S.extend(kn);S.extend(On);S.extend($n);S.locale("zh-tw");S.tz.setDefault();const je={KEYBOARD_TEXT_MEALS_HEIGHT:"190px",KEYBOARD_TEXT_MIN_HEIGHT:"250px",ORDER_CARD_WIDTH:"260px"},fa="linear-gradient(to right, #33ceea 0%, #ffd194  51%, #33ceea  100%)",ha="radial-gradient(circle, #ffd194 0%, #33ceea 100%);",ga="0px",ba="1.5rem",ya="2rem",xa=".2rem",nn=".9rem",an=".85rem",St="1rem",Ca="1.1rem",Bt="250px",Nt="190px",rn="284px";function on(e="all",t=1){return`${e} ${t}s cubic-bezier(0.075, 0.82, 0.165, 1)`}function wa(e=0){return`calc(100vw - ${e}px);`}function Tt(e=0){return`calc(100vh - ${e}px - ${ga});`}function va(e={}){const{width:t="200px",height:a="200px",innerWidth:i="150px",innerHeight:o="150px",rtColor:r="#F4D8DD",rbColor:c="#C9DDE7",lbColor:u="#F3EFE6",ltColor:d="#D5EAE5"}=e;return`
    width: ${t};
    height: ${a};
    display: flex;
    flex-direction: column;
    align-content: center;
    justify-content: center;
    position: relative;
    &::before {
      content: '';
      position: absolute;
      left: 0;
      width: ${t};
      height: ${a};
      border-radius: 50%;
      z-index: -1;
      background: radial-Gradient(
          circle at calc(50% + (50% - 0.625em) * 1)
            calc(50% + (50% - 0.625em) * 0),
          ${r} calc(0.625em - 1px),
          transparent 0.625em
        ),
        radial-Gradient(
          circle at calc(50% + (50% - 0.625em) * 0)
            calc(50% + (50% - 0.625em) * 1),
          ${c} calc(0.625em - 1px),
          transparent 0.625em
        ),
        radial-Gradient(
          circle at calc(50% + (50% - 0.625em) * -1)
            calc(50% + (50% - 0.625em) * 0),
          ${u} calc(0.625em - 1px),
          transparent 0.625em
        ),
        radial-Gradient(
          circle at calc(50% + (50% - 0.625em) * 0)
            calc(50% + (50% - 0.625em) * -1),
          ${d} calc(0.625em - 1px),
          transparent 0.625em
        ),
        conic-Gradient(
          ${r} 0% 90deg,
          ${c} 0% 180deg,
          ${u} 0% 270deg,
          ${d} 0% 360deg
        );
      background-origin: border-box;
      mask: radial-Gradient(
        closest-side,
        red calc(100% - 1.25em - 0.75em - 1px),
        transparent calc(100% - 1.25em - 0.75em) calc(100% - 1.25em),
        red calc(100% - 1.25em + 1px) calc(100% - 1px),
        transparent
      );
    }
    .ant-statistic {
      background-color: #fff;
      border-radius: 50%;
      margin: auto;
      display: flex;
      flex-direction: column;
      flex-wrap: wrap;
      width: ${i};
      height: ${o};
      justify-content: center;
    }
  `}const Ea=l`
  * {
    margin: 0;
  }
  :root {
    font-family: -apple-system, BlinkMacSystemFont, Inter, 'Segoe UI', Roboto,
      'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji',
      'Segoe UI Emoji', 'Segoe UI Symbol';
    line-height: 1.5;
    font-weight: 400;

    color-scheme: light dark;
    color: #213547;
    background-color: #fff;
    font-size: 16px;

    font-synthesis: none;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  .resta--hidden-scroll {
    overflow: hidden;
  }

  a {
    font-weight: 500;
    color: #646cff;
    text-decoration: inherit;

    &:hover {
      color: #535bf2;
    }
  }

  body {
    margin: 0;
    min-width: 320px;
    min-height: 100vh;
    /* background-color: #fff; */ // move it to root instead, otherwise the circle style of statistics will be gone
  }

  h1 {
    font-size: 3.2em;
    line-height: 1.1;
  }

  small {
    font-size: 0.8rem;
  }

  .ant-btn {
    &.ant-btn-primary {
      text-shadow: 0 0 5px #beb7b7;
    }

    &.ant-btn-default {
    }

    &.ant-btn-text {
      padding: 1.1rem;
      border-radius: 9999px;
      vertical-align: middle;

      &:not(:disabled):not(.ant-btn-disabled) {
        color: #404756;
        &:active,
        &:focus {
          color: #0a7ea4;
          background: #e6f7ff;
        }
      }
    }
  }

  .ant-picker-dropdown {
    .ant-picker-footer-extra:not(:last-child) {
      border-bottom: none;
    }
  }

  .ant-picker-ok,
  .ant-picker-now {
    .ant-btn-primary,
    .ant-picker-now-btn {
      padding: 1.1rem;
      border-radius: 9999px;
      vertical-align: middle;
      background: #ffffff;
      box-shadow: none;
      border: none;
      text-shadow: none;

      &:not(:disabled):not(.ant-btn-disabled) {
        color: #404756;
        &:hover {
          background: #23272f0d;
          box-shadow: none;
        }
        &:active,
        &:focus {
          color: #0a7ea4;
          background: #e6f7ff;
        }
      }
    }
  }

  .ant-picker-now {
    padding-block: 2px;
    .ant-picker-now-btn {
      padding: 0.7rem 1rem;
      vertical-align: middle;
    }
  }

  .ant-switch {
    transition: ${on()};

    width: 80px;
    font-size: 1rem;
    height: 30px;
    line-height: 30px;
    vertical-align: text-top;

    .ant-switch-handle {
      top: 5px;
    }

    .ant-switch-inner {
      > span {
        font-size: 1rem !important;
      }
      .ant-switch-inner-unchecked {
        margin-top: -30px;
      }
    }

    &.ant-switch-checked {
      background: ${fa};
      background-size: 200% auto;
      &:hover:not(.ant-switch-disabled) {
        background: ${ha};
      }
    }
    .ant-switch-inner {
      text-shadow: 0 0 10px #636060;
    }
  }

  .ant-drawer {
    & > .ant-drawer-content-wrapper {
      box-shadow:
        -6px 0 16px 0 transparent,
        -3px 0 6px -4px transparent,
        -9px 0 28px 8px rgba(0, 0, 0, 0.05);
    }

    .ant-drawer-mask {
      background: #ffffffca;
    }

    .ant-drawer-body {
      padding: 1rem;
    }

    .ant-drawer-header-title {
      flex-direction: row-reverse;
    }

    .ant-drawer-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }

  .ant-modal {
    .ant-modal-confirm-content {
      font-size: 1rem;
    }
  }

  .ant-modal-root {
    .ant-modal-mask {
      background: #ffffffca;
    }
  }

  .ant-divider {
    margin: 8px 0;
  }

  .ant-input-affix-wrapper .ant-input-clear-icon {
    font-size: 1rem;
  }

  .ant-select .ant-select-clear {
    font-size: 1rem;
    margin-top: -8px;
  }

  .ant-notification {
    .ant-notification-notice-wrapper {
      .ant-notification-notice {
        &-success {
          .ant-notification-notice-progress {
            &::-webkit-progress-value {
              background: #52c41a;
            }
          }
        }
        &-error {
          .ant-notification-notice-progress {
            &::-webkit-progress-value {
              background: #ff4d4f;
            }
          }
        }
        &-warning {
          .ant-notification-notice-progress {
            &::-webkit-progress-value {
              background: #faad14;
            }
          }
        }
      }

      .ant-notification-notice-message {
        font-size: 1.12rem !important;
        font-weight: 500;
        line-height: 1.2;
        margin-bottom: 1rem;
      }

      .ant-notification-notice-description {
        font-size: 1rem !important;
        font-weight: normal;
        color: #444;

        small {
          margin-top: 10px;
          display: block;
        }
      }
    }
    &.ant-notification-topRight {
      .ant-notification-notice-wrapper {
        top: -20px;
        right: 32px;
      }
    }
  }

  .ant-float-btn {
    z-index: 1001;
  }

  .ant-float-btn-group {
    height: min-content;
  }

  @media (prefers-color-scheme: light) {
    :root {
      color: #213547;
      /* background-color: #ffffff; */
    }
    a:hover {
      color: #747bff;
    }
    button {
      background-color: #f9f9f9;
    }
  }

  @media (prefers-color-scheme: dark) {
    :root {
      color: #213547;
      /* background-color: #ffffff; */
    }
  }

  /* PWA: It targets only the app used with a system icon in all mode */
  @media (display-mode: standalone),
    (display-mode: fullscreen),
    (display-mode: minimal-ui) {
    * {
      user-select: none;
    }
    // stop browser-refreshing when scrolling down to bottom
    body {
      overscroll-behavior-y: contain;
    }
  }
`,Ta=`linear-gradient(to right, #2bc0e4 0%, #eaecc6 51%, #2bc0e4 100%);
    background-size: 200% auto;
    border-radius: 10px;
  `,_a={primaryColor:"#fff",colorPrimary:Ta,colorPrimaryHover:`'?';
    background-position: center;
    box-shadow: 0 0 20px #eee;
  `,colorPrimaryActive:`'?';
    background-position: center;
    box-shadow: 0 0 20px #eee;
  `,textHoverBg:"#23272f0d"},ka={Button:_a},Oa="modulepreload",$a=function(e,t){return new URL(e,t).href},Pt={},ut=function(t,a,i){let o=Promise.resolve();if(a&&a.length>0){const r=document.getElementsByTagName("link"),c=document.querySelector("meta[property=csp-nonce]"),u=(c==null?void 0:c.nonce)||(c==null?void 0:c.getAttribute("nonce"));o=Promise.all(a.map(d=>{if(d=$a(d,i),d in Pt)return;Pt[d]=!0;const m=d.endsWith(".css"),h=m?'[rel="stylesheet"]':"";if(!!i)for(let k=r.length-1;k>=0;k--){const A=r[k];if(A.href===d&&(!m||A.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${d}"]${h}`))return;const C=document.createElement("link");if(C.rel=m?"stylesheet":Oa,m||(C.as="script",C.crossOrigin=""),C.href=d,u&&C.setAttribute("nonce",u),document.head.appendChild(C),m)return new Promise((k,A)=>{C.addEventListener("load",k),C.addEventListener("error",()=>A(new Error(`Unable to preload CSS for ${d}`)))})}))}return o.then(()=>t()).catch(r=>{const c=new Event("vite:preloadError",{cancelable:!0});if(c.payload=r,window.dispatchEvent(c),!c.defaultPrevented)throw r})},Da=s.memo(()=>{Dn();const e=An(),t=s.useRef();s.useRef();const a=s.useCallback(o=>{o.preventDefault();const{url:r}=o.currentTarget.dataset;e(r)},[e]),i=s.useCallback(()=>{window.location.reload()},[]);return f(j,{children:[n("div",{id:"resta-header-observer",ref:t}),f(Re.Group,{trigger:"click",style:{right:10,top:10,zIndex:1001},icon:n(In,{}),placement:"bottom",children:[n(Re,{"data-url":"/",icon:n(Rn,{}),onClick:a}),n(Re,{"data-url":"/order-list",icon:n(Mn,{}),onClick:a}),n(Re,{"data-url":"/statistics",icon:n(Sn,{}),onClick:a}),n(Re,{"data-url":"/settings",icon:n(Bn,{}),onClick:a}),n(Re,{icon:n(Qt,{}),onClick:i})]})]})}),Aa=l`
  /* width: 100vw; */
`,Ia=()=>f(j,{children:[n(Da,{}),n("main",{css:Aa,children:n(Nn,{})})]}),tt={MAIN_DISH_TYPE:"main-dish",NO_NEED_SOUP_KEYWORDS:["沙拉"],AUTO_SHOW_ORDER_LIST:!0,SHOW_SOUPS_NUMBER:!0,KEYBOARD_SUBMIT_BTN_TEXT:"送單"},Ra=[[{label:"7",meta:"7"},{label:"8",meta:"8"},{label:"9",meta:"9"},{label:"加蛋",meta:"+15|加蛋"}],[{label:"4",meta:"4"},{label:"5",meta:"5"},{label:"6",meta:"6"},{label:"加菜",meta:"+15|加菜"}],[{label:"1",meta:"1"},{label:"2",meta:"2"},{label:"3",meta:"3"},{label:"",meta:"*",icon:"CloseOutlined"}],[{label:".",meta:"."},{label:"0",meta:"0"},{label:"",meta:"+",icon:"PlusOutlined"},{label:"",meta:"Backspace",icon:"SwapLeftOutlined"}]],ce=[{type:"main-dish",label:"🍱 餐盒",color:"green",typeID:"1"},{type:"à-la-carte",label:"🍖 單點",color:"brown",typeID:"2"},{type:"others",label:"🧃 飲料|水餃",color:"indigo",typeID:"3"}],sn=[{type:ce[0].type,label:ce[0].label,color:ce[0].color,items:[{name:"油淋雞腿飯",price:130,priority:1},{name:"炸雞腿飯",price:120,priority:2},{name:"滷雞腿飯",price:120,priority:3},{name:"魚排飯",price:110,priority:4},{name:"排骨飯",price:110,priority:5},{name:"焢肉飯",price:110,priority:6},{name:"蒜泥白肉飯",price:110,priority:7},{name:"京醬肉絲飯",price:105,priority:8},{name:"糖醋雞丁飯",price:105,priority:9},{name:"雞肉絲飯",price:95,priority:10},{name:"無骨雞排飯",price:95,priority:11},{name:"蔬菜飯",price:80,priority:12},{name:"大雞肉飯",price:55,priority:13},{name:"小雞肉飯",price:40,priority:14},{name:"雞胸肉沙拉",price:160,priority:15},{name:"加蛋",price:15,priority:16,hideOnMode:"both"},{name:"加菜",price:15,priority:17,hideOnMode:"both"}]},{type:ce[1].type,label:ce[1].label,color:ce[1].color,items:[{name:"油淋雞腿",price:90,priority:1},{name:"炸雞腿",price:80,priority:2},{name:"滷雞腿",price:80,priority:3},{name:"魚排",price:65,priority:4},{name:"排骨",price:70,priority:5},{name:"焢肉",price:70,priority:6},{name:"蒜泥白肉",price:70,priority:7},{name:"京醬肉絲",price:65,priority:8},{name:"糖醋雞丁",price:65,priority:9},{name:"雞肉絲",price:50,priority:10},{name:"無骨雞排",price:50,priority:11},{name:"沙拉",price:100,priority:12},{name:"加蛋",price:15,priority:13},{name:"加菜",price:15,priority:14},{name:"白飯",price:10,priority:15},{name:"白飯(小)",price:5,priority:16}]},{type:ce[2].type,label:ce[2].label,color:ce[2].color,items:[{name:"干貝水餃",price:250,priority:1},{name:"招牌水餃",price:220,priority:2},{name:"韭菜水餃",price:220,priority:3},{name:"養生水餃",price:250,priority:4},{name:"4包水餃",price:900,priority:5},{name:"果醋飲",price:20,priority:6},{name:"果醋飲x3",price:50,priority:7},{name:"原萃綠茶",price:25,priority:8},{name:"樂天優格",price:25,priority:9},{name:"蜂蜜牛奶",price:23,priority:10},{name:"可口可樂Zero",price:25,priority:11},{name:"維大力",price:25,priority:12},{name:"樹頂蘋果汁",price:40,priority:13},{name:"瓶裝水",price:10,priority:14}]}],_t=[{name:"飯少",priority:1,type:"meal"},{name:"飯多",priority:2,type:"meal"},{name:"不要飯",priority:3,type:"meal"},{name:"不要湯",priority:4,type:"meal"},{name:"加滷汁",priority:5,type:"meal"},{name:"優惠價",color:"purple",priority:6,type:"order"},{name:"電話自取",color:"blue",priority:7,type:"order"},{name:"外送",color:"gold",priority:8,type:"order"},{name:"攤位",color:"red",priority:9,type:"order"}];_t.reduce((e,{name:t,color:a})=>(e[t]=a,e),{});const Ma=[..._t.map(({name:e})=>({label:e,value:e})),{label:"水餃",value:"水餃"},{label:"湯",value:"湯"}],fe={red:"#db476c",blue:"#546ca3",brown:"#9e5e2f",purple:"#82379e",gold:"#e19338"},Sa="https://tianwen7252.github.io/manifest.json",Be={get({startTime:e,endTime:t,reverse:a=!0,index:i="createdAt",sortKey:o="number",searchText:r=null,offset:c=0,limit:u=0,search:d}){let m=$.orders.where(i).between(e,t);return a&&(m=m.reverse()),r!=null&&r.length&&(m=m.filter(({data:h,total:x,memo:C})=>r.some(k=>(k=k.trim(),x===+k||C.some(A=>A.includes(k))||h.some(A=>{const{res:Y,value:B}=A;return(Y==null?void 0:Y.includes(k))||B===k}))))),d&&(m=d(m)),c&&(m=m.offset(c)),u&&(m=m.limit(u)),m.sortBy(o)},async add(e,t){return t||(t=S().utc().valueOf()),e.createdAt=t,await $.transaction("rw",[$.orders,$.dailyData],async()=>{const i=await $.orders.add(e);return await Be.updateDailyData("add",e),i})},async set(e,t,a){a||(a=S().utc().valueOf()),t.updatedAt=a;const i=$.orders.update(e,t);return await Be.updateDailyData("edit",t),i},async delete(e,t){const a=$.orders.delete(e);return await Be.updateDailyData("delete",t),a},async updateDailyData(e,t){const{createdAt:a}=t,i=S(a).startOf("day"),o=i.format("YYYY/MM/DD");let r,c=0;const[u]=await Ne.get({date:o});switch(u?(r=u.id,c=u.total):r=await Ne.add(o,0,i.valueOf()),e){case"add":{Ne.set(r,c+t.total);break}default:{const d=i.endOf("day"),h=(await Be.get({startTime:i.valueOf(),endTime:d.valueOf(),reverse:!1})).reduce((x,C)=>x+C.total,0);Ne.set(r,h)}}},count({startTime:e,endTime:t,index:a="createdAt"}){return $.orders.where(a).between(e,t).count()}},Ne={get({date:e,startTime:t,endTime:a,reverse:i=!0,index:o="createdAt",sortKey:r=o}){let c;return e?c=$.dailyData.where("date").equals(e):c=$.dailyData.where(o).between(t,a),i&&(c=c.reverse()),c.sortBy(r)},add(e,t,a,i="admin"){return a||(a=S().utc().valueOf()),$.dailyData.add({date:e,total:t,originalTotal:t,createdAt:a,updatedAt:a,editor:i})},set(e,t,a="admin"){return $.dailyData.update(e,{total:t,originalTotal:t,editor:a})},revise(e,t,a,i="admin"){return a||(a=S().utc().valueOf()),$.dailyData.update(e,{total:t,updatedAt:a,editor:i})}},Ba={async get(e,t){const a=await Be.get({startTime:e,endTime:t,reverse:!1}),i=await Ne.get({startTime:e,endTime:t,reverse:!1});return{records:a,dailyDataInfo:i}}},qe={async get(){return $.commondityType.toArray()},async add(e){return e.createdAt=S().utc().valueOf(),$.commondityType.add(e)},async set(e,t){return t.updatedAt=S().utc().valueOf(),$.commondityType.update(e,t)},async clear(){return $.commondityType.clear()}},Te={async get(e="1"){return e?$.commondity.where("onMarket").equals(e).toArray():$.commondity.toArray()},async getMapData(e){const t=await Te.get(e),a={};return t==null||t.forEach(i=>{const{id:o,typeID:r,priority:c,onMarket:u}=i;a[r]=a[r]??[],u==="1"&&a[r].push({key:`${o}-${c}`,...i})}),a},async add(e,t="admin"){return $.commondity.add({...e,createdAt:S().utc().valueOf(),editor:t})},async set(e,t){return t.updatedAt=S().utc().valueOf(),$.commondity.update(e,t)},async clear(){return $.commondity.clear()}},st={async get(){return $.orderTypes.toArray()},async add(e,t="admin"){return $.orderTypes.add({...e,createdAt:S().utc().valueOf(),editor:t})},async set(e,t){return t.updatedAt=S().utc().valueOf(),$.orderTypes.update(e,t)},async delete(e){return $.orderTypes.delete(e)},async clear(){return $.orderTypes.clear()}};function Na(e=!0){kt(e),cn(e),Ot(e)}function kt(e=!0){e&&qe.clear(),ce.forEach(t=>{qe.add(t)})}function cn(e=!0){e&&Te.clear(),sn.forEach((t,a)=>{const{items:i}=t;i.forEach(o=>{Te.add({...o,typeID:String(a+1),onMarket:"1"})})})}function Ot(e=!0){e&&st.clear(),_t.forEach(t=>{st.add(t)})}const Pa=Object.freeze(Object.defineProperty({__proto__:null,MANIFEST_URL:Sa,commondity:Te,commondityTypes:qe,dailyData:Ne,orderTypes:st,orders:Be,reset:Na,resetCommonditType:kt,resetCommondity:cn,resetOrderType:Ot,statistics:Ba},Symbol.toStringTag,{value:"Module"})),zt=3,Oo="2024-12-20 12:00:00",za="commondity",La="TianwenDB",Ya=7,$=new Pn(La),Ha=$.version(Ya);Ha.stores({orders:"++id, createdAt",dailyData:"++id, date, createdAt, total",commondityType:"++id, type",commondity:"++id, name, typeID, onMarket",orderTypes:"++id, name"});function Fa(){Ka()}async function Ka(){const e=localStorage.getItem("SYNC_NUMBER"),t=vt(e)||zt>+e,a=t&&za;if(((await qe.get()).length===0||a==="commondityType")&&kt(t),(await Te.get()).length===0||a==="commondity"){const u=(await qe.get()).reduce((d,m)=>(d[m.type]=m.typeID,d),{});t&&Te.clear(),sn.forEach(d=>{const{type:m,items:h}=d;h.forEach(x=>{Te.add({...x,typeID:u[m],onMarket:"1"})})})}((await st.get()).length===0||a==="orderTypes")&&Ot(t),t&&localStorage.setItem("SYNC_NUMBER",zt.toString())}Fa();const Se={KEYBOARD_ON_ACTION:"keyboard.onAction",KEYBOARD_ON_CANCEL_EDIT:"keyboard.onCancelEdit",ORDER_AFTER_ACTION:"order.afterAction",on(e,t){return document.addEventListener(Se._getName(e),t),Se.off.bind(Se,e,t)},off(e,t){document.removeEventListener(Se._getName(e),t)},fire(e,t){const a=new CustomEvent(Se._getName(e),{detail:t});document.dispatchEvent(a)},_getName(e){return`Resta.${e}`}},$t="YYYY/MM/DD dddd",Ga="YYYY/MM/DD",wt="MM/DD HH:m:s A",Ua="YYYY/MM/DD HH:mm",Wa="MM-DD (dd)",ja=7,ot=1e3*1e3,qa=ot*1e3;function ze(e){return(+e).toLocaleString("zh-TW",{style:"currency",currency:"TWD",maximumFractionDigits:0,minimumFractionDigits:0})}function Xa(e){return ze(e).substring(1)}function Za(e,t=!1){return`${e-(e>12?12:0)}${t?"":e>11?" PM":" AM"}${t?` - ${Za(e+1)}`:""}`}const Va=navigator.userAgent.toLowerCase(),Qa=/(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(Va);function it(e){const t=e?+e:1;return t<1&&t>0?1:t}let mt,ft;function ln(e=null,t=!1,a=!1){const i=[],o={},r={};let c={},u={};const d=(m,h,x)=>{h.forEach((C,k)=>{const{name:A,menu:Y,price:B=x,showRelevancy:Z,textIcon:ee}=C;if(t&&(C.priority=k,Z&&i.push(C)),r[A]=[B,m],Array.isArray(Y))d(m,Y,B);else{const b=o[B]=o[B]??[];b.some(v=>v.name===A)||b.push({name:A,textIcon:ee,type:m})}})};return zn(e,(m,h)=>{let x="";switch(h){case"1":x="main-dish";break;case"2":x="à-la-carte";break;case"3":x="others";break}d(x,m)}),t&&i.forEach(m=>{var x,C;const{price:h}=m;m.menu=((C=(x=o[h])==null?void 0:x.map)==null?void 0:C.call(x,(k,A)=>({...k,price:h,priority:A})))??[]}),a&&(mt&&ft?(c=mt,u=ft):(Object.keys(o).forEach(m=>{o[m].forEach(h=>{const{type:x}=h,C=c[x]=c[x]??{};C[m]=C[m]??[],C[m].push(h),(u[x]=u[x]??[]).push(h.name)})}),c["à-la-carte"][15]=[...c["à-la-carte"][15]??[],...c["main-dish"][15]],delete c["main-dish"][15],u["à-la-carte"].push("加蛋"),u["à-la-carte"].push("加菜"),u["main-dish"]=u["main-dish"].filter(m=>m!=="加蛋"&&m!=="加菜"),mt=c,ft=u)),{data:e,priceMap:o,commodityMap:r,priceMapGroup:c,resMapGroup:u}}async function $o(e="GB"){var u;let t=0,a="---",i=0,o="---",r=0,c="---";if((u=navigator==null?void 0:navigator.storage)!=null&&u.estimate){const d=await navigator.storage.estimate(),m=e==="GB"?qa:ot;t=d.usage/m,t<1?(t=d.usage/ot,a=`${t.toFixed(2)} MB`):a=`${t.toFixed(2)} GB`,i=d.usage/d.quota*100,o=`${i<.01?0:i.toFixed(2)}%`,r=(d.quota-d.usage)/m,r<1?(r=(d.quota-d.usage)/ot,c=`${r.toFixed(2)} MB`):c=`${r.toFixed(2)} GB`}return{useage:a,percentageUsed:o,remaining:c}}let ht;const dn={db:$,API:Pa,appEvent:Se,isTablet:Qa,DATE_FORMAT:$t,DATE_FORMAT_DATE:Ga,DATE_FORMAT_TIME:wt,DATE_FORMAT_DATETIME_UI:Ua,async getAllCommoditiesInfo(){if(!ht){const e=await Te.getMapData();ht=ln(e,!1,!0)}return ht}},Xe=s.createContext(dn),pn=["+","*"],Ja=pn.join(""),{evaluate:er}=ua(ma);function un(e){return er(e)}function nt(e){const{length:t}=e,a=Ln(e,Ja),i=t===0?0:un(a);let o=e==="."?"0.":e;return pn.includes(e[0])||o.startsWith("0")?o=o.slice(1):o=o.replaceAll(/(\++){2,}|(\*{2,})|(\*\+)|(\+\*)/g,r=>{switch(r){case"++":case"**":return r[0];case"+*":case"*+":return r.at(-1);default:return r}}),{input:e,total:i,transformedInput:o}}function Lt(e){let t="";return e.forEach(({value:a,operator:i=""})=>{t+=i+a}),{text:t,total:un(t)||0}}function tr(e){const{priceMap:t,commodityMap:a}=s.useMemo(()=>ln(e),[e]),i=s.useRef(""),o=s.useRef(!1),[r,c]=s.useState(""),[u,d]=s.useState([]),[m,h]=s.useState(0),x=s.useRef(u);i.current=r,x.current=u;const C=s.useCallback(b=>{const v=x.current,w=v.at(-1);return w&&(!w.operator||w.operator&&w.value?v.push({value:"",operator:b}):w.operator=b,o.current=b==="*"),v},[]),k=s.useCallback((b,v)=>{const w=a[v];if(w){const[,p]=w;b.res=v,b.type=p}else b.res="",b.type="";return b},[a]),A=s.useCallback((b,v,w=!1)=>{const p=x.current;if(w&&v){const N=p.indexOf(v);if(N!==-1){const V=N-1;p.splice(V>0?V:0,v.amount?3:2);const{text:te,total:H}=Lt(p);c(te),h(H)}}else if(v=v??p.at(-1),v){const[,N]=b.split("|");k(v,N)}d([...p])},[k]),Y=s.useCallback((b,v)=>{var V,te;let w=x.current,p=w.at(-1),N;switch(b){case"+":case"*":{const{transformedInput:H}=nt(i.current+b);c(H),d([...C(b)]);break}case".":case"0":case"1":case"2":case"3":case"4":case"5":case"6":case"7":case"8":case"9":{b==="."&&(i.current===""||p.value==="")&&(b="0.");const{total:H,transformedInput:q}=nt(i.current+b);if(c(q),h(H),(w.length===0||(p==null?void 0:p.operator)==="+")&&(p={value:""},w.push(p)),p.value+=b,o.current){const E=w.at(-2);E&&(E.amount=p.value)}N=[...w];break}case"Backspace":{const{total:H,transformedInput:q}=nt(i.current.slice(0,-1));if(c(q),h(H),p)if(p.value==="")w.pop();else if(p.value=p.value.slice(0,-1),p.operator==="*"){const E=w.at(-2);E.amount=p.value}else p.value===""&&w.pop();N=[...w];break}case"Escape":{c(""),h(0),d([]),x.current=[],o.current=!1;break}default:if(b.startsWith("+")){const{total:H,transformedInput:q}=nt(i.current+b);c(q),h(H);const E=C("+"),F={value:b.slice(1),res:v};E.push(k(F,v)),N=[...E];break}}if(!(p!=null&&p.operator)&&(p!=null&&p.value)){const H=(te=(V=t[p.value])==null?void 0:V[0])==null?void 0:te.name,[q]=(a==null?void 0:a[p.res])??[];if(+p.value!==q){const E=H??"";p.res!==E&&(k(p,E),N=[...w])}}return N&&(x.current=w=N,d(N)),{data:w}},[C,k,t,a]),B=s.useCallback(b=>{document.querySelector(".ant-modal-mask")||Y(b.key)},[Y]),Z=s.useCallback(()=>{Y("Escape")},[Y]),ee=s.useCallback((b,v)=>{const{text:w}=Lt(b);c(w),h(v),d(b)},[]);return s.useEffect(()=>(document.addEventListener("keyup",B),()=>{document.removeEventListener("keyup",B)}),[B]),{data:u,text:r,total:m,priceMap:t,input:Y,updateItemRes:A,update:ee,clear:Z}}const mn="10px",nr=l`
  position: relative;
  overflow: hidden;
  --resta-original-total-room: 0px;
`,ar=l`
  --resta-original-total-room: 38px;
`,rr=l`
  width: min-content;
  /* width: 40vw; */
  min-width: 60vw;
  min-height: ${Tt(22)};
  padding: 10px 20px;
  font-size: ${ba};
  letter-spacing: ${xa};

  .ant-divider {
    margin: 8px 0;
  }
`,or=l`
  .ant-tabs {
    margin-top: 0;
  }
`,sr=l`
  margin-bottom: 20px;
  word-wrap: break-word;
  min-height: ${Bt};

  @media only screen and (min-device-width: 1080px) and (orientation: landscape) {
    min-height: ${je.KEYBOARD_TEXT_MIN_HEIGHT};
  }
  @media only screen and (min-device-width: 1280px) and (orientation: landscape) {
    min-height: ${Bt};
  }
`,ir=l`
  margin-bottom: -20px;
  margin-top: -10px;

  .resta-keyboard-left {
    min-width: 70vw;
    min-height: ${Tt(112)};
  }

  /* @media only screen and (max-device-width: 1180px) and (orientation: landscape) {
    // transform: scale(0.93);
    // margin-left: -40px;
    // margin-top: -45px;
    margin-bottom: -20px;
    margin-top: -10px;
  } */
  .resta-keyboard-textArea {
    @media only screen and (min-device-width: 1080px) and (orientation: landscape) {
      min-height: calc(${je.KEYBOARD_TEXT_MEALS_HEIGHT} + 20px);
      max-height: calc(${je.KEYBOARD_TEXT_MEALS_HEIGHT} + 20px);
    }
    @media only screen and (min-device-width: 1280px) and (orientation: landscape) {
      max-height: none;
    }
  }
`,cr=l`
  max-height: calc(
    ${Nt} - var(--resta-original-total-room)
  );

  @media only screen and (min-device-width: 1080px) and (orientation: landscape) {
    max-height: calc(
      ${je.KEYBOARD_TEXT_MEALS_HEIGHT} - var(--resta-original-total-room)
    );
  }
  @media only screen and (min-device-width: 1280px) and (orientation: landscape) {
    max-height: calc(
      ${Nt} - var(--resta-original-total-room)
    );
  }

  overflow-y: auto;

  .ant-tag {
    font-size: 1rem;
    vertical-align: text-bottom;
    line-height: inherit;
    margin-inline-end: 4px;
    cursor: pointer;
    background: #fff;
    border: 1px solid #2222229c;
    color: #2222229c;
  }

  .ant-tag-close-icon {
    /* vertical-align: middle; */
    font-size: 1rem;
    color: #2222229c;
  }
`,Yt=l`
  margin-top: 1rem;
  font-weight: 500;
  font-size: ${ya};
`,lr=l`
  color: #aaa;
  text-decoration: line-through;
`,dr=l`
  margin-top: 0;
`,pr=l`
  font-size: 1rem;
  vertical-align: middle;
`,ur=l``,mr=l`
  color: #fff;
  padding: 2px 4px;
  border-radius: 4px;
  letter-spacing: 0;
  font-size: 1rem;
  margin-right: 8px;

  &.resta-keyboard-change-1000 {
    background: #3f6ab0;
  }
  &.resta-keyboard-change-500 {
    background: #ae917d;
  }
  &.resta-keyboard-change-100 {
    background: #f38590;
  }
`,fr=l`
  position: relative;
  padding-top: 8px;

  .ant-btn {
    font-size: 1.2rem;
  }
`,hr=l`
  font-size: 1.5rem;
  width: min-content;
`,gr=l`
  flex: auto;
  justify-content: end;
`,br=l`
  width: min-content;
  gap: 20px;

  // for ipad 11 air
  @media only screen and (min-device-width: 1180px) and (max-height: 796px) and (orientation: landscape) {
    gap: 70px;
  }

  .ant-flex {
    margin-bottom: ${mn};
    align-content: space-between;
  }

  .ant-btn {
    width: 4.2rem;
    height: 4.2rem;
    white-space: normal;
    word-break: break-word;
    padding: 0;
    /* transform: scale(0.9); */

    > span:not(.ant-btn-icon) {
      padding: 5px;
    }
  }

  .ant-btn,
  .anticon {
    font-size: ${Ca};
  }
`,yr=l`
  &.ant-btn {
    width: 5rem;
    height: 30px;
    padding: 0px;
    display: block;
    line-height: inherit;
    font-size: 1rem;
    border-radius: 4px;

    .ant-btn-icon {
      vertical-align: middle;
      margin-right: 4px;
      margin-top: -2px;
    }
  }
`,xr=l`
  margin-top: calc(-${St} - 50px);

  .ant-tabs-nav {
    margin-left: 10px;
    margin-bottom: 1.5rem;
  }

  .ant-tabs-tab + .ant-tabs-tab {
    margin: 0 0 0 2rem;
    // for iPad 10
    @media only screen and (max-device-width: 1080px) and (orientation: landscape) {
      margin: 0 0 0 1rem;
    }
  }

  .ant-tabs-tab-btn {
    font-size: ${St};
  }
`,Cr=l`
  font-size: 12px;
  flex-wrap: wrap;
  flex-direction: column;
  min-height: 300px;
  max-height: 350px;
  align-content: space-between;
  row-gap: ${mn};
`,Ht=Yn`
  color: red;

  .ant-dropdown-menu .ant-dropdown-menu-item {
    font-size: 1rem;
  }
`,Ft=l`
  display: block;
  padding: 2px;
  position: absolute;
  top: -22px;
  color: #777;
  font-size: 0.8rem;
  background: #fff;
`,wr=l`
  font-size: 1rem;
  padding: 5px 0;
  position: relative;

  &:before {
    content: '餐點備註';
    left: 0;
    ${Ft}
  }

  &:after {
    content: '訂單備註';
    right: 0;
    ${Ft}
  }

  .ant-tag {
    font-size: ${nn};
    vertical-align: middle;
    border: 1px solid #ddd;
    margin-right: 0;
    padding: 2px 6px;
    letter-spacing: 2px;
    margin-left: 2px;

    */ &.ant-tag-checkable:not(.ant-tag-checkable-checked):hover {
      color: #333;
    }

    &.ant-tag-checkable-checked {
      background-color: #333;

      &::after {
        position: absolute;
        content: '✔️';
        top: -18px;
        left: 40%;
        z-index: 1;
        /* right: 50%; */
      }
    }
  }
`,vr=l`
  width: 100%;
  justify-content: space-between;
`,Er=l`
  border-right: 1px solid rgba(5, 5, 5, 0.06);
  border-image: linear-gradient(to bottom, #fff, #999, #fff) 1 100%;
  margin: 0 2px;
  height: 26px;
`,Tr=l`
  height: 3.5rem;
  font-size: 1.2rem;
  font-weight: bold;
  transition: ${on()};
  background-size: 200% auto;
  border-radius: 10px;
`,_r=l`
  background: linear-gradient(to right, rgb(201, 255, 191), rgb(255, 175, 189));
`,kr=l`
  margin-top: 20px;
  .ant-form-item-row .ant-form-item-label > label {
    font-size: 1rem;
  }
`,lt=(e,t=e)=>l`
    border-color: ${e};
    color: ${t};
  `,Or=lt("#426e0680","#426e06"),$r=lt("#7e632280","#7e6322"),Dr=lt("#673e7678","#673e76"),Ar=lt("#3e667675","#3e6676"),Ir={green:Or,brown:$r,purple:Dr,indigo:Ar},Ze=(e,t="#fff")=>l`
    &.ant-tag.ant-tag-checkable-checked {
      background-color: ${e};
      color: ${t};
    }
  `,Rr=Ze(fe.brown),Mr=Ze(fe.purple),Sr=Ze(fe.blue),Br=Ze(fe.gold),Nr=Ze(fe.red),Pr={brown:Rr,purple:Mr,blue:Sr,gold:Br,red:Nr},zr={SwapLeftOutlined:n(Fn,{}),PlusOutlined:n(Kn,{}),DeleteOutlined:n(Et,{}),CloseOutlined:n(Gn,{})},Kt=[1e3,500,100];function Lr(e){const t=e.toString(),{length:a}=t,i=+t[0],o=[];return a<=4&&a>1?(Kt.forEach((r,c)=>{if(r>e)o.push([r,r,r-e]);else if(e>r){const u=r*(i+1);u>e&&(u<Kt[c-1]||c===0)&&o.push([r,u,u-e])}}),o):null}const Yr=s.memo(e=>{var Ge;const{API:t,appEvent:a,isTablet:i}=s.useContext(Xe),o=Pe(async()=>(await t.commondityTypes.get()).map(y=>({key:y.id,...y})),[],[]),r=Pe(async()=>await t.commondity.getMapData(),[],{}),c=Pe(async()=>await t.orderTypes.get(),[],[]),{data:u,total:d,priceMap:m,input:h,updateItemRes:x,update:C,clear:k}=tr(r),{editMode:A=!1,record:Y,lastRecordNumber:B,drawerMode:Z=!1,callOrderAPI:ee,submitCallback:b}=e,[v,w]=s.useState(e.mode||"both"),[p,N]=s.useState([]),[V,te]=s.useState(tt.KEYBOARD_SUBMIT_BTN_TEXT),[H,q]=s.useState(A),[E,F]=s.useState(!1),[I,oe]=s.useState(null),[he,le]=s.useState(""),[se,$e]=s.useState(!1),He=s.useRef(Y),de=s.useMemo(()=>{let g=0;return u.forEach(({res:y,type:T,amount:D=""})=>{!tt.NO_NEED_SOUP_KEYWORDS.some(P=>y==null?void 0:y.includes(P))&&(T===tt.MAIN_DISH_TYPE||y==="湯")&&(g+=it(D))}),g},[u]),De=s.useMemo(()=>p.includes("不要湯"),[p]),ge=s.useCallback(g=>{const[y,T]=g.split("|");return h(y,T).data},[h]),dt=s.useCallback(g=>{w(g)},[w]),Ae=s.useCallback(g=>{const{meta:y=""}=g.currentTarget.dataset;ge(y)},[ge]),O=s.useCallback(g=>{const{key:y}=g;i?x(y):ge(y)},[i,ge,x]),L=s.useCallback((g,y=!1,T)=>{const{key:D}=T;x(D,g,y)},[x]),R=s.useCallback((g,y)=>{const T=p.indexOf(g);y?T===-1&&p.push(g):p.splice(T,1),N([...p])},[p]),ie=s.useCallback(()=>{F(!0)},[]),be=s.useCallback(()=>{I===null||I===d?(oe(null),$e(!1)):(p.includes("優惠價")||N([...p,"優惠價"]),$e(!0)),F(!1)},[I,d,p]),ne=s.useCallback(()=>{$e(!1),oe(null),le(""),p.includes("優惠價")&&N([...Hn(p,"優惠價")]),F(!1)},[p]),pe=s.useCallback(()=>{ge("Escape"),N([]),ne(),Z||(te(tt.KEYBOARD_SUBMIT_BTN_TEXT),q(!1),a.fire(a.ORDER_AFTER_ACTION)),He.current=null,k()},[Z,a,ge,k,ne]),Fe=s.useCallback(async()=>{const g=se?I:d;if(g>0){let y="add";const T={data:u,number:B+1,total:g,originalTotal:se?d:void 0,editedMemo:he,soups:de,memo:!de||De?p:[...p,`${de}杯湯`]};if(H){const D=He.current;delete T.number,y="edit",D&&ee({...D,...T},y)}else await ee(T,y);b==null||b(y),pe()}},[u,B,d,de,H,De,p,se,I,he,ee,b,pe]);s.useEffect(()=>{const g=a.on(a.KEYBOARD_ON_ACTION,T=>{const{record:D,action:_}=T.detail;switch(_){case"edit":{const{data:P,memo:M,number:z,editedMemo:G}=D;let{total:X,originalTotal:U}=D;He.current=D,vt(U)||(oe(X),le(G),$e(!0),X=U),C(P,X),N(M.filter(ae=>!ae.includes("杯湯"))),te(`編輯訂單 - 編號[${z}]`),q(!0);break}case"delete":{ee(D,"delete");break}}}),y=a.on(a.KEYBOARD_ON_CANCEL_EDIT,pe);return()=>{g(),y()}},[a,C,ee,pe]);const Ve=s.useMemo(()=>Ra.map((g,y)=>n(K,{gap:"middle",children:g.map((T,D)=>{const{label:_,meta:P,icon:M}=T;return n(Ue,{shape:"circle",size:"large","data-meta":P,icon:zr[M],onClick:Ae,children:_},D)})},y)),[Ae]),Qe=s.useMemo(()=>o.map(g=>{const{type:y,label:T,typeID:D,color:_}=g,M=(r[D]??[]).map((z,G)=>{const{name:X,price:U,menu:ae,visible:Ce,showRelevancy:Q,hideOnMode:ue}=z;if(Ce===!1||ue===v)return null;const me=Q&&ae?`+${U}|${ae[0].name}`:`+${U}|${X}`,W=n(Ue,{size:"large","data-meta":me,css:Ir[_],onClick:Ae,children:X},`${G}-${me}`);return ae?n(Mt,{overlayClassName:Ht,arrow:{pointAtCenter:!0},placement:"bottom",menu:{onClick:O,items:ae.map(({name:re,price:we,textIcon:ve})=>({key:`+${we}|${re}`,label:ve?f(J,{children:[ve,re]}):re}))},children:W},me):W});return{label:T,key:y,children:n(K,{css:Cr,gap:"middle",vertical:!0,wrap:!0,children:M})}}),[v,o,r,Ae,O]),_e=s.useMemo(()=>u.map((g,y)=>{var M,z;const{value:T,operator:D,res:_}=g;let P;return D?P=f("span",{children:[D,T]}):P=_?f("span",{children:[T,"(",n(Mt,{overlayClassName:Ht,arrow:{pointAtCenter:!0},placement:"bottom",menu:{items:(z=(M=m[T])==null?void 0:M.map)==null?void 0:z.call(M,({name:G})=>({key:`+${T}|${G}`,label:G})),onClick:L.bind(null,g,!1)},children:n(Ct,{bordered:!1,closeIcon:!0,onClose:L.bind(null,g,!0),children:_})},`${y}-${T}`),")"]}):T,n(J,{children:P},`${y}-${T}-${Date.now()}`)}),[u,m,L]),[ke,Ke]=s.useMemo(()=>{const g=[],y=[];return c.forEach(T=>{const{name:D,color:_,type:P}=T,M=n(Ct.CheckableTag,{css:Pr[_],checked:p.includes(D),onChange:z=>R(D,z),children:D},D);P==="meal"?g.push(M):y.push(M)}),[g,y]},[c,p,R]),ye=s.useMemo(()=>{var y;const g=se?I:d;return g!==0&&((y=Lr(g))==null?void 0:y.map(([T,D,_])=>f("span",{css:mr,className:`resta-keyboard-change-${T}`,children:["$",D," 找 $",_]},T)))},[se,d,I]),xe=s.useMemo(()=>f(j,{children:[n("span",{css:pr,children:de>0&&!De&&`(${de}杯湯)`}),ye&&n("span",{css:ur,children:ye})]}),[de,De,ye]);return f("div",{css:[nr,Z&&ir,se&&ar],children:[f(K,{css:[rr,v==="commondity"&&or],className:"resta-keyboard-left",vertical:!0,children:[f(K,{css:sr,className:"resta-keyboard-textArea",vertical:!0,children:[n("div",{css:cr,children:_e}),n("div",{css:Yt,children:f(J,{size:"large",children:[f("span",{css:se&&lr,children:[d&&`= ${ze(d)}`,d!==0&&n(Ue,{type:"text",icon:n(Jt,{}),onClick:ie})]}),!se&&xe]})}),se&&n("div",{css:[Yt,dr],children:f(J,{size:"large",children:[n("span",{children:`= ${ze(I)}`}),xe]})})]}),f(K,{css:gr,gap:"middle",vertical:!0,children:[f(J,{size:"middle",children:[n(oa,{css:hr,options:[{value:"both",icon:n(Un,{})},{value:"commondity",icon:n(Wn,{})},{value:"calculator",icon:n(jn,{})}],onChange:dt}),n(Ue,{danger:!0,type:"primary",size:"large",css:yr,icon:n(Et,{}),onClick:pe,children:"清除"})]}),f(K,{css:br,gap:"middle",children:[v!=="commondity"&&n("div",{css:fr,children:Ve}),v!=="calculator"&&n(en,{css:xr,tabPosition:v==="commondity"?"left":"top",defaultActiveKey:(Ge=o==null?void 0:o[0])==null?void 0:Ge.type,items:Qe})]})]}),n(We,{}),n(K,{css:wr,gap:"small",wrap:!0,align:"center",children:f(J,{css:vr,split:n("span",{css:Er}),children:[n(J,{children:ke}),n(J,{children:Ke})]})}),n(We,{}),n(K,{vertical:!0,children:n(Ue,{css:[Tr,H&&_r],size:"large",type:"primary",disabled:Z&&(u==null?void 0:u.length)===0,onClick:Fe,children:V})})]}),n(tn,{title:"設定訂單總金額",open:E,okText:"確定修改",cancelText:"取消 (還原)",closable:!1,maskClosable:!1,onOk:be,onCancel:ne,children:n(K,{vertical:!0,children:f(et,{labelCol:{span:4},wrapperCol:{span:18},css:kr,children:[n(et.Item,{label:"目前金額",children:ze(d)}),n(et.Item,{label:"修改金額",children:n(aa,{type:"number",prefix:"$",value:I===null?d:I,min:0,style:{minWidth:"60%"},addonAfter:`($${Xa(I===null?d:I)})`,onChange:s.useCallback(g=>oe(g),[])})}),n(et.Item,{label:"備註",children:n(ra,{type:"text",placeholder:"請輸入備註",value:he,onChange:s.useCallback(g=>le(g.target.value),[])})})]})})})]})}),Gt=42*2-1,fn="linear-gradient(to top, #dbd5a7, #b0dab9)",Hr="linear-gradient(to bottom, #fb578e, #f7bb97)",Fr=l`
  --resta-order-card-width: ${rn};
  font-size: 1rem;
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  border: 1px solid #55555587;
  width: var(--resta-order-card-width);
  min-width: var(--resta-order-card-width);

  // for iPad 10
  @media only screen and (max-device-width: 1080px) and (orientation: landscape) {
    --resta-order-card-width: ${je.ORDER_CARD_WIDTH};
  }

  /* @media only screen and (min-device-width: 1080px) and (orientation: landscape) {
    --resta-order-card-width: 260px;
  }
  @media only screen and (min-device-width: 1280px) and (orientation: landscape) {
    --resta-order-card-width: 284px;
  } */
`,hn=l`
  height: 100%;
  &,
  .anticon {
    transition: transform 1s cubic-bezier(0.075, 0.82, 0.165, 1);
  }
  label: __order-frame; // @emotion only
`,gn=l`
  background: #fff;
  min-width: var(--resta-order-card-width);
  label: __order-main; // @emotion only

  .ant-tag {
    font-size: ${nn};
    margin-inline-end: 0;
  }
`,Dt=l`
  min-width: 40px;
  min-height: 30px;
  line-height: 30px;
  background: #444;
  color: #fff;
  text-align: center;
  border-radius: 0 0 8px 0;
  label: __order-number; // @emotion only
`,Kr=l`
  .css-${hn.name}, [class$='__order-frame'] {
    background: ${fn};
    transform: translateX(-${Gt}px);
  }

  .css-${gn.name}, [class$='__order-main'] {
    border-radius: 0 8px 8px 0;
    box-shadow: 0px 0px 10px #00000085;
    z-index: 1;
  }

  /* .css-${Dt.name}, [class$='__order-number'] {
    left: ${Gt}px;
  } */
`,Gr=l`
  display: flex;
  justify-content: space-between;
`,bn=l`
  visibility: hidden;
  label: __order-action-btn; // @emotion only
  transition: all 0.5s ease-out;

  .anticon {
    cursor: pointer;
    margin: 8px;

    &:hover,
    &:active {
      transform: scale(1.5);
    }
  }
`,Ur=l`
  font-size: 1.2rem;
`,Wr=l`
  height: 100%;
  &:hover {
    .css-${bn.name}, [class$='__order-action-btn'] {
      visibility: visible;
    }
  }
`,jr=l`
  padding: 10px;
  flex: 1;
`,qr=l`
  padding: 10px;
  align-self: flex-end;
`,Xr=l`
  margin-inline-start: 4px;
  margin-inline-end: 4px;
`,Zr=l`
  font-weight: 500;
  text-align: right;
`,Vr=l`
  font-size: ${an};
  text-align: right;
`,at=l`
  font-size: ${an};
  width: 100%;
  justify-content: flex-end;
`,Qr=l`
  color: #619b6d;
`,Jr=l`
  color: white;
  cursor: pointer;
`,yn=`
  padding: 10px 1rem;
  justify-content: center;
  align-items: center;
  display: flex;
  width: 10px;
  &:hover, &:active {
    .anticon {
      transform: scale(1.5);
    }
  }
`,Ut=l`
  ${yn}
  background: ${fn};
`,eo=l`
  ${yn}
  background: ${Hr};
`,rt=e=>l`
    background: ${e};
    background: linear-gradient(
      to bottom,
      color-mix(in srgb, ${e} 10%, #fff),
      #fff
    );

    .css-${Dt.name}, [class$='__order-number'] {
      background: ${e};
    }
  `,to={gold:rt(fe.gold),blue:rt(fe.blue),purple:rt(fe.purple),red:rt(fe.red)},no=()=>{},gt=s.memo(e=>{const{record:t,number:a,editable:i=!0,callOrderAPI:o=no}=e,[r,c]=s.useState(!1),[u,d]=s.useState(!1),{API:m,appEvent:h,isTablet:x}=s.useContext(Xe),C=s.useRef(),{data:k,total:A,originalTotal:Y,memo:B,editedMemo:Z,createdAt:ee,updatedAt:b}=t,v=S.tz(ee),w=b&&S.tz(b),p=Pe(async()=>await m.orderTypes.get(),[],[]),N=s.useMemo(()=>{let E="";return Array.isArray(B)&&B.some(F=>{const I=p.find(oe=>oe.name===F);return I&&(E=I.color),I}),E},[B,p]),V=s.useCallback(()=>{c(E=>!E)},[]),te=s.useCallback(E=>{if(i){const{directions:F}=E.detail;F.left?c(!0):F.right&&c(!1)}},[i]),H=s.useCallback(E=>{E==="edit"&&d(!0),h.fire(h.KEYBOARD_ON_ACTION,{record:t,action:E,callOrderAPI:o})},[t,o,h]),q=s.useCallback(()=>{h.fire(h.KEYBOARD_ON_CANCEL_EDIT),d(!1)},[h]);return s.useEffect(()=>{const E=C.current,F=qn(E);E.addEventListener("swipe",te);const I=h.on(h.ORDER_AFTER_ACTION,()=>{d(!1),c(!1)});return()=>{E.removeEventListener("swipe",te),F.off(),I()}},[h,te]),n("div",{css:[Fr,r&&Kr],className:"resta-order-card",ref:C,children:f(K,{css:hn,children:[n("div",{css:[gn,to[N]],children:f(K,{css:Wr,vertical:!0,children:[f(K,{css:Gr,children:[n("div",{css:Dt,children:a}),!x&&n("span",{css:bn,onClick:V,children:r?n(Xn,{}):n(Zn,{css:Ur})})]}),f("div",{css:jr,children:[k.map((E,F)=>{const{value:I,operator:oe,res:he}=E;let le;return oe?le=f("span",{children:[n("span",{css:Xr,children:oe}),I]}):le=he?f("span",{children:[I," (",he,")"]}):I,n(J,{children:le},`${F}-${I}`)}),(B==null?void 0:B.length)>0&&f(j,{children:[n(We,{}),n(J,{wrap:!0,children:B.map(E=>n(Ct,{children:E},E))})]}),n(We,{})]}),f("div",{css:qr,children:[f("div",{css:Zr,children:["金額 ",ze(A)]}),!vt(Y)&&f("div",{css:Vr,children:[" ","(原金額: ",ze(Y),")"]}),Z&&n(J,{css:at,children:Z}),f(J,{css:at,children:["訂單編號: ",t.number]}),f(J,{css:at,children:[v.format(wt),f("span",{children:["(",v.fromNow(),")"]})]}),w&&f(J,{css:[at,Qr],children:["更新於: ",w.format(wt),f("span",{children:["(",w.fromNow(),")"]})]})]})]})}),i&&f(K,{css:Jr,children:[u?n("div",{css:Ut,onClick:q,children:n(Qt,{})}):n("div",{css:Ut,onClick:H.bind(null,"edit"),children:n(Jt,{})}),n("div",{css:eo,onClick:H.bind(null,"delete"),children:n(Et,{})})]})]})})}),xn=13,Cn=30,Le=["AM","上午"],Ye=["PM","下午"],ct=["TODAY","今日"],bt={[Le[0]]:Le[1],[Ye[0]]:Ye[1],[ct[0]]:ct[1]},ao=[{title:Le[1],key:Le[0],startTime:"09:00",color:"#fdf4d5"},{title:Ye[1],key:Ye[0],startTime:`${xn}:${Cn}`,color:"#EBF3F7"}];function Wt(e,t,a="en"){return e*60+t>=xn*60+Cn?a==="en"?Ye[0]:Ye[1]:a==="en"?Le[0]:Le[1]}const ro=[...ao].reverse(),Do=l`
  position: relative;
  padding: 20px;
  /* width: ${wa(40)}; */
  min-height: ${Tt(40)};
  label: __main;

  [class*='__orderlist_summary'] {
    padding: 20px;
    border-radius: 20px;
    margin-right: 200px; // for anchor last item
    position: relative;

    .ant-statistic-title {
      font-size: 1rem;
    }
  }

  .resta-orderlist-search-drawer {
    .ant-drawer-content-wrapper {
      position: sticky;
      top: 60px;

      .ant-drawer-body {
        overflow-y: auto;
        > div {
          height: calc(100vh - 170px);
        }
      }
    }
  }
`,Ao=l`
  padding: 10px 20px;
  h2 {
    color: #bbb;
  }
`,Io=l`
  [class*='__orderlist_summary'] {
    padding-bottom: 0;
    width: 70%;
    margin-left: auto;

    .ant-statistic-title {
      border-bottom: 1px solid #d3cdcd;
      padding-bottom: 4px;
    }
  }
`,yt=l`
  ${va({rtColor:"#b6cad8",rbColor:"#ebdcc0",lbColor:"#e7e2d5",ltColor:"#c0cfb9"})}
`,oo=l`
  overflow-x: hidden;
  overflow-y: auto;
  width: 100%;

  .ant-select,
  .ant-input-affix-wrapper {
    margin-bottom: 1rem;
  }

  .ant-tabs {
    &.ant-tabs-right {
      > .ant-tabs-content-holder {
        border-right: none;
      }
      > .ant-tabs-nav .ant-tabs-tab {
        padding: 4px 12px;
      }
      .ant-tabs-content > .ant-tabs-tabpane {
        min-height: 300px;
        max-height: 600px;
        min-width: 292px;
        overflow-y: auto;
      }
    }
    > .ant-tabs-nav {
      top: 2px;
      right: -62px;
      position: absolute;
    }
  }

  // for anchor
  /* .ant-flex:empty {
    height: 1px;
    padding: 0;
    margin: 0;
    visibility: hidden;
  } */
`,Ro=l`
  position: relative;
`,Mo=l`
  .ant-drawer-content {
    overflow: hidden;
    height: auto;
  }

  .ant-drawer-close {
    margin-right: 50px;
  }
`,So=l`
  padding-bottom: 350px; // for anchor last item and scroll-top buttn

  /* @media only screen and (min-device-width: 1080px) and (orientation: landscape) {
    padding-bottom: 280px;
  }
  @media only screen and (min-device-width: 1280px) and (orientation: landscape) {
    padding-bottom: 350px;
  } */
`,Bo=l`
  filter: blur(0.3rem);

  .ant-anchor-wrapper {
    display: none;
  }
`,so=l`
  > [class*='__orderlist_summary'] {
    width: 70%;
    background: #00000007;
    margin: 0;
  }
`,io=l`
  border-radius: 20px;
  padding: 20px;
  margin: 20px 0;
  position: relative;

  &::after {
    content: attr(data-title);
    position: absolute;
    top: 0;
    right: 0;
    font-size: 1rem;
    padding: 1rem;
    background: #ffffff70;
    border-radius: 0 20px 0 20px;
    color: #666;
  }
`,co=l`
  width: 100%;
  justify-content: center;
`,lo=l`
  position: relative;
  margin-right: 60px;
  min-width: 286px;

  h1 {
    font-size: 2.2rem;
    margin: 40px 0;
  }

  .resta-orders-content {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
`,jt=l`
  text-align: center;
  label: __orderlist_summary; // @emotion only
`,po=l`
  width: 100%;
  margin-right: 140px;
`,uo=l`
  position: fixed;
  inset-inline-end: 0;
  margin-inline-end: calc(20px - 100vw + 100%);
  margin-top: 10px;
`,No=l`
  font-size: 1.2rem;
  padding: 1.2rem;
  border: 1px solid #eee;
`,Po=l`
  float: left;
  margin: 3px 0;
`,qt={add:"新增訂單失敗",edit:"編輯訂單失敗",delete:"刪除訂單失敗"},mo=["期間總訂單數量","期間總銷售商品數量","期間總營業額"],Me=["訂單數量","銷售商品數量","總營業額","上午營業額","下午營業額"];function fo(e,t){const a=S.tz(t),i=a.format("YYYY-MM-DD");e[i]=e[i]??{periods:ro.map(({title:r,startTime:c,key:u,color:d})=>{const[m,h]=c.split(":");return{title:r,key:u,id:`resta-anchor-${i}-${u}`,createdAt:a.hour(+m).minute(+h).valueOf(),elements:[],elementsProps:[],color:d,total:0,numberCount:0}}),datetime:t,dateWithWeek:a.format($t),AM:{soldCount:0,recordCount:0,total:0},PM:{soldCount:0,recordCount:0,total:0},today:{soldCount:0,recordCount:0,total:0}};const o=e[i];return{dateData:o,periods:o.periods}}function ho(e,t=!0){return Object.keys(e).sort((a,i)=>t?i.localeCompare(a):a.localeCompare(i))}function Xt(e){const t=new Map;let a=!1;for(const{res:i,amount:o,type:r,value:c}of e.data){if(!i)continue;const u=t.get(i);(u==null?void 0:u.type)===r?(a=!0,u.amount+=it(o)):t.set(i,{amount:it(o),type:r,value:c})}if(a&&t.size){const i=Array.from(t).flatMap(([o,{amount:r,type:c,value:u}])=>[{res:o,type:c,value:u,...r>1?{amount:String(r)}:{}},...r>1?[{value:String(r),operator:"*"}]:[],{value:"",operator:"+"}]).slice(0,-1);e.data=i}}const Zt="today";function go({datetime:e,searchData:t,dateOrder:a=!0,searchUI:i=!0,reverse:o=!0,orderPageMode:r=!1,vertical:c=r,emptyDescription:u,offset:d=0,limit:m=ja,handleRecords:h,search:x}){e=e??Zt;const C=S.tz(),k=C.format($t),{API:A}=s.useContext(Xe),[Y,B]=sa.useNotification(),[Z,ee]=tn.useModal(),[b,v]=s.useMemo(()=>e===Zt?[C.startOf("day").valueOf(),C.endOf("day").valueOf()]:e,[e,k]),w=s.useCallback(()=>{const O=S.tz();return Wt(O.hour(),O.minute())},[k]),[p,N]=s.useState(w),[V,te]=s.useState([]),H=s.useCallback(Vn(O=>{te(O)},500),[]),q=s.useRef(),E=s.useCallback((O=!1)=>n(K,{css:co,children:n(ia,{description:O?"查無資料":u,style:{marginTop:100}})}),[u]),F=s.useCallback(({type:O,message:L="系統通知",description:R,errorDescription:ie,errorMsg:be})=>{Y[O]({message:L,description:ie?f(j,{children:[n("p",{children:ie}),n("p",{children:f("small",{children:["錯誤代碼 - ",be??"Unknown"]})})]}):R,showProgress:!0,pauseOnHover:O!=="success",duration:O==="success"?3:20})},[Y]),I=s.useCallback(async(O,L)=>{try{switch(L){case"add":{Xt(O);const R=await A.orders.add(O);return F({message:"",type:"success",description:"新增訂單成功!"}),R}case"edit":{Xt(O);const R=await A.orders.set(O.id,O);return F({message:"",type:"success",description:`編輯訂單[${O.number}]成功!`}),R}case"delete":return new Promise(R=>{Z.confirm({title:"你知道你正在做什麼嗎",content:f(j,{children:[f("p",{children:["確定要刪除訂單[",O.number,"]?"]}),n(We,{})]}),okType:"danger",okText:"不要吵給我刪掉",cancelText:"取消，我不小心按到",onOk:ie=>{A.orders.delete(O.id,O),F({type:"success",description:`刪除訂單[${O.number}]成功!`}),ie(),R(O.id)},onCancel:()=>{R(null)},footer:(ie,{OkBtn:be,CancelBtn:ne})=>f(j,{children:[n(be,{}),n(ne,{})]})})})}}catch(R){F({type:"error",message:"系統發生錯誤",errorDescription:L==="add"?qt[L]:`${qt[L]} - 訂單編號[${O.number}]`,errorMsg:R==null?void 0:R.message})}finally{if(L==="add"){const R=w();R!==p&&N(R)}}return null},[A,Z,p,w,F]),oe=Pe(async()=>{const O=await A.orders.get({startTime:b,endTime:v,reverse:o,searchText:t??V,search:x}),L=(h==null?void 0:h(O))??O;let R=0,ie=0,be=0,ne=[],pe=null,Fe=null,Ve=null,Qe=null;const _e={},ke=L==null?void 0:L.length;if(ke||V.length){const Ke=!!(ke===0&&V.length);L==null||L.forEach(_=>{const{data:P,total:M,createdAt:z}=_,{dateData:G,periods:X}=fo(_e,z);R+=M,++G.today.recordCount;let U=0;P.forEach(({res:W,amount:re})=>{if(W){const we=it(re);U+=we,G.today.soldCount+=we}});const ae=S.tz(z),Ce=Wt(ae.hour(),ae.minute()),Q=G[Ce];++Q.recordCount,Q.total+=M,Q.soldCount+=U,ie+=U;const ue=W=>{++W.numberCount;const{elements:re,elementsProps:we,numberCount:ve}=W;W.total+=M;const Ie=`${z}-${ve}`;r?we.push({record:_,key:Ie,number:ve,callOrderAPI:I}):re.push(n(gt,{record:_,number:ve,callOrderAPI:I},Ie))};if(!X.some(W=>{const{createdAt:re}=W;return z>=re?(ue(W),!0):!1})){const W=X.at(-1);ue(W)}}),ne=ho(_e,a),be=ne.length,m&&(ne=ne.slice(d,d+m));const ye={};let xe=null;if(r){if(xe=_e[Object.keys(_e)[0]],xe){const{periods:_}=xe,P=[],M=_.map(({elements:z,elementsProps:G,numberCount:X,title:U,key:ae,createdAt:Ce})=>(G.forEach((Q,ue)=>{Q.number=X-ue;const me=`${Ce}-${Q.number}`;z.push(Rt(gt,{...Q,key:me}));const W=Q.record.number;Q.number=W,P.push(Rt(gt,{...Q,key:`${Ce}-${W}`}))}),{label:U,key:ae,children:n(K,{gap:10,wrap:!0,children:z})})).reverse();M.push({label:ct[1],key:ct[0],children:n(K,{gap:10,wrap:!0,children:P})}),Fe=n(en,{tabPosition:"right",items:M,activeKey:p,onChange:N})}}else ne.forEach(_=>{const P=`resta-anchor-${_}`,M=_e[_],{periods:z,dateWithWeek:G,datetime:X}=M,U=_.split("-")[0],ae=`resta-anchor-${U}`,Ce=ye[U]=ye[U]??{yearId:ae,dateElements:[],anchorItems:[]},{dateElements:Q,anchorItems:ue}=Ce,me=S.tz(X).format(Wa);ue.push({key:`${U}-${me}`,href:`#${P}`,title:me,children:[]}),!r&&z.reverse();const W=z.filter(({elements:pt})=>pt.length).map(({elements:pt,id:Je,color:En,title:It})=>{const Tn={backgroundColor:En};return ue.at(-1).children.push({key:Je,href:`#${Je}`,title:It}),n(K,{css:io,id:Je,"data-title":It,vertical:c,gap:10,wrap:!0,style:Tn,children:pt},Je)}),{today:re,AM:we,PM:ve}=M,Ie=Math.round(we.total),At=Math.round(ve.total),wn=Ie+At,vn=f("section",{css:so,children:[n("h1",{id:P,children:G}),f(K,{css:jt,justify:"space-between",children:[n(Ee,{title:Me[0],value:re.recordCount}),n(Ee,{title:Me[1],value:re.soldCount}),n(Ee,{title:Me[3],prefix:"$",value:Ie}),n(Ee,{title:Me[4],prefix:"$",value:At}),n(Ee,{title:Me[2],prefix:"$",value:wn})]}),W]},_);Q.push(vn)});if(!Ke){const _={css:uo};if(!r){const P=[],M=Object.keys(ye);a&&M.sort().reverse(),Fe=M.map(z=>{const{yearId:G,dateElements:X,anchorItems:U}=ye[z];return P.push({key:z,href:`#${G}`,title:z,children:U}),n("article",{id:G,children:X},G)}),Ve=n(la,{..._,items:P,offsetTop:64,targetOffset:100,bounds:220})}}pe=n(K,{css:oo,gap:8,ref:q,children:f("div",{css:[lo,!c&&po],children:[i&&n(ca,{placeholder:"找什麼呢?",mode:"tags",style:{width:"100%"},allowClear:!0,onChange:H,onKeyUp:_=>{_.preventDefault(),_.stopPropagation()},options:Ma}),Ke?E(Ke):n(j,{children:n("div",{className:"resta-orders-content",children:Fe})})]})}),R=Math.round(R);const Ge=ne.length===1,g=Ge?Me:mo;let y=ke??0,T=ie,D=R;if(r&&xe&&(p==="AM"||p==="PM")){const _=xe[p];y=_.recordCount,T=_.soldCount,D=_.total}Qe=!r&&Ge?null:f(K,{css:jt,justify:"space-between",children:[n("div",{css:!r&&yt,children:n(Ee,{title:`${r?bt[p]:""}${g[0]}`,value:y})}),n("div",{css:!r&&yt,children:n(Ee,{title:`${r?bt[p]:""}${g[1]}`,value:T})}),n("div",{css:!r&&yt,children:n(Ee,{title:`${r?bt[p]:""}${g[2]}`,prefix:"$",value:D})})]})}else ke===0&&(pe=E());return{records:L,recordLength:ke,totalCount:R,totalDays:be,soldItemsCount:ie,periodsOrder:ne,orderListElement:pe,anchorElement:Ve,summaryElement:Qe}},[b,v,V,p,t,d,m,o,r,a,i,c,h,x]),he=Pe(async()=>{let O=0;if(r){const[L,R]=[C.startOf("day").valueOf(),C.endOf("day").valueOf()];O=await A.orders.count({startTime:L,endTime:R})}return O},[k,r]),{records:le,recordLength:se,totalCount:$e,totalDays:He,soldItemsCount:de,periodsOrder:De,orderListElement:ge,anchorElement:dt,summaryElement:Ae}=oe??{periodsOrder:[]};return{records:le,recordLength:se,totalCount:$e,totalDays:He,soldItemsCount:de,periodsOrder:De,lastRecordNumber:he,orderListElement:f(j,{children:[B,ee,ge]}),anchorElement:dt,summaryElement:Ae,contentRef:q,callOrderAPI:I}}const Vt=[f(j,{children:[n("p",{children:"還沒營業? 今天沒人來? 還是老闆不爽做?"}),n("p",{children:"加油好嗎"})]}),f(j,{children:[n("p",{children:"為什麼今天還要上班"}),n("p",{children:"怎麼還沒有放假呢🥲"})]}),f(j,{children:[n("p",{children:"為什麼是我來夾菜..."}),n("p",{children:"夾菜好開心好快樂🥲"})]}),f(j,{children:[n("p",{children:"用微笑和樂觀面對生活，每一天都會快樂且充實"}),n("p",{children:"只要客人不要太機車😮‍💨"})]}),f(j,{children:[n("p",{children:"今天應該生意會很好，大排長龍，賺到破記錄"}),n("p",{children:"可是我會好累🫠"})]}),f(j,{children:[n("p",{children:"希望今天的奧客會少一點"}),n("p",{children:"然後大家都點菜點很快😇"})]}),f(j,{children:[n("p",{children:"當你看到我的時後，代表今天又是新的開始"}),n("p",{children:"開始倒數晚上8點下班吧"})]})],bo=l`
  position: relative;
  overflow: hidden;

  .resta-order-card {
    // for iPad 10
    @media only screen and (max-device-width: 1080px) and (orientation: landscape) {
      --resta-order-card-width: ${rn};
    }
  }

  .ant-drawer {
    .ant-drawer-header {
      background: radial-gradient(
        circle at 10% 20%,
        #cef5e6 42%,
        #c0e9f9 93.6%
      );
    }
    .ant-drawer-body {
      overflow: hidden;
    }
  }

  .ant-empty {
    font-size: 1rem;
  }
`,yo=l`
  position: relative;
`,xo=s.memo(()=>{const{DATE_FORMAT:e}=s.useContext(Xe),{orderListElement:t,summaryElement:a,lastRecordNumber:i,contentRef:o,callOrderAPI:r}=go({datetime:"today",orderPageMode:!0,emptyDescription:Vt[Math.floor(Math.random()*Vt.length)]}),c=s.useCallback(u=>{var d,m,h;u==="add"&&((h=(m=(d=o.current)==null?void 0:d.querySelector(".ant-tabs-tabpane"))==null?void 0:m.scroll)==null||h.call(m,0,0))},[o]);return f("div",{css:bo,children:[n(Yr,{lastRecordNumber:i,callOrderAPI:r,submitCallback:c}),n(da,{css:yo,title:f("span",{children:["訂單記錄 - ",S.tz().format(e)]}),getContainer:!1,placement:"right",open:!0,mask:!1,closeIcon:null,footer:a,children:t})]})}),xt=e=>{const t=s.lazy(e);return n(s.Suspense,{children:n(t,{})})},Co=s.memo(()=>{const e=n(xo,{});return n(Qn,{children:f(Oe,{element:n(Ia,{}),children:[n(Oe,{path:"/",element:e}),n(Oe,{path:"order",element:e}),n(Oe,{path:"order-list",element:xt(()=>ut(()=>import("./index-BRPZfaMA.js"),__vite__mapDeps([0,1,2,3,4,5]),import.meta.url))}),n(Oe,{path:"statistics",element:xt(()=>ut(()=>import("./index-C9ZdwULu.js"),__vite__mapDeps([6,1,2,3,7,4,5]),import.meta.url))}),n(Oe,{path:"settings",element:xt(()=>ut(()=>import("./index-BNUuy9lw.js"),__vite__mapDeps([8,1,2,3,4,5]),import.meta.url))}),n(Oe,{path:"login",element:n(j,{children:"Login"})})]})})}),wo=Jn([{path:"*",element:n(Co,{})}]),vo=()=>f(Xe.Provider,{value:dn,children:[n(ea,{styles:[Ea]}),n(pa,{theme:{components:ka},children:n(ta,{router:wo})})]});na(document.getElementById("root")).render(n(vo,{}));export{Xe as A,fe as C,Ga as D,Yr as K,Oo as L,Sa as M,zt as N,ja as O,Ua as a,Ma as b,So as c,Ro as d,Bo as e,ze as f,Za as g,Ao as h,Xa as i,_t as j,Mo as k,Io as l,Do as m,va as n,Wt as o,it as p,$o as q,No as s,Po as t,go as u};
