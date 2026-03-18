

javascript:(function(){
  const PANEL_ID='jarvis_meta_floating_panel_v1';
  if(document.getElementById(PANEL_ID)){
    document.getElementById(PANEL_ID).style.display='block';
    return;
  }

  const oldWrap=document.getElementById(PANEL_ID+'_wrap');
  if(oldWrap) oldWrap.remove();

  function getTags(){
    const roots=[...document.querySelectorAll('.annotation-list.list.group,.annotation-list.list-group')].filter(Boolean);
    if(!roots.length) return [{text:'未找到 .annotation-list.list-group',index:-1}];
    const els=roots.flatMap(root=>[...root.querySelectorAll('*')].filter(el=>
      el.classList &&
      el.classList.contains('ml-1') &&
      el.classList.contains('metadata-tag') &&
      el.className.includes('el-tag') &&
      (el.className.includes('el-tag--small') || el.className.includes('el-tag—small')) &&
      (el.className.includes('el-tag--dark') || el.className.includes('el-tag—dark'))
    ));
    const items=els.map((el,i)=>({text:(el.innerText||el.textContent||'').trim(),index:i})).filter(x=>x.text);
    return items.length?items:[{text:'未找到目标元素',index:-1}];
  }

  function esc(s){
    return s.replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  const wrap=document.createElement('div');
  wrap.id=PANEL_ID+'_wrap';
  wrap.style.cssText='position:fixed;inset:0;z-index:2147483647;pointer-events:none;';

  const panel=document.createElement('div');
  panel.id=PANEL_ID;
  panel.style.cssText='position:absolute;top:80px;right:40px;width:420px;height:520px;min-width:280px;min-height:180px;overflow:hidden;resize:both;pointer-events:auto;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,PingFang SC,Microsoft YaHei,sans-serif;';

  const header=document.createElement('div');
  header.style.cssText='height:48px;display:flex;align-items:center;justify-content:space-between;padding:0 12px 0 14px;cursor:move;user-select:none;';
  header.innerHTML='<div style="display:flex;align-items:center;gap:10px;font-size:14px;font-weight:600;"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#fff;box-shadow:0 0 0 3px rgba(255,255,255,.18);"></span><span>标签提取面板</span></div>';

  const btns=document.createElement('div');
  btns.style.cssText='display:flex;align-items:center;gap:8px;';

  function makeBtn(txt,title){
    const b=document.createElement('button');
    b.type='button';
    b.textContent=txt;
    b.title=title||txt;
    b.style.cssText='border:none;padding:6px 10px;border-radius:10px;font-size:12px;font-weight:600;cursor:pointer;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);';
    return b;
  }

  const body=document.createElement('div');
  body.style.cssText='height:calc(100% - 48px);display:flex;flex-direction:column;';

  const toolbar=document.createElement('div');
  toolbar.style.cssText='display:flex;gap:8px;align-items:center;padding:12px 12px 10px 12px;flex-wrap:wrap;';

  const count=document.createElement('div');
  count.style.cssText='margin-left:auto;font-size:12px;';

  const content=document.createElement('div');
  content.style.cssText='flex:1;overflow:auto;padding:12px;';

  const list=document.createElement('div');
  list.style.cssText='display:flex;flex-direction:column;gap:8px;white-space:pre-wrap;word-break:break-word;';
  content.appendChild(list);

  const copyBtn=document.createElement('button');
  copyBtn.textContent='复制';
  copyBtn.style.cssText='border:none;padding:8px 12px;border-radius:10px;font-size:12px;font-weight:600;cursor:pointer;';

  const refreshBtn=document.createElement('button');
  refreshBtn.textContent='刷新';
  refreshBtn.style.cssText='border:none;padding:8px 12px;border-radius:10px;font-size:12px;font-weight:600;cursor:pointer;';

  const notesBtn=document.createElement('button');
  notesBtn.textContent='备注';
  notesBtn.style.cssText='border:none;padding:8px 12px;border-radius:10px;font-size:12px;font-weight:600;cursor:pointer;';

  const themeBtn=document.createElement('button');
  themeBtn.textContent='深色';
  themeBtn.style.cssText='border:none;padding:8px 12px;border-radius:10px;font-size:12px;font-weight:600;cursor:pointer;';

  const minBtn=makeBtn('最小化','最小化');
  const closeBtn=makeBtn('关闭','关闭');

  toolbar.appendChild(copyBtn);
  toolbar.appendChild(refreshBtn);
  toolbar.appendChild(notesBtn);
  toolbar.appendChild(themeBtn);
  toolbar.appendChild(count);

  btns.appendChild(minBtn);
  btns.appendChild(closeBtn);

  header.appendChild(btns);
  body.appendChild(toolbar);
  body.appendChild(content);
  panel.appendChild(header);
  panel.appendChild(body);
  wrap.appendChild(panel);
  document.body.appendChild(wrap);

  let theme='light';
  let notesMode=false;
  let notesBaseline=null;
  let currentActiveTagIndex=null;

  function getPalette(){
    if(theme==='dark'){
      return {
        panelBg:'rgba(28,28,30,.92)',
        panelBorder:'1px solid rgba(255,255,255,.10)',
        panelShadow:'0 16px 48px rgba(0,0,0,.45)',
        text:'#f5f5f7',
        subText:'#a1a1aa',
        bodyBg:'linear-gradient(180deg,rgba(28,28,30,.98),rgba(44,44,46,.96))',
        headerBg:'linear-gradient(135deg,rgba(58,58,60,.96),rgba(44,44,46,.96))',
        headerText:'#f5f5f7',
        divider:'rgba(255,255,255,.08)',
        itemBg:'rgba(44,44,46,.92)',
        itemBorder:'1px solid rgba(255,255,255,.06)',
        itemShadow:'0 2px 10px rgba(0,0,0,.22)',
        itemText:'#f5f5f7',
        itemNumBg:'rgba(99,102,241,.22)',
        itemNumText:'#c7d2fe',
        activeOutline:'2px solid #f59e0b',
        activeBg:'rgba(92,56,18,.45)',
        activeShadow:'0 4px 18px rgba(245,158,11,.22)',
        primaryBtnBg:'#0a84ff',
        primaryBtnText:'#fff',
        successBtnBg:'#30d158',
        successBtnText:'#08110b',
        secondaryBtnBg:'rgba(255,255,255,.10)',
        secondaryBtnText:'#f5f5f7',
        secondaryBtnActiveBg:'rgba(245,158,11,.20)',
        noteEditedBg:'rgba(245,158,11,.18)',
        noteEditedText:'#fbbf24',
        noteNewBg:'rgba(48,209,88,.18)',
        noteNewText:'#86efac',
        windowBtnBg:'rgba(255,255,255,.10)',
        windowBtnText:'#f5f5f7'
      };
    }
    return {
      panelBg:'rgba(255,255,255,.92)',
      panelBorder:'1px solid rgba(255,255,255,.45)',
      panelShadow:'0 12px 40px rgba(0,0,0,.18)',
      text:'#1f2937',
      subText:'#6b7280',
      bodyBg:'linear-gradient(180deg,rgba(248,250,252,.96),rgba(255,255,255,.90))',
      headerBg:'linear-gradient(135deg,rgba(99,102,241,.95),rgba(59,130,246,.95))',
      headerText:'#ffffff',
      divider:'rgba(0,0,0,.06)',
      itemBg:'rgba(255,255,255,.90)',
      itemBorder:'1px solid rgba(0,0,0,.06)',
      itemShadow:'0 2px 10px rgba(0,0,0,.04)',
      itemText:'#1f2937',
      itemNumBg:'#eef2ff',
      itemNumText:'#4338ca',
      activeOutline:'2px solid #f59e0b',
      activeBg:'rgba(255,247,237,.98)',
      activeShadow:'0 4px 16px rgba(245,158,11,.25)',
      primaryBtnBg:'#2563eb',
      primaryBtnText:'#fff',
      successBtnBg:'#0f766e',
      successBtnText:'#fff',
      secondaryBtnBg:'rgba(15,23,42,.06)',
      secondaryBtnText:'#334155',
      secondaryBtnActiveBg:'rgba(245,158,11,.12)',
      noteEditedBg:'rgba(245,158,11,.12)',
      noteEditedText:'#b45309',
      noteNewBg:'rgba(34,197,94,.12)',
      noteNewText:'#15803d',
      windowBtnBg:'rgba(255,255,255,.16)',
      windowBtnText:'#fff'
    };
  }

  function styleWindowButton(btn){
    const p=getPalette();
    btn.style.background=p.windowBtnBg;
    btn.style.color=p.windowBtnText;
    btn.onmouseenter=()=>btn.style.background=(theme==='dark'?'rgba(255,255,255,.16)':'rgba(255,255,255,.26)');
    btn.onmouseleave=()=>btn.style.background=p.windowBtnBg;
  }

  function styleTopButtons(){
    const p=getPalette();

    copyBtn.style.background=p.primaryBtnBg;
    copyBtn.style.color=p.primaryBtnText;

    refreshBtn.style.background=p.successBtnBg;
    refreshBtn.style.color=p.successBtnText;

    notesBtn.style.background=notesMode?p.secondaryBtnActiveBg:p.secondaryBtnBg;
    notesBtn.style.color=p.secondaryBtnText;
    notesBtn.style.boxShadow=notesMode?'inset 0 0 0 1px rgba(245,158,11,.35)':'none';

    themeBtn.style.background=p.secondaryBtnBg;
    themeBtn.style.color=p.secondaryBtnText;
    themeBtn.textContent=theme==='light'?'深色':'浅色';

    styleWindowButton(minBtn);
    styleWindowButton(closeBtn);
  }

  function getItemBaseCss(){
    const p=getPalette();
    return 'background:'+p.itemBg+';border:'+p.itemBorder+';border-radius:12px;padding:10px 12px;line-height:1.5;font-size:13px;box-shadow:'+p.itemShadow+';transition:all .2s ease;color:'+p.itemText+';';
  }

  function getNoteBadgeHtml(noteText){
    const p=getPalette();
    const isNew=noteText==='New label';
    const bg=isNew?p.noteNewBg:p.noteEditedBg;
    const color=isNew?p.noteNewText:p.noteEditedText;
    return '<span style="display:inline-block;margin-left:8px;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:700;vertical-align:middle;background:'+bg+';color:'+color+';">'+noteText+'</span>';
  }

  function applyTheme(){
    const p=getPalette();
    panel.style.background=p.panelBg;
    panel.style.backdropFilter='blur(14px)';
    panel.style.webkitBackdropFilter='blur(14px)';
    panel.style.border=p.panelBorder;
    panel.style.borderRadius='18px';
    panel.style.boxShadow=p.panelShadow;
    panel.style.color=p.text;

    header.style.background=p.headerBg;
    header.style.color=p.headerText;

    body.style.background=p.bodyBg;
    toolbar.style.borderBottom='1px solid '+p.divider;
    count.style.color=p.subText;

    styleTopButtons();

    [...list.children].forEach(el=>{
      if(el.dataset.active==='1'){
        applyActiveStyle(el,false);
      }else{
        applyBaseStyle(el);
      }
    });
  }

  function applyBaseStyle(el){
    const p=getPalette();
    el.style.cssText=getItemBaseCss();
    el.style.outline='';
    el.style.background=p.itemBg;
    el.style.boxShadow=p.itemShadow;
    el.style.color=p.itemText;
  }

  function applyActiveStyle(el,shouldScroll){
    const p=getPalette();
    el.dataset.active='1';
    el.style.cssText=getItemBaseCss();
    el.style.outline=p.activeOutline;
    el.style.background=p.activeBg;
    el.style.boxShadow=p.activeShadow;
    el.style.color=p.itemText;
    if(shouldScroll){
      el.scrollIntoView({behavior:'smooth',block:'center'});
    }
  }

  function clearActiveStyles(){
    [...list.children].forEach(el=>{
      el.dataset.active='0';
      applyBaseStyle(el);
    });
  }

  function syncActiveByIndex(idx,shouldScroll){
    const matched=[...list.children].find(el=>String(el.dataset.tagIndex)===String(idx));
    if(!matched) return;
    clearActiveStyles();
    currentActiveTagIndex=idx;
    applyActiveStyle(matched,shouldScroll);
  }

  function render(){
    const arr=getTags();
    list.innerHTML='';

    arr.forEach((obj,i)=>{
      const item=document.createElement('div');
      item.style.cssText=getItemBaseCss();

      let noteText='';
      if(notesMode && notesBaseline){
        const baseText=notesBaseline.get(String(obj.index));
        if(baseText===undefined){
          noteText='New label';
        }else if(baseText!==obj.text){
          noteText='Edited';
        }
      }

      item.innerHTML=
        '<span style="display:inline-block;min-width:22px;height:22px;line-height:22px;text-align:center;margin-right:8px;border-radius:999px;background:'+getPalette().itemNumBg+';color:'+getPalette().itemNumText+';font-size:12px;font-weight:700;vertical-align:top;">'+(i+1)+'</span>'+
        '<span style="vertical-align:top;display:inline-block;width:calc(100% - 34px);">'+esc(obj.text)+(noteText?getNoteBadgeHtml(noteText):'')+'</span>';

      item.dataset.rawText=obj.text;
      item.dataset.tagIndex=obj.index;
      item.dataset.active='0';
      list.appendChild(item);
    });

    count.textContent='共 '+(arr[0]&&arr[0].text&&arr[0].text.startsWith('未找到')?0:arr.length)+' 项';
    panel.dataset.copyText=(arr[0]&&arr[0].text&&arr[0].text.startsWith('未找到'))?'':arr.map(x=>x.text).join('\n');

    applyTheme();

    if(currentActiveTagIndex!==null){
      syncActiveByIndex(currentActiveTagIndex,false);
    }
  }

  render();

  (function observeHighlight(){
    const container=document.querySelector('.annotation-list.list-group');
    if(!container) return;

    const getAllTagEls=()=>[...document.querySelectorAll('.annotation-list.list-group *')].filter(el=>
      el.classList &&
      el.classList.contains('ml-1') &&
      el.classList.contains('metadata-tag') &&
      el.className.includes('el-tag') &&
      (el.className.includes('el-tag--small') || el.className.includes('el-tag—small')) &&
      (el.className.includes('el-tag--dark') || el.className.includes('el-tag—dark'))
    );

    const observer=new MutationObserver(()=>{
      const active=container.querySelector('.list-group-item.highlighted');
      if(!active) return;

      const allTags=getAllTagEls();
      if(!allTags.length) return;

      let activeTag=null;
      const insideTags=[...active.querySelectorAll('*')].filter(el=>
        el.classList &&
        el.classList.contains('ml-1') &&
        el.classList.contains('metadata-tag') &&
        el.className.includes('el-tag') &&
        (el.className.includes('el-tag--small') || el.className.includes('el-tag—small')) &&
        (el.className.includes('el-tag--dark') || el.className.includes('el-tag—dark'))
      );

      if(insideTags.length===1){
        activeTag=insideTags[0];
      }else if(insideTags.length>1){
        activeTag=insideTags[insideTags.length-1];
      }

      if(!activeTag) return;

      const idx=allTags.indexOf(activeTag);
      if(idx<0) return;

      syncActiveByIndex(idx,true);
    });

    observer.observe(container,{subtree:true,attributes:true,attributeFilter:['class']});
  })();

  (function autoRefresh(){
    const container=document.querySelector('.annotation-list.list-group');
    if(!container) return;

    let timer=null;
    const observer=new MutationObserver(()=>{
      if(timer) clearTimeout(timer);
      timer=setTimeout(()=>{
        render();
      },300);
    });

    observer.observe(container,{
      subtree:true,
      childList:true,
      characterData:true
    });
  })();

  copyBtn.onclick=async function(){
    const txt=panel.dataset.copyText||'';
    if(!txt){
      alert('没有可复制的内容');
      return;
    }
    try{
      await navigator.clipboard.writeText(txt);
      copyBtn.textContent='已复制';
      setTimeout(()=>copyBtn.textContent='复制',1200);
    }catch(e){
      const ta=document.createElement('textarea');
      ta.value=txt;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      copyBtn.textContent='已复制';
      setTimeout(()=>copyBtn.textContent='复制',1200);
    }
  };

  refreshBtn.onclick=function(){
    render();
  };

  notesBtn.onclick=function(){
    notesMode=!notesMode;
    if(notesMode){
      const arr=getTags().filter(x=>x.index>=0);
      notesBaseline=new Map(arr.map(x=>[String(x.index),x.text]));
    }else{
      notesBaseline=null;
    }
    render();
  };

  themeBtn.onclick=function(){
    theme=theme==='light'?'dark':'light';
    applyTheme();
    if(currentActiveTagIndex!==null){
      syncActiveByIndex(currentActiveTagIndex,false);
    }
  };

  let minimized=false,lastSize={width:'420px',height:'520px'};
  minBtn.onclick=function(){
    if(!minimized){
      lastSize={width:panel.style.width,height:panel.style.height};
      body.style.display='none';
      panel.style.height='48px';
      panel.style.resize='none';
      minBtn.textContent='恢复';
      minimized=true;
    }else{
      body.style.display='flex';
      panel.style.width=lastSize.width;
      panel.style.height=lastSize.height;
      panel.style.resize='both';
      minBtn.textContent='最小化';
      minimized=false;
      applyTheme();
    }
  };

  closeBtn.onclick=function(){
    wrap.remove();
  };

  let dragging=false,startX=0,startY=0,startLeft=0,startTop=0;
  header.addEventListener('mousedown',function(e){
    if(e.target.tagName==='BUTTON') return;
    dragging=true;
    const rect=panel.getBoundingClientRect();
    startX=e.clientX;
    startY=e.clientY;
    startLeft=rect.left;
    startTop=rect.top;
    document.body.style.userSelect='none';
    e.preventDefault();
  });

  document.addEventListener('mousemove',function(e){
    if(!dragging) return;
    const x=startLeft+(e.clientX-startX);
    const y=startTop+(e.clientY-startY);
    const maxX=window.innerWidth-120;
    const maxY=window.innerHeight-48;
    panel.style.left=Math.max(0,Math.min(x,maxX))+'px';
    panel.style.top=Math.max(0,Math.min(y,maxY))+'px';
    panel.style.right='auto';
  });

  document.addEventListener('mouseup',function(){
    dragging=false;
    document.body.style.userSelect='';
  });

  applyTheme();
})();