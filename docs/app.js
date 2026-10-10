'use strict';
const chapters = globalThis.DesignChapters;
const esc = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const inline = value => esc(value).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/`([^`]+)`/g,'<code>$1</code>');
function markdown(source) {
  const lines=source.split('\n'); let html='',i=0;
  while(i<lines.length) {
    const line=lines[i].trim();
    if(!line){i++;continue;}
    if(/^#{1,6} /.test(line)) {
      const match=line.match(/^(#+) (.*)/),level=Math.min(4,Math.max(2,match[1].length));
      html+=`<h${level}>${inline(match[2])}</h${level}>`;i++;continue;
    }
    if(/^\|/.test(line)) {
      const rows=[];
      while(i<lines.length && /^\|/.test(lines[i].trim())) {
        const row=lines[i++].trim();
        if(!/^\|[\s:|\-]+$/.test(row))rows.push(row.replace(/^\||\|$/g,'').split('|').map(cell=>cell.trim()));
      }
      html+='<div class="table-wrap" tabindex="0" role="region" aria-label="可横向滚动的数据表"><table>';
      html+=rows.map((row,index)=>'<tr>'+row.map(cell=>`<${index?'td':'th'}>${inline(cell)}</${index?'td':'th'}>`).join('')+'</tr>').join('')+'</table></div>';continue;
    }
    if(/^---+$/.test(line)){html+='<hr>';i++;continue;}
    if(/^>/.test(line)) {
      html+='<blockquote>';
      while(i<lines.length && /^>/.test(lines[i].trim()))html+='<p>'+inline(lines[i++].trim().replace(/^>\s?/,''))+'</p>';
      html+='</blockquote>';continue;
    }
    if(/^[-*] /.test(line)||/^\d+\. /.test(line)) {
      const ordered=/^\d+\./.test(line),tag=ordered?'ol':'ul',pattern=ordered?/^\d+\. /:/^[-*] /;
      html+=`<${tag}>`;
      while(i<lines.length && pattern.test(lines[i].trim()))html+='<li>'+inline(lines[i++].trim().replace(pattern,''))+'</li>';
      html+=`</${tag}>`;continue;
    }
    html+='<p>'+inline(line)+'</p>';i++;
  }
  return html;
}
let data, sections, index;
const article=document.querySelector('#content');
const repo='https://github.com/LaskyMY/mirror-lake-design';
const chapterFile=chapter=>'design/'+String(chapters.indexOf(chapter)+1).padStart(2,'0')+'-'+chapter[0]+'.md';
function sourceDoc(number) {
  const source=data.docs[number];
  return `<details><summary>${esc(source.label||source.title)} · 来源全文</summary><pre>${esc(source.text)}</pre></details>`;
}
function navigation(active) {
  document.querySelector('#nav').innerHTML=chapters.map((chapter,i)=>`<a href="#${chapter[0]}" ${chapter===active?'class="active" aria-current="page"':''}><span>${String(i+1).padStart(2,'0')}</span>${chapter[1]}</a>`).join('');
}
function renderSearch(query) {
  navigation(null);document.title='搜索 · 镜湖残响';
  const results=DocSearch.search(index,query,50);
  article.innerHTML='<div class="eyebrow">SEARCH / 现行总纲</div><h1>搜索设计文档</h1>'+
    `<p class="intro">${query?'“'+esc(query)+'” · 找到 '+results.length+' 个章节':'输入角色、地点或玩法关键词。多个关键词用空格分隔。'}</p>`+
    '<p class="search-note">检索范围：现行总纲的 23 节。历史来源在「下载与来源」中单独保留。</p>'+
    (query && !results.length?'<div class="notice">没有匹配章节。试试「林汐」「灵矿」或「M-07」。</div>':'')+
    '<div class="search-results">'+results.map(result=>`<a class="search-result" href="#${result.routeId}/s${result.sectionNumber}"><small>${esc(result.chapterTitle)}</small><h2>${esc(result.title)}</h2><p>${esc(result.snippet)}</p><span>阅读全文 →</span></a>`).join('')+'</div>';
}
function render() {
  const raw=location.hash.slice(1),[route,anchor]=raw.split('/');
  if(route==='search') {
    let query='';try{query=decodeURIComponent(raw.slice(7));}catch{}
    document.querySelector('#search-input').value=query;
    renderSearch(query);window.scrollTo(0,0);return;
  }
  const chapter=chapters.find(item=>item[0]===route)||chapters[0],position=chapters.indexOf(chapter);
  navigation(chapter);document.title=chapter[1]+' · 镜湖残响';
  let html=`<div class="eyebrow">MIRROR LAKE ECHO / ${String(position+1).padStart(2,'0')}</div><h1>${chapter[1]}</h1><p class="intro">${chapter[2]}</p>`;
  if(chapter[0]==='overview') {
    html+='<div class="hero"><div class="eyebrow">现行设计档案 · v0.5</div><p>下一轮，你不记得我。<br>我仍然选择改变因果。</p><div class="pills"><span>灵矿共振</span><span>男枪空间 · 女刀时间</span><span>镜湖号 DLC</span><span>双螺旋二周目</span></div></div>';
    html+='<div class="archive-stats"><div><strong>23</strong><span>总纲章节</span></div><div><strong>10</strong><span>阅读分类</span></div><div><strong>8</strong><span>来源全文</span></div></div>';
    html+='<div class="quick-download"><a class="download primary" href="镜湖残响_现行总纲_v0.5.md" download>↓ 现行总纲</a><a class="download" href="镜湖残响_设计总纲.md" download>↓ 总纲与全部来源</a><a class="download" href="编辑说明.md">阅读整理说明</a></div>';
    html+='<div class="notice"><strong>阅读顺序：</strong>先读项目总览，再看世界观与时间线；进入制作时查看游戏框架和待定事项。正文保留「确认／继承／补拟」标记，历史来源不覆盖现行决定。</div>';
    html+='<div class="cards">'+chapters.slice(1).map((item,i)=>`<a class="card" href="#${item[0]}"><small>CHAPTER ${String(i+2).padStart(2,'0')}</small><h3>${item[1]} ↗</h3><p>${item[2]}</p></a>`).join('')+'</div>';
  }
  html+=`<div class="chapter-tools"><a href="${chapterFile(chapter)}" download>↓ 本分类 Markdown</a><a href="${repo}/blob/main/docs/${chapterFile(chapter)}" target="_blank" rel="noopener noreferrer">在 GitHub 阅读 ↗</a></div>`;
  html+='<div class="section-links">'+chapter[3].map(number=>`<a href="#${chapter[0]}/s${number}">${esc(sections[number].split('\n')[0].replace(/^## \d+\. /,''))}</a>`).join('')+'</div>';
  for(const number of chapter[3])html+=`<article id="s${number}">${markdown(sections[number])}<a class="section-permalink" href="#${chapter[0]}/s${number}" aria-label="第${number}节固定链接">§ 章节直达链接</a></article>`;
  const related={world:[0],characters:[5,3,1],maps:[2],timeline:[4]};
  if(related[chapter[0]])html+='<h2>对应来源 · 追溯阅读</h2>'+related[chapter[0]].map(sourceDoc).join('');
  if(chapter[0]==='production')html+='<div class="notice">整理检查发现：第9节标题的地点数量、第22节的问卷编号引用与现档其他位置存在差异。原文保留，详情见<a href="编辑说明.md">编辑说明</a>；本轮没有替你决定尚待确认的剧情或玩法。</div>';
  if(chapter[0]==='archive') {
    html+='<div class="download-grid"><a class="download primary" href="镜湖残响_现行总纲_v0.5.md" download>↓ 现行总纲 v0.5 · MD</a><a class="download" href="镜湖残响_设计总纲.md" download>↓ 总纲＋全部来源 · MD</a><a class="download" href="镜湖号_未抵达者_DLC设计_v0.5.md" download>↓ 火车循环 DLC · MD</a><a class="download" href="镜湖残响_角色与核心物件设定整理_v1.0.docx" download>↓ 角色文档原件 · DOCX</a></div>';
    html+='<div class="notice">六份文档来源及两份可见讨论记录完整保留。历史版本与补拟内容按原标签展示。</div><details><summary>现行设计总纲 v0.5 · 展开全文</summary>'+markdown(data.overview)+'</details>'+data.docs.map((_,i)=>sourceDoc(i)).join('');
  }
  html+='<nav class="chapter-pager" aria-label="相邻分类">'+(position>0?`<a href="#${chapters[position-1][0]}">← ${chapters[position-1][1]}</a>`:'<span></span>')+(position<chapters.length-1?`<a href="#${chapters[position+1][0]}">${chapters[position+1][1]} →</a>`:'')+'</nav>';
  article.innerHTML=html;
  const target=/^s\d+$/.test(anchor||'')?document.getElementById(anchor):null;
  if(target)requestAnimationFrame(()=>target.scrollIntoView());else window.scrollTo(0,0);
}
document.querySelector('#search-form').addEventListener('submit',event=>{
  event.preventDefault();location.hash='search/'+encodeURIComponent(document.querySelector('#search-input').value.trim());
  if(data)render();
});
fetch('content.json').then(response=>{if(!response.ok)throw new Error('load');return response.json();}).then(value=>{
  data=value;sections=data.overview.split(/\n(?=## \d+\.)/);
  index=DocSearch.buildIndex(chapters,sections);render();addEventListener('hashchange',render);
}).catch(()=>{
  article.innerHTML='<h1>资料暂未载入</h1><p>请刷新重试，或下载完整文档。</p><a class="download" href="镜湖残响_设计总纲.md">下载设计总纲</a>';
});
