// ==UserScript==
// @name         煎蛋侠
// @name:en      Jiandan Hero
// @name:zh-TW   煎蛋俠
// @namespace    hoothin
// @version      1.5
// @description  为煎蛋jandan.net提供左右方向键快捷翻页、鼠标悬停显示大图、屏蔽指定用户发言等功能
// @description:en  Tools for jandan.net
// @description:zh-TW  為煎蛋jandan.net提供左右方向鍵快捷翻頁、鼠標懸停顯示大圖、屏蔽指定用戶發言等功能
// @author       hoothin
// @include      http*://jandan.net/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// ==/UserScript==

(function() {
    'use strict';
    var timer,tempImg=document.createElement("img"),getImgWH=function(img,callBack){
        if(timer)clearInterval(timer);
        tempImg.src="";
        tempImg.src=img.src;
        var check=function(){
            if(tempImg.width>0 || tempImg.height>0){
                if(timer)clearInterval(timer);
                callBack(tempImg.width,tempImg.height);
                return true;
            }else{
                return false;
            }
        };
        var geted=check();
        if(!geted){
            timer = setInterval(check,40);
        }
    };

    document.addEventListener("keydown", function(e) {
        if(/INPUT|TEXTAREA/.test(document.activeElement.tagName))return;
        switch(e.keyCode){
            case 37://←
                var next=document.querySelector("span#nav_next>a");
                if(next)next.click();
                break;
            case 39://→
                var pre=document.querySelector("span#nav_prev>a");
                if(pre)pre.click();
                break;
        }
    });
    var authors=document.querySelectorAll("div.author"),i;
    var isHttps=location.protocol=="https:";
    for(i=0;i<authors.length;i++){
        let author=authors[i];
        let authorId=author.querySelector("strong").title.replace(/防伪码：/,"");
        let changeBtn=document.createElement("a");
        changeBtn.href=`javascript:void(0);`;
        changeBtn.id="changeBtn";
        changeBtn.style.display="none";
        author.insertBefore(changeBtn,author.querySelector("br"));
        if(GM_getValue("jandanDis_"+authorId)){
            author.nextSibling.nextSibling.style.display="none";
            changeBtn.innerHTML="显";
        }else{
            changeBtn.innerHTML="隐";
        }
        author.onmouseover=function(){
            changeBtn.style.display="block";
        };
        author.onmouseout=function(){
            changeBtn.style.display="none";
        };
        changeBtn.onclick=function(){
            var author_s,j,shown;
            if(author.nextSibling.nextSibling.style.display=="none"){
                shown=false;
                GM_deleteValue("jandanDis_"+authorId);
            }else{
                shown=true;
                GM_setValue("jandanDis_"+authorId,true);
            }
            for(j=0;j<authors.length;j++){
                author_s=authors[j];
                if(author_s.querySelector("strong").title.replace(/防伪码：/,"")==authorId){
                    author_s.nextSibling.nextSibling.style.display=shown?"none":"block";
                    author_s.querySelector("#changeBtn").innerHTML=shown?"显":"隐";
                }
            }
        };
    }
    var imgs=document.querySelectorAll("img"),left,top,src;
    var bigImg=document.createElement("img");
    bigImg.style.cssText="pointer-events: none;position:fixed;z-index:999";
    for(i=0;i<imgs.length;i++){
        let img=imgs[i];
        img.onmouseover=function(e){
            src=img.src.replace(/\b(custom|square)\b/,"medium").replace(/\.sinaimg\.cn\/(mw600|thumb\d+)/,".sinaimg.cn/large");
            src=isHttps?src.replace(/http\:\/\//,"https://"):src.replace(/https\:\/\//,"http://");
            bigImg.src=img.src;
            bigImg.src=src;
            left=e.clientX;
            top=e.clientY;
            document.body.appendChild(bigImg);
            relocBigImg(left, top);
            getImgWH(bigImg,function(w,h){
                relocBigImg(left, top, w, h);
            });
            bigImg.onload=function(){
                relocBigImg(left, top);
            };
        };
        img.onmouseout=function(e){
            if(bigImg.parentNode)bigImg.parentNode.removeChild(bigImg);
            bigImg.removeAttribute("height");
            bigImg.removeAttribute("width");
        };
        img.onmousemove=function(e){
            left=e.clientX;
            top=e.clientY;
            if(!bigImg.src || bigImg.src===""){
                img.onmouseover(e);
            }
            relocBigImg(left, top);
        };
    }
    $("p").on("mouseover","div.gif-mask",function(e){
        src=this.previousSibling.getAttribute("org_src").replace(/\b(custom|square)\b/,"medium").replace(/\.sinaimg\.cn\/(mw600|thumb\d+)/,".sinaimg.cn/large");
        src=isHttps?src.replace(/http\:\/\//,"https://"):src.replace(/https\:\/\//,"http://");
        bigImg.src=this.previousSibling.src;
        bigImg.src=src;
        document.body.appendChild(bigImg);
        getImgWH(bigImg,function(w,h){
            relocBigImg(left, top, w, h);
        });
        bigImg.onload=function(){
            relocBigImg(left, top);
        };
    });
    $("p").on("mouseout","div.gif-mask",function(e){
        if(bigImg.parentNode)bigImg.parentNode.removeChild(bigImg);
        bigImg.removeAttribute("height");
        bigImg.removeAttribute("width");
    });
    $("p").on("mousemove","div.gif-mask",function(e){
        if(e){
            left=e.clientX;
            top=e.clientY;
        }
        if(!bigImg.src || bigImg.src===""){
            this.onmouseover(e);
        }
        relocBigImg(left, top);
    });
    function relocBigImg(left, top, w, h){
        var imgWidth=w?w:bigImg.width;
        var imgHeight=h?h:bigImg.height;
        var type=imgHeight/imgWidth>document.documentElement.clientHeight/document.documentElement.clientWidth;
        if(type && imgHeight>document.documentElement.clientHeight){
            imgHeight=bigImg.height=document.documentElement.clientHeight;
        }
        if(!type && imgWidth>document.documentElement.clientWidth){
            imgWidth=bigImg.width=document.documentElement.clientWidth;
        }
        if(top-imgHeight<0){
            top=0;
        }else{
            top-=imgHeight;
        }
        if(left+imgWidth>document.documentElement.clientWidth){
            left=document.documentElement.clientWidth-imgWidth;
        }
        bigImg.style.left=left+10+"px";
        bigImg.style.top=top+"px";
    }
})();