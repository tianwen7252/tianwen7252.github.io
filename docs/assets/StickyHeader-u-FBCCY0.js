import{bG as c,r,bJ as p,bK as a,bL as x}from"./vendor-ONl0qZS6.js";c``;const f=c`
  position: sticky;
  top: 0;
  z-index: 870;

  &.resta-header--active {
    backdrop-filter: blur(10px);
    box-shadow:
      0 0 #000,
      0 0 #0000,
      0 0 #000,
      0 0 #0000,
      0 16px 32px -16px rgba(0, 0, 0, 0.3),
      0 0 0 1px rgba(0, 0, 0, 0.1);
  }
`,v=({cls:n,header:i,children:b})=>{const s=r.useRef(),e=r.useRef();return r.useEffect(()=>{const t=s.current,o=new IntersectionObserver(([d])=>{e.current&&e.current.classList.toggle("resta-header--active",!d.isIntersecting)});return o.observe(t),()=>{o.unobserve(t)}},[]),p(x,{children:[a("div",{id:"resta-header-observer",ref:s}),a("header",{css:[f,n],ref:e,children:i||b})]})};export{v as S};