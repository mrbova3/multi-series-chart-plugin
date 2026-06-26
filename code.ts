type ChartType = 'area' | 'bar' | 'pie'
type Params = {
  chartType: ChartType; stackedMode: boolean; horizontal: boolean; darkMode: boolean
  showLegend: boolean; showGrid: boolean; showChartTitle: boolean; chartTitle: string
  showXAxisTitle: boolean; xAxisTitle: string; showYAxisTitle: boolean; yAxisTitle: string
  chartWidth: number; chartHeight: number; seriesCount: number; pointCount: number
}
type Attachment = { version: 1; params: Params; state: null }
type RunMsg =
  | { type: 'ready' } | { type: 'resize' }
  | { type: 'window-resize'; width: number; height: number }
  | { type: 'action'; id: string; params: Partial<Params>; customData?: number[][] | null; seriesNames?: string[] | null; categoryNames?: string[] | null; updateTargetId?: string | null; darkMode?: boolean }
const TOOL_ID = '3bf35518-52b6-48b3-9e95-8552862ea85a'
const DISPLAY_NAME = 'Multi-series chart generator'
const ATTACH_KEY = TOOL_ID + ':state'
const AREA_FILL_OPACITY = 0.2
const STROKE_WEIGHT = 2
const SIGNAL_COLOR_KEYS = {
  chart1:'0881d4a95c692d016a5bf25ee50c9bc88a5dce97', chart2:'69bbc347524b62c1037561fe5892c9e194e67405',
  chart3:'db1f03cf567433a6297eaa3c1fa697c550c118a0', chart4:'334f0393f710285c3e593dc8e52e39b2b2b451ae',
  chart5:'6820585fc37d9324b4dd744081bfcb312e3dd42d', primary:'dc36229529b915bc76a15b396306530e63695bff',
  background:'a14fefc47d98693a8bb369bdb118eab44b505377', chartBg:'aaefba61c95131b9be7bf7ba33ba9f9c08be576e',
  card:'b5fccbf7cb3b95d95ea13364235d1366af27e1e4', foreground:'db385df6c8ad9f04c23214e595099a183efc9f97',
  mutedForeground:'d0ac1646df4795656a37feed0103dbff6f4bfd05', border:'e1ed1d5a91baabc5b136148e371562f1479ec0fa'
}
const SIGNAL_FLOAT_KEYS = {
  radiusSm:'fed6645b94717cfda76fb48ede6902ff8ebcca96', radiusMd:'65d9dddf8ca6d5dc579b1b1d7368089ad2b91055',
  radiusLg:'5661427e0156c0b3f059aa8fdaf3a2b0a7ba750a', spacing3:'3a3b960a909da44ccb1da9c6a8181c422a896ae7',
  spacing4:'9be25c821befe2dbd221c9508695d828932235c6', spacing5:'98fea6a50a2ca8fc36e6a25c5c66874f0b3890fb',
  spacing8:'50f568ce1c29d58779ea2e149f24269fe954c357', spacing12:'eb8373a6fbb15cee2b95470c5aa6d7cf54868ee0',
  spacing14:'ed155ec9d56dd27431f7147cde18f9e336d6b2fc', spacing20:'acd7fabe43039d25904b869182f83fd7e8fe09a4',
  spacing24:'077bd4d15d379b7f66d898ab02d688954f777d3e', spacing32:'f08467b4c8233bb460848fd7bcc801113d1fef21',
  borderRadius2:'103c6836cab2a1a600e303c27f2a0e704df129a5', borderRadius12:'22b7e82c86e14a6e2ec4617786108138f6683cdd',
  strokeWeight1:'f947a0985937976ab89a46468695deed2b935d90'
}
const SIGNAL_TEXT_KEYS = {
  labelXs:'4f7637a239083b0e5afb6e7452db3e68446c9b3c',
  labelSm:'e70bc0c9ac573cace62b7f3d9495b65329804912',
  titleLg:'d3367956d0d9834ab077b29316c768a116e9a513'
}
const DEFAULT_COLORS: RGBA[] = [
  {r:0.918,g:0.345,b:0.047,a:1},{r:0.051,g:0.580,b:0.533,a:1},
  {r:0.086,g:0.306,b:0.388,a:1},{r:0.984,g:0.749,b:0.141,a:1},
  {r:0.24,g:0.74,b:0.95,a:1},{r:0.7,g:0.47,b:1,a:1}
]
const DEFAULTS: Params = {
  chartType:'bar',chartWidth:600,chartHeight:500,seriesCount:3,pointCount:5,
  showLegend:true,showGrid:true,stackedMode:true,horizontal:false,darkMode:false,
  showChartTitle:true,chartTitle:'Chart title',showXAxisTitle:false,xAxisTitle:'X axis',
  showYAxisTitle:true,yAxisTitle:'Y-Axis'
}
let latestParams: Params = DEFAULTS
let isExecuting = false
function finiteNumber(v: unknown, fb: number){const n=Number(v);return Number.isFinite(n)?n:fb}
function clamp(v:number,mn:number,mx:number){return Math.max(mn,Math.min(mx,v))}
function normalizeParams(input: unknown): Params {
  const v=(input??{}) as Record<string,unknown>
  const vT: ChartType[]=['area','bar','pie']
  return {
    chartType:vT.includes(v.chartType as ChartType)?v.chartType as ChartType:DEFAULTS.chartType,
    chartWidth:clamp(finiteNumber(v.chartWidth,DEFAULTS.chartWidth),200,1600),
    chartHeight:clamp(finiteNumber(v.chartHeight,DEFAULTS.chartHeight),100,1200),
    seriesCount:clamp(finiteNumber(v.seriesCount,DEFAULTS.seriesCount),1,6),
    pointCount:clamp(finiteNumber(v.pointCount,DEFAULTS.pointCount),3,20),
    showLegend:typeof v.showLegend==='boolean'?v.showLegend:DEFAULTS.showLegend,
    showGrid:typeof v.showGrid==='boolean'?v.showGrid:DEFAULTS.showGrid,
    stackedMode:typeof v.stackedMode==='boolean'?v.stackedMode:DEFAULTS.stackedMode,
    horizontal:typeof v.horizontal==='boolean'?v.horizontal:DEFAULTS.horizontal,
    darkMode:typeof v.darkMode==='boolean'?v.darkMode:DEFAULTS.darkMode,
    showChartTitle:typeof v.showChartTitle==='boolean'?v.showChartTitle:DEFAULTS.showChartTitle,
    chartTitle:typeof v.chartTitle==='string'?v.chartTitle.slice(0,120):DEFAULTS.chartTitle,
    showXAxisTitle:typeof v.showXAxisTitle==='boolean'?v.showXAxisTitle:DEFAULTS.showXAxisTitle,
    xAxisTitle:typeof v.xAxisTitle==='string'?v.xAxisTitle.slice(0,120):DEFAULTS.xAxisTitle,
    showYAxisTitle:typeof v.showYAxisTitle==='boolean'?v.showYAxisTitle:DEFAULTS.showYAxisTitle,
    yAxisTitle:typeof v.yAxisTitle==='string'?v.yAxisTitle.slice(0,120):DEFAULTS.yAxisTitle,
  }
}
function htmlEscapeAttribute(s:string){return s.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;')}
function setBooleanControl(html:string,id:string,value:boolean):string {
  const e=id.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')
  const checked=new RegExp(`(<(?:input|fig-switch)[^>]*id="${e}"[^>]*)\\schecked(=[^\\s>]*)?`,'g')
  let next=html.replace(checked,'$1')
  if(value){const target=new RegExp(`(<(?:input|fig-switch)[^>]*id="${e}"[^>]*)(>)`,'g');next=next.replace(target,'$1 checked$2')}
  return next
}
function solidPaintBound(color:RGB,variable:Variable|null,opacity=1):Paint {
  let p:SolidPaint={type:'SOLID',color:{r:color.r,g:color.g,b:color.b},opacity}
  if(variable){p=figma.variables.setBoundVariableForPaint(p,'color',variable) as SolidPaint;if(opacity!==1)p={...p,opacity}}
  return p
}
async function applyTextFill(node:TextNode,variable:Variable|null,fallback:RGB) {
  let p:Paint={type:'SOLID',color:fallback}
  if(variable)p=figma.variables.setBoundVariableForPaint(p as SolidPaint,'color',variable)
  node.fills=[p]
}
async function applyTextStyle(node:TextNode,styleId:string|null,fallbackFont:FontName,fallbackSize:number,colorVar:Variable|null,colorFallback:RGB) {
  if(styleId){try{const s=await figma.getStyleByIdAsync(styleId) as TextStyle|null;if(s?.fontName)await figma.loadFontAsync(s.fontName);await node.setTextStyleIdAsync(styleId)}catch{node.fontName=fallbackFont;node.fontSize=fallbackSize}}
  else{node.fontName=fallbackFont;node.fontSize=fallbackSize}
  await applyTextFill(node,colorVar,colorFallback)
}
function niceGridLines(dataMax:number):{max:number;step:number;count:number} {
  if(dataMax<=0)return{max:100,step:10,count:10}
  const rawStep=dataMax/9,magnitude=Math.pow(10,Math.floor(Math.log10(rawStep))),niceSteps=[1,2,2.5,5,10]
  let step=magnitude*niceSteps[niceSteps.length-1]
  for(const ns of niceSteps){const c=magnitude*ns;if(c>=rawStep){step=c;break}}
  const max=Math.ceil(dataMax/step)*step
  return{max,step,count:Math.round(max/step)}
}
async function importSignalVars():Promise<Record<string,Variable|null>> {
  const results:Record<string,Variable|null>={}
  await Promise.all(Object.entries({...SIGNAL_COLOR_KEYS,...SIGNAL_FLOAT_KEYS}).map(async([k,vk])=>{
    try{results[k]=await figma.variables.importVariableByKeyAsync(vk)}catch{results[k]=null}
  }))
  return results
}
async function importSignalTextStyles():Promise<Record<string,string|null>> {
  const result:Record<string,string|null>={}
  await Promise.all(Object.entries(SIGNAL_TEXT_KEYS).map(async([k,sk])=>{
    try{const s=await figma.importStyleByKeyAsync(sk);result[k]=s.id}catch{result[k]=null}
  }))
  return result
}
function seededRandom(seed:number){let s=seed;return()=>{s=(s*1664525+1013904223)&0xffffffff;return((s>>>0)/0xffffffff)}}
function generateSeriesData(si:number,pc:number):number[] {
  const rng=seededRandom(si*997+42),data:number[]=[];let val=300+rng()*400
  for(let i=0;i<pc;i++){val+=(rng()-.45)*250;val=Math.max(50,Math.min(950,val));data.push(Math.round(val))}
  return data
}
function tryBind(node:SceneNode,field:VariableBindableNodeField,variable:Variable|null){
  if(!variable)return;try{node.setBoundVariable(field,variable)}catch{}
}
function placeNodeCentered(node:SceneNode,point:Vector){
  const p=node as FrameNode;p.x=point.x-p.width/2;p.y=point.y-p.height/2
}
function catmullRomPath(pts:{x:number;y:number}[]):string {
  if(pts.length<2)return ''
  const alpha=0.5
  function getT(t:number,p0:{x:number;y:number},p1:{x:number;y:number}){const dx=p1.x-p0.x,dy=p1.y-p0.y;return Math.pow(Math.sqrt(dx*dx+dy*dy),alpha)+t}
  const n=pts.length;let d=`M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`
  for(let i=0;i<n-1;i++){
    const p0=i===0?pts[0]:pts[i-1],p1=pts[i],p2=pts[i+1],p3=i+2<n?pts[i+2]:pts[n-1]
    const t0=0,t1=getT(t0,p0,p1),t2=getT(t1,p1,p2),t3=getT(t2,p2,p3),tD=t2-t1
    const m1x=tD===0?0:(p2.x-p0.x)*(t1-t0)/(t2-t0),m1y=tD===0?0:(p2.y-p0.y)*(t1-t0)/(t2-t0)
    const m2x=tD===0?0:(p3.x-p1.x)*(t2-t1)/(t3-t1),m2y=tD===0?0:(p3.y-p1.y)*(t2-t1)/(t3-t1)
    d+=` C ${(p1.x+m1x/3).toFixed(2)} ${(p1.y+m1y/3).toFixed(2)} ${(p2.x-m2x/3).toFixed(2)} ${(p2.y-m2y/3).toFixed(2)} ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`
  }
  return d
}
function arcToCubic(cx:number,cy:number,r:number,sa:number,ea:number):string {
  const ts=ea-sa,ns=Math.max(1,Math.ceil(Math.abs(ts)/(Math.PI/2))),parts:string[]=[]
  for(let i=0;i<ns;i++){const a1=sa+(i/ns)*ts,a2=sa+((i+1)/ns)*ts,sw=a2-a1,k=(4/3)*Math.tan(sw/4);const cos1=Math.cos(a1),sin1=Math.sin(a1),cos2=Math.cos(a2),sin2=Math.sin(a2);parts.push(`C ${(cx+r*(cos1-k*sin1)).toFixed(2)} ${(cy+r*(sin1+k*cos1)).toFixed(2)} ${(cx+r*(cos2+k*sin2)).toFixed(2)} ${(cy+r*(sin2-k*cos2)).toFixed(2)} ${(cx+r*cos2).toFixed(2)} ${(cy+r*sin2).toFixed(2)}`)}
  return parts.join(' ')
}
function pieSlicePath(cx:number,cy:number,r:number,sa:number,ea:number):string {
  return `M ${cx.toFixed(2)} ${cy.toFixed(2)} L ${(cx+r*Math.cos(sa)).toFixed(2)} ${(cy+r*Math.sin(sa)).toFixed(2)} ${arcToCubic(cx,cy,r,sa,ea)} Z`
}
function uniqueSceneNodes(nodes:SceneNode[]):SceneNode[]{return[...new Set(nodes)].filter(n=>!n.removed)}
function attachRelaunch(nodes:SceneNode[]){
  const u=uniqueSceneNodes(nodes)
  if(u.length>0)for(const n of u)n.setRelaunchData({[TOOL_ID]:DISPLAY_NAME})
  else figma.root.setRelaunchData({[TOOL_ID]:DISPLAY_NAME})
}
function singleSelectedTarget():SceneNode|null{const s=figma.currentPage.selection;return s.length===1?s[0]??null:null}
function readAttachment(node:SceneNode):Attachment|null {
  try{const p=JSON.parse(node.getPluginData(ATTACH_KEY));if(p?.version!==1)return null;return{version:1,params:normalizeParams(p.params),state:p.state??null}}catch{return null}
}
function evaluateEnabled_generate(sel:readonly SceneNode[]):boolean{return sel.length===0||(sel.length===1&&sel[0].type==='FRAME')}
function selectedFrameRef():FrameNode|null{const s=figma.currentPage.selection;return s.length===1&&s[0].type==='FRAME'?s[0] as FrameNode:null}
async function renderBarChart(pf:FrameNode,pW:number,pH:number,p:Params,aS:number[][],sN:string[],cN:string[],sc:number,pc:number,sv:Record<string,Variable|null>,cv:(Variable|null)[],fc:RGBA[],ts:Record<string,string|null>,fR:FontName,fS:FontName,an:SceneNode[]) {
  let rawMax=0;for(let i=0;i<pc;i++){if(p.stackedMode){let col=0;for(let s=0;s<sc;s++)col+=aS[s][i];if(col>rawMax)rawMax=col}else for(let s=0;s<sc;s++)if(aS[s][i]>rawMax)rawMax=aS[s][i]}
  const{max:gMax,count:GC}=niceGridLines(rawMax||100)
  const mFV=sv.mutedForeground??null,mFb:RGB={r:0.451,g:0.451,b:0.451},fgV=sv.foreground??null,fgFb:RGB={r:0.039,g:0.039,b:0.039},bV=sv.border??null
  const SP=32,YPB=68,BCP=6,BCG=8,BWP=80
  pf.layoutMode='VERTICAL';pf.primaryAxisSizingMode='FIXED';pf.counterAxisSizingMode='FIXED';pf.primaryAxisAlignItems='MIN';pf.counterAxisAlignItems='MIN';pf.itemSpacing=SP;pf.paddingTop=SP;pf.paddingBottom=SP;pf.paddingLeft=SP;pf.paddingRight=SP;pf.resize(pW,pH);pf.layoutSizingVertical='FILL'
  tryBind(pf,'itemSpacing',sv.spacing24??null);tryBind(pf,'paddingLeft',sv.spacing32??null);tryBind(pf,'paddingTop',sv.spacing32??null);tryBind(pf,'paddingRight',sv.spacing32??null);tryBind(pf,'paddingBottom',sv.spacing32??null)
  const mBH=Math.max(10,pH-SP-YPB)
  const yAO=figma.createFrame();yAO.name='Y-Axis';yAO.layoutMode='HORIZONTAL';yAO.primaryAxisAlignItems='MIN';yAO.counterAxisAlignItems='MIN';yAO.primaryAxisSizingMode='FIXED';yAO.counterAxisSizingMode='FIXED';yAO.paddingTop=SP;yAO.paddingBottom=YPB;yAO.paddingLeft=SP;yAO.paddingRight=SP;yAO.itemSpacing=0;yAO.fills=[];yAO.resize(pW,pH);pf.appendChild(yAO);yAO.layoutPositioning='ABSOLUTE';yAO.x=0;yAO.y=0
  if('constraints' in yAO)(yAO as FrameNode).constraints={horizontal:'STRETCH',vertical:'STRETCH'}
  tryBind(yAO,'paddingLeft',sv.spacing32??null);tryBind(yAO,'paddingTop',sv.spacing32??null);tryBind(yAO,'paddingRight',sv.spacing32??null)
  const yTC=figma.createFrame();yTC.name='Y-axis';yTC.layoutMode='VERTICAL';yTC.primaryAxisAlignItems='CENTER';yTC.counterAxisAlignItems='CENTER';yTC.primaryAxisSizingMode='FIXED';yTC.counterAxisSizingMode='AUTO';yTC.fills=[];yTC.resize(14,100);yAO.appendChild(yTC);yTC.layoutSizingHorizontal='HUG';yTC.layoutSizingVertical='FILL'
  if(p.showYAxisTitle){const yT=figma.createText();await applyTextStyle(yT,ts.labelXs,fR,12,mFV,mFb);yT.textAutoResize='WIDTH_AND_HEIGHT';yT.characters=p.yAxisTitle||'Y-Axis';yTC.appendChild(yT);yT.rotation=90;an.push(yT)}
  an.push(yTC)
  const lF=figma.createFrame();lF.name='Labels';lF.layoutMode='VERTICAL';lF.primaryAxisAlignItems='SPACE_BETWEEN';lF.counterAxisAlignItems='MIN';lF.primaryAxisSizingMode='FIXED';lF.counterAxisSizingMode='AUTO';lF.paddingLeft=8;lF.paddingRight=8;lF.itemSpacing=16;lF.fills=[];yAO.appendChild(lF);lF.layoutSizingHorizontal='HUG';lF.layoutSizingVertical='FILL'
  tryBind(lF,'paddingLeft',sv.spacing8??null);tryBind(lF,'paddingRight',sv.spacing8??null)
  for(let g=GC;g>=0;g--){const yV=Math.round((g/GC)*gMax);const yL=figma.createText();yL.name=`Y Label ${g}`;await applyTextStyle(yL,ts.labelXs,fR,12,mFV,mFb);yL.textAutoResize='WIDTH_AND_HEIGHT';yL.textAlignHorizontal='LEFT';yL.characters=yV.toLocaleString();lF.appendChild(yL);yL.layoutSizingHorizontal='FILL';yL.layoutSizingVertical='HUG';an.push(yL)}
  an.push(lF)
  const gF=figma.createFrame();gF.name='Grids';gF.layoutMode='VERTICAL';gF.primaryAxisAlignItems='SPACE_BETWEEN';gF.counterAxisAlignItems='MIN';gF.primaryAxisSizingMode='FIXED';gF.counterAxisSizingMode='FIXED';gF.fills=[];yAO.appendChild(gF);gF.layoutSizingHorizontal='FILL';gF.layoutSizingVertical='FILL'
  for(let g=GC;g>=0;g--){const gW=figma.createFrame();gW.name='Gridline';gW.layoutMode='HORIZONTAL';gW.primaryAxisAlignItems=g===GC?'CENTER':'MIN';gW.counterAxisAlignItems='CENTER';gW.primaryAxisSizingMode='FIXED';gW.counterAxisSizingMode='FIXED';gW.itemSpacing=12;gW.fills=[];gW.resize(100,14);gF.appendChild(gW);gW.layoutSizingHorizontal='FILL';gW.layoutSizingVertical='FIXED';tryBind(gW,'itemSpacing',sv.spacing12??null);if(p.showGrid){const gl=figma.createRectangle();gl.name='Gridline';gl.resize(100,1);gl.fills=[solidPaintBound({r:0.898,g:0.898,b:0.898},bV)];gW.appendChild(gl);gl.layoutSizingHorizontal='FILL';gl.layoutSizingVertical='FIXED';an.push(gl)}an.push(gW)}
  an.push(gF,yAO)
  const bWr=figma.createFrame();bWr.name='Bar Wrapper';bWr.layoutMode='VERTICAL';bWr.primaryAxisAlignItems='MIN';bWr.counterAxisAlignItems='MIN';bWr.primaryAxisSizingMode='FIXED';bWr.counterAxisSizingMode='FIXED';bWr.paddingLeft=BWP;bWr.itemSpacing=0;bWr.fills=[];pf.appendChild(bWr);bWr.layoutSizingHorizontal='FILL';bWr.layoutSizingVertical='FILL'
  const bC=figma.createFrame();bC.name='Bar Columns';bC.layoutMode='HORIZONTAL';bC.primaryAxisAlignItems='MIN';bC.counterAxisAlignItems='MAX';bC.primaryAxisSizingMode='FIXED';bC.counterAxisSizingMode='FIXED';bC.itemSpacing=8;bC.fills=[];bWr.appendChild(bC);bC.layoutSizingHorizontal='FILL';bC.layoutSizingVertical='FILL';tryBind(bC,'itemSpacing',sv.spacing8??null)
  for(let i=0;i<pc;i++){
    const bCol=figma.createFrame();bCol.name='Bar Col';bCol.layoutMode='VERTICAL';bCol.primaryAxisAlignItems='MAX';bCol.counterAxisAlignItems='CENTER';bCol.primaryAxisSizingMode='FIXED';bCol.counterAxisSizingMode='FIXED';bCol.paddingBottom=BCP;bCol.itemSpacing=0;bCol.fills=[];bC.appendChild(bCol);bCol.layoutSizingHorizontal='FILL';bCol.layoutSizingVertical='FILL'
    const bCon=figma.createFrame();bCon.name='Bar Container';bCon.layoutMode='VERTICAL';bCon.primaryAxisAlignItems='MAX';bCon.counterAxisAlignItems='CENTER';bCon.primaryAxisSizingMode='AUTO';bCon.counterAxisSizingMode='FIXED';bCon.itemSpacing=BCG;bCon.fills=[];bCol.appendChild(bCon);bCon.layoutSizingHorizontal='FILL';bCon.layoutSizingVertical='HUG';tryBind(bCon,'itemSpacing',sv.spacing8??null)
    const stk=figma.createFrame();stk.name='Stack'
    if(p.stackedMode){stk.layoutMode='VERTICAL';stk.primaryAxisAlignItems='MAX';stk.counterAxisAlignItems='MIN';stk.itemSpacing=0}else{stk.layoutMode='HORIZONTAL';stk.primaryAxisAlignItems='MIN';stk.counterAxisAlignItems='MAX';stk.itemSpacing=2}
    stk.cornerRadius=2;stk.clipsContent=true;stk.fills=[];stk.primaryAxisSizingMode='AUTO';stk.counterAxisSizingMode='FIXED';bCon.appendChild(stk);stk.layoutSizingHorizontal='FILL';stk.layoutSizingVertical='HUG'
    tryBind(stk,'topLeftRadius',sv.borderRadius2??null);tryBind(stk,'topRightRadius',sv.borderRadius2??null);tryBind(stk,'bottomLeftRadius',sv.borderRadius2??null);tryBind(stk,'bottomRightRadius',sv.borderRadius2??null)
    if(p.stackedMode){for(let s=sc-1;s>=0;s--){const v=aS[s][i],c=fc[s],cV=cv[s]??null,bH=Math.max(1,Math.round((v/gMax)*mBH));const b=figma.createFrame();b.name='Bar';b.layoutMode='HORIZONTAL';b.primaryAxisAlignItems='MIN';b.counterAxisAlignItems='CENTER';b.itemSpacing=10;b.fills=[solidPaintBound(c,cV)];b.strokes=[];b.resize(10,bH);stk.appendChild(b);b.layoutSizingHorizontal='FILL';b.layoutSizingVertical='FIXED';an.push(b)}}
    else{for(let s=0;s<sc;s++){const v=aS[s][i],c=fc[s],cV=cv[s]??null,bH=Math.max(1,Math.round((v/gMax)*mBH));const b=figma.createFrame();b.name='Bar';b.layoutMode='HORIZONTAL';b.primaryAxisAlignItems='MIN';b.counterAxisAlignItems='CENTER';b.itemSpacing=0;b.fills=[solidPaintBound(c,cV)];b.strokes=[];b.resize(10,bH);stk.appendChild(b);b.layoutSizingHorizontal='FILL';b.layoutSizingVertical='FIXED';an.push(b)}}
    an.push(stk)
    const vL=figma.createText();vL.name='Value Label';await applyTextStyle(vL,ts.labelSm,fR,14,fgV,fgFb);vL.textAlignHorizontal='CENTER';vL.textAutoResize='WIDTH_AND_HEIGHT';vL.characters=cN[i]||`Y${i+1}`;vL.textTruncation='ENDING';vL.maxLines=1;bCon.appendChild(vL);vL.layoutSizingHorizontal='FILL';vL.layoutSizingVertical='HUG';an.push(vL,bCon,bCol)
  }
  an.push(bC)
  const xL=figma.createText();xL.name='X-Label';await applyTextStyle(xL,ts.labelXs,fR,12,mFV,mFb);xL.textAlignHorizontal='CENTER';xL.textAutoResize='WIDTH_AND_HEIGHT';xL.characters=p.showXAxisTitle?(p.xAxisTitle||'X-Axis'):'';bWr.appendChild(xL);xL.layoutSizingHorizontal='FILL';xL.layoutSizingVertical='HUG';an.push(xL,bWr)
}
async function renderHorizontalBarChart(pf:FrameNode,pW:number,pH:number,p:Params,aS:number[][],sN:string[],cN:string[],sc:number,pc:number,sv:Record<string,Variable|null>,cv:(Variable|null)[],fc:RGBA[],ts:Record<string,string|null>,fR:FontName,an:SceneNode[]) {
  let rawMax=0;for(let i=0;i<pc;i++){if(p.stackedMode){let col=0;for(let s=0;s<sc;s++)col+=aS[s][i];rawMax=Math.max(rawMax,col)}else for(let s=0;s<sc;s++)rawMax=Math.max(rawMax,aS[s][i])}
  const{max:gMax}=niceGridLines(rawMax||100)
  const mFV=sv.mutedForeground??null,mFb:RGB={r:0.451,g:0.451,b:0.451},fgV=sv.foreground??null,fgFb:RGB={r:0.039,g:0.039,b:0.039}
  pf.layoutMode='VERTICAL';pf.primaryAxisSizingMode='FIXED';pf.counterAxisSizingMode='FIXED';pf.primaryAxisAlignItems='MIN';pf.counterAxisAlignItems='MIN';pf.paddingTop=32;pf.paddingBottom=32;pf.paddingLeft=32;pf.paddingRight=32;pf.itemSpacing=8;pf.resize(pW,pH);pf.layoutSizingVertical='FILL'
  tryBind(pf,'paddingLeft',sv.spacing32??null);tryBind(pf,'paddingTop',sv.spacing32??null);tryBind(pf,'paddingRight',sv.spacing32??null);tryBind(pf,'paddingBottom',sv.spacing32??null);tryBind(pf,'itemSpacing',sv.spacing8??null)
  if(p.showYAxisTitle){const yTF=figma.createFrame();yTF.name='Y-axis title';yTF.fills=[];yTF.layoutMode='HORIZONTAL';yTF.primaryAxisSizingMode='AUTO';yTF.counterAxisSizingMode='AUTO';yTF.layoutSizingHorizontal='FILL';yTF.layoutSizingVertical='HUG';yTF.itemSpacing=0;yTF.paddingBottom=4;pf.appendChild(yTF);const yT=figma.createText();yT.name='Y-Axis Title';await applyTextStyle(yT,ts.labelXs,fR,12,mFV,mFb);yT.textAutoResize='WIDTH_AND_HEIGHT';yT.characters=p.yAxisTitle||'Y-Axis';yTF.appendChild(yT);an.push(yT,yTF)}
  const rF=figma.createFrame();rF.name='Bar Rows';rF.layoutMode='VERTICAL';rF.primaryAxisSizingMode='FIXED';rF.counterAxisSizingMode='FIXED';rF.primaryAxisAlignItems='MIN';rF.counterAxisAlignItems='MIN';rF.itemSpacing=8;rF.fills=[];pf.appendChild(rF);rF.layoutSizingHorizontal='FILL';rF.layoutSizingVertical='FILL';tryBind(rF,'itemSpacing',sv.spacing8??null)
  const pBW=pW-64
  for(let i=0;i<pc;i++){
    const rw=figma.createFrame();rw.name=`Row ${i}`;rw.layoutMode='HORIZONTAL';rw.primaryAxisSizingMode='FIXED';rw.counterAxisSizingMode='FIXED';rw.primaryAxisAlignItems='MIN';rw.counterAxisAlignItems='CENTER';rw.paddingTop=4;rw.paddingBottom=4;rw.itemSpacing=0;rw.fills=[];rF.appendChild(rw);rw.layoutSizingHorizontal='FILL';rw.layoutSizingVertical='FILL';tryBind(rw,'paddingTop',sv.spacing4??null);tryBind(rw,'paddingBottom',sv.spacing4??null)
    const tot=p.stackedMode?aS.reduce((s,a)=>s+a[i],0):Math.max(...aS.map(a=>a[i]))
    const stk=figma.createFrame();stk.name='Stack';stk.layoutMode=p.stackedMode?'HORIZONTAL':'VERTICAL';stk.primaryAxisAlignItems='MIN';stk.counterAxisAlignItems='MIN';stk.cornerRadius=2;stk.clipsContent=true;stk.fills=[];stk.primaryAxisSizingMode='FIXED';stk.counterAxisSizingMode='FIXED';stk.itemSpacing=0;stk.resize(Math.max(4,Math.round((tot/gMax)*pBW)),24);rw.appendChild(stk);stk.layoutSizingHorizontal='FILL';stk.layoutSizingVertical='FILL'
    tryBind(stk,'topLeftRadius',sv.borderRadius2??null);tryBind(stk,'topRightRadius',sv.borderRadius2??null);tryBind(stk,'bottomLeftRadius',sv.borderRadius2??null);tryBind(stk,'bottomRightRadius',sv.borderRadius2??null)
    for(let s=0;s<sc;s++){
      const v=aS[s][i],c=fc[s],cV=cv[s]??null,bw=Math.max(1,Math.round((v/gMax)*pBW))
      const b=figma.createFrame();b.name=`Bar ${s+1}`;b.layoutMode='HORIZONTAL';b.primaryAxisAlignItems='MIN';b.counterAxisAlignItems='CENTER';b.fills=[solidPaintBound(c,cV)];b.strokes=[];stk.appendChild(b)
      if(p.stackedMode){b.resize(bw,10);b.layoutSizingHorizontal='FIXED';b.layoutSizingVertical='FILL'}else{b.resize(bw,8);b.layoutSizingHorizontal='FILL';b.layoutSizingVertical='FIXED'}
      if(s===0){const cl=figma.createText();cl.name='Category Label';await applyTextStyle(cl,ts.labelXs,fR,12,null,{r:1,g:1,b:1});cl.characters=cN[i]||`Y${i+1}`;cl.textAutoResize='HEIGHT';cl.textTruncation='ENDING';cl.maxLines=1;b.appendChild(cl);cl.layoutSizingHorizontal='FILL';cl.layoutSizingVertical='HUG';an.push(cl)}
      an.push(b)
    }
    const vL=figma.createText();vL.name='Value Label';await applyTextStyle(vL,ts.labelSm,fR,14,fgV,fgFb);vL.textAutoResize='WIDTH_AND_HEIGHT';vL.characters=Math.round(p.stackedMode?aS.reduce((s,a)=>s+a[i],0):aS[0][i]).toLocaleString();rw.appendChild(vL);vL.layoutSizingHorizontal='HUG';vL.layoutSizingVertical='HUG';an.push(vL,stk,rw)
  }
  an.push(rF)
  if(p.showXAxisTitle){const xT=figma.createText();xT.name='X-Axis Title';await applyTextStyle(xT,ts.labelXs,fR,12,mFV,mFb);xT.textAutoResize='WIDTH_AND_HEIGHT';xT.textAlignHorizontal='CENTER';xT.characters=p.xAxisTitle||'X axis';pf.appendChild(xT);xT.layoutSizingHorizontal='FILL';xT.layoutSizingVertical='HUG';an.push(xT)}
}
async function renderAreaChart(pf:FrameNode,pW:number,pH:number,p:Params,aS:number[][],sN:string[],sc:number,pc:number,sv:Record<string,Variable|null>,cv:(Variable|null)[],fc:RGBA[],ts:Record<string,string|null>,fR:FontName,an:SceneNode[]) {
  const yTE=p.showYAxisTitle?16:0,pad={top:8,right:16,bottom:24,left:48+yTE},uW=pW-pad.left-pad.right,uH=pH-pad.top-pad.bottom
  const mFV=sv.mutedForeground??null,mFb:RGB={r:0.451,g:0.451,b:0.451}
  const ss:number[][]=[];if(p.stackedMode){const run=new Array(pc).fill(0);for(let s=0;s<sc;s++){const row:number[]=[];for(let i=0;i<pc;i++){run[i]+=aS[s][i];row.push(run[i])}ss.push(row)}}
  const dt=p.stackedMode?ss:aS;let gMin=Infinity,gMax=-Infinity;for(const s of dt)for(const v of s){if(v<gMin)gMin=v;if(v>gMax)gMax=v}
  gMin=Math.floor(gMin/10)*10;gMax=Math.ceil(gMax/10)*10;const range=gMax-gMin||1
  const toY=(v:number)=>pad.top+uH-((v-gMin)/range)*uH,toX=(i:number)=>pad.left+(i/Math.max(1,pc-1))*uW
  if(p.showGrid){for(let g=0;g<=4;g++){const y=toY(gMin+(g/4)*range),l=figma.createLine();l.name=`Grid ${g}`;l.x=pad.left;l.y=Math.round(y);l.resize(uW,0);l.strokes=[solidPaintBound({r:0.898,g:0.898,b:0.898},sv.border??null)];l.strokeWeight=1;pf.appendChild(l);an.push(l)}}
  const bgV=sv.chartBg??sv.card??null
  for(let s=sc-1;s>=0;s--){
    const td=p.stackedMode?ss[s]:aS[s],bd=p.stackedMode&&s>0?ss[s-1]:null,c=fc[s],cV=cv[s]??null
    const tp=td.map((v,i)=>({x:toX(i),y:toY(v)})),bp=bd?bd.map((v,i)=>({x:toX(i),y:toY(v)})):[]
    let fP=catmullRomPath(tp)
    if(bd&&bp.length>0){const rev=[...bp].reverse();fP+=` L ${tp[pc-1].x.toFixed(2)} ${bp[pc-1].y.toFixed(2)}`;for(let i=1;i<rev.length;i++)fP+=` L ${rev[i].x.toFixed(2)} ${rev[i].y.toFixed(2)}`;fP+=' Z'}
    else fP+=` L ${toX(pc-1).toFixed(2)} ${(pad.top+uH).toFixed(2)} L ${pad.left.toFixed(2)} ${(pad.top+uH).toFixed(2)} Z`
    const fV=figma.createVector();fV.name=`${sN[s]} fill`;fV.vectorPaths=[{windingRule:'NONZERO',data:fP}];fV.fills=[solidPaintBound(c,cV,AREA_FILL_OPACITY)];fV.strokes=[];pf.appendChild(fV);an.push(fV)
    const sV=figma.createVector();sV.name=`${sN[s]} line`;sV.vectorPaths=[{windingRule:'NONZERO',data:catmullRomPath(tp)}];sV.fills=[];sV.strokes=[solidPaintBound(c,cV)];sV.strokeWeight=STROKE_WEIGHT;sV.strokeCap='ROUND';sV.strokeJoin='ROUND';pf.appendChild(sV);an.push(sV)
    for(let i=0;i<pc;i++){const dot=figma.createEllipse();const dR=STROKE_WEIGHT+1.5;dot.name=`${sN[s]} dot ${i}`;dot.resize(dR*2,dR*2);dot.x=tp[i].x-dR;dot.y=tp[i].y-dR;dot.fills=[solidPaintBound(c,cV)];dot.strokes=bgV?[figma.variables.setBoundVariableForPaint({type:'SOLID',color:{r:1,g:1,b:1}},'color',bgV)]:[{type:'SOLID',color:{r:1,g:1,b:1}}];dot.strokeWeight=2;pf.appendChild(dot);an.push(dot)}
  }
  for(let g=0;g<=4;g++){const yV=gMin+(g/4)*range;const t=figma.createText();t.name=`Y label ${g}`;t.fontName=fR;t.fontSize=10;await applyTextFill(t,mFV,mFb);t.textAutoResize='WIDTH_AND_HEIGHT';t.characters=Math.round(yV).toString();pf.appendChild(t);t.x=4;t.y=toY(yV)-t.height/2;an.push(t)}
  const xLS=Math.max(1,Math.floor(pc/8));for(let i=0;i<pc;i+=xLS){const t=figma.createText();t.name=`X label ${i}`;t.fontName=fR;t.fontSize=10;await applyTextFill(t,mFV,mFb);t.textAutoResize='WIDTH_AND_HEIGHT';t.characters=`W${i+1}`;pf.appendChild(t);t.x=toX(i)-t.width/2;t.y=pad.top+uH+8;an.push(t)}
}
async function renderPieChart(pf:FrameNode,pW:number,pH:number,aS:number[][],sN:string[],sc:number,cv:(Variable|null)[],fc:RGBA[],fR:FontName,an:SceneNode[]) {
  const cx=pW/2,cy=pH/2,r=Math.min(cx,cy)*.8,sV=aS.map(s=>Math.max(0,s.reduce((a,b)=>a+b,0))),total=sV.reduce((a,b)=>a+b,0)||1;let ang=-Math.PI/2
  for(let s=0;s<sc;s++){const sw=(sV[s]/total)*(Math.PI*2);if(sw<.001){ang+=sw;continue}const c=fc[s],cV=cv[s]??null;const sl=figma.createVector();sl.name=`${sN[s]} slice`;sl.vectorPaths=[{windingRule:'NONZERO',data:pieSlicePath(cx,cy,r,ang,ang+sw)}];sl.fills=[solidPaintBound(c,cV)];sl.strokes=[];pf.appendChild(sl);an.push(sl);if(sw>.3){const mA=ang+sw/2;const t=figma.createText();t.name=`${sN[s]} pct`;t.fontName=fR;t.fontSize=10;t.fills=[{type:'SOLID',color:{r:1,g:1,b:1}}];t.characters=`${Math.round((sV[s]/total)*100)}%`;t.textAutoResize='WIDTH_AND_HEIGHT';pf.appendChild(t);t.x=cx+r*.62*Math.cos(mA)-t.width/2;t.y=cy+r*.62*Math.sin(mA)-t.height/2;an.push(t)}ang+=sw}
}
async function action_generate(p:Params,cD:number[][]|null|undefined,cSN:string[]|null|undefined,cCN:string[]|null|undefined,uTId?:string|null):Promise<{affectedNodes:SceneNode[];state:null}> {
  const an:SceneNode[]=[]
  await(async()=>{
    const isDark=p.darkMode===true,fc=DEFAULT_COLORS
    const[sv,ts]=await Promise.all([importSignalVars(),importSignalTextStyles()])
    const cv:(Variable|null)[]=[sv.chart1??null,sv.chart2??null,sv.chart3??null,sv.chart4??null,sv.chart5??null,sv.primary??null]
    let aS:number[][],sN:string[],sc:number,pc:number,cN:string[]
    if(cD&&cD.length>0){sc=Math.min(cD.length,6);pc=Math.max(...cD.slice(0,sc).map(s=>s.length));aS=cD.slice(0,sc).map(s=>{const l=s[s.length-1]??0;return s.length<pc?[...s,...new Array(pc-s.length).fill(l)]:s.slice(0,pc)});sN=Array.from({length:sc},(_,i)=>cSN&&cSN[i]?cSN[i]:`Series ${String.fromCharCode(65+i)}`);cN=Array.from({length:pc},(_,i)=>cCN&&cCN[i]?cCN[i]:`Y${i+1}`)}
    else{sc=p.seriesCount;pc=p.pointCount;aS=Array.from({length:sc},(_,s)=>generateSeriesData(s,pc));sN=['Services 1','B2B License','B2B Consumption','Product D','Product E','Product F'];cN=Array.from({length:pc},(_,i)=>`Y${i+1}`)}
    let fR:FontName={family:'Inter',style:'Regular'},fS:FontName={family:'Inter',style:'SemiBold'}
    try{await figma.loadFontAsync({family:'SF Pro',style:'Regular'});await figma.loadFontAsync({family:'SF Pro',style:'Semibold'});fR={family:'SF Pro',style:'Regular'};fS={family:'SF Pro',style:'Semibold'}}
    catch{await figma.loadFontAsync({family:'Inter',style:'Regular'});await figma.loadFontAsync({family:'Inter',style:'SemiBold'});await figma.loadFontAsync({family:'Inter',style:'Medium'})}
    const bgV=isDark?null:sv.chartBg??null,bV=isDark?null:sv.border??null,fgV=isDark?null:sv.foreground??null,fgFb:RGB=isDark?{r:0.98,g:0.98,b:0.98}:{r:0.039,g:0.039,b:0.039}
    let tF:FrameNode|null=null
    if(uTId){const found=await figma.getNodeByIdAsync(uTId);if(found&&found.type==='FRAME')tF=found as FrameNode}
    const rF=tF??selectedFrameRef(),cW=rF?Math.round(rF.width):p.chartWidth,cH=rF?Math.round(rF.height):p.chartHeight
    const root=figma.createFrame();root.name=p.chartType==='bar'?(p.horizontal?'Horizontal bar chart':'Bar chart'):p.chartType==='pie'?'Pie chart':'Area chart'
    root.layoutMode='VERTICAL';root.primaryAxisSizingMode='FIXED';root.counterAxisSizingMode='FIXED';root.resize(cW,cH);root.itemSpacing=0;root.paddingTop=0;root.paddingBottom=0;root.paddingLeft=0;root.paddingRight=0;root.clipsContent=true;root.cornerRadius=12
    tryBind(root,'topLeftRadius',sv.borderRadius12??null);tryBind(root,'topRightRadius',sv.borderRadius12??null);tryBind(root,'bottomLeftRadius',sv.borderRadius12??null);tryBind(root,'bottomRightRadius',sv.borderRadius12??null)
    if(isDark){root.fills=[{type:'SOLID',color:{r:0.078,g:0.078,b:0.078}}];root.strokes=[{type:'SOLID',color:{r:1,g:1,b:1},opacity:0.12}]}
    else{root.fills=bgV?[figma.variables.setBoundVariableForPaint({type:'SOLID',color:{r:0.961,g:0.961,b:0.961}},'color',bgV)]:[{type:'SOLID',color:{r:0.961,g:0.961,b:0.961}}];root.strokes=bV?[figma.variables.setBoundVariableForPaint({type:'SOLID',color:{r:0.898,g:0.898,b:0.898}},'color',bV)]:[{type:'SOLID',color:{r:0.898,g:0.898,b:0.898}}]}
    root.strokeWeight=1;root.strokeAlign='INSIDE';tryBind(root,'strokeTopWeight',sv.strokeWeight1??null);tryBind(root,'strokeBottomWeight',sv.strokeWeight1??null);tryBind(root,'strokeLeftWeight',sv.strokeWeight1??null);tryBind(root,'strokeRightWeight',sv.strokeWeight1??null)
    const SP=32,showH=p.showChartTitle||p.showLegend;let hN:FrameNode|null=null
    if(showH){
      const h=figma.createFrame();h.name='Header';h.layoutMode='HORIZONTAL';h.itemSpacing=SP;h.paddingTop=SP;h.paddingBottom=SP;h.paddingLeft=SP;h.paddingRight=SP;h.primaryAxisAlignItems='MIN';h.counterAxisAlignItems='MIN';h.fills=[];root.appendChild(h);h.layoutSizingHorizontal='FILL';h.layoutSizingVertical='HUG'
      tryBind(h,'paddingLeft',sv.spacing32??null);tryBind(h,'paddingTop',sv.spacing32??null);tryBind(h,'paddingRight',sv.spacing32??null);tryBind(h,'paddingBottom',sv.spacing32??null);tryBind(h,'itemSpacing',sv.spacing32??null)
      if(p.showChartTitle){const tT=figma.createText();await applyTextStyle(tT,ts.titleLg,fS,18,isDark?null:fgV,fgFb);tT.characters=p.chartTitle||'Chart title';h.appendChild(tT);tT.layoutSizingHorizontal='FILL';tT.layoutSizingVertical='HUG';an.push(tT)}
      if(p.showLegend){const lF=figma.createFrame();lF.name='Legend';lF.layoutMode='HORIZONTAL';lF.layoutWrap='WRAP';lF.itemSpacing=16;lF.counterAxisSpacing=8;lF.primaryAxisAlignItems='MAX';lF.counterAxisAlignItems='CENTER';lF.fills=[];h.appendChild(lF);lF.layoutSizingHorizontal='FILL';lF.layoutSizingVertical='HUG';for(let s=0;s<sc;s++){const c=fc[s],cV=cv[s]??null;const iF=figma.createFrame();iF.name=`Legend Item ${s+1}`;iF.layoutMode='HORIZONTAL';iF.itemSpacing=8;iF.primaryAxisAlignItems='MIN';iF.counterAxisAlignItems='CENTER';iF.fills=[];lF.appendChild(iF);iF.layoutSizingHorizontal='HUG';iF.layoutSizingVertical='HUG';tryBind(iF,'itemSpacing',sv.spacing8??null);const dot=figma.createRectangle();dot.resize(12,12);dot.cornerRadius=2;dot.fills=[solidPaintBound(c,cV)];dot.strokes=[];tryBind(dot,'topLeftRadius',sv.borderRadius2??null);tryBind(dot,'topRightRadius',sv.borderRadius2??null);tryBind(dot,'bottomLeftRadius',sv.borderRadius2??null);tryBind(dot,'bottomRightRadius',sv.borderRadius2??null);iF.appendChild(dot);const lt=figma.createText();await applyTextStyle(lt,ts.labelSm,fR,14,isDark?null:fgV,fgFb);lt.textAutoResize='WIDTH_AND_HEIGHT';lt.characters=sN[s];iF.appendChild(lt);an.push(iF,dot,lt)}an.push(lF)}
      an.push(h);hN=h
    }
    const aHH=hN?hN.height:0,pF=figma.createFrame();pF.name='Plot Area';pF.fills=[];pF.clipsContent=false;root.appendChild(pF);pF.layoutSizingHorizontal='FILL';pF.layoutSizingVertical='FILL';const pW=cW,pH=Math.max(100,cH-aHH);pF.resize(pW,pH);pF.layoutSizingVertical='FILL'
    if(p.chartType==='bar'&&p.horizontal)await renderHorizontalBarChart(pF,pW,pH,p,aS,sN,cN,sc,pc,sv,cv,fc,ts,fR,an)
    else if(p.chartType==='bar')await renderBarChart(pF,pW,pH,p,aS,sN,cN,sc,pc,sv,cv,fc,ts,fR,fS,an)
    else if(p.chartType==='pie')await renderPieChart(pF,pW,pH,aS,sN,sc,cv,fc,fR,an)
    else await renderAreaChart(pF,pW,pH,p,aS,sN,sc,pc,sv,cv,fc,ts,fR,an)
    an.push(pF,root)
    if(tF&&tF.parent){const par=tF.parent,idx=par.children.indexOf(tF);root.x=tF.x;root.y=tF.y;par.insertChild(idx,root);tF.remove()}
    else placeNodeCentered(root,figma.viewport.center)
    root.setPluginData(ATTACH_KEY,JSON.stringify({version:1,params:p,state:null}))
  })()
  return{affectedNodes:an,state:null}
}
async function runAction_generate(notify:boolean,cD?:number[][]|null,cSN?:string[]|null,cCN?:string[]|null,uTId?:string|null) {
  isExecuting=true
  try{const r=await action_generate(latestParams,cD,cSN,cCN,uTId);attachRelaunch(r.affectedNodes);pushActionStates();if(notify){const c=r.affectedNodes.filter(n=>!n.removed);if(c.length>0){figma.currentPage.selection=c;figma.viewport.scrollAndZoomIntoView(c)}figma.notify(DISPLAY_NAME+' generated')}}
  catch(e){const m=e instanceof Error?e.message:String(e);figma.notify(m,{error:true});throw e}
  finally{isExecuting=false}
}
function pushActionStates():void {
  const sel=figma.currentPage.selection,enabled=evaluateEnabled_generate(sel),ref=selectedFrameRef(),att=ref!=null?readAttachment(ref):null,isUpdate=att!=null
  const label=enabled?isUpdate?'Update chart':ref?`Generate into ${Math.round(ref.width)}×${Math.round(ref.height)}`:'Generate chart':'Select a frame or deselect all'
  figma.ui.postMessage({type:'action-state',actions:{generate:{enabled,label,isUpdate,updateTargetId:isUpdate&&ref?ref.id:null,status:undefined}}})
}
function refreshSelection():void {
  if(isExecuting)return;const t=singleSelectedTarget(),att=t!=null?readAttachment(t):null;latestParams=att?.params??DEFAULTS;figma.ui.postMessage({type:'params-change',params:latestParams});pushActionStates()
}
const initialTarget=singleSelectedTarget(),initialAttachment=initialTarget!=null?readAttachment(initialTarget):null,initialParams:Params=initialAttachment?.params??DEFAULTS
latestParams=initialParams
let html=__html__
html=html.replace(/(id="chartType"[^>]*\bvalue=")[^"]*(")/ g,'$1'+htmlEscapeAttribute(String(initialParams.chartType))+'$2')
html=setBooleanControl(html,'showLegend',initialParams.showLegend);html=setBooleanControl(html,'showGrid',initialParams.showGrid);html=setBooleanControl(html,'stackedMode',initialParams.stackedMode);html=setBooleanControl(html,'horizontal',initialParams.horizontal);html=setBooleanControl(html,'darkMode',initialParams.darkMode)
html=setBooleanControl(html,'showChartTitle',initialParams.showChartTitle);html=html.replace(/(id="chartTitle"[^>]*\bvalue=")[^"]*(")/ g,'$1'+htmlEscapeAttribute(initialParams.chartTitle)+'$2')
html=setBooleanControl(html,'showXAxisTitle',initialParams.showXAxisTitle);html=html.replace(/(id="xAxisTitle"[^>]*\bvalue=")[^"]*(")/ g,'$1'+htmlEscapeAttribute(initialParams.xAxisTitle)+'$2')
html=setBooleanControl(html,'showYAxisTitle',initialParams.showYAxisTitle);html=html.replace(/(id="yAxisTitle"[^>]*\bvalue=")[^"]*(")/ g,'$1'+htmlEscapeAttribute(initialParams.yAxisTitle)+'$2')
figma.root.setRelaunchData({[TOOL_ID]:DISPLAY_NAME})
figma.showUI(html,{width:480,height:384})
pushActionStates()
figma.on('selectionchange',refreshSelection)
figma.ui.onmessage=(msg:RunMsg)=>{
  if(msg.type==='ready'){pushActionStates();return}
  if(msg.type==='resize')return
  if(msg.type==='window-resize'){const w=Math.max(380,Math.min(1400,Math.round(msg.width))),h=Math.max(260,Math.min(1000,Math.round(msg.height)));figma.ui.resize(w,h);return}
  if(msg.type==='action'&&msg.id==='generate'){if(msg.darkMode!==undefined)msg.params={...msg.params,darkMode:msg.darkMode};latestParams=normalizeParams(msg.params);void runAction_generate(true,msg.customData,msg.seriesNames,msg.categoryNames,msg.updateTargetId)}
}
