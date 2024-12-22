import{C as P,Z as M,r as m,al as ye,am as Ce,a1 as O,a2 as c,an as ve,aa as Ee,a6 as $,a3 as De}from"./vendor-BI7AP7kA.js";import{S as ke}from"./StickyHeader-YG-wK0gn.js";import{C as H,p as Oe,B as Te,D as Ae,a as xe,P as Me,L as $e}from"./chartjs-DcC58poK.js";import{C as W,A as ce,f as ie,g as ae,i as de,j as Se,n as we,D as se,o as Fe,p as Re,a as Be}from"./index-BV8QanmR.js";import{a as q,S as ue,e as ne,E as Pe,g as S,F as _e,k as Ie}from"./antd-BXZtuar0.js";import{X as fe,a7 as je,a8 as ze,a9 as Le}from"./antd-design-BgRsLr4a.js";import"./antd-rc-eGw6kBFk.js";import"./mathjs-6WDVO1Xf.js";const L={red:"#ff6384",orange:"#ff9f40",yellow:"#ffcd56",green:"#4bc0c0",blue:"#36a2eb",purple:"#9966ff",gray:"#c9cbcf",cinnabar:"#ea4335",palePink:"#f4d8dd",pastelPurple:"#b99fb1",brownSugar:"#b47556",coffee:"#6d4932",gunmetal:"#30313c",armyGreen:"#44501d",coolGrey:"#8898a7",chineseSilver:"#c4d0d2"},T={red:"#ff638480",orange:"#ff9f4080",yellow:"#ffc23380",green:"#4bc0c080",blue:"#37a2eb80",purple:"#9966ff80",gray:"#c9cbcfd9",cinnabar:"#ea433580",palePink:"#f4d8dd80",pastelPurple:"#b99fb180",brownSugar:"#b4755680",coffee:"#6d493280",gunmetal:"#30313c80",armyGreen:"#44501d80",coolGrey:"#8898a780",chineseSilver:"#c4d0d29e"},qe={chineseWhite:"#D5EAE5",columbiaBlue:"#C9DDE7",champagne:"#F4E5CA",palePink:"#F4D8DD",americanSilver:"#CECED0",sunray:"#E9B95E",tealBlue:"#2D6B8E80",skyBlue:"#7BC7EE",pastelYellow:"#F4F497",deepPeach:"#F6C2A6",cottonCandy:"#FBBED6",africanViolet:"#B68EC990",maximumBlueGreen:"#24DAC5",maize:"#F8C058",conditioner:"#FEFFC9",peru:"#C68642"},He={chineseWhite:"#D5EAE5",columbiaBlue:"#C9DDE7",champagne:"#F4E5CA",palePink:"#F4D8DD",americanSilver:"#CECED0",purple:`${W.purple}80`,blue:`${W.blue}80`,gold:`${W.gold}80`,red:`${W.red}80`,skyBlue:"#7BC7EE",cottonCandy:"#FBBED6",africanViolet:"#B68EC990",maximumBlueGreen:"#24DAC5",maize:"#F8C058",conditioner:"#FEFFC9",peru:"#C68642"},re={d:{label:"日",value:"d"},w:{label:"週",value:"w"},m:{label:"月",value:"m"},q:{label:"季",value:"q"},y:{label:"年",value:"y"}},Ne="d|w|m|q|y",Ye={d:["d","w","m"],w:["d","w","m"],m:["w","m","q","y"],q:["m","q","y"],y:["m","q","y"]},Ge=Array.from(Array(10)).map((a,l)=>l+10);function Qe(a){let l="d";return a<=7?l="d":a<=31?l="w":a<=90?l="m":a<=180||a<365?l="q":a>=365&&(l="y"),l}function Z(a,l=T){const b=Object.keys(l);return l[b[a%b.length]]}function We(a){const l=a instanceof P?a:P.tz(a),b=l.startOf("M").day(),t=l.date()+b;let o=Math.floor(t/7);return t%7!==0&&++o,o}function N(a,l,b){var s,n,r;const t=Object.keys(a),o=(r=(n=(s=t[0])==null?void 0:s.split)==null?void 0:n.call(s,"/"))==null?void 0:r[0];let f=!0;const i=new Set;let e;return t.forEach((d,u)=>{const h=P.tz(d),[C,A]=d.split("/");let v;switch(l){case"w":{const x=We(h);v=`${C}/${A}/W${x}`,i.add(v);break}case"m":v=`${C}/${A}月`,i.add(v);break;case"q":{const x=h.quarter();v=`${C}/Q${x}`,i.add(v);break}case"y":{v=C,i.add(v);break}case"d":default:{v=d;break}}C!==o&&(f=!1),b==null||b({day:h,date:d,group:v},u)}),l==="d"?e=t:e=Array.from(i),{labels:f&&o&&l!=="y"?e.map(d=>d.split("/").slice(1).join("/")):e,dates:t}}const Ue={id:"totalizer",beforeUpdate:(a,l,b)=>{const t={};let o=0;b.calculate===!0&&a.data.datasets.forEach((f,i)=>{a.isDatasetVisible(i)&&(o=i,f.data.forEach((e,s)=>{t[s]=(t[s]||0)+e}))}),a.$totalizer={totals:t,utmost:o}}};H.register(Ue);const Ve=M`
  .ant-empty-image {
    height: auto;
    > span {
      background: #efefef2e;
      padding: 40px 0;
      border-radius: 20px;
      width: 100%;
      color: #efefef;
      font-size: 13rem;
    }
  }
`,Xe=M`
  font-size: 1.4rem;
  color: #6b6868;
  margin-bottom: 20px;
`,Ze=M`
  justify-content: space-between;
  align-items: baseline;
`,Je=M`
  width: 100%;
  .ant-empty {
    width: 100%;
  }
`;H.register(Oe);H.defaults.plugins.legend.position="bottom";H.defaults.plugins.legend.onClick=(a,l,b)=>{const t=l.datasetIndex,{chart:o}=b,f=o.getDatasetMeta(t).hidden===null?!1:o.getDatasetMeta(t).hidden;o.data.datasets.forEach((i,e)=>{const s=o.getDatasetMeta(e);e!==t?f?s.hidden===null&&(s.hidden=!0):s.hidden=s.hidden===null?!s.hidden:null:e===t&&(s.hidden=null)}),o.update()};H.defaults.layout.padding={top:20};const w=m.memo(({dateMap:a,dateType:l="d",title:b,type:t,style:o,color:f="1",allowedDateType:i=Ne,displayTypes:e="**|doughnut|table",handle:s})=>{const{getAllCommoditiesInfo:n}=m.useContext(ce),[r,d]=m.useState(null),[u=re[l].value,h]=m.useState(),[C,A]=m.useState(t),v=m.useRef(!1),x=t==="doughnut"||t==="pie",Y=x?600:"auto",_=m.useMemo(()=>e&&ye(e.trim().replace("**",t).split("|")).map(y=>({label:oe(y),value:y})),[t,e]),I=m.useMemo(()=>{switch(f){case"orderTypes":return He;case"2":return qe;case"1":default:return T}},[f]),G=m.useMemo(()=>{switch(t){case"line":return $e;case"pie":return Me;case"bubble":return xe;case"doughnut":return Ae;case"bar":default:return Te}},[t]),j=m.useMemo(()=>oe(t),[t]),E=m.useMemo(()=>{if(i&&a){const y=i.trim().split("|");return Ce(y.concat(Ye[l]),(D,R,B)=>ve(B,D,R+1)).map(D=>re[D.trim()])}return[]},[a,l,i]),p=m.useCallback(y=>{A(y)},[]),g=m.useCallback(y=>{h(y)},[]);return m.useEffect(()=>{E.length&&!E.some(({value:y})=>y===u)&&(v.current=!0,h(E[0].value))},[E,u]),m.useEffect(()=>{const y=async()=>{const{resMapGroup:k}=await n(),D=await(s==null?void 0:s(a,C,u,I,k));D&&d(D)};!v.current&&y(),v.current=!1},[a,s,u,C,I,n]),O("div",{css:Ve,children:[O(q,{css:Ze,children:[O(ue,{css:Xe,children:[j,c("label",{children:b})]}),_&&r&&c(ne,{options:_,value:C,onChange:p}),i?c(ne,{options:E,value:u,onChange:g}):c("div",{style:{width:112}})]}),c(q,{css:Je,align:x&&"center",style:{height:Y,...o},vertical:!0,children:r?c(G,{options:r.options,data:r.data}):c(Pe,{description:!1,image:j})})]})});function oe(a){switch(a){case"line":return c(Le,{});case"doughnut":case"pie":return c(ze,{});case"table":return c(je,{});case"bar":default:return c(fe,{})}}function Ke(a,l,b){if(!a)return null;const t=[{label:"上午",data:[],backgroundColor:T.yellow,stack:"stack 0"},{label:"下午",data:[],backgroundColor:T.blue,stack:"stack 0"}],o={},f={},i={},{labels:e}=N(a,b,({date:n,group:r})=>{const{records:d,dailyData:u}=a[n];d.forEach(({total:h,$isAM:C})=>{C?f[r]=(f[r]??0)+h:i[r]=(i[r]??0)+h}),o[r]=(o[r]??0)+u.total}),s=Object.values(o);return t[0].data=Object.values(f),t[1].data=Object.values(i),{options:{responsive:!0,scales:{x:{stacked:!0},y:{stacked:!0}},plugins:{datalabels:{anchor:"end",align:"end",formatter(n,r){const d=s[r.dataIndex];return ie(d)},display(n){return n.datasetIndex===1}}}},data:{labels:e,datasets:t}}}function et(a,l,b){if(!a)return null;const t=[{label:"營收",data:[],backgroundColor:T.orange},{label:"成本",data:[],backgroundColor:T.chineseSilver},{label:"淨利",data:[],backgroundColor:T.green}],o={},{labels:f}=N(a,b,({date:e,group:s})=>{const{records:n,dailyData:r}=a[e];n.forEach(({total:d,$isAM:u})=>{}),o[s]=(o[s]??0)+r.total}),i=Object.values(o);return t[0].data=i,t[1].data=[],t[2].data=i,{options:{responsive:!0,plugins:{datalabels:{anchor:"end",align:"end",formatter(e){return ie(e)}}}},data:{labels:f,datasets:t}}}function tt(a,l){if(!a)return null;const b=(e,s)=>e.p0.skip||e.p1.skip?s:void 0,t=(e,s,n)=>(e!=null&&e.p0DataIndex?e.p0DataIndex:e.dataIndex)>=6?s:n,o=[{label:"營業時間",data:[],backgroundColor:e=>t(e,T.blue,T.yellow),borderColor:e=>t(e,L.blue,L.yellow),pointStyle:"circle",pointRadius:10,pointHoverRadius:15,segment:{pointBackgroundColor:e=>t(e,T.blue),pointBorderColor:e=>t(e,L.blue),borderColor:e=>b(e,L.gray)||t(e,L.blue),borderDash:e=>b(e,[6,6])},spanGaps:!0}],f=[...Ge].map(e=>e===14||e===15?`午休 (${ae(e,!0)})`:ae(e,!0));return Object.keys(a).forEach(e=>{const{records:s}=a[e];s.forEach(({createdAt:n})=>{const u=P.tz(n).hour()-10;if(u>-1){const h=o[0].data;h[u]=h[u]??0,++h[u]}})}),o[0].data[4]=NaN,o[0].data[5]=NaN,{options:{responsive:!0,scales:{x:{stacked:!0},y:{stacked:!0}},plugins:{totalizer:{calculate:!0},datalabels:{anchor:"end",align:"end",formatter(e){return`${e} 人`}}},fill:!1,interaction:{intersect:!1},radius:0},data:{labels:f,datasets:o}}}function at(a,l,b,t,o,f){if(!l)return null;const i={},{labels:e}=N(l,t,({date:n,group:r})=>{const{records:d}=l[n];d.forEach(({data:u})=>{u.forEach(({res:h,type:C})=>{C===a&&(i[h]=i[h]??{},i[h][r]=(i[h][r]??0)+1)})})}),s=f[a].map((n,r)=>({label:n,data:Object.values(i[n]??{}),backgroundColor:Z(r,o),stack:"stack 0",datalabels:{formatter(d,u){let h=0;return u.chart.data.datasets.forEach(A=>{h+=A.data[u.dataIndex]??0}),`${(d/h*100).toFixed(1)}%`}}}));return s.push({label:"Total",data:[...Array.from(Array(e.length)).map(()=>0)],datalabels:{align:"end",anchor:"end",formatter(n,r){let d=0;return r.chart.data.datasets.forEach(u=>{d+=u.data[r.dataIndex]??0}),de(d)}},stack:"stack 0"}),{options:{responsive:!0,scales:{x:{stacked:!0},y:{stacked:!0}},plugins:{tooltip:{callbacks:{label(n){return`${n.dataset.label+": "||""}${n.parsed.y}份`}}}}},data:{labels:e,datasets:s}}}function X(a){return m.useMemo(()=>at.bind(null,a),[a])}function st(a,l,b,t){if(!a)return null;const o={},{labels:f}=N(a,b,({date:e,group:s})=>{const{records:n}=a[e];n.forEach(({memo:r})=>{r!=null&&r.length&&r.forEach(d=>{o[d]=o[d]??{},o[d][s]=(o[d][s]??0)+1})})}),i=Se.map(({name:e},s)=>({label:e,data:Object.values(o[e]??{}),backgroundColor:Z(s,t),stack:"stack 0",datalabels:{formatter(n,r){let d=0;return r.chart.data.datasets.forEach(h=>{d+=h.data[r.dataIndex]??0}),`${(n/d*100).toFixed(1)}%`}}}));return i.push({label:"Total",data:[...Array.from(Array(f.length)).map(()=>0)],backgroundColor:"#7BC7EE",datalabels:{align:"end",anchor:"end",formatter(e,s){let n=0;return s.chart.data.datasets.forEach(r=>{n+=r.data[s.dataIndex]??0}),de(n)}},stack:"stack 0"}),{options:{indexAxis:"y",responsive:!0,scales:{x:{stacked:!0},y:{stacked:!0}}},data:{labels:f,datasets:i}}}function nt(a,l,b,t,o){if(!a)return null;const f=[],i=[...o["main-dish"]];N(a,b,({date:s})=>{const{records:n}=a[s];n.forEach(({data:r,memo:d})=>{d!=null&&d.length&&!d.includes("外送")||r.forEach(({res:u,type:h})=>{if(h==="main-dish"){const C=i.indexOf(u);C>-1&&(f[C]=(f[C]??0)+1)}})})});const e=[{data:f,backgroundColor:i.map((s,n)=>Z(n,t)),datalabels:{formatter(s){if(s===void 0)return"";const n=f.reduce((d,u)=>d+u,0),r=(s/n*100).toFixed(1);return`${s}份 (${r}%)`}}}];return{options:{responsive:!0,plugins:{tooltip:{callbacks:{label(s){return`${s.parsed}份`}}}}},data:{labels:i,datasets:e}}}const rt=M`
  padding: 20px;
  padding-bottom: 80px;
`,ot=M`
  margin-bottom: 20px;
  font-size: 1.4rem;
  color: #6b6868;
  padding: 10px 20px;

  .ant-picker {
    margin-left: 30px;
    margin-right: 20px;
  }
`,lt=M`
  vertical-align: middle;
`,ct=M`
  .ant-flex {
    margin-bottom: 20px;
    justify-content: space-around;
  }

  .ant-statistic {
    text-align: center;
  }

  .ant-statistic-title {
    color: #858585;
    font-size: 1.1rem;
    border-bottom: 1px solid #d3cdcd;
    padding-bottom: 4px;
  }
`,F=M`
  ${we({rtColor:"#FBD28E",rbColor:"#B2E9E6",lbColor:"#FCD5C2",ltColor:"#FFBBBA"})}
`,{RangePicker:it}=Ie,le={},dt=m.memo(()=>{const{API:a}=m.useContext(ce),l=P.tz(),b=l.format(se),[t,o]=m.useState(()=>[l.startOf("day"),l.endOf("day")]),[f,i]=m.useState("今天"),[e,s,n]=m.useMemo(()=>{if(!(t!=null&&t.length))return[null,null,void 0];const p=t.map(k=>k.valueOf()),g=Math.abs(t[0].diff(t[1],"day")),y=Qe(g);return[...p,y]},[t]),r=m.useMemo(()=>{const p=l.startOf("day"),g=l.endOf("day"),y=p.add(-1,"d"),k=p.quarter()>2;return[{label:"今天",value:[p,g]},{label:"昨天",value:[y,y.endOf("day")]},{label:"2天內",value:[y,g]},{label:"本週",value:[p.day(1),g]},{label:"上週",value:[p.add(-7,"d").day(1),g.add(-7,"d").day(5)]},{label:"2週內",value:[p.add(-14,"d").day(1),g]},{label:"本月",value:[p.startOf("M"),g]},{label:"上個月",value:[p.add(-1,"M").startOf("M"),g.add(-1,"M").endOf("M")]},{label:"2月內",value:[p.add(-1,"M").startOf("M"),g]},{label:"本季",value:[p.startOf("Q"),g]},{label:"上季",value:[p.add(-1,"Q").startOf("Q"),g.add(-1,"Q").endOf("Q")]},{label:"上半年",value:[p.startOf("y"),p.month(5).endOf("M")]},k?{label:"下半年",value:[p.month(6).startOf("M"),g.endOf("y")]}:null,{label:"今年",value:[p.startOf("y"),g.endOf("y")]},{label:"去年",value:[p.add(-1,"y").startOf("y"),g.add(-1,"y").endOf("y")]},{label:"2年內",value:[p.add(-1,"y"),g]}].filter(D=>D)},[b]),d=m.useCallback(p=>{if(p){const[g,y]=p;r.some(({label:D,value:R})=>{const B=R[0].valueOf()===g.valueOf()&&R[1].valueOf()===y.valueOf();return B&&i(D),B})||i(""),o(p)}},[r]),{records:u,dailyDataInfo:h}=Ee(async()=>!e||!s?le:await a.statistics.get(e,s),[e,s],le),C=m.useMemo(()=>{if(!u||!h)return{incomeTotal:null,incomeAMTotal:null,incomePMTotal:null,recordsCount:null,resCount:null,mainDishCount:null,profits:null,cost:null,dateMap:null};const p={};let g=0,y=0,k=0,D=0,R=0,B=0,pe=0;return h.forEach(z=>{const{date:Q,total:U}=z;g+=U,p[Q]=p[Q]??{records:[],dailyData:z}}),u.forEach(z=>{const{createdAt:Q,data:U,total:J}=z,V=P.tz(Q),he=V.format(se),K=Fe(V.hour(),V.minute())==="AM";K?y+=J:k+=J,U.forEach(({res:be,type:me,amount:ge})=>{const te=Re(ge);be&&(me==="main-dish"&&(R+=te),D+=te)});const ee=z;ee.$isAM=K,p[he].records.push(ee)}),{incomeTotal:g,incomeAMTotal:y,incomePMTotal:k,resCount:D,mainDishCount:R,profits:B,cost:pe,recordsCount:(u==null?void 0:u.length)??0,dateMap:p}},[u,h]),{incomeTotal:A,profits:v,cost:x,recordsCount:Y,incomeAMTotal:_,incomePMTotal:I,resCount:G,mainDishCount:j,dateMap:E}=C;return O(De,{children:[O(ke,{cls:ot,children:[O(ue,{css:lt,children:[c(fe,{}),c("label",{children:"統計報表"})]}),c(it,{showNow:!0,inputReadOnly:!0,presets:r,format:Be,placeholder:["開始日期","結束日期"],size:"large",value:t,onChange:d}),c("label",{children:f&&`(${f})`})]}),O(q,{css:rt,vertical:!0,gap:40,children:[O("div",{css:ct,children:[O(q,{children:[c("div",{css:F,children:c(S,{title:"總營業額 (含修正)",prefix:$(A)?"":"$",value:A??"---"})}),c("div",{css:F,children:c(S,{title:"淨利",prefix:$(v)?"":"$",value:v??"---"})}),c("div",{css:F,children:c(S,{title:"成本",prefix:$(x)?"":"$",value:x??"---"})}),c("div",{css:F,children:c(S,{title:"訂單數量",prefix:$(Y)?"":"$",value:Y??"---"})})]}),O(q,{children:[c("div",{css:F,children:c(S,{title:"上午營業額",prefix:$(_)?"":"$",value:_??"---"})}),c("div",{css:F,children:c(S,{title:"下午營業額",prefix:$(I)?"":"$",value:I??"---"})}),c("div",{css:F,children:c(S,{title:"銷售便當數量",prefix:$(j)?"":"$",value:j??"---"})}),c("div",{css:F,children:c(S,{title:"銷售商品數量",prefix:$(G)?"":"$",value:G??"---"})})]})]}),c(w,{type:"bar",title:"營收分析",dateMap:E,dateType:n,handle:Ke}),c(w,{type:"bar",title:"淨利分析",dateMap:E,dateType:n,handle:et}),c(w,{type:"line",title:"客流量分析 (總計)",dateMap:E,dateType:n,allowedDateType:null,handle:tt}),c(w,{type:"bar",title:"便當銷售分析",dateMap:E,dateType:n,handle:X("main-dish")}),c(w,{type:"bar",title:"單點銷售分析",dateMap:E,dateType:n,color:"2",handle:X("à-la-carte")}),c(w,{type:"bar",title:"零售銷售分析",dateMap:E,dateType:n,handle:X("others")}),c(w,{type:"bar",title:"訂單備註分析",dateMap:E,dateType:n,color:"orderTypes",handle:st}),c(w,{type:"doughnut",title:"送外訂單分析",dateMap:E,dateType:n,allowedDateType:null,handle:nt}),c(_e.BackTop,{visibilityHeight:100})]})]})}),Ct=dt;export{dt as Component,Ct as Statistics,Ct as default};