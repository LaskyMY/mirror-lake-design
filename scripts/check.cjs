const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const source=JSON.parse(read('source/content.json'));
const data=JSON.parse(read('docs/content.json'));
const current=read('source/current.md');
assert.equal(data.overview,current,'Published overview must equal authoritative source');
assert.equal(read('docs/镜湖残响_现行总纲_v0.5.md'),current);
assert.deepEqual(data.docs,source.docs,'Source records must remain verbatim');
const chapters=require('../docs/chapters.js'),search=require('../docs/search.js');
const sections=current.split(/\n(?=## \d+\.)/);
assert.equal(sections.length,24);
const mapped=chapters.flatMap(chapter=>chapter[3]).sort((a,b)=>a-b);
assert.deepEqual(mapped,Array.from({length:23},(_,i)=>i+1),'Every section must occur in exactly one category');
chapters.forEach((chapter,i)=>{
  const text=read('docs/design/'+String(i+1).padStart(2,'0')+'-'+chapter[0]+'.md');
  chapter[3].forEach(number=>assert(text.includes(sections[number]),`Section ${number} changed`));
});
data.docs.forEach((item,i)=>assert.equal(read('docs/sources/'+String(i+1).padStart(2,'0')+'.txt'),item.text));
assert(read('docs/镜湖残响_设计总纲.md').startsWith(current));
for(const item of data.docs)assert(read('docs/镜湖残响_设计总纲.md').includes(item.text));
const index=search.buildIndex(chapters,sections);
assert.equal(index.length,23);assert(index.every(item=>item.routeId));
assert.equal(search.search(index,'   ').length,0);
assert(search.search(index,'林汐').some(item=>item.sectionNumber===5));
assert(search.search(index,'M-07').length>0);
assert(search.search(index,'镜湖号 林舟').some(item=>item.sectionNumber===23));
assert.equal(search.search(index,'不存在的关键词XYZ987').length,0);
const before=JSON.stringify(index);search.search(index,'灵矿');assert.equal(JSON.stringify(index),before);
const testSections=['preamble','## 1. literal [.*]\n中文中文 Boss boss','## 2. 其他\n'+('甲'.repeat(220))+'早词'+('乙'.repeat(220))+'晚词'];
const fixture=search.buildIndex([['first','一','',[1,2]],['second','二','',[1,9]]],testSections);
assert.equal(fixture.length,2);assert.equal(fixture[0].routeId,'first');
assert.equal(search.search(fixture,'[.*]')[0].sectionNumber,1);
assert.equal(search.search(fixture,'BOSS')[0].matches,2);
assert.equal(search.search(fixture,'中文 BOSS')[0].matches,4);
assert(search.search(fixture,'晚词 早词')[0].snippet.includes('早词'));
assert(search.search(fixture,'晚词 早词')[0].snippet.length<=180);
assert.equal(search.search(index,'灵矿',1).length,1);
assert.equal(search.search(index,'灵矿',0).length,1);
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(item=>item.name==='.git'||item.name==='test-results'?[]:item.isDirectory()?files(path.join(dir,item.name)):[path.join(dir,item.name)]);}
const publicFiles=files(root);
for(const file of publicFiles){
  if(file.endsWith('.docx'))continue;
  const text=fs.readFileSync(file,'utf8');
  assert(!/(?:github_pat_[A-Za-z0-9_]{30,}|gh[pousr]_[A-Za-z0-9]{30,}|sk-[A-Za-z0-9_-]{24,})/.test(text),'Possible credential in '+path.relative(root,file));
  if(file.endsWith('.md'))for(const match of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)){
    const href=match[1];if(/^(https?:|sandbox:|#)/.test(href))continue;
    assert(fs.existsSync(path.resolve(path.dirname(file),href.split('#')[0])),'Broken Markdown link in '+path.relative(root,file)+': '+href);
  }
}
console.log('PASS: 23 sections preserved once, 8 sources verbatim, literal Chinese search, ranking/snippets, links and credential-pattern scan.');
