import{aF as c,r,aI as p,aJ as o,aK as x}from"./vendor-G6F9539m.js";c``;const f=c`
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
`,v=({cls:n,header:i,children:d})=>{const s=r.useRef(),e=r.useRef();return r.useEffect(()=>{const t=s.current,a=new IntersectionObserver(([b])=>{e.current&&e.current.classList.toggle("resta-header--active",!b.isIntersecting)});return a.observe(t),()=>{a.unobserve(t)}},[]),p(x,{children:[o("div",{id:"resta-header-observer",ref:s}),o("header",{css:[f,n],ref:e,children:i||d})]})};export{v as S};
