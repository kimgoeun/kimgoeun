// DOM 조작 편의를 위한 구현체
// 여러가지 복잡한 DOM 조작을 쉽게 해줄수 있도록 해주는 함수들이다.

var isDebugMode = false;

// o function 정의 부분
// o function은 함수로 감싼 요소를 쉽게 접근 할 수 있는 함수
var O = [];
function o(obj){
    if(O[obj] != undefined) return O[obj];
    else if(O[obj.id] != undefined) return O[obj.id];
    var elem = obj;
    while((elem = elem.parentElement) != undefined) {
        if(O[elem.id] != undefined) return O[elem.id]; 
    }
    return undefined;
}

// 주어진 HTML 요소 아래에 있는 모든 object 요소에 대해서 함수로 초기화 하고 o function에 등록
o.initObject = function(elem, pObj){
    var objects = elem.querySelectorAll('*[object]');
    var parentObject = pObj;
    for(var i = 0; i < objects.length; i++){
        if(window[objects[i].getAttribute('object')] == undefined) continue;
        else if(objects[i].id != '' && O[objects[i].id] == undefined) {
            if(parentObject != undefined) O[objects[i].id] = eval('new ' + objects[i].getAttribute('object') + '(objects[i], parentObject)');
            else O[objects[i].id] = eval('new ' + objects[i].getAttribute('object') + '(objects[i])');
        }
    }
}

// o function에 object function을 등록하는 함수
o.registerObject = function(fobj){
    if(fobj.getObjectId != undefined) O[fobj.getObjectId()] = fobj;
}

// o function에 등록된 object function의 등록을 해제하는 함수
o.unregisterObject = function(fobj){
    if(fobj.getObjectId != undefined){
        O[fobj.getObjectId()] = null;
        delete O[fobj.getObjectId()];
    } else if(O[fobj] != undefined){
        O[fobj] = null;
        delete O[fobj];
    }
}

// 페이지 로딩이 끝나면 전체 object 요소에 대해서 함수로 초기화 및 o function에 등록
onWindowLoad(function(){
    o.initObject(document);
});

var tsarr = {};
function t(){ }
// 탬플릿 id를 이용해서 해당 탬플릿을 활용하는 모든 "탬플릿 위치 div"를 "탬플릿이 적용된 div"로 바꾸는 함수
// tid : 탬플릿 id, o : 탬플릿에 적용할 변수 또는 객체 (배열 포함, 선택사항)
t.applyTemplates = function(tid, o){
    var ds = document.querySelectorAll('div[data-template="' + tid + '"]');
    for(var i = 0; i < ds.length; i++) t.replaceTemplate(ds[i], o);
},

// "탬플릿 위치 div"를 "탬플릿이 적용된 div"로 바꾸는 함수
// d : 탬플릿 위치 div 객체, o : 탬플릿에 적용할 변수 또는 객체 (배열 포함, 선택사항)
t.replaceTemplate = function(d, o){
    var pe = d.parentElement;
    var tm = tsarr[d.dataset.template];
    var o = o || window[d.dataset.obj];
    if(tm == undefined || o == undefined) return;
    if(Array.isArray(o)){ o.forEach(function(v){ t.insertNodelistBefore(t.getAppliedTemplate(tm.id, v), d)});
    } else { t.insertNodelistBefore(pe, t.getAppliedTemplate(tm.id, window[d.dataset.obj]), d); }
    var es = document.querySelectorAll('*[data-if]');
    for(var i = 0; i < es.length; i++){
        if(es[i].dataset.if == 'false') es[i].parentNode.removeChild(es[i]);
        else es[i].removeAttribute('data-if');
    }
    d.parentNode.removeChild(d);
},

// 특정 노드 앞에 요소를 삽입하는 함수
t.insertNodelistBefore = function(nd, d){
    var pe = d.parentElement
    for(var i = 0 ; i < nd.length; i++){
        if(nd[i].nodeType == Node.ELEMENT_NODE) pe.insertBefore(nd[i], d);
    }
},

// 실제 기능 함수 - 탬플릿이 적용된 div를 반환하는 함수
// tid : 탬플릿 id, o : 탬플릿에 적용할 변수 또는 객체 (배열 불가)
t.getAppliedTemplate = function(tid, o){
    var regvar = /{{[\s]*([^\s]+)[\s]*}}/g;
    var templateHTML = tsarr[tid].innerHTML;
    while(templateHTML.match(regvar) != null){
        var vm = /{{[\s]*([^\s]+)[\s]*}}/g.exec(templateHTML);
        if(vm == undefined) break;
        templateHTML = templateHTML.replace(
            new RegExp('{{\\s*'+ vm[1] + '\\s*}}'), 
            t.e(vm[1]).call(o)
        );
    }
    var d = document.createElement('div');
    d.innerHTML = templateHTML;
    var es = d.querySelectorAll('*[data-if]');
    for(var i = 0; i < es.length; i++){
        if(es[i].dataset.if == 'false') es[i].parentNode.removeChild(es[i]);
        else es[i].removeAttribute('data-if');
    }
    return d.childNodes;
},

t.e = function(s){ return function(){return eval(s);} }

// 초기 DOM 로딩 완료시 탬플릿 div들을 변수에 저장하고 DOM 트리에서는 삭제
// 탬플릿 위치 div들에 값이 적용된 div들로 대체한다
onWindowLoad(function(){
    var ts = document.querySelectorAll('template');
    for(var i = 0; i < ts.length; i++){
        var tm = ts[i]; var tid = tm.id; tsarr[tid] = tm; 
        tm.parentNode.removeChild(tm); t.applyTemplates(tid);
    }
});

// HTML 요소 클래스 조작 함수
// 각각 HTML 요소에 클래수를 추가, 삭제, 존재 여부를 확인해 준다
// 추가, 삭제 함수의 경우 HTML 요소 입력시 Array 또는 Nodelist로 입력해도 된다.

// 클래스 추가 함수
function addClass(elem, name){
    if(elem.length != undefined){
        for(var i = 0; i < elem.length; i++){
            addClass(elem[i], name);
        }
    } else {
        if(name.indexOf(' ') != -1){
            name = name.split(' ');
        }
        if(Array.isArray(name)){
            for(nameIdx in name){
                elem.classList.add(name[nameIdx]);
            }
        } else {
            elem.classList.add(name);
        }
    }
}

// 클래스 삭제 함수
function removeClass(elem, name){
    if(elem.length != undefined){
        for(var i = 0; i < elem.length; i++){
            removeClass(elem[i], name);
        }
    } else {
        if(name.indexOf(' ') != -1){
            name = name.split(' ');
        }
        if(Array.isArray(name)){
            for(nameIdx in name){
                elem.classList.remove(name[nameIdx]);
            }
        } else {
            elem.classList.remove(name);
        }
    }
}

// 클래스 적용 여부 확인 함수
function hasClass(elem, name){
    return elem.classList.contains(name);
}

// HTML 요소를 새로 만드는 함수
// 요소에 추가되어 있는 이벤트를 완전 초기화 하거나, HTML 요소 내 내용을 완전 지우는데 사용한다.
// withChildren 옵션이 true인 경우 자식 요소들을 유지한채 새로 만든다.
function recreateNode(elem, withChildren) {
    if (withChildren) {
      elem.parentNode.replaceChild(elem.cloneNode(true), elem);
    } else {
      var newElem = elem.cloneNode(false);
      while (elem.hasChildNodes()) newElem.appendChild(elem.firstChild);
      elem.parentNode.replaceChild(newElem, elem);
    }
}

// 자바스크립트 object를 인스턴스 자체를 복사하는 함수
function copyObject(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    var copiedObject = obj.constructor();
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) copiedObject[key] = copyObject(obj[key]);
    }
    return copiedObject;
}

// 페이지 로딩이 완전히 끝났을때 콜백 함수를 실행하는 함수
function onDOMContentLoad(callback){
    if(document.readyState == 'interactive' || document.readyState == 'complete') callback();
    else $(document).ready(callback);
}

// 페이지 로딩이 완전히 끝났을때 콜백 함수를 실행하는 함수
function onWindowLoad(callback){
    if(document.readyState == 'complete') callback();
    else $(window).bind('load', callback);
}

// 스크립트를 동적으로 로드/언로드하고, 로드 여부를 확인해 주는 함수들
// 로드시 기본적으로 강제 재로딩이 가능하도록 스크립트 로드시 url 뒤에 랜덤한 숫자로 이루어진 피라미터를 삽입한다.
// 단, 외부에서 불러들이는 라이브러리는 강제 재로딩을 하지 않음 (ex. jQuery)
// 스크립트 로드가 완료되면 callback 함수를 실행한다.
function loadScript(url, callback){
    if(isScriptLoaded(url) == true) return;
    var script = document.createElement('script');
    if(url.indexOf('http') != -1) script.src = url; 
    else script.src = url + '?_=' + getRandom8Digit(); 
    script.onload = callback;
    script.async = false;
    var scriptPos = document.getElementsByTagName('script')[0];
    if(scriptPos != undefined) scriptPos.parentNode.insertBefore(script, scriptPos);
    else document.body.appendChild(script);
}

function unloadScript(url){
    if(isScriptLoaded(url) == false) return;
    var script = document.querySelector('script[src^=\'' + url + '\']');
    if(script != undefined) script.parentElement.removeChild(script);
}

function isScriptLoaded(url){
    return document.querySelector('script[src^=\'' + url + '\']') != null
}

function loadStyle(url, callback){
    if(isStyleLoaded(url) == true) return;
    var link = document.createElement('link');
    if(url.indexOf('http') != -1) link.href = url; 
    else link.href = url + '?_=' + getRandom8Digit(); 
    link.rel = 'stylesheet'; link.type = 'text/css'; 
    link.onload = callback;
    var linkPos = document.getElementsByTagName('link')[0];
    if(linkPos != undefined) linkPos.parentNode.insertBefore(link, linkPos);
    else document.head.appendChild(link);
}

function isStyleLoaded(url){
    return document.querySelector('link[href^=\'' + url + '\']') != null
}

// 8자리 랜덤 숫자를 반환하는 함수
function getRandom8Digit(){
    return (Math.floor(Math.random() * 90000000) + 10000000);
}

// 자바의 format 함수 처럼 날짜/시간을 조작하기 위한 프로토타입 재정의
// 자바와 동일하게 'yyyy-MM-dd' 형식으로 원하는 날짜/시간 값을 얻을 수 있다.
Date.prototype.format = function(f) {
    if (!this.valueOf()) return " ";
    
    var weekShortName = ["일", "월", "화", "수", "목", "금", "토"];
    var weekName = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
    var d = this;
    var h;
        
    return f.replace(/(yyyy|yy|MM|dd|E|hh|mm|ss|a\/p)/gi, function($1) {
        switch ($1) {
            case "yyyy": return d.getFullYear();
            case "yy": return (d.getFullYear() % 1000).zf(2);
            case "MM": return (d.getMonth() + 1).zf(2);
            case "dd": return d.getDate().zf(2);
            case "E": return weekShortName[d.getDay()];
            case "EEE": return weekName[d.getDay()];
            case "HH": return d.getHours().zf(2);
            case "hh": return ((h = d.getHours() % 12) ? h : 12).zf(2);
            case "mm": return d.getMinutes().zf(2);
            case "ss": return d.getSeconds().zf(2);
            case "a/p": return d.getHours() < 12 ? "AM" : "PM";
            default: return $1;
        }
    });
};
    
String.prototype.string = function(len){var s = '', i = 0; while (i++ < len) { s += this; } return s;};
String.prototype.zf = function(len){return "0".string(len - this.length) + this;};
Number.prototype.zf = function(len){return this.toString().zf(len);};


// 터치 관련 이벤트 처리 함수 정의 부분
// 터치 스크롤을 방지해야 할 경우 사용 하면 된다.

function _preventTouchScroll(event){
    if(event != undefined){
        event.preventDefault();
        event.stopPropagation();
    }
}

// 브라우저 체크 함수
// 학독만 랜딩페이지에서 지원하는 브라우저인지 아닌지 나타내 준다.
var isNaverApp, isiPhone;
var browser, browser_ver;
var os, os_ver;
function checkBrowser(){
    var agent = navigator.userAgent.replace(/ /g, '').replace(/_/g, '.'), match;

    if((match = agent.match(/KAKAOTALK([\d.]+)/))) browser = 'KakaoTalk';
    else if((match = agent.match(/MSIE([\d.]+)/)) || (match = agent.match(/Trident.*rv:([\d.]+)/))) browser = 'Internet Explorer';
    else if(match = agent.match(/Chrome\/([\d.]+)/)) browser = 'Chrome'; // Includes Microsoft Edge
    else if(match = agent.match(/Firefox\/([\d.]+)/)) browser = 'Firefox';
    else if(match = agent.match(/Safari\/([\d.]+)/)) browser = 'WebKit'; // Includes Android Default Browser
    else if((match = agent.match(/OPR\/([\d.]+)/)) || (match = agent.match(/Opera\/([\d.]+)/))) browser = 'Opera';
    else if((match = agent.match(/AppleWebKit\/([\d.]+)/))) browser = 'WebKit';
    else browser = 'Unknown';
    if(browser !== 'Unknown') browser_ver = parseFloat(match[1]);

    if((match = agent.match(/WindowsNT([\d.]+)/))) os = 'Windows';
    else if(match = agent.match(/Android([\d.]+)/)) os = 'Android';
    else if(match = agent.match(/iPhoneOS([\d.]+)/)) os = 'iOS';
    else if(match = agent.match(/MacOSX([\d.]+)/)) os = 'Mac OS X';
    else if(match = agent.match(/Linux/)) os = 'Linux';
    else os = 'Unknown';
    if(os !== 'Unknown') os_ver = parseFloat(match[1]);

    isNaverApp = agent.toLowerCase().match(/android.+naver/) != null;
    isiPhone = agent.toLowerCase().match(/iphone/) != null;

    // 학독만 홈페이지 검수 기준
    // Internet Explorer 11, Edge 전버전, Chrome 30, Firefox 52, Opera 36, 기타 웹킷 기반 534.30 (iOS 기준 5) 에서 정상 동작
    if(browser == 'Internet Explorer' && browser_ver < 11) return false;
    else if(browser == 'Chrome' && browser_ver < 30) return false;
    else if(browser == 'WebKit' && browser_ver < 534.30) return false;
    else if(browser == 'Firefox' && browser_ver < 44) return false;
    else if(browser == 'Opera' && browser_ver < 15) return false;
    else if(browser == 'Unknown') return false;

    return true;
}

// 지원되는 브라우저가 아닐 경우 띄워주게 될 팝업
function showNotSupportedBrowserPopup(){
    o('browser_popup').showPopup();

    $('#browser_popup .browser_info').text('(현재 접속중인 브라우저 : ' + browser + ' / ' + browser_ver + ')');
    if((os == 'Android' && os_ver < 4.0) || (os == 'iOS')){
        // 안드로이드 4.0 미만 버전과 iOS는 대체 브라우저가 없으므로 다른 환경으로 접속하도록 안내
        $('#browser_popup .install_new_browser').css({ display:'none' });
    } else if(os == 'Android') { 
        // 안드로이드 4.0 이상인 경우 브라우저 별 플레이스토어로 안내
        $('#browser_popup .unavailable_os').css({ display:'none' });
        $('#browser_popup .browser.chrome a').attr('href', 'https://play.google.com/store/apps/details?id=com.android.chrome');
        $('#browser_popup .browser.firefox a').attr('href', 'https://play.google.com/store/apps/details?id=org.mozilla.firefox');
        $('#browser_popup .browser.opera a').attr('href', 'https://play.google.com/store/apps/details?id=com.opera.browser');
    } else {
        // 그 이외의 OS(데스크탑 등)일 경우 브라우저 홈페이지로 안내
        $('#browser_popup .unavailable_os').css({ display:'none' });
        $('#browser_popup .browser.chrome a').attr('href', 'https://www.google.com/chrome/');
        $('#browser_popup .browser.firefox a').attr('href', 'https://www.mozilla.org/ko/firefox/new/');
        $('#browser_popup .browser.opera a').attr('href', 'https://www.opera.com/ko');
    }
}

function mergeObjects() {
    var resObj = {};
    for(var i=0; i < arguments.length; i += 1) {
         var obj = arguments[i],
             keys = Object.keys(obj);
         for(var j=0; j < keys.length; j += 1) {
             resObj[keys[j]] = obj[keys[j]];
         }
    }
    return resObj;
}

requestAnimFrame =
        window.requestAnimationFrame       || 
        window.webkitRequestAnimationFrame || 
        window.mozRequestAnimationFrame    || 
        window.oRequestAnimationFrame      || 
        window.msRequestAnimationFrame     || 
        function(callback){
            window.setTimeout(callback, 1000 / 60);
        };

$.fn.isBound = function(type, fn) {
    var data = jQuery._data(this[0], 'events')[type];

    if (data === undefined || data.length === 0) {
        return false;
    }

    return (-1 !== $.inArray(fn, data));
};


// 슬라이더 애니메이션 실행 (슬라이더가 보일때만 실행한다.)
function setAnimation(id, forceSwitch){
    if(o(id) != undefined){
        if($('#' + id).visible(true) || forceSwitch) o(id).startAnimation();
        else o(id).stopAnimation();
    }
}

// 각종 애니메이션 실행 (슬라이더가 보일때만 실행한다
function setAnimationByClass(className, animationName, delayTime) {
    var objList = document.querySelectorAll('.'+className);

    for (var i=0; i<objList.length; i++) {
        var obj = objList[i];
        if  (obj.getBoundingClientRect().top >= 0 &&
            (obj.getBoundingClientRect().top + obj.offsetHeight / 2) <= window.innerHeight &&
            !obj.classList.contains(animationName)) {
            if (delayTime) {
                setTimeout(function () {
                    obj.classList.remove(className);
                    obj.classList.add(animationName);
                }, delayTime);
            } else {
                obj.classList.remove(className);
                obj.classList.add(animationName);
            }
        }
    }
}