var Tv4 =
{
    result:[]
};

Tv4.getUrl = function(name) {
    var type = "episode"
    switch (name)
    {
    case "main":
    case "PopularClips.html":
        if (name == "PopularClips.html") {
            document.title = 'Populära Klipp'; 
            type = "clip"
        }
        return 'http://webapi.tv4play.se/play/video_assets/most_viewed?page=1&is_live=false&platform=web&per_page=100&sort_order=desc&is_premium=false&type=' + type;
        break;

    case "live":
        var startDate = getCurrentDate();
        var endDate   = getCurrentDate();
        endDate.setDate(startDate.getDate() + 4);
        return 'http://webapi.tv4play.se/play/video_assets?broadcast_from' + dateToString(startDate) + '&broadcast_to=' + dateToString(endDate) + '&is_live=true&platform=web&sort=broadcast_date_time&sort_order=asc&per_page=100'
        break;

    case "categories":
        return 'http://webapi.tv4play.se/play/categories'
        break;

    case "categoryDetail":
        return 'http://webapi.tv4play.se/play/programs?per_page=1000&page=1&is_premium=false&category='
        break;

    case "episodes":
        return 'http://webapi.tv4play.se/play/video_assets?is_live=false&page=1&per_page=250&platform=web&is_premium=false&type=episode&node_nids='
        break;

    case "Latest.html":
    case "LatestClips.html":
        if (name == "LatestClips.html") {
            document.title = 'Senaste Klipp'; 
            type = "clip"
        } else {
            document.title = 'Senaste';
        }
        var endDate = getCurrentDate();
        endDate.setDate(endDate.getDate() + 1)
        var startDate = getCurrentDate();
        startDate.setDate(startDate.getDate() - 7);
        return 'http://webapi.tv4play.se/play/video_assets?is_live=false&platform=web&is_premium=false&premium=false&sort=broadcast_date_time&sort_order=desc&per_page=100&broadcast_from=' + dateToString(startDate) + '&broadcast_to=' + dateToString(endDate) + '&type=' + type;
        break;

    case "queryShow":
        return 'http://webapi.tv4play.se/play/programs?per_page=100&platform=web&is_premium=false&q='

    case "query":
        return 'http://webapi.tv4play.se/play/video_assets?is_live=false&per_page=200&is_premium=false&platform=web&q='

    default:
        return name;
        break;
    }
};

Tv4.search = function(query, completeFun) {

    requestUrl(Tv4.getUrl("queryShow") + query,
               function(status, data)
               {
                   Tv4.decode_shows(data.responseText, query);
                   data = null;
                   if (query.length > 1)
                       requestUrl(Tv4.getUrl("query") + query,
                                  function(status, data)
                                  {
                                      Tv4.decode(data.responseText, false, completeFun);
                                      data = null;
                                      if (completeFun)
                                          completeFun();
                                  }
                                 );
                   else if (completeFun)
                       completeFun();
               }
              )
};

Tv4.getHeaderPrefix = function() {
    return "Tv4";
}

Tv4.fixAButton = function(language) {
    if ((myRefreshLocation && (myRefreshLocation.indexOf("index.html")) != -1) || myLocation.indexOf("index.html") != -1) {
        if(language == 'English'){
	    $("#a-button").text('Latest');
        } else {
	    $("#a-button").text('Senaste');
        }
    } else if((myRefreshLocation && (myRefreshLocation.indexOf("Latest.html")) != -1) || myLocation.indexOf("Latest.html") != -1) {
        if(language == 'English'){
	    $("#a-button").text('Popular Clips');
        } else {
	    $("#a-button").text('Populära Klipp');
        }
    } else if((myRefreshLocation && (myRefreshLocation.indexOf("PopularClips.html")) != -1) || myLocation.indexOf("PopularClips.html") != -1) {
        if(language == 'English'){
	    $("#a-button").text('Latest Clips');
        } else {
	    $("#a-button").text('Senaste Klipp');
        }
    } else {
        if(language == 'English'){
	    $("#a-button").text('Popular');
        } else {
	    $("#a-button").text('Populärt');
        }
    }
};

Tv4.getCButtonText = function (language) {
    if(language == 'English')
	return 'Live broadcasts';
    else
        return 'Livesändningar';
};

Tv4.decode = function(data, stripShow, completeFun) {
    try {
        var Name;
        var Duration;
        var IsLive;
        var IsLiveText;
        var running;
        var starttime;
        var Link;
        var Description;
        var ImgLink;
        var next = null;
        var AirDate;
        var Season=null;
        var Episode=null;

        Tv4.result = [];

        data = JSON.parse(data).results;

        for (var k=0; k < data.length; k++) {
            Name = data[k].title.trim();
            IsLive = data[k].is_live;
            if (data[k].is_premium || data[k].is_drm_protected || (data[k].availability.availability_group_free == "0" || !data[k].availability.availability_group_free))
                // Premium/DRM
                continue;

            starttime = (IsLive) ? Tv4.getStartTime(data[k].broadcast_date_time) : "";
            running = starttime && !starttime.match(/ /) && (tsToClock(getCurrentDate().getTime()) > starttime);
            starttime = starttime.replace(/.+ /,"");

            if (stripShow) {
                Name = Name.replace(data[k].program.name,"").replace(/^[,. :\-]*/,"").trim();
                if (data[k].season)
                    Name = "Säsong " + data[k].season + " - " + Name;
                else
                    Name = Name.replace(/^./,Name[0].toUpperCase());
            }
            ImgLink = Tv4.fixThumb(data[k].image); 
            Duration = data[k].duration;
            Description = (data[k].description) ? data[k].description.trim() : "";
            Link = "http://webapi.tv4play.se/play/video_assets?id=" +  data[k].id;
            AirDate = data[k].broadcast_date_time.replace(/T.+/,"");
	    if (Description.length > 55){
		Description = Description.substring(0, 52)+ "...";
	    }
            Season = (data[k].season) ? data[k].season : null;
            Episode = (data[k].episode) ? data[k].episode : null;
            Tv4.result.push({name:Name, 
                             season:Season,
                             episode:Episode,
                             link:Link, 
                             thumb:ImgLink, 
                             duration:Duration, 
                             description:Description,
                             airDate:AirDate,
                             link_prefix:'<a href="details.html?ilink=',
                             is_live:IsLive,
                             starttime:starttime,
                             running:running
                            }
                           );
        }
        data = null;
        
        if (stripShow) {
            Tv4.result.sort(function(a, b){
                if (a.season == b.season) {
                    if (a.episode == b.episode) {
                        if (a.airDate > b.airDate)
                            return -1
                        else
                            return 1
                    } else if (!b.episode || +a.episode > +b.episode) {
                        return -1
                    } else {
                        return 1
                    }
                } else if (!b.season || +a.season > +b.season) {
                    return -1
                } else
                    return 1
            })
        };

        for (var k=0; k < Tv4.result.length; k++) {
            if (!Tv4.result[k].link_prefix) {
                showToHtml(Tv4.result[k].name,
                           Tv4.result[k].thumb,
                           Tv4.result[k].link
                          );
            } else {
                
                toHtml({name:Tv4.result[k].name,
                        duration:Tv4.result[k].duration,
                        is_live:Tv4.result[k].is_live,
                        is_channel:false,
                        running:Tv4.result[k].running,
                        starttime:Tv4.result[k].starttime,
                        link:Tv4.result[k].link,
                        link_prefix:Tv4.result[k].link_prefix,
                        description:Tv4.result[k].description,
                        thumb:Tv4.result[k].thumb
                       });
            }
	}
        Tv4.result = [];
    } catch(err) {
        Log("Tv4.decode Exception:" + err.message + " data[" + k + "]:" + JSON.stringify(data[k]));
    }
    if (completeFun)
        completeFun();
};

Tv4.decodeCategories = function(data) {
    try {
        var Name;
	var Link;
	var ImgLink;

        data = JSON.parse(data);

        for (var k=0; k < data.length; k++) {
            Name = data[k].name;
	    Link = Tv4.getUrl("categoryDetail") + data[k].nid;
            toHtml({name:Name,
                    duration:"",
                    is_live:false,
                    is_channel:false,
                    running:null,
                    starttime:null,
                    link:Link,
                    link_prefix:'<a href="categoryDetail.html?category=',
                    description:"",
                    thumb:null
                   });
	}
	data = null;
    } catch(err) {
        Log("Tv4.decodeCategories Exception:" + err.message + " data[" + k + "]:" + JSON.stringify(data[k]));
    }
};

Tv4.decode_shows = function(data, query, completeFun) {
    try {
        var Name;
        var Link;
        var ImgLink;
        var next = null;
        var checkSeasons=false;
        var LinkPrefix = '<a href="showList.html?name='
        var json = null;
        var queryTest = (query && query.length == 1) ? new RegExp("^" + query, 'i') : null;

        Tv4.result = [];
        data = JSON.parse(data).results;
        for (var k=0; k < data.length; k++) {
            Name = data[k].name;
            if (queryTest && !queryTest.test(Name))
                continue;
            ImgLink = Tv4.fixThumb(data[k].program_image);
            Link = Tv4.getUrl("episodes") + data[k].nid
            Tv4.result.push({name:Name, link:Link, thumb:ImgLink});
        }
        data = null;

        if (!query || queryTest) {
            Tv4.result.sort(function(a, b) {
                if (a.name.toLowerCase() > b.name.toLowerCase())
                    return 1
                else
                    return -1
            });
        }

        for (var k=0; k < Tv4.result.length; k++) {
            showToHtml(Tv4.result[k].name,
                       Tv4.result[k].thumb,
                       Tv4.result[k].link,
                       LinkPrefix
                      );
        }
        Tv4.result = [];
    } catch(err) {
        Log("Tv4.decode_shows Exception:" + err.message + " data[" + k + "]:" + JSON.stringify(data[k]));
    }
    if (completeFun)
        completeFun();
};

Tv4.getDetailsData = function(url, data) {

    if (url.match(/\?nids=/))
        return Tv4.getShowData(url,data);

    var Name="";
    var Title = Name;
    var DetailsImgLink="";
    var AirDate="";
    var VideoLength = "";
    var IsLive;
    var AvailDate=null;
    var Description="";
    var onlySweden="";
    var isChannel=false;
    var NotAvailable=false;
    var startTime=0;
    try {

        data = JSON.parse(data.responseText).results[0];

        Name = data.title;
        Title = Name;
	DetailsImgLink = data.image;
        Description  = (data.description) ? data.description.trim() : "";
        AirDate = Tv4.getStartTime(data.broadcast_date_time);
        VideoLength = dataLengthToVideoLength(null, data.duration);
        Details.duration = VideoLength;
        IsLive = data.is_live;
        AvailDate = data.availability.availability_group_free + ' dagar kvar'
        if (data.expire_date_time)
        AvailDate = data.expire_date_time.replace(/T.+/,"") + ' (' + AvailDate + ')';
        if (IsLive) 
            startTime = Tv4.getStartTime(data.broadcast_date_time);
        Details.startTime = startTime;
        NotAvailable = IsLive && (startTime.match(/ /) || startTime > tsToClock(getCurrentDate().getTime()));

    } catch(err) {
        Log("Tv4.getDetailsData Exception:" + err.message);
        Log("Name:" + Name);
        Log("AirDate:" + AirDate);
        Log("AvailDate:" + AvailDate);
        Log("VideoLength:" + VideoLength);
        Log("Description:" + Description);
        Log("NotAvailable:" + NotAvailable);
        Log("DetailsImgLink:" + DetailsImgLink);
    }
    data = null;
    return {name          : Name,
            title         : Title,
            is_live       : IsLive,
            air_date      : AirDate,
            avail_date    : AvailDate,
            start_time    : startTime,
            duration      : VideoLength,
            description   : Description,
            not_available : NotAvailable,
            thumb         : DetailsImgLink
    }
};

Tv4.getShowData = function(url, data) {
    var Name="";
    var Genre = [];
    var DetailsImgLink="";
    var Description="";

    try {

        data = JSON.parse(data.responseText)[0];
        Name = data.name;
        Description = data.description.trim();
	DetailsImgLink = data.program_image;
        for (var i=0; i < data.genres.length; i++) {
            Genre.push(data.genres[i])
        }
        Genre = Genre.join('/');
    } catch(err) {
        Log("Tv4.getShowData exception:" + err.message);
        Log("Name:" + Name);
        Log("Genre:" + Genre);
        Log("Description:" + Description);
        Log("DetailsImgLink:" + DetailsImgLink);
    }
    data = null;
    return {show          : true,
            name          : Name,
            description   : Description,
            genre         : Genre,
            thumb         : DetailsImgLink
           };
    
};

Tv4.getDetailsUrl = function(streamUrl) {
    if (streamUrl.match(/&node_nids=/))
        return 'http://webapi.tv4play.se/play/programs?nids=' + streamUrl.replace(/.+&node_nids=([^&]+).*/, "$1");
    else
        return streamUrl;
};

Tv4.getPlayUrl = function(streamUrl, isLive) {

    var reqUrl;
    if (isLive)
        reqUrl = streamUrl.replace(/.*\?id=([^&]+).*/, "http://prima.tv4play.se/api/html5/asset/$1/play?protocol=hls");
    else
        reqUrl = streamUrl.replace(/.*\?id=([^&]+).*/, "http://prima.tv4play.se/api/web/asset/$1/play?protocol=hls&videoFormat=MP4+WEBVTT");
        
    requestUrl(reqUrl,
               function(status, data)
               {
                   if (Player.checkPlayUrlStillValid(streamUrl)) {
                       var stream;
                       if (isLive) 
                           stream = data.responseText.match(/(http.+\.m3u8.*hdnea[^<]*)/)[1]; 
                       else
                           stream = data.responseText.match(/(http.+\.mp4.+\.m3u8[^<]*)/)[1];
                       var srtUrl = data.responseText.match(/(http.+\.webvtt[^<]*)/);
                       srtUrl = (srtUrl && srtUrl.length > 0) ? srtUrl[1] : null;
                       Resolution.getCorrectStream(stream, false, srtUrl);
                   }
               }
              );
}

Tv4.fixThumb = function(thumb) {
    return "https://img3.tv4cdn.se/?format=jpeg&quality=40&resize=240x135&retina=true&shape=cut&source=" + thumb;
}

Tv4.fetchSubtitle = function (detailsUrl) {
    var result = syncHttpRequest(detailsUrl);
    if (result.success) { 
        subtitles = [];
        var srtdata    = result.data;
        var srtContent = Player.strip(srtdata.replace(/\r\n|\r|\n/g, '\n').replace(/(.+-->.+)$/mg,"1\n$1").replace(/.*WEBVTT.*\n+/,"").replace(/^([0-9]+:[0-9]+\.[0-9]+ -->)/mg,"00:$1").replace(/--> ([0-9]+:[0-9]+\.[0-9]+)/mg,"--> 00:$1"));
        srtContent     = srtContent.split('\n\n');
        for (var i = 0; i < srtContent.length; i++) {
            Player.parseSrtRecord(srtContent[i]);
        }
        // for (var i = 0; i < 10 && i < subtitles.length; i++) {
        //     alert("start:" + subtitles[i].start + " stop:" + subtitles[i].stop + " text:" + subtitles[i].text);
     // };
    };
};

Tv4.getStartTime = function(broadcastTime) {
    return broadcastTime.replace(/T([0-9]+:[0-9]+).+/," $1").replace(dateToString(getCurrentDate(),'-'),"").trim();
}

Tv4.requestNextPage = function(url, callback) {
    requestUrl(url,callback,callback);
}