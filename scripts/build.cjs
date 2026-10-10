const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const chapters=require('../docs/chapters.js');
const data=JSON.parse(fs.readFileSync(path.join(root,'source/content.json'),'utf8'));
data.overview=fs.readFileSync(path.join(root,'source/current.md'),'utf8');
const sections=data.overview.split(/\n(?=## \d+\.)/);
function write(name,content){const file=path.join(root,'docs',name);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,content);}
write('content.json',JSON.stringify(data));
write('镜湖残响_现行总纲_v0.5.md',data.overview);
write('镜湖残响_设计总纲.md',data.overview+'\n\n# 来源附录（非现行规则）\n\n'+data.docs.map(item=>'## '+item.label+'\n\n'+item.text).join('\n\n'));
write('镜湖号_未抵达者_DLC设计_v0.5.md','# 《镜湖号：未抵达者》DLC设计\n\n摘自《镜湖残响》现行设计总纲 v0.5。\n\n'+sections[23]);
chapters.forEach((chapter,i)=>write('design/'+String(i+1).padStart(2,'0')+'-'+chapter[0]+'.md',
  '# '+chapter[1]+'\n\n[返回目录](../../README.md) · [在线阅读](https://laskymy.github.io/mirror-lake-design/#'+chapter[0]+')\n\n> 摘自现行设计总纲 v0.5。按主题编排，原节号和正文保留。\n\n'+chapter[3].map(number=>sections[number]).join('\n\n')));
write('sources/README.md','# 来源全文索引\n\n来源用于追溯；现行决定以[总纲](../../source/current.md)为准。文件内容保持当前资料中的原文，本轮未重新读取早期聊天。\n\n'+data.docs.map((item,i)=>'- ['+item.label+']('+String(i+1).padStart(2,'0')+'.txt)').join('\n')+'\n');
data.docs.forEach((item,i)=>write('sources/'+String(i+1).padStart(2,'0')+'.txt',item.text));
console.log(`Built ${sections.length-1} sections, ${chapters.length} chapters and ${data.docs.length} sources.`);
