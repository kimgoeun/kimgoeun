// url 피라미터 저장
var baseurl = window.location.pathname;
var urlParams = window.location.search.substring(1);
var urlParamArr = urlParams.split('&');
var urlParamObj = {};
for(var i in urlParamArr){
    var arr = urlParamArr[i].split('=');
    urlParamObj[arr[0]] = arr[1] || arr[0];
}
var utmParamArr = urlParamArr.filter(function(p){ return p.indexOf('utm') == 0; });

// 팝업을 조작하기 위한 객체 선언
// 기본적으로 팝업 배경과 닫기 버튼에 대한 동작을 제공한다.
function Popup(element) {
    var _this = this;
    this.popup = element;
    this.close = element.getElementsByClassName('close')[0];
    this.isAskBeforeHide = element.getAttribute('askbeforehide') || false;

    this._bgcover_click = (this._bgcover_click).bind(this);
    this._close_click = (this._close_click).bind(this);

    if(hasClass(this.popup.parentElement, 'bgcover')){
        this.bgcover = this.popup.parentElement;
        this.bgcover.addEventListener('click', this._bgcover_click);
    }

    if(this.close != undefined){
        this.close.addEventListener('click', this._close_click);
    }
}

Popup.prototype.getObjectId = function(){
    return this.popup.id;
}

// 팝업 배경 및 닫기 버튼에 대한 이벤트 메서드들
Popup.prototype._bgcover_click = function(e){
    if(e.target == this.bgcover) this.hidePopup();
}

Popup.prototype._close_click = function(){
    this.hidePopup();
}

// 팝업을 조작하기 위한 메서드들
// 각각 배경을 표시하고, 팝업을 표시하고, 팝업을 종료하는 메서드들이다.
Popup.prototype.showBgcover = function(){
    addClass([html, body], 'popup_active');
    if(this.bgcover != undefined) addClass(this.bgcover, 'active');
}

Popup.prototype.showPopup = function(){
    this.showBgcover();
    addClass(this.popup, 'active');
}

Popup.prototype.hidePopup = function(isForceHide){
    if(!this.isAskBeforeHide || (this.isAskBeforeHide && confirm('정말 나가시겠습니까?')) || isForceHide){
        removeClass([html, body], 'popup_active');
        if(this.bgcover != undefined) removeClass(this.bgcover, 'active');
        removeClass(this.popup, 'active');
    }
}


// 슬라이더 애니메이션 구현을 위한 Slider 객체 정의
// Slider 객체 생성자
function Slider(element, params){
    this.id = element.id;
    this.slider = $('#' + element.id + ' .slider');
    this.currIdx = params.initIdx || 1;
    this.sliderInterval = params.sliderInterval || 0;
    this.sliderDirection = params.sliderDirection || 'right';
    this.isAnimated = params.isAnimated || false;
    this.isCentered = params.isCentered;
    this.isSliderCentered = params.isSliderCentered;
    this.isPageSlider = params.isPageSlider || false;
    this.isNavigable = true;
    this.isAnimating = false;

    this.item_wrapper = this.slider.find('.slider_item_wrapper');
    this.transition = this.item_wrapper.css('transition');
    this.item_wrapper.css('transition', 'none');
    this.item_wrapper.css('left', 'none');
    this.item_wrapper_pos = 0;

    if(params.isCentered == undefined) this.isCentered = false;
    if(params.isSliderCentered == undefined) this.isSliderCentered = false;

    // 페이지 단위로 넘어가는 슬라이더는 item 항목 및 일부 속성을 사용하지 않는다.
    if(this.isPageSlider){
        this.showItemLevel = 0;
        this.isFadingSlide = false;
        this.isLoop = false;
        this.itemCnt = Math.ceil(this.item_wrapper.width() / this.slider.width());
    } else {
        this.showItemLevel = params.showItemLevel || 0;
        this.isFadingSlide = params.isFadingSlide || false;
        this.isLoop = params.isLoop || false;
        this.items = this.slider.find('.item');
        this.itemCnt = this.isLoop ? this.items.length / 2 : this.items.length;
        $(this.items).on('click', params.onclick);
    }
    this.onnavigate = params.onnavigate;

    this.navigatorLeft = $('#' + element.id + ' .navigator.left');
    this.navigatorRight = $('#' + element.id + ' .navigator.right');

    if(this.navigatorLeft != undefined) this.navigatorLeft.click((this.navigateSliderLeft).bind(this));
    if(this.navigatorRight != undefined) this.navigatorRight.click((this.navigateSliderRight).bind(this));

    this.firstIdx = this.showItemLevel + 1;
    this.lastIdx = this.itemCnt + this.showItemLevel + 1;

    if(this.currIdx < this.firstIdx) this.currIdx = this.firstIdx;
    else if(this.currIdx > this.lastIdx) this.currIdx = this.lastIdx;

    this.addItemClass(this.currIdx);

    if((this.sliderDirection == 'left' || this.sliderDirection == 'down') && this.currIdx == this.firstIdx){
        this.currIdx = this.lastIdx;
    } else if((this.sliderDirection == 'right' || this.sliderDirection == 'left') && this.currIdx == this.lastIdx){
        this.currIdx = this.firstIdx;
    }

    onDOMContentLoad((function(){
        this.setItemSize();
        switch(this.sliderDirection){
            case 'left':
            case 'right':
                if(this.showItemLevel != 0) this.slider.width(Math.ceil((this.showItemLevel * 2 + 1) * this.itemSize));
                if(this.isLoop == true) this.item_wrapper.width(Math.ceil((this.itemCnt * 2) * this.itemSize));
                else this.item_wrapper.width(Math.ceil(this.itemCnt * this.itemSize));
                break;
            case 'up':
            case 'down':
                if(this.showItemLevel != 0) this.slider.height(Math.ceil((this.showItemLevel * 2 + 1) * this.itemSize * 1.2));
                if(this.isLoop == true) this.item_wrapper.height(Math.ceil((this.itemCnt * 2) * this.itemSize));
                else this.item_wrapper.height(Math.ceil(this.itemCnt * this.itemSize));
                break;
        }

        this.setItemWrapperPosition();
        if(this.onnavigate != undefined) this.onnavigate();
        if(this.isAnimated == true && this.slider.visible(true)) this.startAnimation();

        $(window).on('resize', (function(){
            this.setItemSize();
            this.setItemWrapperPosition();
        }).bind(this));
    }).bind(this));
}

Slider.prototype.getObjectId = function(){
    return this.id;
}

// 슬라이더 이동을 위해 구현한 메서드
// 실제 구현시 아래 세개 메서드와 제일 아래 setItemWrapperPosition만 사용하면 슬라이더 작동 가능
Slider.prototype.navigateSliderLeft = function() {
    this.navigateSlider('left');
}

Slider.prototype.navigateSliderRight = function() {
    this.navigateSlider('right');
}

Slider.prototype.navigateSliderTo = function(index) {
    var navigateDirection = (this.currIdx > index) ? 'left' : 'right';
    if(index < this.firstIdx){
        index = index + this.itemCnt;
    } else if(index > this.lastIdx) {
        index = index - this.itemCnt;
    }
    if(this.currIdx != index){
        this.navigateSlider(navigateDirection);
        this.setTimeout(function(){ this.navigateSliderTo(index); }, 500);
    }
}

// 슬라이더 실제 이동을 컨트롤 하기 위한 메서드 - 방향에 따라 이동
// 너무 짧은 간격안에 다시 실행되지 않도록 isNaviable 사용
Slider.prototype.navigateSlider = function(navigateDirection) {
    if(this.isNavigable != true) return;
    this.stopAnimation();
    switch(navigateDirection){
        case 'left':
        case 'down':
            this.moveSliderLeft(); break;
        case 'right':
        case 'up':
            this.moveSliderRight(); break;
    }
    var slider = this;
    this.isNavigable = false;
    window.setTimeout(function(){ slider.isNavigable = true; }, 500);
    if(this.isAnimated == true && this.isAnimating) this.setTimeout(this.startAnimation, 3000);
}

// 슬라이더의 왼쪽 혹은 오른쪽 아이템으로 한칸 이동하는 메서드
Slider.prototype.moveSliderLeft = function(){
    this.removeItemClass(this.currIdx);
    if(this.currIdx - 1 == this.firstIdx) {
        this.addItemClass(this.lastIdx);
    }
    if(this.currIdx == this.firstIdx && this.isLoop == true){
        var slider = this;
        this.currIdx = this.lastIdx;
        this.item_wrapper.css('transition', 'none');
        window.setTimeout(function(){
            slider.moveSliderLeft.apply(slider);
        }, 100);
    } else if(this.currIdx != this.firstIdx) {
        this.item_wrapper.css('transition', this.transition);
        this.addItemClass(--this.currIdx);
    }
    this.setItemWrapperPosition();
    if(this.onnavigate != undefined) this.onnavigate();
}

Slider.prototype.moveSliderRight = function(){
    this.removeItemClass(this.currIdx);
    if(this.currIdx + 1 == this.lastIdx) {
        this.addItemClass(this.firstIdx);
    }
    if(this.currIdx == this.lastIdx && this.isLoop == true){
        var slider = this;
        this.currIdx = this.firstIdx;
        this.item_wrapper.css('transition', 'none');
        window.setTimeout(function(){
            slider.moveSliderRight.apply(slider);
        }, 100);
    } else if(this.currIdx != this.lastIdx){
        this.item_wrapper.css('transition', this.transition);
        this.addItemClass(++this.currIdx);
    }
    this.setItemWrapperPosition();
    if(this.onnavigate != undefined) this.onnavigate();
}

// 애니메이션 시작 및 종료를 위한 메서드
Slider.prototype.startAnimation = function() {
    if(!this.isAnimated || this.isAnimating == true) return;
    this.isAnimating = true;
    switch(this.sliderDirection){
        case 'left':
        case 'down':
            this.setInterval(this.moveSliderLeft, this.sliderInterval);
            break;
        case 'right':
        case 'up':
            this.setInterval(this.moveSliderRight, this.sliderInterval);
            break;
    }
}

Slider.prototype.stopAnimation = function() {
    if(!this.isAnimated || this.isAnimating == false) return;
    this.isAnimating = false;
    window.clearInterval(this.intervalId);
}

// 반복 실행과 지연 실행을 위한 메서드
// 일반적으로 this를 사용하면 window 전역 객체를 가르키기 때문에 this가 Slider 객체를 가르키도록 자체 구현
Slider.prototype.setInterval = function(func, interval) {
    var slider = this;
    window.clearInterval(this.intervalId);
    this.intervalId = window.setInterval(function(){ func.apply(slider); }, interval);
}

Slider.prototype.setTimeout = function(func, interval) {
    var slider = this;
    window.clearTimeout(this.timeoutId);
    this.timeoutId = window.setTimeout(function(){ func.apply(slider); }, interval);
}

// 슬라이더에서 디스플레이 되는 아이템들에 대한 클래스 추가, 삭제 메서드
// large, small1, small2, small3 클래스를 사용하며, 숫자가 커질수록 중심에서 멀리있는 아이템
Slider.prototype.addItemClass = function(index) {
    if(!this.isPageSlider && this.isFadingSlide){
        index = index - 1;
        $(this.items[index]).addClass('large');
        for(var i = 1; i <= this.showItemLevel; i++) {
            $(this.items[index-i]).addClass('small' + i);
            $(this.items[index+i]).addClass('small' + i);
        }
    }
}

Slider.prototype.removeItemClass = function(index) {
    if(!this.isPageSlider && this.isFadingSlide){
        index = index - 1;
        $(this.items[index]).removeClass('large');
        for(var i = 1; i <= this.showItemLevel; i++) {
            $(this.items[index-i]).removeClass('small' + i);
            $(this.items[index+i]).removeClass('small' + i);
        }
    }
}

// 슬라이더에서 아이템을 감싸고 있는 item_wrapper의 위치를 구하는 메서드
// 현재 index에 따라서 item_wrapper를 이동해 주는 방법으로 구현
// item_wrapper 이동 후에 슬라이더의 네비게이터를 비활성화 할지 여부를 결정한다.
Slider.prototype.setItemWrapperPosition = function(){
    switch(this.sliderDirection){
        case 'left':
        case 'right':
            if(!this.isCentered) var wrapper_posX = (this.currIdx - this.firstIdx) * -this.itemSize;
            else if(this.isSliderCentered && this.slider.outerWidth() >= this.item_wrapper.width()) var wrapper_posX = (this.slider.outerWidth() - this.itemCnt * this.itemSize)/2;
            else if(this.showItemLevel == 0) var wrapper_posX = ((this.currIdx - this.firstIdx) * -this.itemSize) + (this.slider.outerWidth() - this.itemSize)/2;
            else var wrapper_posX = ((this.currIdx - this.firstIdx) * -this.itemSize) - (((this.showItemLevel * 2 + 1) * this.itemSize) - this.slider.outerWidth())/2;

            this.item_wrapper.css('left', wrapper_posX + 'px');
            this.item_wrapper_pos = wrapper_posX;
            break;
        case 'up':
        case 'down':
            if(!this.isCentered) var wrapper_posY = (this.currIdx - this.firstIdx) * -this.itemSize;
            else if(this.isSliderCentered && this.slider.outerHeight() >= this.item_wrapper.height()) var wrapper_posY = (this.slider.outerHeight() - this.itemCnt * this.itemSize)/2;
            else if(this.showItemLevel == 0) var wrapper_posY = ((this.currIdx - this.firstIdx) * -this.itemSize) + (this.slider.outerHeight() - this.itemSize)/2;
            else var wrapper_posY = ((this.currIdx - this.firstIdx) * -this.itemSize) - (((this.showItemLevel * 2 + 1) * this.itemSize) - this.slider.outerHeight())/2;

            this.item_wrapper.css('top', wrapper_posY + 'px');
            this.item_wrapper_pos = wrapper_posY;
            break;
    }

    if(this.slider.width() >= this.item_wrapper.width() || this.item_wrapper_pos == 0 || this.currIdx == this.firstIdx){
        this.navigatorLeft.addClass('disabled');
    } else {
        this.navigatorLeft.removeClass('disabled');
    }

    if(this.slider.width() >= this.item_wrapper.width() || this.slider.width() >= this.item_wrapper.width() + this.item_wrapper_pos || this.currIdx == this.lastIdx){
        this.navigatorRight.addClass('disabled');
    } else {
        this.navigatorRight.removeClass('disabled');
    }
}

Slider.prototype.setItemSize = function(){
    if(this.isPageSlider){
        var itemStyle = getComputedStyle(this.slider.get()[0]);
        switch(this.sliderDirection){
            case 'left': case 'right':
                this.itemSize = parseFloat(itemStyle.width);
                break;
            case 'up': case 'down':
                this.itemSize = parseFloat(itemStyle.height);
                break;
        }
    } else {
        var itemStyle = getComputedStyle(this.items[this.currIdx - 1]);
        switch(this.sliderDirection){
            case 'left': case 'right':
                this.itemSize = parseFloat(itemStyle.width) + parseFloat(itemStyle.marginLeft) + parseFloat(itemStyle.marginRight);
                break;
            case 'up': case 'down':
                this.itemSize = parseFloat(itemStyle.height) + parseFloat(itemStyle.marginTop) + parseFloat(itemStyle.marginBottom);
                break;
        }
    }
}


// 유튜브 플레이어 객체
// 유튜브 플레이어 재생, 정지 관련 기능 추가
function YTPlayer(element){
    this.id = element.id;
    this.element = element;
    this.videoId = element.getAttribute('videoId');
    this.totalPlaybackTime = 0;
    this.startPlaybackTime = 0;
    this.startPlayPosTime = 0;
}

YTPlayer.prototype.loadPlayer = function() {
    if(typeof YT === 'undefined' || typeof YT.Player === 'undefined'){
        loadScript('https://www.youtube.com/player_api', (this.loadPlayer).bind(this));
        return;
    }
    if(this.ytplayer == undefined){
        this.ytplayer = new YT.Player(this.id, {
            height: '360',
            width: '640',
            videoId: this.videoId,
            playerVars: {
                'autoplay': 0,  // 자동실행여부
                'color': 'white',
                'controls': 1,   // 재생컨트롤 노출여부
                'autohide': 1,  // 재생컨트롤이 자동으로 사라질지의 여부
                'showinfo': 0,
                'modestbranding': 1,
                'rel': 0,          // 동영상 재생완료 후 유사동영상 노출여부
                'wmode': 'transparent'
            },
            events: {
                'onReady': this._onReady.bind(this),
                'onStateChange': this._onPlayerStateChange.bind(this)
            }
        });
    }
}

YTPlayer.prototype.playVideo = function() {
    if(this.ytplayer == undefined && this.ytplayer.playVideo != undefined){
        this.loadPlayer();
    } else {
        this.ytplayer.playVideo();
    }
}

YTPlayer.prototype.stopVideo = function() {
    if(this.ytplayer != undefined && this.ytplayer.stopVideo != undefined) this.ytplayer.stopVideo();
}

YTPlayer.prototype.pauseVideo = function() {
    if(this.ytplayer != undefined && this.ytplayer.pauseVideo != undefined) this.ytplayer.pauseVideo();
}

YTPlayer.prototype._onReady = function(event) { // 플레이어 준비 완료시 실행되는 메서드
}

YTPlayer.prototype._onPlayerStateChange = function(event) {
    switch(event.data) {
        case 0:
            console.log('video ended');
        break;
        case 1:
            console.log('video playing from ' + this.ytplayer.getCurrentTime());
            this.startPlayPosTime = this.ytplayer.getCurrentTime();
            this.startPlaybackTime = new Date().getTime();
        break;
        case 2:
            var duration = (new Date().getTime() - this.startPlaybackTime) / 1000;
            console.log('video paused at ' + (this.startPlayPosTime + duration));
            console.log('playback duration : ' + duration);
            this.totalPlaybackTime += duration;
    }
}


// 팝업 유튜브 플레이어 객체
// Popup에서 상속받은 객체로 유튜브 재생, 정지 관련 기능 추가
function PopupYTPlayer(element){
    Popup.call(this, element);
    this.id = this.popup.id;
    this.videoId = element.getAttribute('videoId');
    this.setPopupHeight = (this.setPopupHeight).bind(this);
    $(window).on('resize', this.setPopupHeight);
}

PopupYTPlayer.prototype = Object.create(Popup.prototype);
PopupYTPlayer.prototype.constructor = PopupYTPlayer;

PopupYTPlayer.prototype._bgcover_click = function(e){
    if(e.target == this.bgcover) this.stopVideo();
}

PopupYTPlayer.prototype.playVideo = function() {
    if(typeof YT === 'undefined' || typeof YT.Player === 'undefined'){
        loadScript('https://www.youtube.com/player_api', (this.playVideo).bind(this));
        return;
    }
    if(this.ytplayer == undefined){
        this.showBgcover();
        this.ytplayer = new YT.Player(this.popup.id, {
            height: '360',
            width: '640',
            videoId: this.videoId,
            playerVars: {
                'autoplay': 1,  // 자동실행여부
                'color': 'white',
                'controls': 1,   // 재생컨트롤 노출여부
                'autohide': 1,  // 재생컨트롤이 자동으로 사라질지의 여부
                'showinfo': 0,
                'modestbranding': 1,
                'rel': 0,          // 동영상 재생완료 후 유사동영상 노출여부
                'wmode': 'transparent'
            },
            events: {
                'onReady': this._onReady.bind(this),
                'onStateChange': this._onPlayerStateChange.bind(this)
            }
        });
    } else {
        this.showPopup();
        this.setPopupHeight();
        this.ytplayer.playVideo();
    }
}

PopupYTPlayer.prototype.stopVideo = function() {
    this.ytplayer.stopVideo();
    this.hidePopup();
    $(window).off('resize', this.setPopupHeight);
}

PopupYTPlayer.prototype._onReady = function(event) { // 플레이어 준비 완료시 실행되는 메서드
    this.popup = document.getElementById(this.id);
    this.showPopup();
    this.setPopupHeight();
}

PopupYTPlayer.prototype._onPlayerStateChange = function(event) {
    if(event.data === 0) { // 플레이 종료시
        this.hidePopup();
    }
}

PopupYTPlayer.prototype.setPopupHeight = function(event) {
    this.popup.style.height = (this.popup.offsetWidth * 0.5625) + 'px';
};


//loadStyle('/common/css/common.css');
//loadStyle('/common/css/common_page.css');

var html;
var body;

// 네이버 노출이 제대로 되지 않을때를 대비해서 어느 페이지든 네이버로 유입시 자동으로 랜딩으로 소환해준다.
/* if(document.referrer.indexOf('search.naver.com') != -1){
    window.location.href = '/';
} */

onDOMContentLoad(function(){
    o.initObject(document);

    html = document.getElementsByTagName('html')[0];
    body = document.getElementsByTagName('body')[0];

    // 상단 햄버거 메뉴 관련 스크립트
    // 햄버거 메뉴 버튼을 누르면 햄버거 메뉴를 보여준다.
    // $('#hambuger_menu').click(function(){
    //     $('#navigation').toggleClass('hambuger_active');
    //     $('#hambuger_menu').toggleClass('hambuger_active');
    // });

    // 햄버거 메뉴 이외 부분을 누르면 햄버거 메뉴를 숨겨준다.
    // $('.section').click(function(event) {
    //     $('#navigation').removeClass('hambuger_active');
    //     $('#hambuger_menu').removeClass('hambuger_active');
    // });

    // 자주 묻는 질문 버튼 이벤트 추가
    $('.btn_faq.student').click(function(){ window.location.href = './faq.html#student'; });
    $('.btn_faq.teacher').click(function(){ window.location.href = './faq.html#teacher'; });

    // 학생/선생님 지원 버튼 이벤트 추가
    $('.btn_apply.student').on('click', function(){ studentApply(); });
    $('.btn_apply.coding_student').on('click', function(){ codingStudentApply(); });
    $('.btn_apply.teacher').on('click', function(){ teacherApply(); });

    $('.btn_academy.student').click(function(){ window.open('https://goo.gl/forms/ZhUi4X8QNy5s6YRJ3'); });
    $('.btn_academy.academy').click(function(){ window.open('https://goo.gl/forms/jwGGjLFOU3JW0MNj2'); });

    // if(o('holiday_popup') != undefined) o('holiday_popup').showPopup();
    if($('#sidenav').length) {
        $('#hambuger_menu').click(function(e){
            $('#sidenav').addClass('active');
            $('body').addClass('nav_active');
            e.stopPropagation();
        });

        $('#sidenav').click(function(e){ e.stopPropagation() });

        $('body').click(function(e){
            if($(this).hasClass('nav_active')){
                $('#sidenav').removeClass('active');
                $('body').removeClass('nav_active');
            }
        });

        $('#sidenav .close').click(function(e){
            $('#sidenav').removeClass('active');
            $('body').removeClass('nav_active');
        });

        $('#sidenav .item').click(function(e){
            $(this).closest('li').toggleClass('active');
            if($(e.target).hasClass('collapse_icon')){
                e.preventDefault();
            }
        });
    }
});

function setCurrentNavigation(parent, nav){
    $('#sidenav li.' + parent).addClass('active');
    $('#sidenav li, header li').each(function(){
        if($(this).hasClass(nav)) $(this).addClass('nav_selected');
    });
}

onWindowLoad(function(){
    if(typeof ga != 'undefined') ga('create', 'UA-116555560-1', 'auto');

    // 햄버거 메뉴에서 링크 클릭시 보여줄 이벤트 (머티리얼 잉크 이벤트)
    var parent, ink, d, x, y;
    $("#navigation ul li a").click(function(e){
        parent = $(this).parent();
        if(parent.find(".ink").length == 0){
            parent.append("<span class='ink'></span>");
        }

        ink = parent.find(".ink");
        ink.removeClass("animate");

        if(!ink.height() && !ink.width()) {
            d = Math.max(parent.outerWidth(), parent.outerHeight());
            ink.css({height: d, width: d});
        }

        x = e.pageX - parent.offset().left - ink.width()/2;
        y = e.pageY - parent.offset().top - ink.height()/2;

        ink.css({top: y+'px', left: x+'px'}).addClass("animate");
    })

    // 스크롤시 상단 해더바 처리
    // 아래로 스크롤시 헤더바는 숨겨지며, 위로 스크롤시 헤더바가 보이게 된다.
    var prevScrollPos = 0;
    $(window).on('scroll', function(e) {
        if($('body').hasClass('popup_active')){
            $('header').addClass('active');
            return;
        }
        var currScrollPos = $(this).scrollTop();
        if(currScrollPos <= 45 || prevScrollPos > currScrollPos) {
            $('header').addClass('active');
        } else {
            $('header').removeClass('active');
            $('#navigation').removeClass('hambuger_active');
            $('#hambuger_menu').removeClass('hambuger_active');
        }
        prevScrollPos = currScrollPos;
    });

    var fabInterval = window.setInterval(function(){
        var channel_btn = document.getElementById('ch-plugin-launcher');
        if(channel_btn == null) return;
        else {
            var channel_style = getComputedStyle(channel_btn.parentElement);
            $('.fab_button').css('visibility', 'visible');
            $('.fab_button').css('bottom', parseInt(channel_style.bottom) + 72);
            $('.fab_button').css('right', channel_style.right);
        }
        window.clearInterval(fabInterval);
     }, 500);
});

// 학생 및 선생님 지원서를 로드하는 함수

function studentApply() {
    /* if(!$('.btn_apply.student').hasClass('disabled')){
        $('.btn_apply.student, .btn_apply.teacher').addClass('disabled');
        window.location.href = '/apply/studentApply.html?startForm';
    } else {
        alert('지원서 로딩 중입니다. 잠시만 기다려 주세요.');
    } */
    o('terminal_popup').showPopup();
}

function codingStudentApply() {
    /* if(!$('.btn_apply.coding_student').hasClass('disabled')){
        $('.btn_apply.coding_student, .btn_apply.teacher').addClass('disabled');
        window.location.href = '/apply/codingStudentApply.html?startForm';
    } else {
        alert('지원서 로딩 중입니다. 잠시만 기다려 주세요.');
    } */
    o('terminal_popup').showPopup();
}

 function teacherApply() {
    /* if(!$('.btn_apply.teacher').hasClass('disabled')){
        $('.btn_apply.student, .btn_apply.teacher').addClass('disabled');
        loadApplyPopup('teacherApply');
    } else {
        alert('지원서 로딩 중입니다. 잠시만 기다려 주세요.');
    } */
    o('terminal_popup').showPopup();
}

function showSurvey() {
    loadApplyPopup(urlParamArr[0]);
}
// 지원서 로드를 위한 함수
function loadApplyPopup(formType){
    // 로딩 배경화면을 표시
    o('apply_popup').showBgcover();

    // 지원서용 스타일시트와 스트립트 로드
    // 스크립트 로드가 끝나면 해당 지원서용 파일을 로드한다
    loadStyle('./css/form.css');
    // 유효성 검증을 위한 스크립트 로드
    loadScript('/common/js/type.js');
    loadScript('/common/js/form.js');

    recreateNode(o('apply_popup').bgcover, true); // bgcover에 있던 이벤트 리스너 제거
    var loadFunction = function(){
        $.get('./' + formType + '.html', function(data){
            $('#apply_popup').replaceWith(data);
            $('.btn_apply.student, .btn_apply.teacher').removeClass('disabled');
        })
    }
    if(isScriptLoaded('/common/js/applyForm.js')) loadFunction();
    else loadScript('/common/js/applyForm.js', loadFunction);
}

// id 항목으로의 부드러운 스크롤을 위한 함수
function smoothScroll(id){
    var startPos = window.scrollY;
    var endPos = $('#' + id).offset().top;
    var duration = 500;
    var scrollLength = endPos - startPos;
    var posDelta = scrollLength / duration;
    var startTime = null;
    var easyInOutQuart = function (t) { return t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t };

    $('header').removeClass('active');
    $('#navigation').removeClass('hambuger_active');
    $('#hambuger_menu').removeClass('hambuger_active');

    function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = timestamp - startTime;
        if (progress < duration) {
            window.scrollTo(0, startPos + easyInOutQuart(progress / duration) * scrollLength);
            requestAnimFrame(step);
        } else {
            window.scrollTo(0, endPos);
        }
    }
    requestAnimFrame(step);
}
