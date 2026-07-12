const t=new Map,o=new Set;function n(){for(const e of o)e()}function c(e,r,s){return t.set(e,{id:e,label:r,read:s}),n(),()=>{t.delete(e),n()}}export{c as r};
