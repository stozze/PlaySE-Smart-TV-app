var tvKey = new Common.API.TVKeyValue();

var index = 0; // list = 0, details = 1, player = 2, kanaler = 3, player2 = 5, settings = 6, imeSearch = 7, blocked = 8, connection error = 9
var keyHeld = false;
var keyTimer;
var itemSelected;
var lastKey = 0;
var keyHeldCounter = 0;

var shift = false;
var capslock = false;
var rowCount = 1;
var keyCount = 0;
var first = true;
var channels = ['svt1', 'svt2', 'svt24', 'barnkanalen', 'kunskapskanalen'];
var channelId = 0;
var resButton = ["#resauto", "#res1", "#res2", "#res3", "#res4", "#res5", "#res6"];
var reslButton = ["#reslauto", "#resl1", "#resl2", "#resl3", "#resl4", "#resl5", "#resl6"];
var langButton = ["#english", "#swedish"];
var channelButton = ["#svt", "#viasat", "#tv4", "#dplay"];
var menuId = 0;
var menu = [{id:'.language-content .title', button:langButton},
            {id:'.res-content .title', button:resButton}, 
            {id:'.res-live-content .title', button:reslButton},
            {id:'.channel-content .title', button:channelButton}
           ];
var animateCallbacked = 0;

var Buttons =
{
};
Buttons.keyDown = function()
{
        // Log("index:" + index + " exit:" + $('#exitBlock').is(':visible') + " error:" + $(".slider-error").is(':visible')); 
	if(index == 2){
	    this.keyHandleForPlayer();
	}
        else if($('#exitBlock').is(':visible')) {
                this.keyHandleForExit();
        }
        else if ($(".slider-error").is(':visible') || index == 9) {
		this.keyHandleForConnectionError();
	} 
        else if(index == 0){
		this.keyHandleForList();
	}
	else if(index == 1)
	{
		this.keyHandleForDetails();
	}
	else if(index == 3){
		this.keyHandleForKanaler();
	}
	else if(index == 5){
		this.getCurrentChannelId();
		this.keyHandleForPlayer2();
	}
	else if(index == 6){
		this.keyHandleForSettings();
	}
	else if(index == 7){
		this.keyHandleForImeSearch();
	}
	else if(index == 8){
		this.keyHandleForGeofilter();
	}
};

Buttons.getCurrentChannelId = function(){
	var url = document.location.href;
	for(var i = 0; i < channels.length; i++){
		if (url.indexOf(channels[i])>0)
		{
			channelId = i;
		}
	}
	
};

Buttons.setKeyHandleID = function(iid){
	index = iid;
};

Buttons.getKeyHandleID = function(){
	return index; 
};



Buttons.enableKeys = function()
{
	document.getElementById("anchor").focus();
};

Buttons.clearKey = function() 
{
    // Log("clearKey");
    lastKey = 0;
    keyHeld = false;
    keyHeldCounter = 0;
};

Buttons.sscroll = function(hide) 
{
    pageIndex = Math.floor(itemIndex/15);
    var yaxis = pageIndex*-603;
    $('.content-holder').animate(
        {marginTop: yaxis},
        {complete: function() 
         {
             if (!hide && !$("#content-scroll").is(':visible')) {
                 $("#content-scroll").show();
             }
         }
        }
    );
};

Buttons.keyHandleForExit = function()
{
    var keyCode = event.keyCode;

    switch(keyCode)
    {
    case tvKey.KEY_RETURN:
	widgetAPI.blockNavigation(event); 
        $("#exitBlock").hide();
        break

    case tvKey.KEY_ENTER:
        widgetAPI.sendReturnEvent();
        break;
    }
};

Buttons.keyHandleForList = function()
{
	var itemList = $('.itemlist');
	var keyCode = event.keyCode;

        if (keyCode != lastKey) {
            window.clearTimeout(keyTimer);
            keyHeld = false;
        }

        if (keyCode != lastKey || keyHeld) {
                // Log("Key handled: " + keyCode + " lastKey=" + lastKey);
                lastKey = keyCode;
                window.clearTimeout(keyTimer);
                if (keyHeld) {
                    // Use longer to avoid end up in "first repeat is ignored" again.
	            keyTimer = window.setTimeout(this.clearKey, 600);
                }
                else
	            keyTimer = window.setTimeout(this.clearKey, 300);

		if (!itemSelected) {
			itemSelected = itemList.eq(0).addClass('selected');
                        itemIndex = 0;
		}
		switch(keyCode)
		{
			case tvKey.KEY_RIGHT:
                            itemSelected = nextInList(itemList, itemSelected, 1);
	                    break;

	                case tvKey.KEY_CH_UP:
                        case tvKey.KEY_PANEL_CH_UP:         
	                case tvKey.KEY_FF:
                        case tvKey.KEY_FF_:
                            itemSelected = nextInList(itemList, itemSelected, 15);
	                    break;
				
			case tvKey.KEY_LEFT:
                            itemSelected = prevInList(itemList, itemSelected, 1);
	                    break;

            	        case tvKey.KEY_CH_DOWN:
         	        case tvKey.KEY_PANEL_CH_DOWN:
	                case tvKey.KEY_RW:
                        case tvKey.KEY_REWIND_:
                            itemSelected = prevInList(itemList, itemSelected, 15);
	                    break;

			case tvKey.KEY_DOWN:
                             if (keyHeld)
                                 itemSelected = nextInList(itemList, itemSelected, 15);
                             else
                                 itemSelected = nextInList(itemList, itemSelected, 5);
                             break;

			case tvKey.KEY_UP:				
                                if (keyHeld)
                                    itemSelected = prevInList(itemList, itemSelected, 15);
                                else
                                    itemSelected = prevInList(itemList, itemSelected, 5);
				break;
			case tvKey.KEY_INFO:
			case tvKey.KEY_ENTER:
			case tvKey.KEY_PANEL_ENTER:
                        case tvKey.KEY_PLAY:
				var ilink = itemSelected.find('.ilink').attr("href");
				Log(ilink);
                                if (ilink != undefined)
                                {
                                    if (keyCode != tvKey.KEY_INFO && ilink.search("details.html\\?") != -1) {
                                        Buttons.playItem();
                                        break;
                                    }
                                    else if (keyCode == tvKey.KEY_INFO && (ilink.match("showList.html\\?name=") || ilink.match("categoryDetail.html"))) {
                                        // Info of show.
                                        ilink = "details.html?" + ilink;
                                    }
                                    else if (keyCode == tvKey.KEY_INFO && ilink.search("details.html\\?") == -1) {
                                        // Info of non-episode/show, not relevant.
                                        break;
                                    }
	                            setLocation(ilink);
                                }
                                else {
	                            itemSelected.removeClass('selected');
                                    itemSelected = false;
                                }
				break;
                default:
                    this.handleMenuKeys(keyCode);
                    return;
                    
		}
		this.sscroll();
        }
        else {
            Log("Key repeated, first time is ignored: " + keyCode + " KeyHeld:" + keyHeld);
            widgetAPI.blockNavigation(event)
            keyHeld = true;
            window.clearTimeout(keyTimer);
	    keyTimer = window.setTimeout(this.clearKey, 600);
        }
};

nextInList = function(itemList, itemSelected, steps)
{
    var maxIndex = (itemList.length-1);
    if (steps == 1) {
        if ((itemIndex % 5) == 4 || !(itemSelected.next()).length) {
            return movePrev(itemSelected, (itemIndex % 5));
        } else {
            return moveNext(itemSelected, steps)
        }
    } else if (steps == 5 || steps == 15) {
        // Next Line        
        if ((itemIndex + steps) <= maxIndex)
            return moveNext(itemSelected, steps); 
        else if (Math.floor(itemIndex/5) != Math.floor(maxIndex/5))
            // Not on same line - swith to last item
            return moveNext(itemSelected, maxIndex-itemIndex); 
        else if (itemIndex > 4)
            // We're on same and last line, move to first line instead
            return movePrev(itemSelected, itemIndex-(itemIndex % 5));
        else
            return itemSelected;
    } else {
        return moveNext(itemSelected, steps);
    }
};

moveNext = function(itemSelected, steps) {
    return moveToItem(itemSelected, steps);
};

moveToItem = function(itemSelected, steps) {
    itemSelected.removeClass('selected');
    itemIndex = itemIndex+steps
    itemSelected = $('.itemlist').eq(itemIndex);
    return itemSelected.addClass('selected');
};

prevInList = function(itemList, itemSelected, steps)
{
    var maxIndex = (itemList.length-1);
    if (steps == 1 && (itemIndex % 5) == 0) {
        return moveNext(itemSelected, Math.min(4, maxIndex-itemIndex));
    } else if (steps == 5 || steps == 15) {
        // Previous Line        
        if ((itemIndex - steps) >= 0)
            return movePrev(itemSelected, steps); 
        else if (maxIndex > 4) {
            // We're on first line, move to last line instead
            var newSteps = maxIndex-itemIndex;
            if ((itemIndex+newSteps) % 5 > itemIndex % 5)
                // Keep column if possible
                newSteps = newSteps - (((itemIndex+newSteps)%5) - (itemIndex%5));
            return moveNext(itemSelected, newSteps);
        }
        else
            return itemSelected;
    
    } else {
        return movePrev(itemSelected, steps);
    }
};

movePrev = function(itemSelected, steps)
{
    return moveToItem(itemSelected, -steps);
};


Buttons.keyHandleForDetails = function()
{
    var keyCode = event.keyCode;
    switch(keyCode)
    {

    case tvKey.KEY_DOWN:
        if($('#extraButton').is(':visible')) {
	    $('#extraButton').addClass('selected');
	    $('#playButton').removeClass('selected');
	    $('#enterShowButton').removeClass('selected');
        }
	break;

    case tvKey.KEY_UP:
        if($('#extraButton').is(':visible') &&
           !$('#notStartedButton').is(':visible')) {
	    $('#extraButton').removeClass('selected');
            if ($('#playButton').is(':visible'))
                $('#playButton').addClass('selected')
            else ($('#enterShowButton').is(':visible'))
                $('#enterShowButton').addClass('selected')
        }
        break;

    case tvKey.KEY_ENTER:
    case tvKey.KEY_PANEL_ENTER:
	if ($('#enterShowButton').hasClass('selected')) {
	    setLocation(itemSelected.find('.ilink').attr("href"));
	} else if ($('#playButton').hasClass('selected')) {
	    Details.startPlayer();
	} else if ($('#extraButton').hasClass('selected')) {
            setLocation($('#extraButton').attr('href'));
        }
	break;
	
    case tvKey.KEY_INFO:
	goBack();
	break;

    case tvKey.KEY_CH_UP:
    case tvKey.KEY_PANEL_CH_UP:
    case tvKey.KEY_FF_:
    case tvKey.KEY_RIGHT:
	this.showNextItem(1);
	break;

    case tvKey.KEY_CH_DOWN:
    case tvKey.KEY_PANEL_CH_DOWN:
    case tvKey.KEY_REWIND_:
    case tvKey.KEY_LEFT:
	this.showNextItem(-1);
	break;
    }
    this.handleMenuKeys(keyCode);
    
};

Buttons.keyHandleForSettings = function()
{
    var keyCode = event.keyCode;
    
    var selected = -1;
    var checked  = -1;
    var button = menu[menuId].button;
    for(var i = 0; i < button.length; i++){
	if($(button[i]).hasClass('selected')){
	    selected = i;
	}
	if($(button[i]).hasClass('checked'))
            checked = i
    }

    switch(keyCode)
    {
    case tvKey.KEY_RIGHT:
    case tvKey.KEY_LEFT:
        var newSelected = (keyCode == tvKey.KEY_RIGHT) ? selected+1 : selected-1
        if (newSelected >= 0 && newSelected < button.length) {
            if (selected != -1) {
	        $(button[selected]).removeClass('selected');
	        $(button[selected]).addClass('unselected');
            }
            selected = newSelected;
	    $(button[selected]).addClass('selected');
	    $(button[selected]).removeClass('unselected');
        }
	break;

    case tvKey.KEY_DOWN:
    case tvKey.KEY_UP:
        var newMenuId = (keyCode == tvKey.KEY_DOWN) ? menuId+1 : menuId-1
        if (newMenuId  >= 0 && newMenuId < menu.length) {
            if (selected != -1) {
	        $(button[selected]).removeClass('selected');
	        $(button[selected]).addClass('unselected');
            }
            $(menu[menuId].id).removeClass('stitle');
	    menuId=newMenuId;
            $(menu[menuId].id).addClass('stitle');
        }
	break;

    case tvKey.KEY_ENTER:
    case tvKey.KEY_PANEL_ENTER:
        if (selected != -1) {
            if (checked != -1)
                $(button[checked]).removeClass('checked');
            $(button[selected]).addClass('checked');
            $(button[selected]).addClass('selected');
            switch (menuId) {
            case 0:
	        if(selected == 1)
	            Language.setLanguage('Swedish');
                else
                    Language.setLanguage('English');
	        Language.setLang();
                break;
            case 1:
                Resolution.setRes(selected);
                break;
            case 2:
                Resolution.setLiveRes(selected);
                break;
            case 3:
                Language.hide();
                setChannel($(button[selected]).attr("id"));
                break;
            }
        }
	break;

    }
    this.handleMenuKeys(keyCode);	
};

Buttons.keyHandleForImeSearch = function()
{
};

Buttons.keyHandleForKanaler = function()
{
    Log("keyHandleForKanaler!!!");
};
Buttons.keyHandleForPlayer2 = function(){
    Log("keyHandleForPlayer2!!!");
};
Buttons.keyHandleForPlayer = function(){
    var keyCode = event.keyCode;
    keyHeld = (keyCode == lastKey);

    if (keyCode != lastKey || keyHeld) {
        lastKey = keyCode;
        window.clearTimeout(keyTimer);
        if (keyHeld) {
            keyHeldCounter++;
        }
        else {
            keyHeldCounter = 0
        }
	keyTimer = window.setTimeout(this.clearKey, 600);
    }

    var longMinutes = Math.floor(keyHeldCounter/10) + 1;

    switch(keyCode)
    {
    case tvKey.KEY_RIGHT:
        Player.skipLongForwardVideo(longMinutes);
	break;
    case tvKey.KEY_LEFT:
        Player.skipLongBackwardVideo(longMinutes);
	break;
    case tvKey.KEY_RW:
	Player.skipBackwardVideo();
	break;
    case tvKey.KEY_PAUSE:
	Player.togglePause();
	break;
    case tvKey.KEY_ENTER:
	Player.keyEnter();
	break;
    case tvKey.KEY_FF:
	Player.skipForwardVideo();
	break;
    case tvKey.KEY_CH_UP:
    case tvKey.KEY_PANEL_CH_UP:
    case tvKey.KEY_FF_:
	this.playNextItem(1);
	break;
    case tvKey.KEY_CH_DOWN:
    case tvKey.KEY_PANEL_CH_DOWN:
    case tvKey.KEY_REWIND_:
	this.playNextItem(-1);
	break;
    case tvKey.KEY_PLAY:
	Player.resumeVideo();
	break;
    case tvKey.KEY_STOP:
	Player.stopVideo();
	break;
    case tvKey.KEY_VOL_DOWN:
	Log("VOL_DOWN");
	Audio.setRelativeVolume(1);
	break;
    case tvKey.KEY_PANEL_VOL_DOWN:
	Log("VOL_DOWN");
	Audio.setRelativeVolume(1);
	break;
    case tvKey.KEY_VOL_UP:
	Log("VOL_UP");
	Audio.setRelativeVolume(0);
	break;
    case tvKey.KEY_PANEL_VOL_UP:
	Log("VOL_UP");
	Audio.setRelativeVolume(0);
	break;
    case tvKey.KEY_RETURN:
	widgetAPI.blockNavigation(event); 
        Player.keyReturn();
	break;
    case tvKey.KEY_EXIT:
        //Internet/Smart Hub
    case tvKey.KEY_INFOLINK:
    case tvKey.KEY_HOME:
    case tvKey.KEY_12:
	Player.stopVideo();
	// Terminated by force
	break;
    case tvKey.KEY_INFO:
	Player.showDetails();
	break;
    case tvKey.KEY_TOOLS:
        widgetAPI.blockNavigation(event); 
	Player.showHelp();
	break;
    case tvKey.KEY_MUTE:
	Audio.toggleMute();
	break;
    case tvKey.KEY_RED:
	Player.toggleRepeat();
	break;
    case tvKey.KEY_BLUE:
    case tvKey.KEY_ASPECT:
    case tvKey.KEY_CALLER_ID:
    case tvKey.KEY_D_VIEW_MODE:
	Player.toggleAspectRatio();
	break;
    case tvKey.KEY_YELLOW:
    case tvKey.KEY_SUBTITLE:     
    case tvKey.KEY_SUB_TITLE:
	Player.toggleSubtitles();
	break;

    case tvKey.KEY_UP:
    case tvKey.KEY_DOWN:
        if (Player.aspectMode == Player.ASPECT_ZOOM) {
            Player.changeZoom(keyCode == tvKey.KEY_UP);
        } else {
	    Player.moveSubtitles(keyCode == tvKey.KEY_UP);
        }
	break;

    case tvKey.KEY_2:
    case tvKey.KEY_8:
	Player.sizeSubtitles(keyCode == tvKey.KEY_2);
	break;

    case tvKey.KEY_4:
    case tvKey.KEY_6:
	Player.separateSubtitles(keyCode == tvKey.KEY_6);
	break;
    default:
        Log("Unhandled key:" + keyCode);
    }
};


Buttons.keyHandleForGeofilter = function()
{
	var keyCode = event.keyCode;
	switch(keyCode)
	{
		
		case tvKey.KEY_ENTER:
		case tvKey.KEY_PANEL_ENTER:
	                history.go(-1);
			break;
		
	}
	this.handleMenuKeys(keyCode);
	
};

Buttons.keyHandleForConnectionError = function()
{
	var keyCode = event.keyCode;
	switch(keyCode)
	{
		
		case tvKey.KEY_ENTER:
		case tvKey.KEY_PANEL_ENTER:
			// location.reload(true);
			break;
	}
	this.handleMenuKeys(keyCode);

};

Buttons.handleMenuKeys = function(keyCode){
    switch(keyCode)
    {
    case tvKey.KEY_RED: 
        if (channel == "svt") {
            Svt.setNextSection();
        } else if (channel == "viasat") {
	    if ($("#a-button").text().indexOf("Pop") != -1) {
	        setLocation('index.html');
            } else if ($("#a-button").text().indexOf("lip") != -1) {
	        setLocation('LatestClips.html');
            } else {
	        setLocation('Latest.html');
            }
        } else if (channel == "tv4") {
	    if ($("#a-button").text().match(/Pop.*lip/)) {
	        setLocation('PopularClips.html');
            } else if ($("#a-button").text().match(/lip/)) {
	        setLocation('LatestClips.html');
            } else if ($("#a-button").text().match(/Pop/)) {
	        setLocation('index.html');
            } else {
	        setLocation('Latest.html');
            }
        } else if (channel == "dplay") {
	    if ($("#a-button").text().indexOf("Re") != -1) {
	        setLocation('index.html');
	    } else if ($("#a-button").text().indexOf("Pop") != -1) {
	        setLocation('Popular.html');
            } else {
	        setLocation('Latest.html');
            }
        }

	break;
    case tvKey.KEY_GREEN: 
        if (Language.isBButtonChanged())
        {
            if (channel == "svt") {
                if (getIndexLocation().match("categories.html"))
                    Categories.setNextLocation();
                else
	            categoryDetail.setNextLocation();
            }
            else if (channel == "viasat")
                Categories.setNextLocation();
            else if (channel == "tv4")
	        setLocation('categories.html');
            else if (channel == "dplay")
                Categories.setNextLocation();
        } else {
	    setLocation('categories.html');
        }
	break;
    case tvKey.KEY_YELLOW:
	setLocation('live.html');
	break;
    case tvKey.KEY_BLUE:
	Language.hide();
        Search.imeShow();
	break;
    case tvKey.KEY_RETURN:
	widgetAPI.blockNavigation(event); 
	var urlpath = myLocation;
	// var ifound = urlpath.indexOf('index.html');
	if(index == 6){
	    Language.hide();
	}
	else if(index == 9 || $(".slider-error").is(':visible')) {
            ConnectionError.show(true);
        }
        else if(myHistory.length > 0) {
	    // else if(ifound < 0){
	    goBack();
	}
	else{
            $("#exitBlock").show();
	}
	break;
    case tvKey.KEY_EXIT:
    case tvKey.KEY_INFOLINK:
    case tvKey.KEY_HOME:
    case tvKey.KEY_MENU:
    case tvKey.KEY_PANEL_MENU:
    case tvKey.KEY_12:
    case tvKey.KEY_DISC_MENU:
	// Terminated by force
	break;
    case tvKey.KEY_TOOLS:
	widgetAPI.blockNavigation(event); 
	Search.hide();
	Language.show();
	break;
    case tvKey.KEY_MUTE:
	Audio.uiToggleMute();
	break;
	break;
    case tvKey.KEY_1:
    case tvKey.KEY_2:
        Buttons.changeChannel("svt");
        break;
    case tvKey.KEY_3:
    case tvKey.KEY_6:
    case tvKey.KEY_8:
        Buttons.changeChannel("viasat");
        break;
    case tvKey.KEY_4:
        Buttons.changeChannel("tv4");
        break;
    case tvKey.KEY_5:
    case tvKey.KEY_9:
        Buttons.changeChannel("dplay");
        break;
    }
};

Buttons.changeChannel = function (channel) {
    for(var i=0, anySelected=false; i < channelButton.length; i++) {
        if ($(channelButton[i]).attr("id") == channel) {
            $(channelButton[i]).addClass('checked');
        } else {
            $(channelButton[i]).removeClass('checked');
        }
    }
    Language.hide();
    setChannel(channel)
};

Buttons.playItem = function() {
    var duration     = itemSelected.find('.ilink').attr("data-length");
    var isLive       = (itemSelected.find('.ilink').attr("is-live") != null);
    var notAvailable = (itemSelected.find('.ilink').attr("not-yet-available") != null);
    var starttime    = 0;
    var itemLink     = itemSelected.find('.ilink').attr("href")

    if (notAvailable) {
        // Not available yet
        return -1;
    }
    if (isLive) {
        if (itemSelected.html().indexOf('bottomoverlay') == -1) {
            starttime = itemSelected.find('a').text().match(/([0-9][0-9][:.][0-9]+)-[0-9]/);
            starttime = (starttime) ? starttime[1] : 0;
        } else if (itemSelected.html().indexOf('bottomoverlayred') != -1) {
            starttime = itemSelected.html().match(/bottomoverlayred">[^<]*([0-9][0-9][:.][0-9]+)</);
            starttime = (starttime) ? starttime[1] : 0;
        }
    }
    // Log("isLive:" + isLive + " starttime:" + starttime);
    if (duration.search(/[hsekmin]/) == -1) {
        duration = duration + " sek";
    }
    Player.setDuration(duration);
    Player.setNowPlaying(itemSelected.find('a').text());
    Player.startPlayer(itemLink.match(/ilink=(.+)&history/)[1], isLive, starttime);
    return 0;
};

Buttons.findNextItem = function(play) {

    var itemList = $('.itemlist');
    var tmpItemIndex = itemIndex;
    var tmpItem;

    while (true) {
        tmpItemIndex = tmpItemIndex+1;
        if (tmpItemIndex < itemList.length)
            tmpItem = itemList.eq(tmpItemIndex)
        else if (!play) {
            tmpItemIndex = 0;
            tmpItem = itemList.eq(tmpItemIndex);
        }
        else
            // There is no more item
            return -1

        if (tmpItem.find('.ilink').attr("href") != undefined && 
            (tmpItem.find('.ilink').attr("href").search("details.html\\?") != -1 ||
             (tmpItem.find('.ilink').attr("href").search("(showList|categoryDetail).html\\?") != -1 && !play)) &&
            (!play || tmpItem.html().indexOf('not-yet-available') === -1)) {
            return {item:tmpItem, index:tmpItemIndex}
        }
    }
};

Buttons.findPriorItem = function(play) {

    var itemList = $('.itemlist');
    var tmpItemIndex = itemIndex;
    var tmpItem;

    while (true) {
        tmpItemIndex = tmpItemIndex-1;
        if (tmpItemIndex >= 0)
            tmpItem = itemList.eq(tmpItemIndex)
        else if (!play) {
            tmpItemIndex = itemList.length-1;
            tmpItem = itemList.eq(tmpItemIndex);
        }
        else
            // There is no more item
            return -1
        if (tmpItem.find('.ilink').attr("href") != undefined && 
            (tmpItem.find('.ilink').attr("href").search("details.html\\?") != -1 ||
             (tmpItem.find('.ilink').attr("href").search("(showList|categoryDetail).html\\?") != -1 && !play)) &&
            (!play || tmpItem.html().indexOf('not-yet-available') === -1)) {
            return {item:tmpItem, index:tmpItemIndex}
        }
    }
};

Buttons.runNextItem = function(direction, play) {
    var tmpItem;
    if (direction == 1)
        tmpItem = this.findNextItem(play);
    else
        tmpItem = this.findPriorItem(play);
    if (tmpItem != -1) {
        itemSelected.removeClass('selected');
        itemIndex = tmpItem.index;
        itemSelected = tmpItem.item;
        itemSelected.addClass('selected');
        this.sscroll(true);
        if (detailsOnTop) {
            // refresh History
            oldPos = myHistory.pop();
            myHistory.push(
                {
                    loc: oldPos.loc,
                    pos: itemIndex
                }
            );
        }
        if (myLocation.match(/details.html/)) {
            // refresh Details
            myLocation = itemSelected.find('.ilink').attr("href");
            if (myLocation.search("(showList|categoryDetail).html\\?") != -1) {
                // Info of category/show.
                myLocation = "details.html?" + myLocation;
            }
            Details.refresh(play);
        }
        if (play) {
            Player.stopVideo(true);
            this.playItem();
        }

    } else {
        // Log("No more items");
        return -1;
    }
};

Buttons.playNextItem = function(direction) {
    this.runNextItem(direction, true);
};

Buttons.showNextItem = function(direction) {
    if (this.runNextItem(direction, false) != -1)
        loadingStart();
};
