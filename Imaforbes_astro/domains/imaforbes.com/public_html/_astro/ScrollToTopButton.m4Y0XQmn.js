import{w as n,u as l,j as e}from"./withProviders.D4bnULlA.js";import{r}from"./index.BCOEHr3l.js";import{m as c}from"./proxy.orq9bBXl.js";import{c as d}from"./createLucideIcon.Bz_Rabl9.js";/**
 * @license lucide-react v0.474.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const f=[["path",{d:"m18 15-6-6-6 6",key:"153udz"}]],u=d("ChevronUp",f),m=()=>{const{t:s}=l(),[i,o]=r.useState(!1),t=()=>{window.scrollY>300?o(!0):o(!1)},a=()=>{window.scrollTo({top:0,behavior:"smooth"})};return r.useEffect(()=>(window.addEventListener("scroll",t),()=>window.removeEventListener("scroll",t)),[]),e.jsx(c.button,{onClick:a,className:`fixed bottom-4 right-4 md:bottom-8 md:right-8 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center
                 bg-white dark:bg-gray-800 text-black dark:text-white cursor-pointer z-50 shadow-lg dark:shadow-gray-900/50 
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 
                 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700`,"aria-label":s("scrollToTop.label")||"Scroll to top",initial:{scale:0,opacity:0},animate:i?{scale:1,opacity:1}:{scale:0,opacity:0},transition:{type:"spring",stiffness:260,damping:20},whileHover:{scale:1.1,rotate:-5},whileTap:{scale:.9},children:e.jsx(u,{size:28})})},b=n(m);export{b as default};
