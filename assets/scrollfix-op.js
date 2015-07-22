//scroll fix one page
$(function(){
    var fixRatio = 16/9,
        windowScrolled=0,
        $window =$(window),
        viewHeight = $window.height(),            // for video-container height;
        fixHeight = $window.width() / fixRatio,   // video-container box margin-top value and centerallize it
        fixTop = Math.round((viewHeight-fixHeight)/2),
        fadeTop = Math.max(200, fixTop),
        fadeBottom = Math.min(viewHeight - 200, fixTop + fixHeight),
        sequences = $('#showlist'),        // get all video sequence divs;
        videos = $('.video'),                    //get all divs have video class
        videoContainers = $('.video-container'), //get all divs have video-container class
        videoIndexPlayed= false;
        path = 'assets/',
        mobilePath = 'assets/mobile/'
        navHeights=[];

    //isMobile
    function isMobile() {
        return /iPad|iPod|iPhone|Android/.test(navigator.userAgent) || document.location.hash == "#ipad";
    }

    //check element  is partial in view or not;
    function checkInView(element){
        var docViewTop = $window.scrollTop(), //window.pageYOffset,
            docViewBottom = docViewTop+viewHeight,      //set doc viewport  vertical position
            elemTop = element.offset().top,
            elemBottom = elemTop +element.height();     // set element vertial position
        return ((elemBottom>=docViewTop)&&(elemTop<=docViewBottom));  //just only element is partially in view ,will return true;
    }

    /*initial setting video class divs's child element display and opacity style*/
    function initVideos(){
        if(!isMobile()){
            //for pc web;
            var firstVideoSource =  $('video').eq(0)[0];     //get the first video source in the doc;

            //settingvideo-container inline style ----height, margin-top, position,z-index
            videoContainers.css({'height':fixHeight,'z-index':2});
            sequences.css('margin-top',fixTop);

            if($('audio')[0])$('audio')[0].play();

            var thisVideos =  sequences.children('.video');
            var videoLength = thisVideos.length;     //get this sequence's video children;
            thisVideos.each(function(index, element) {
                var $this = $(this);
                if(index==0 ||index== videoLength-1){
                    //set the first and the last video' children divs's style;
                    $this.children('.video-container').css({'position':'absolute','opacity':1,'top':0});
                    $this.children('.video-caption').css({'opacity':1});
                }else{
                    $this.children('.video-container').css({'position':'fixed','opacity':0});
                    $this.children('.video-caption').css({'opacity':0});
                }
            });
        }else{
           //for mobile web;
           $('img').each(function(index, element) {
                var srcPath = $(this).attr('src');
                $(this).attr('src',srcPath.replace(path,mobilePath));
            });
            $('source').each(function(index, element) {
                var srcPath = $(this).attr('src');
                $(this).attr('src',srcPath.replace(path,mobilePath));
            });
        }
    }

    /*sequence in scroll, loop and caculate all the videos in this sequence*/
    function sequenceInScroll(sequence,pageScrolled){
        if(isMobile()) return false;
        var bgAudio= sequence.find('audio')[0],
            thisVideos = sequence.children('.video'),
            videosLength = thisVideos.length;

        thisSequenceBottom = sequence.offset().top+sequence.height(),
        viewBottom = pageScrolled+viewHeight,
        opaicty=0;

        //start check and set each video box
        thisVideos.each(function(index, element) {
            var $this = $(this),
                theRealVideo = $this.find('video')[0],
                theRealAudio = $this.find('audio')[0];
            if((pageScrolled+fixTop)>sequence.offset().top){
                $this.children('.video-container').css({
                    'position':'fixed',
                    'top':fixTop,
                    'display':'block'
                });
            }else{
                thisVideos.eq(0).children('.video-container').css({
                    'position':'absolute',
                    'opacity':1,
                    'top':0,
                    'display':'block'
                });
            }

            if(!checkInView($this)||($this.offset().top+$this.height()<pageScrolled+fadeTop)){
                $this.children('div').css({'opacity':0}); // if this video is not in view, set it to transparent;
                $this.children('.video-container').css('display','none');
                //console.log(theRealVideo);
                if(theRealVideo){
                    theRealVideo.pause();
                    theRealVideo.currentTime=0;
                }
            }else if(checkInView($this)){
                if($this.data('video')=='movie' && bgAudio){
                    bgAudio.muted=true;
                }else if(bgAudio) {
                    bgAudio.muted=false;
                    bgAudio.play();
                };
                //start caculate the opacity of the sibling video containers;
                var nextVideoWillView = (pageScrolled+viewHeight)>($this.offset().top+$this.height());

                if(nextVideoWillView){
                    opacity = ($this.offset().top+$this.height()-pageScrolled-fadeTop)/(Math.round(viewHeight/2-fadeTop))*1.3;
                    opacity =opacity<0?0:opacity>1?1:opacity;

                    $this.children('div').css({'opacity':opacity});
                    if(theRealVideo){
                        theRealVideo.volume = opacity;
                    }
                    if(theRealAudio){
                        //console.log( $(this).children('.video-container').css('opacity'));
                        //$(this).find('audio')[0].volume = $(this).children('.video-container').css('opacity');
                        theRealAudio.volume = opacity/2<.1?0:opacity;
                    }
                    $this.next('.video').children('div').css({'opacity':1-opacity});
                    if($this.next('.video').find('video')[0]){
                        $this.next('.video').find('video')[0].volume =(1- opacity);
                    }
                }

                //start playing the video source in view
                if(theRealVideo){
                    if((theRealVideo.currentTime<theRealVideo.duration)&&($this.children('.video-container').css('opacity')>0.5)){
                        theRealVideo.play();
                    }
                }
            }
        });
        //end checking and setting each video box
        // calculate the background color when the sequence scrolled over pass the 2/3 of window;
        var theSequenceWillShow = (pageScrolled+Math.round(viewHeight/3))>(sequence.offset().top);
        var backColor='';
        var backColorPercentage = 0;
        if(theSequenceWillShow){
            backColorPercentage = (sequence.offset().top-pageScrolled-fadeTop)/(Math.round(viewHeight/3)-fadeTop);
            backColorPercentage = backColorPercentage<0?0:backColorPercentage;
            backColorPercentage = Math.round(backColorPercentage*100)/100;
            backColor = Math.round(255*backColorPercentage);
            $('body').css('background-color','rgb('+backColor+','+backColor+','+backColor+')');
        }
        var theSequenceWillHide = (pageScrolled+fadeBottom)>(sequence.offset().top+sequence.height());
        if(theSequenceWillHide){
            backColorPercentage = (pageScrolled+fadeBottom-sequence.offset().top-sequence.height())/fadeTop;
            backColorPercentage = backColorPercentage>1?1:backColorPercentage;
            backColorPercentage = Math.round(backColorPercentage*100)/100;
            backColor = Math.round(255*backColorPercentage);
            $('body').css('background-color','rgb('+backColor+','+backColor+','+backColor+')');
        }
        if((pageScrolled+Math.round(viewHeight/3))<sequence.offset().top){
            $('body').css('background-color','white');
        }
    }

    function cacuAnchor(windowScrolled){
        for(var i=0;i<navHeights.length-1;i++){
            if(windowScrolled>=navHeights[i]&&windowScrolled<navHeights[i+1]){
                return i;
                break;
            }
        }
    }

    /*when window scrolling*/
    function windowScrolling(){
        if(isMobile()){
            return false;
        }else{
            windowScrolled = $window.scrollTop();

            if(windowScrolled<=0){
                //check the doc is scrolled on top or not;
                $window.scrollTop(1);
                sequenceInView = true;
                $('body').css('background-color','#000');
                initVideos();
            }

            $('.column audio').each(function(index, element) {
                element.pause();
            });
            sequenceInScroll(sequences,windowScrolled);
        }
    }

    /* resizeWindow*/
    function resizedWindow(){
        if(isMobile()){
            return false
        }else{
            viewHeight = $window.height(),
            fixHeight = $window.width() / fixRatio,         // setting the video-container box height;
            fixTop = Math.round((viewHeight-fixHeight)/2),  // setting the video-container box margin-top value and centerallize it
            fadeTop = Math.max(200, fixTop);
            fadeBottom = Math.min(viewHeight - 200, fixTop + fixHeight),
            videos.css('height',viewHeight);
            videoContainers.css({'height':fixHeight});      //settingvideo-container inline style ----height, margin-top, position,z-index
            sequences.css('margin-top',fixTop);
            windowScrolling();
            $('.section a[data-name]').each(function(index, element) {
                navHeights[index]=$(this).offset().top+parseInt($('.section a[data-name]').css('margin-top'));
            });
            navHeights[0]=0;
            navHeights[navHeights.length]=$(document).height();
        }
    }

    initVideos();
    $window.scroll(windowScrolling); //when window scrolling, run the windowScrolling function;
    $window.resize(resizedWindow);

});
