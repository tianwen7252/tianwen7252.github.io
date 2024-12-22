import{r as a,Z as u,aa as V,ad as P,a2 as e,a1 as h,a3 as H,R as xe,ao as Ce,ap as ke,aq as Q,ar as Ie,as as ve}from"./vendor-BI7AP7kA.js";import{S as we}from"./StickyHeader-YG-wK0gn.js";import{A as ie,L as Te,M as Se,q as Re,N as De}from"./index-BV8QanmR.js";import{s as ae,M as Me,I as z,l as F,B as I,b as se,F as Oe,d as $e,h as x,m as ce,R as j,n as w,g as T,o as S,S as Z}from"./antd-BXZtuar0.js";import{s as G,aa as W,ab as X,a0 as ee,Y as Ae,ac as Be,ad as Ee,ae as Ne,af as Ue,ag as _e}from"./antd-design-BgRsLr4a.js";import"./antd-rc-eGw6kBFk.js";import"./mathjs-6WDVO1Xf.js";const Y={product:{}},Le={storage:Y,updateStorage:()=>{},setInitialStorage:m=>{}},le=a.createContext(Le),Ve=u`
  padding: 20px;
`,q=u`
  margin-bottom: 20px;
`,Pe=u`
  float: right;
`;u`
  margin-bottom: 16px;
`;u`
  width: 100%;
  margin-bottom: 16px;
`;u`
  width: 100%;
  margin-bottom: 16px;
`;const He=u`
  margin-bottom: 40px;
  .ant-table-thead > tr > th {
    background: #f1fafe;
  }
`,te=u`
  margin-top: 20px;
  margin-bottom: 30px;

  .ant-table-thead > tr > th {
    background: #f0f9f3;
  }
`,ze=u`
  margin-top: 20px;
  margin-bottom: 20px;

  .ant-table-thead > tr > th {
    background: #fef4cb66;
  }
`,_=u`
  margin-right: 10px;
`,ne=u`
  margin-left: 10px;
`,Fe=u`
  margin-top: 40px;
  padding: 20px;
`,L=m=>{var f;const i=m.closest(".ant-table-row");return Array.from(((f=i==null?void 0:i.parentElement)==null?void 0:f.childNodes)??[]).indexOf(i)},je=()=>{const{API:m}=a.useContext(ie),{storage:i,updateStorage:f,setInitialStorage:R}=a.useContext(le),[D,k]=a.useState(""),[M,E]=ae.useNotification(),[C,g]=Me.useModal(),[O,A]=a.useReducer(r=>!r,!0),J=a.useRef("1"),U=a.useRef(!1);a.useLayoutEffect(()=>{if(D){const[r,s,d]=D.split(":");setTimeout(()=>{var t,n,p,y;const o=document.getElementById(r).querySelectorAll(".ant-table-tbody > tr");if(o.length&&o[d]){const l=o[d];l.childNodes.forEach(c=>{c.classList.remove("ant-table-cell-row-hover")}),s==="up"?(n=(t=l==null?void 0:l.previousSibling)==null?void 0:t.childNodes)==null||n.forEach(c=>{c.classList.add("ant-table-cell-row-hover")}):(y=(p=l==null?void 0:l.nextSibling)==null?void 0:p.childNodes)==null||y.forEach(c=>{c.classList.add("ant-table-cell-row-hover")})}},100)}},[D]);const b=a.useCallback((r=!1)=>{r&&A(),f()},[f]),N=V(async()=>{if(U.current)return[];const r=await m.commondityTypes.get();return i.product.commondityTypes=r,R("product.commondityTypes"),r.map(s=>({key:s.id,...s}))},[],[]),K=a.useCallback(P((r,s)=>{i.product.commondityTypes.some(d=>d.id===r?(d.label=s.target.value,b(),!0):!1)},300),[b]),de=a.useMemo(()=>[{title:"編號",dataIndex:"typeID",key:"typeID"},{title:"種類",dataIndex:"label",key:"label",render:(r,s)=>e(z,{defaultValue:s.label,style:{width:200},onChange:K.bind(null,s.id)},s.id)}],[K]),pe=V(async()=>{if(U.current)return;const r=await m.commondity.get();i.product.commondities=r,R("product.commondities")},[],[]),$=a.useCallback(P((r,s,d,o)=>{const{commondities:t}=i.product,n=t.find(y=>y.id===r),{typeID:p}=n;if(n){const y=o==null?void 0:o.target,l="resta-settings-commondity-tabs";switch(s){case"edit":{const c=(y==null?void 0:y.value)??o;n[d]=c,b();break}case"delete":{n.id.toString().includes("new-")?i.product.commondities=t.filter(c=>c.id!==r):n.onMarket="0",b(!0);break}case"moveUp":{const c=t.find(v=>v.priority===n.priority-1&&v.typeID===p);if(c){++c.priority,--n.priority;const v=L(y);b(!0),k(`${l}:up:${v}`)}break}case"moveDown":{const c=t.find(v=>v.priority===n.priority+1&&v.typeID===p);if(c){--c.priority,++n.priority;const v=L(y);b(!0),k(`${l}:down:${v}`)}break}}}},150),[]),ue=a.useMemo(()=>{var d;const r=[{title:"順序",dataIndex:"priority",key:"priority"},{title:"品名",dataIndex:"name",key:"name",render:(o,t)=>e(z,{defaultValue:t.name,onChange:$.bind(null,t.id,"edit","name")},t.id)},{title:"價格",dataIndex:"price",key:"price",render:(o,t)=>e($e,{type:"number",defaultValue:t.price,onChange:$.bind(null,t.id,"edit","price")},t.id)},{title:"鍵盤顯示",dataIndex:"hideOnMode",key:"hideOnMode",render:(o,t)=>h(x,{defaultValue:t.hideOnMode||"",style:{width:140},onChange:n=>$(t.id,"edit","hideOnMode",n),children:[e(x.Option,{value:"",children:"皆顯示"}),e(x.Option,{value:"calculator",children:"僅顯示在計算機"}),e(x.Option,{value:"commondity",children:"僅顯示在商品"}),e(x.Option,{value:"both",children:"皆不顯示"})]})},{title:"設定",key:"action",render:(o,t)=>h(H,{children:[e(I,{css:_,type:"text",variant:"filled",color:"primary",icon:e(W,{}),onClick:$.bind(null,t.id,"moveUp",null)}),e(I,{css:_,type:"text",variant:"filled",color:"primary",icon:e(X,{}),onClick:$.bind(null,t.id,"moveDown",null)}),e(I,{css:ne,type:"text",variant:"filled",color:"danger",icon:e(ee,{}),onClick:$.bind(null,t.id,"delete",null)})]})}],s={};return(d=i.product.commondities)==null||d.forEach(o=>{const{id:t,typeID:n,priority:p,onMarket:y}=o;s[n]=s[n]??[],y==="1"&&s[n].push({key:`${t}-${p}`,...o})}),(N==null?void 0:N.map(o=>{const{id:t,label:n,typeID:p}=o,y=s[p]??[];return y.sort((l,c)=>l.priority-c.priority),{key:t,label:n,children:e(F,{bordered:!1,css:te,dataSource:y,columns:r,pagination:!1})}}))??[]},[N,$,pe,O]),me=a.useCallback(()=>{var o,t;const r=J.current,{commondities:s}=i.product,d=s.filter(n=>n.typeID===r).sort((n,p)=>n.priority-p.priority);if(d){const n=d.at(-1).priority+1;s.push({hideOnMode:"",id:`new-${Date.now()}`,name:"",onMarket:"1",price:0,priority:n,editor:"admin",typeID:r}),b(!0),window.scroll({top:((t=(o=document.getElementById("resta-settings-commondity-tabs"))==null?void 0:o.getBoundingClientRect())==null?void 0:t.bottom)-document.body.getBoundingClientRect().top-150,left:0,behavior:"smooth"})}},[i.product,b]),ye=V(async()=>{if(U.current)return;const r=await m.orderTypes.get();i.product.orderTypes=r,R("product.orderTypes")},[],[]),B=a.useCallback(P((r,s,d,o)=>{const{orderTypes:t}=i.product,n=t.find(p=>p.id===r);if(n){const p=o==null?void 0:o.target,y="resta-settings-orderTypes-table";switch(s){case"edit":{const l=(p==null?void 0:p.value)??o;n[d]=l,b();break}case"delete":{i.product.orderTypes=t.filter(l=>l.id!==r),b(!0);break}case"moveUp":{const l=t.find(c=>c.priority===n.priority-1);if(l){++l.priority,--n.priority;const c=L(p);b(!0),k(`${y}:up:${c}`)}break}case"moveDown":{const l=t.find(c=>c.priority===n.priority+1);if(l){--l.priority,++n.priority;const c=L(p);b(!0),k(`${y}:down:${c}`)}break}}}},150),[]),[fe,ge]=a.useMemo(()=>{var d;const r=[{title:"順序",dataIndex:"priority",key:"priority"},{title:"名稱",dataIndex:"name",key:"name",render:(o,t)=>e(z,{defaultValue:t.name,onChange:B.bind(null,t.id,"edit","name")},t.id)},{title:"顏色",dataIndex:"color",key:"color",render:(o,t)=>h(x,{defaultValue:t.color??"",style:{width:120},onChange:n=>B(t.id,"edit","color",n),children:[e(x.Option,{value:"",children:"無"}),e(x.Option,{value:"red",children:"紅色"}),e(x.Option,{value:"blue",children:"藍色"}),e(x.Option,{value:"purple",children:"紫色"}),e(x.Option,{value:"gold",children:"金色"}),e(x.Option,{value:"brown",children:"咖啡色"})]},t.id)},{title:"設定",key:"action",render:(o,t)=>h(H,{children:[e(I,{css:_,type:"text",variant:"filled",color:"primary",icon:e(W,{}),onClick:B.bind(null,t.id,"moveUp",null)}),e(I,{css:_,type:"text",variant:"filled",color:"primary",icon:e(X,{}),onClick:B.bind(null,t.id,"moveDown",null)}),e(I,{css:ne,type:"text",variant:"filled",color:"danger",icon:e(ee,{}),onClick:B.bind(null,t.id,"delete",null)})]})}],s=((d=i.product.orderTypes)==null?void 0:d.map(o=>({...o,key:o.id})).sort((o,t)=>o.priority-t.priority))??[];return[r,s]},[ye,B,O]),he=a.useCallback(()=>{var d,o;const{orderTypes:r}=i.product;if(r.length>=10){M.warning({message:"系統設定",description:"訂單分類最多只能10個",showProgress:!0});return}const s=r.sort((t,n)=>t.priority-n.priority);if(s){const t=s.at(-1).priority+1;r.push({id:`new-${Date.now()}`,name:"",priority:t,editor:"admin",type:"order"}),b(!0),window.scroll({top:((o=(d=document.getElementById("resta-settings-orderTypes-table"))==null?void 0:d.getBoundingClientRect())==null?void 0:o.bottom)-document.body.getBoundingClientRect().top-100,left:0,behavior:"smooth"})}},[i.product,M,b]),be=a.useCallback(r=>{J.current=r},[]);return h("div",{css:Ve,children:[E,g,e("h2",{css:q,children:"商品種類"}),e(F,{bordered:!1,css:He,dataSource:N,columns:de,pagination:!1}),e("h2",{css:q,children:"商品設定"}),e(se,{id:"resta-settings-commondity-tabs",items:ue,css:te,tabBarExtraContent:e(I,{icon:e(G,{}),onClick:me,children:"新增商品"}),onChange:be}),h("h2",{css:q,children:["訂單分類",e(I,{css:Pe,icon:e(G,{}),onClick:he,children:"新增分類"})]}),e(F,{id:"resta-settings-orderTypes-table",css:ze,bordered:!1,dataSource:ge,columns:fe,pagination:!1}),e(I,{css:Fe,type:"primary",danger:!0,block:!0,onClick:a.useCallback(()=>{C.confirm({title:"危險動作 - 請再次確認",content:h(H,{children:[e("label",{children:"確定要還原所有商品和分類到預設狀態嗎？此操作無法復原。"}),h("h4",{children:["預設資料的最後更新日期為：",Te]})]}),okText:"確認還原",cancelText:"取消",okType:"danger",width:500,onOk:()=>{U.current=!0,m.reset(),setTimeout(()=>{M.success({message:"系統設定",description:"資料已還原成功，即將重新啟動App...",showProgress:!0,duration:3})},100),setTimeout(()=>{window.location.reload()},3e3)}})},[C,m,M]),children:"還原預設"}),e(Oe.BackTop,{visibilityHeight:100})]})},oe="0.0.9",qe=u`
  .ant-card-bordered {
    border: 1px solid #ddd;
    background-image: linear-gradient(
      to right bottom,
      #ffffff,
      #fff,
      #fff,
      #fff,
      #f5f5f5
    );
  }
  .ant-statistic .ant-statistic-title {
    font-size: 0.9rem;
    color: #777;
  }
`,re=m=>Number(m==null?void 0:m.replaceAll(".","")),Ye=xe.memo(()=>{const[m,i]=ae.useNotification(),[f,R]=a.useState("---"),[{useage:D,percentageUsed:k,remaining:M},E]=a.useState({useage:"---",percentageUsed:"---",remaining:"---"});let C=!1;return re(f)>re(oe)&&(C=!0),Ce(async()=>{try{const g=await ke.get(Se).json();if(g!=null&&g.start_url){const O=g.start_url.match(/v=(.+)/);O&&R(O[1])}}catch(g){g!=null&&g.message&&m.error({message:"網路資料錯誤",description:`取得最新版本失敗: ${g.message}`,duration:20,showProgress:!0})}try{const{useage:g,percentageUsed:O,remaining:A}=await Re();E({useage:g,percentageUsed:O,remaining:A})}catch{}},[m]),h("div",{css:qe,children:[i,C&&e(ce,{style:{margin:"12px 0"},message:"請重開App將自動更新到最新版本",type:"warning",showIcon:!0}),h(j,{gutter:12,children:[e(S,{span:8,children:e(w,{children:e(T,{title:"本機App版本",prefix:"v",value:oe})})}),e(S,{span:8,children:e(w,{children:e(T,{title:"程式資料庫同步版本",value:De})})}),e(S,{span:8,children:e(w,{children:e(T,{title:"本機資料庫同步版本",value:localStorage.getItem("SYNC_NUMBER")})})})]}),h(j,{gutter:12,style:{marginTop:12},children:[e(S,{span:8,children:e(w,{children:e(T,{title:"最新App版本",prefix:"v",value:f})})}),e(S,{span:8,children:e(w,{children:e(T,{title:"雲端資料同步版本",value:"---"})})}),e(S,{span:8,children:e(w,{children:e(T,{title:"本機雲端資料同步版本",value:localStorage.getItem("CLOUD_SYNC_NUMBER")??"---"})})})]}),h(j,{gutter:12,style:{marginTop:12},children:[e(S,{span:8,children:e(w,{children:e(T,{title:"本機資料庫使用量",value:D})})}),e(S,{span:8,children:e(w,{children:e(T,{title:"本機資料庫剩餘量",value:M})})}),e(S,{span:8,children:e(w,{children:e(T,{title:"本機資料庫使用率",value:k})})})]})]})}),Je=u`
  margin-bottom: 20px;
  font-size: 1.4rem;
  color: #6b6868;
  padding: 10px 20px;
`,Ke=u`
  vertical-align: middle;
`,Qe=u`
  padding-bottom: 80px;
  h2 {
    font-weight: normal;
    color: #6b6868;
    font-size: 1.3rem;
    border-left: 6px solid #6b686891;
    border-radius: 4px;
    padding-left: 8px;
  }
  .ant-tabs .ant-tabs-tab {
    font-size: 1rem;
  }
`,Ze=u`
  padding: 0 20px;
`,Ge=u`
  padding: 4px 8px;
  margin-left: 20px;
`,We=u`
  float: right;
  right: 60px;
  padding: 14px 8px;
  top: 5px;
  font-size: 1rem;
`,Xe=[{key:"info",icon:e(Be,{}),label:"系統資訊",children:e(Ye,{})},{key:"product",icon:e(Ee,{}),label:"商品設定",children:e(je,{})},{key:"stuff",icon:e(Ne,{}),label:"員工設定"},{key:"cost",icon:e(Ue,{}),label:"每月成本"},{key:"cloud",icon:e(_e,{}),label:"雲端同步"}],et=()=>{const{API:m}=a.useContext(ie),i=a.useMemo(()=>({...Y}),[]),f=a.useMemo(()=>Q(Y),[]),[R,D]=a.useState(!1),k=a.useCallback(()=>{console.log("comparison",i,f),D(JSON.stringify(i)!==JSON.stringify(f))},[i,f]),M=a.useCallback(()=>{const{product:{commondityTypes:C,commondities:g,orderTypes:O}}=i;C.forEach(A=>{m.commondityTypes.set(A.id,A)}),D(!1)},[i,f,k,m]),E=a.useMemo(()=>({storage:i,updateStorage:k,setInitialStorage:C=>{Ie(f,C,Q(ve(i,C))),console.log("init",C,i,f)}}),[i,f,k]);return e(le.Provider,{value:E,children:h("div",{css:Qe,children:[h(we,{cls:Je,children:[h(Z,{css:Ke,children:[e(Ae,{}),e("label",{children:"系統設定"}),R&&e(Z,{children:e(ce,{css:Ge,description:"設定尚未存檔",type:"warning",showIcon:!0})})]}),R&&e(I,{css:We,size:"small",type:"primary",onClick:M,children:"存檔設定 (未完成)"})]}),e("div",{css:Ze,children:e(se,{items:Xe,defaultActiveKey:"info",destroyInactiveTabPane:!0})})]})})},ct=et;export{et as Component,ct as Settings,ct as default};