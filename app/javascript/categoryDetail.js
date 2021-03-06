var categoryDetail =
{
    tabs: [],
    tab_index: 0
};

categoryDetail.onLoad = function(refresh)
{
    if (!refresh)
	PathHistory.GetPath();

    if (!detailsOnTop) {
        var location = getLocation(refresh);
        if (location.indexOf("&tab_index=") == -1) {
            categoryDetail.tabs = [];
            categoryDetail.tab_index = 0;
        } else {
            categoryDetail.tab_index = +location.match(/&tab_index=([0-9]+)/)[1];
        }
	this.loadXml(this.Geturl(refresh), refresh);
    }
//	widgetAPI.sendReadyEvent();
};

categoryDetail.setNextLocation = function()
{
    if (channel == "svt" && Svt.category_detail_max_index > 0)
        setLocation(Svt.getNextCategoryDetail());
    // To be removed when SVT updated all their categories
    else {
        var myNewLocation = myLocation;
        if (detailsOnTop)
            myNewLocation = getOldLocation();
        if (myNewLocation.match(/tab_index=[0-9]+/)) {
            // Name to be replaced exists in History
            myNewLocation = myNewLocation.replace(/[^\/]+\/$/, this.getNextName() + '/');
        } else
            myNewLocation = myNewLocation + this.getNextName() + '/';
        myNewLocation = myNewLocation.replace(/(&tab_index=[0-9]+)?&history/,"&tab_index=" + this.getNextTabIndex() + "&history");
        setLocation(myNewLocation);
    }
};

categoryDetail.getNextName = function()
{
    return categoryDetail.tabs[categoryDetail.getNextTabIndex()].name;
};

categoryDetail.getCategoryName = function()
{
    return decodeURIComponent(document.title.match(/[^\/]+\/([^\/]+)/)[1]);
};

categoryDetail.getNextTabIndex = function()
{
    if ((categoryDetail.tab_index+1) >= categoryDetail.tabs.length)
        return 0;
    else
        return categoryDetail.tab_index+1;
};

categoryDetail.onUnload = function()
{

};

categoryDetail.Geturl=function(refresh){
    var url;
    if (!refresh && categoryDetail.tabs.length > categoryDetail.tab_index) {
        url = categoryDetail.tabs[categoryDetail.tab_index].href;
        if (url.indexOf(myLocation.match(/\?category=(http:[^&]+)/)[1]) != -1)
            return url
    }
    url = getLocation(refresh);
    var parse;
    var name="";
    if (url.match(/category=/))
    {
        name = url.match(/category=(.+)&catThumb/)[1]
    }
    
    return name.replace(/&tab_index=[0-9]+/, "");
};

categoryDetail.loadXml = function(url, refresh) {
    $("#content-scroll").hide();

    if (categoryDetail.tabs.length > categoryDetail.tab_index &&
        url == categoryDetail.tabs[categoryDetail.tab_index].href) {
        categoryDetail.fixBButton();
    // Temp to check Svt.category_detail_max_index
    } else if (categoryDetail.tabs.length == 0 && Svt.category_detail_max_index == 0)
        Language.fixBButton();

    switch (channel) {
    case "svt":
        categoryDetail.loadSvt(url, refresh);
        break;
    case "viasat":
        categoryDetail.loadViasat(url, refresh);
        break;
    case "tv4":
        categoryDetail.loadTv4(url, refresh);
        break;
    case "dplay":
        categoryDetail.loadDplay(url, refresh);
        break;
    }
};

categoryDetail.loadSvt = function(url, refresh) {
    requestUrl(url,
               function(status, data)
               {
                   if (!data.responseText.match(/ul class=\"play_category__tab/)) {
                       return Svt.decode_category(data);
                   }
                   // Temp
                   Svt.category_detail_max_index = 0;
                   data = data.responseText.split("ul class=\"play_category__tab");
                   tabs = data[1].split("li class=\"play_category__tab-list-item");
                   var tab = null;
                   var newTab;
                   var recommendedLinks = [];
                   categoryDetail.tabs = [];
                   // Create/Update TABs list
                   // Add also "latest list" to tabs
                   if (data[0].match(/section class=[^>]+play_category__latest-list/)) {
                       categoryDetail.tabs.push(
                           {
                               name: $($(data[0]).find("h1.play_videolist-section-header__header")[0]).text().trim(),
                               key: 'special-list',
                               href: url
                           }
                       );
                   }
                   // Tabs
                   for (var i=1; i<tabs.length; i++) {
                       var tab = "li class=\"play_category__tab-list-item" + tabs[i].split("</li>")[0] + "</li>";
                       newTab = {
                           name: $(tab).text().trim(),
                           key: $(tab).attr('aria-controls'),
                           href: Svt.fixLink($(tab).attr('href'))
                       };
                       if (newTab.key === "playJs-alphabetic-list")
                           categoryDetail.tabs.unshift(newTab);
                       else
                           categoryDetail.tabs.push(newTab);
                   }
                   if (url != categoryDetail.tabs[categoryDetail.tab_index].href) {
                       if (categoryDetail.tab_index != 0) {
                           // This is old data - we're out of sync - update
                           return categoryDetail.loadXml(categoryDetail.tabs[categoryDetail.tab_index].href, refresh);
                       } else if ($(tabs[1]).attr('aria-controls') != "playJs-alphabetic-list") {
                           // Default isn't A-� -> shows are missing
                           return categoryDetail.loadXml(categoryDetail.tabs[0].href, refresh );
                       }
                   }
                   categoryDetail.fixBButton();
                   itemCounter = 0;
                   if (categoryDetail.tabs[categoryDetail.tab_index].key == "special-list") {
                       
                       data = data[0].split(" play_category__latest-list")[1];
                       Section.decode_data(data);
                   } else {
                       // Add recommended to popular
                       if (categoryDetail.tabs[categoryDetail.tab_index].key == "playJs-popular-videos" &&
                           data[0].match(/section id=\"recommended-videos/)) {
                           recommendedLinks = Section.decode_recommended(data[0]);
                       }
                       data = data[1].split("div id=\"" + categoryDetail.tabs[categoryDetail.tab_index].key)[1];
                       data = data.split("role=\"tabpanel")[1];
                       // Log("articles:"+ data.length);
                       if (categoryDetail.tab_index == 0)
                           categoryDetail.decode_data(data);
                       else
                           Section.decode_data(data, recommendedLinks);
                   }
               },
               {callLoadFinished:true,
                refresh:refresh
               }
              );
};

categoryDetail.loadViasat = function(url, refresh) {

    var url = Viasat.getUrl(url);
    requestUrl(url,
               function(status, data)
               {
                   itemCounter = 0;
                   Viasat.decode_shows(data.responseText, url, false, false, 
                                       function() {loadFinished(status, refresh)}
                                      );
               },
               {cbError:function(status, data) {loadFinished(status, refresh)}}
              );
};

categoryDetail.loadTv4 = function(url, refresh) {
    requestUrl(Tv4.getUrl(url),
               function(status, data)
               {
                   itemCounter = 0;
                   Tv4.decode_shows(data.responseText);
                   data = null
               },
               {callLoadFinished:true,
                refresh:refresh
               }
              );
};

categoryDetail.loadDplay = function(url, refresh) {

    Dplay.getAllShows(function() {loadFinished("success", refresh)}, url);
};

categoryDetail.decode_data = function (categoryData) {

    try {
        var Name;
        var Link;
        var ImgLink;

        categoryData = categoryData.split("</article>");
        categoryData.pop();

        for (var k=0; k < categoryData.length; k++) {
            categoryData[k] = "<article" + categoryData[k].split("<article")[1];
            Name = categoryData[k].match(/data-title="([^"]+)"/)[1];
            Link = Svt.fixLink(categoryData[k].match(/href="([^"]+)"/)[1]);
            if (Svt.isPlayable(Link))
                // Episode amongst shows - skip
                continue;
            // Log(Link);
            ImgLink = categoryData[k].match(/data-imagename="([^"]+)"/);
            if (!ImgLink) {
                ImgLink = categoryData[k].match(/src="([^"]+)"/)[1];
            } else {
                ImgLink = ImgLink[1];
            }
            ImgLink = Svt.fixLink(ImgLink);
            categoryData[k] = "";
            showToHtml(Name, ImgLink, Link);
        }
    } catch(err) {
        Log("decode_data Exception:" + err.message + " data[" + k + "]:" + categoryData[k]);
    }
};

categoryDetail.fixBButton = function()
{
    if ((categoryDetail.tab_index+1) >= categoryDetail.tabs.length)
        Language.fixBButton();
    else
        $("#b-button").text(this.getCategoryName() + '-' + this.getNextName());
};
//window.location = 'showList.html?name=' + ilink + '&history=' + historyPath + iname + '/';
