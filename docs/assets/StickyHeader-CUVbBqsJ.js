import{g as c,j as p,a,F as f}from"./index-BMXlYxi-.js";import{r}from"./react-DQrQyBkK.js";c``;const x=c`
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
`,h=({cls:n,header:i,children:d})=>{const s=r.useRef(),e=r.useRef();return r.useEffect(()=>{const t=s.current,o=new IntersectionObserver(([b])=>{e.current&&e.current.classList.toggle("resta-header--active",!b.isIntersecting)});return o.observe(t),()=>{o.unobserve(t)}},[]),p(f,{children:[a("div",{id:"resta-header-observer",ref:s}),a("header",{css:[x,n],ref:e,children:i||d})]})};export{h as S};
