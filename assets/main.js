$(function(){
    var isMobile = /iPad|iPod|iPhone|Android/.test(navigator.userAgent),
        isWeixin = /MicroMessenger/.test(navigator.userAgent),
        $window = $(window),
        winH = $window.height(),
        winW = $window.width(),
        body_class = document.body.className,
        video_skrollr;

    //topbar
    var lastScrollTop = 0;
    var $topbar = $('#topbar');

    //cover
    var $cover = $('#cover'),
        is_cover1 = $cover.hasClass('cover1');
        $coverVideo = $cover.find('video');
        coverVideoDom = $cover.find('video')[0];

    $('.cover video').on('timeupdate',function(){
        if(this.readyState==4){
            if(is_cover1 && this.currentTime>=11){
                $('.cover').find('h1').fadeIn('slow');
            }
            else if(!is_cover1 && this.currentTime>=3){
                $('.cover').find('h1').fadeIn('slow');
            }
        }
    });

    //fixed Nav show
    var fixedNav = $('#fixedNav');
    var sectitle1 = $('.sectitle').eq(0);

    //right tips show
    var poptip = $('.popup-tips');
    poptip.hover(function() {
            var $this = $(this),
                theSec = $this.parent().parent(),
                theSecTop = theSec.offset().top,
                tipTarget = $this.data('target'),
                tipOffset = $this.offset(),
                tipLeft = 700,
                tipTop = tipOffset.top - theSecTop;
            $('#'+tipTarget+'').css('top',tipTop);
            $('#'+tipTarget+'').css('left',tipLeft);

        },function() {
            var $this = $(this),
                tipTarget = $this.data('target');
            $('#'+tipTarget+'').css('left','-1280px');
        });

    function topbarShow() {
       var st = $(this).scrollTop();
       if (st > lastScrollTop){
           $topbar.stop().animate({top: '-45px'},100);
       } else {
          $topbar.stop().animate({top: '0'},100);
       }
       lastScrollTop = st;
    }

    function coverSize() {
        if (winH/winW > 720/1280){
            $coverVideo.height('100%');
        }else{
            $coverVideo.width('100%');
        }
    }

    function fixedNavShow() {
        var wScrolltop = $window.scrollTop();
        var coverVideo = $cover.find('video')[0];
        if(wScrolltop > winH/2){
            $cover.find('h1').show();
            fixedNav.fadeIn();
        }else{
            fixedNav.fadeOut();
        }
    }

    function videoOnScroll() {
        var wScrolltop = $window.scrollTop();
        var wtwh= $window.scrollTop()+winH;
        $('.shortmedia').each(function() {
            var $this = $(this),
                secTop = $this.offset().top;
            var inViewPos = secTop+$this.height()/2; //sec offset top + sec 1/2 height
            var outViewPos = secTop+$this.height()/2; //sec offset top + sec 1/2 height

            var theVideo = $this.find('video')[0];
            var theVideoCover = $this.find('.video-cover');
            if (wtwh>inViewPos && wScrolltop<outViewPos){
                $this.addClass("inview");
                if(theVideo){
                    theVideo.play();
                    theVideoCover.hide();
                }
            }else{
                $this.removeClass("inview");
                if(theVideo){
                    theVideo.pause();
                    theVideoCover.show();
                }
            }
        });
    }
    //fixed Nav highlight
    function fixedNavHighlight(){
        var sectitle = $('.title-sec'),
            wScrolltop = $window.scrollTop(),
            wtwh= wScrolltop+winH;
        sectitle.each(function() {
            var $this = $(this),
                linkAim = $this.prev().attr('name'),
                $secwrap = $this.parent(),
                navLink = $('#fixedNav').find('a'),
                sectitleTop = $this.offset().top;

            var inViewStrat = sectitleTop;
            var inViewEnd = sectitleTop+$secwrap.height();
            if (inViewStrat < wtwh && inViewEnd > wtwh ){
                navLink.removeClass('active');
                navLink.each(function() {
                    var $theNavlink = $(this);
                    if ($theNavlink.data('target') == linkAim){
                        $theNavlink.addClass('active');
                    }
                });
            }
        });
    }

    //define Video skrollr
    function Video_skrollr(){
        var _this= this;

        this.init = function (){
            this.container = $('.container');
            this.back_mask = $('.back-mask');
            this.video_fade = $('.video-fade');
            this.fixed_nav = $('#fixedNav');
            this.top_nav = $('.topbar');
            this.popup_tips = $('.popup-tips');
            this.cal_fade_rect();
        };

        this.append_inner = function(){
            this.video_cover = $('<div/>').appendTo(_this.video_fade)
                                    .addClass('video-cover');
            this.cover_img = $('<img/>').appendTo(this.video_cover).attr('width','100%');
            this.video_stage = $('<div/>').appendTo(this.video_fade)
                                .addClass('video-stage');
        }

        this.cal_fade_rect = function(){
            this.fade_datas_array = [];
            this.video_fade.each(function(i){
                var fade_data = {};
                var ele_offset = $(this).offset();

                fade_data.ele_offset_top = ele_offset.top;
                fade_data.ele_height = $(this).height();

                fade_data.name = $(this).data('name');
                fade_data.fade_top_start = 'data-'+(fade_data.ele_offset_top - winH/2),
                fade_data.fade_top_end = 'data-'+(fade_data.ele_offset_top),
                fade_data.fade_bottom_end= 'data-'+(fade_data.ele_offset_top + fade_data.ele_height-winH*.25),
                fade_data.fade_bottom_start  = 'data-'+(fade_data.ele_offset_top + fade_data.ele_height-winH*.75);

                _this.fade_datas_array[i] = fade_data;
            });
            if(!$('.video-fade .video-cover').length){
                _this.append_inner();
            }
            this.cal_data();
        };

        this.clear_dataset = function(ele){
            for(k in ele.dataset){
                delete ele.dataset[k];
            }
        };

        this.cal_data = function(){
            this.video_cover.each(function(i){
                            var $this = $(this);
                            var fade_data = _this.fade_datas_array[i];
                            _this.clear_dataset(this);
                            $this.attr(fade_data.fade_top_start,'opacity:1');
                            $this.attr(fade_data.fade_top_end,'opacity:0');
                            $this.attr(fade_data.fade_bottom_start,'opacity:0');
                            $this.attr(fade_data.fade_bottom_end,'opacity:1');
                        });

            this.cover_img.each(function(i){
                            var $this = $(this);
                            var fade_data = _this.fade_datas_array[i];
                            _this.clear_dataset(this);
                            $this.attr(fade_data.fade_top_start,'transform:scale(1)');
                            $this.attr(fade_data.fade_top_end,'transform:scale(1.1)');
                            $this.attr(fade_data.fade_bottom_start,'transform:scale(1.1)');
                            $this.attr(fade_data.fade_bottom_end,'transform:scale(1)');
            });

            _this.clear_dataset(this.container[0]);
            _this.clear_dataset(this.back_mask[0]);

            this.fade_datas_array.forEach(function(ele,index){
                _this.container.attr(ele.fade_top_start,'background-color:rgb(247,244,240)');
                _this.container.attr(ele.fade_top_end,'background-color:rgb(0,0,0)');
                _this.container.attr(ele.fade_bottom_start,'background-color:rgb(0,0,0)');
                _this.container.attr(ele.fade_bottom_end,'background-color:rgb(247,244,240)');

                _this.back_mask.attr(ele.fade_top_start,'opacity:0');
                _this.back_mask.attr(ele.fade_top_end,'opacity:1');
                _this.back_mask.attr(ele.fade_bottom_start,'opacity:1');
                _this.back_mask.attr(ele.fade_bottom_end,'opacity:0');
            });
            if(!this.video_cover.find('img').attr('src')){
                this.video_cover.find('img').attr('src',function(i){
                    return 'videos/'+_this.fade_datas_array[i].name+'.png';
                });
            }
            _this.s = skrollr.init();
        };

        this.show_video = function(){
            _this.cur_video_fade = _this.video_fade.filter(function(index){
                                        var scrollY = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop;
                                        if((scrollY+winH)>_this.fade_datas_array[index].ele_offset_top&&scrollY<(_this.fade_datas_array[index].ele_offset_top+_this.fade_datas_array[index].ele_height)){
                                                _this.cur_video_index = index;
                                                return this;
                                            }
                                        });

            if(_this.cur_video_fade.length){
                _this.fixed_nav.css('opacity','0');

                _this.back_mask.addClass('show');
                _this.top_nav.addClass('hide');

                _this.cur_video_stage = _this.cur_video_fade.find('.video-stage');
                _this.cur_cover = _this.cur_video_fade.find('.video-cover');
                _this.cur_video = _this.cur_video_stage.find('video');

                //append video if not in DOM;
                if(!_this.cur_video.length){
                    _this.cur_video = $('<video/>').appendTo(_this.cur_video_stage)
                                       .attr('src',function(index){
                                            return 'http://image.thepaper.cn/html/zt/2015/sanxia/videos/'+_this.fade_datas_array[_this.cur_video_index].name+'.mp4';
                                        })
                                       .attr('controls',true);

                    _this.cur_loading = $('<div/>').appendTo(_this.cur_video_stage)
                                            .addClass('video-loading');

                    _this.pass_btn = $('<p/>').appendTo(_this.cur_video_stage)
                                        .addClass('pass-video-btn');
                    var span = $('<span/>').appendTo(_this.pass_btn)
                                            .text('跳过视频')
                                            .on('click',_this.video_ended)
                                            .on('mouseenter',function(){
                                                $(_this).addClass('on');
                                            })
                                            .on('mouseleave',function(){
                                                $(_this).removeClass('on');
                                            });
                }
                _this.cur_video_ele = _this.cur_video[0];

                if(_this.cur_cover.css('opacity')<=.1){
                    _this.cur_video_stage.addClass('show');
                    if(_this.cur_video_ele&&_this.cur_video_ele.currentTime==0){
                        _this.cur_video_ele.play();
                    }
                }
                else{
                    _this.cur_video_stage.removeClass('show');
                    _this.cur_loading.removeClass('show');

                    if(_this.cur_video_ele){
                        _this.cur_video_ele.pause();
                        _this.cur_video_ele.currentTime = 0;
                    }
                }

                _this.cur_video_ele.addEventListener('progress',_this.video_progress,false);
                _this.cur_video_ele.addEventListener('timeupdate',_this.video_timeupdate,false);
                _this.cur_video_ele.addEventListener('waiting',_this.video_waiting,false);
                _this.cur_video_ele.addEventListener('ended',_this.video_ended,false);

                _this.back_mask.css('opacity')<.2?_this.popup_tips.addClass('show-top'):_this.popup_tips.removeClass('show-top');
            }
            else{
                _this.fixed_nav.css('opacity','1');
                _this.back_mask.removeClass('show');
                _this.top_nav.removeClass('hide');
                _this.video_fade.find('.video-stage').removeClass('show');
                if(_this.video_fade.find('video').length){
                    _this.video_fade.find('video')[0].pause();
                }
            }
        };

        this.video_progress = function(){
            if(this.readyState==4){
                _this.cur_loading.removeClass('show');
            }
            if(this.readyState<this.HAVE_FUTURE_DATA){
                _this.cur_loading.addClass('show');
            }
        };

        this.video_ended = function(){
            var data = _this.fade_datas_array[_this.cur_video_index];
            var scrollY_needed = data.ele_offset_top + data.ele_height;

            _this.cur_loading.removeClass('show');
            _this.cur_video_stage.removeClass('show');

            $('html,body').animate({scrollTop:scrollY_needed},1000,function(){
                _this.cur_video_ele.currentTime=0;
                _this.cur_video_ele.pause();

                _this.cur_video_ele.removeEventListener('progress',_this.video_progress,false);
                _this.cur_video_ele.removeEventListener('timeupdate',_this.video_timeupdate,false);
                _this.cur_video_ele.removeEventListener('waiting',_this.video_waiting,false);
                _this.cur_video_ele.removeEventListener('ended',_this.video_ended,false);

            });
        };

        this.video_waiting = function(){
            _this.cur_loading.addClass('show');
        };

        this.init();
    }

    // when document is loaded completetly;
    document.onreadystatechange = function(){
            if(document.readyState=='complete'){
                video_skrollr = new Video_skrollr();
                $window.on('scroll',video_skrollr.show_video);
            }
    }

    //init swipe albums
    if($('.swiper-container').length){
        var albums1 = new Swiper('.albums1',{
            pagination:'.pagination1',
            paginationClickable: true,
            grabCursor:true,
            prevButton:'.swiper-button-prev1',
            nextButton:'.swiper-button-next1',
            preloadImages: false,
            lazyLoading: true
        });

        var albums2 = new Swiper('.albums2',{
            pagination:'.pagination2',
            paginationClickable: true,
            grabCursor:true,
            prevButton:'.swiper-button-prev2',
            nextButton:'.swiper-button-next2',
            preloadImages: false,
            lazyLoading: true
        });
    }

    //scroll func
    $window.on("scroll", function(){
        //topbarShow();
        fixedNavShow();
        fixedNavHighlight();
        videoOnScroll();
    });

    coverSize();

    $window.resize(function () {
        $coverVideo.attr('style','')
        winH = $(this).height();
        winW = $(this).width();
        coverSize();

        video_skrollr.cal_fade_rect();
        video_skrollr.s.refresh();
    });

    var shareTitles = ['澎湃新闻年度作品|三峡','三峡|【中篇】向下的力量','三峡|【下篇】过三峡'],
        shareDescs = ['历时一年，行程万里，倾听、观察、记录三峡变迁。',
                      '世界上最大的水利工程见证了人们克服和利用自然的雄心，但无穷尽的滑坡是不可能克服的。在人力和自然力的消长里，是无数具体的个人动荡的生活。',
                      '三峡改变了成千上万的中国人的命运，让一些人梦想成真的同时，让另一些人陷入了幻灭。'
                        ],
        imgUrls = ['s1.jpg','s2.jpg','s3.jpg'];

    var shareTitle = body_class=='c1'?shareTitles[0]:body_class=='c2'?shareTitles[1]:shareTitles[2],
        shareDesc = body_class=='c1'?shareDescs[0]:body_class=='c2'?shareDescs[1]:shareDescs[2],
        imgUrl = body_class=='c1'?imgUrls[0]:body_class=='c2'?imgUrls[1]:imgUrls[2];

    // weibo and weixin share configue;
    window.directory = location.origin+location.pathname.substring(0, location.pathname.lastIndexOf('/'))+'/',
        imgUrl = directory+imgUrl,
        share_link=location.href;
    //jiathis_config
    window.jiathis_config={
        data_track_clickback:true,
        hideMore:true,
        title:shareTitle,
        summary:shareDesc,
        pic:imgUrl,
        url:share_link,
        appkey:{
            "tsina":"1918686509",
            "tqq":"1a19d5534ef00089838fea7b03410e22",
        }
    };
});