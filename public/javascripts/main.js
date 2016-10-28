window.SpeechRecognition = window.SpeechRecognition || webkitSpeechRecognition;
var gSpeechRecognition = new webkitSpeechRecognition();

var useLibraries ={
    useLibHonkan:{name:'本館',iconName:'いこま',iconColor:'#888888'},
    useLibEkimae:{name:'駅前',iconName:'えき',iconColor:'#888888'},
    useLibKita:{name:'北館',iconName:'きた',iconColor:'#888888'},
    useLibMinami:{name:'南館',iconName:'みなみ',iconColor:'#888888'},
    useLibShika:{name:'鹿ノ台',iconName:'しか',iconColor:'#888888'}
};

var bookGeneration ={
    1:{name:'０～２歳'},
    2:{name:'３～６歳'},
    3:{name:'７～１０歳'},
    4:{name:'１１～１３歳'},
};

var clearChildren = function() {
    var main = $("#main");
    var result = $("#result");
    main.text('');
    main.children().remove();
    result.children().remove();
    result.show();
};

var createInitialSetLibraries = function() {
    clearChildren();
    var source = $("#createInitialSetLibraries").html();
    var template = Handlebars.compile(source);
    var html = template(useLibraries);
    $("#main").append(html);
};

var onSetLibraries = function() {
    var useLibHonkan = $('#useLibHonkan').is(':checked');
    var useLibEkimae = $('#useLibEkimae').is(':checked');
    var useLibKita = $('#useLibKita').is(':checked');
    var useLibMinami = $('#useLibMinami').is(':checked');
    var useLibShika = $('#useLibShika').is(':checked');
    localStorage.setItem('useLibHonkan', useLibHonkan);
    localStorage.setItem('useLibEkimae', useLibEkimae);
    localStorage.setItem('useLibKita', useLibKita);
    localStorage.setItem('useLibMinami', useLibMinami);
    localStorage.setItem('useLibShika', useLibShika);
    createInitialSetAge();
};

var createInitialSetAge = function() {
    clearChildren();
    var source = $("#createInitialSetAge").html();
    var template = Handlebars.compile(source);
    var html = template(bookGeneration);
    $("#main").append(html);
};

var onSetAge = function() {
    localStorage.setItem('age', $('input[name="age"]:checked').val());
    localStorage.setItem('initialized', 'true');
    goToGenreSelection();
};

var setOptionAge = function(age) {
    localStorage.setItem('age', age);
    var s = '';
    switch (age) {
    case '1': s = '0～2歳'; break;
    case '2': s = '3～6歳'; break;
    case '3': s = '7～10歳'; break;
    case '4': s = '11～13歳'; break;
    default: break;
    }
    $("#optionAge").text('対象年齢:' + s);
};

var setSearchOptions = function() {
    localStorage.setItem('optionTitle', $("#optionTitle")[0].value);
    localStorage.setItem('optionAuthor', $("#optionAuthor")[0].value);
    localStorage.setItem('optionPublisherName', $("#optionPublisherName")[0].value);
};

var goToGenreSelection = function() {
    clearChildren();
    var main = $("#main");
    main.append("<input type=\"button\" value=\"おすすめ\" onClick=\"onSearchRecommendation()\" style=\"width: 90px; height: 90px\">");
    main.append("<input type=\"button\" value=\"どうぶつ\" onClick=\"onSearchGenreAnimal()\" style=\"width: 90px; height: 90px\">");
    main.append("<input type=\"button\" value=\"のりもの\" onClick=\"onSearchGenreVehicle()\" style=\"width: 90px; height: 90px\"><br/>");
    main.append("<input type=\"button\" value=\"こぐま社\" onClick=\"onSearchPublisherKoguma()\" style=\"width: 90px; height: 90px\"><br/>");
    main.append("<img id=\"mic\" src=\"/images/mic.png\" onClick=\"onSearchBySpeech()\" style=\"width: 90px; height: 90px\">");
};

var goToSearch = function() {
    clearChildren();
    $('.hamburger.is-open').click();
    onSearch();
};

var returnToSearchResult = function() {
    var main = $("#main");
    var result = $("#result");
    main.text('');
    main.children().remove();
    var result = $("#result");
    result.show();
};

var createSearchOptions = function() {
    var main = $("#main");
    var isRecommendation = localStorage.getItem('optionIsRecommendation');
    var age = localStorage.getItem('age');
    var libraries = localStorage.getItem('optionLibraries');
    if (libraries == null) libraries = '本館';
    var title = localStorage.getItem('optionTitle');
    if (title == null) title = '';
    var author = localStorage.getItem('optionAuthor');
    if (author == null)  author = '';
    var publisherName = localStorage.getItem('optionPublisherName');
    if (publisherName == null) publisherName = '';
    main.append("<p><div class=\"dropdown\"><button id=\"optionIsRecommendation\" class=\"btn btn-default dropdown-toggle\" type=\"button\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"true\"></button><ul class=\"dropdown-menu\" aria-labelledby=\"dropdownMenu1\"><li>	<a href=\"#\" onClick=\"setOptionIsRecommendation('ON')\">ON</a></li><li><a href=\"#\" onClick=\"setOptionIsRecommendation('OFF')\">OFF</a></li></ul></div></p>");
    main.append("<p><div class=\"dropdown\"><button id=\"optionAge\" class=\"btn btn-default dropdown-toggle\" type=\"button\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"true\"></button><ul class=\"dropdown-menu\" aria-labelledby=\"dropdownMenu1\"><li><a href=\"#\" onClick=\"setOptionAge('1')\">0～2歳</a></li><li><a href=\"#\" onClick=\"setOptionAge('2')\">3～6歳</a></li><li><a href=\"#\" onClick=\"setOptionAge('3')\">7～10歳</a></li><li><a href=\"#\" onClick=\"setOptionAge('4')\">11～13歳</a></li></ul></div></p>");
    main.append("<p><div class=\"dropdown\"><button id=\"optionLibraries\" class=\"btn btn-default dropdown-toggle\" type=\"button\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"true\"></span></button><ul class=\"dropdown-menu\" aria-labelledby=\"dropdownMenu1\"><li><a href=\"#\" onClick=\"setOptionLibraries('本館')\">本館</a></li><li><a href=\"#\" onClick=\"setOptionLibraries('駅前')\">駅前</a></li><li><a href=\"#\" onClick=\"setOptionLibraries('北館')\">北館</a></li><li><a href=\"#\" onClick=\"setOptionLibraries('南館')\">南館</a></li><li><a href=\"#\" onClick=\"setOptionLibraries('鹿ノ台')\">鹿ノ台</a></li></ul></div></p>");
    main.append("<p><input type=\"text\" id=\"optionTitle\" class=\"form-control\" placeholder=\"書名\" value=\"" + title + "\"></p>");
    main.append("<p><input type=\"text\" id=\"optionAuthor\" class=\"form-control\" placeholder=\"著者名\" value=\"" + author + "\"></p>");
    main.append("<p><input type=\"text\" id=\"optionPublisherName\" class=\"form-control\" placeholder=\"出版社\" value=\"" + publisherName + "\"></p>");
    main.append("<p><input type=\"button\" class=\"btn btn-success\" id=\"goToSearch\" value=\"決定\" onClick=\"setSearchOptions(); goToSearch()\">");
    setOptionLibraries(libraries);
    setOptionIsRecommendation(isRecommendation);
    setOptionAge(age);
};

var onSearchOptions = function() {
    clearChildren();
    $("#BtnSearchOptions").remove();
    createSearchOptions();
    $("input").button().click(function(event) { event.preventDefault(); });
};

var goToSettings = function() {
    clearChildren();
    var main = $("#main");
    main.append("<p><input type=\"button\" class=\"btn btn-default\" id=\"BtnSearchOptions\" value=\"検索条件\" onClick=\"onSearchOptions()\"></p>");
    main.append("<p><div class=\"dropdown\"><button id=\"viewStyle\" class=\"btn btn-default dropdown-toggle\" type=\"button\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"true\"></span></button><ul class=\"dropdown-menu\" aria-labelledby=\"dropdownMenu1\"><li><a href=\"#\" onClick=\"setViewStyle('ノーマル')\">ノーマル</a></li><li><a href=\"#\" onClick=\"setViewStyle('タイル')\">タイル</a></li><li><a href=\"#\" onClick=\"setViewStyle('カルーセル')\">カルーセル</a></li></ul></div></p>");
    setViewStyle(localStorage.getItem('viewStyle'));
    main.append("<p><input type=\"button\" class=\"btn btn-default\" id=\"useFromMultiDevice\" value=\"マルチデバイスでの使用\" onClick=\"\"></p>");
    $('.hamburger.is-open').click();
};

var goToDetail = function(obj) {
    var result = $("#result");
    result.hide();
    var main = $("#main");
    var title = obj.getAttribute('alt');
    var author = obj.getAttribute('author');
    var isbn = obj.getAttribute('isbn');
    var imageUrl = obj.getAttribute('src');
    var cityLibRecommended = obj.getAttribute('CityLibRecommended');
    var cityLibComment = obj.getAttribute('CityLibComment');

    var html_string = '<div class="book_detail_before"></div>' +
                        '<div class="book_detail">' + 
                            '<table class="book_info">' + 
                                '<tr><td colspan="2"><span class="recom_comment">↓オススメ本をクリックすると図書館司書さんからの紹介文が読めます！</span></td></tr>' +
                                '<tr>' + 
                                '<td class="book_big_image" style="background-image:url(' + imageUrl + '); background-size: contain; background-repeat:no-repeat;">';
    if (cityLibRecommended == 1) {
        html_string +=              '<div id="recommend">' +
                                        '<a href="#open_recommend"><img src="/images/recommend.png" ></a>' +
                                        '<div id="modal">' +
                                            '<div id="open_recommend">' + 
                                                '<a href="#" class="close_overlay">×</a>' + 
                                                '<div class="modal_window">' +
                                                    '<h2>生駒図書館司書おすすめ</h2>' + 
                                                    '<p>' + cityLibComment  + '</p>' +
                                                    '<a href="#"><img src="/images/close.png" ></a>' + 
                                                '</div><!--/.modal_window-->'+ 
                                            '</div><!--/#open01-->'+
                                        '</div><!--/#modal-->' +
                                    '</div><!--/#recommend-->';
    }
    html_string +=              '</td>' + 
                                    '<td>' + 
                                        '<a href="#"><img src="/images/koreyomo.png"></a>' + 
                                    '</td>' + 
                                '</tr>' + 
                                '<tr>' + 
                                    '<td class="heading_td">タイトル：</td>' + 
                                    '<td colspan="2">'+ title + '</td>' + 
                                '</tr>' + 
                                '<tr>' + 
                                    '<td class="heading_td">作：</td>' + 
                                    '<td>' + author + '</td>' + 
                                '</tr>' + 
                                '<tr>' + 
                                    '<td class="heading_td">蔵書図書館：</td>' + 
                                    '<td id="target_of_calil_result">' +
                                    '</td>' + 
                                '</tr>' + 
                                '<tr>' + 
                                    '<td></td>' + 
                                    '<td>' +
                                        '<a href="#"><input type="button" value="この本を買う" onclick=""></a>' +
                                        '<div class="rakuten"><!-- Rakuten Web Services Attribution Snippet FROM HERE -->' +
                                            '<a href="http://webservice.rakuten.co.jp/" target="_blank">Supported by 楽天ウェブサービス</a>' +
                                            '<!-- Rakuten Web Services Attribution Snippet TO HERE -->' +
                                        '</div>' +
                                    '</td>' + 
                                '</tr>' +
                            '</table>' + 
                        '</div>' + 
                        '<a onClick="returnToSearchResult()"><img class="back" src="/images/back.png"></a>' +
                      '</div>';

    main.append(html_string);
    ajaxCalil(isbn);

/*

    main.append("<p><input type=\"image\" src=\"/images/back.png\" id=\"BtnReturn\" onClick=\"goToSearch()\"></p>");
    main.append("<img src=\"" + imageUrl + "\" alt=\"" + title + "\" align=\"top\">");
    main.append("<input type=\"image\" src=\"/images/koreyomo.png\" width=\"50%\" height=\"50%\">");
    main.append("<ul class=\"list-group\">");
    main.append("  <li class=\"list-group-item\">タイトル: " + title + "</li>");
    main.append("  <li class=\"list-group-item\">著者: " + author + "</li>");
    main.append("  <li class=\"list-group-item\">ISBN: " + isbn + "</li>");
    main.append("</ul>");
*/
};

var getHtmlRentaledIcons = function(info) {
    var len = info.length;
    var html = '', icon = '';
    for (var i = 0; i < len; i++) {
	if (info[i].LIB == "IKOMA_LIB_1") { icon += "icon_kita"; }
	else if (info[i].LIB == "IKOMA_LIB_2") { icon += "icon_minami"; }
	else if (info[i].LIB == "IKOMA_LIB_3") { icon += "icon_ikoma"; }
	else if (info[i].LIB == "IKOMA_LIB_4") { icon += "icon_eki"; }
	else if (info[i].LIB == "IKOMA_LIB_5") { icon += "icon_shika"; }
	else { console.log("Error: getHtmlRentaledIcons(1): " + info[i].LIB); continue; }
	switch (info[i].status) {
	case 0: icon += "_off.png"; break;
	case 1: icon += "_on.png"; break;
	case 2: icon += ".png"; break;
	default: console.log("Error: getHtmlRentaledIcons(2): " + info[i].status); break;
	}
	html += "<img src=\"/images/" + icon + "\">";
	icon = ''; // clear value
    }
    return html;
};

var getHtmlRecommended = function(rcmd) {
    return rcmd == 1 ? '<img src="/images/icon_recommend.png">' : '';
}

var ajaxRecommendationApi = function() {
    var vs = localStorage.getItem('viewStyle');
    var age = localStorage.getItem('age');
    var q = 'age=' + age;
    var url = (location.hostname == "localhost") ? "http://localhost:3000/api/recommendation?" + q : "https://" + location.hostname + "/api/recommendation?" + q;
    $("#loading").html("<img src=\"/images/loading.gif\" />");
    $.ajax({type: "GET",
            url: url,
            dataType: 'json',
            success: function(r) {
                var result = $("#result");
                result.children().remove();
                result.append('<div class="padding_box"></div>');
                result.append('<div class="inner_container"></div>');
                var inner_container = $('.inner_container');
                inner_container.append("<div class=\"book-list\"></div>");
                var bookList = $(".book-list");
                var len = r.length;

                for (var i = 0; i < len; i++) {
                    if (vs == 'ノーマル') {
                        bookList.append("<p>" + r[i].Title +"<br><div class=\"book\"><img src=\"" + r[i].MidiumImageURL + "\"></div></p>");
                    } else if (vs == 'タイル') {
                      var attr = 'src="' + r[i].MidiumImageURL + '" alt="' + r[i].Title + '"';
                      attr += ' author="' + r[i].Author + '" isbn="' + r[i].Isbn + '"';
                      attr += ' CityLibRecommended="' + r[i].CityLibRecommended + '"';
                      attr += ' CityLibComment="' + r[i].CityLibComment + '"';
                      var html_string ='<a ' + attr + ' onClick="goToDetail(this)">' + 
                                        '<div class="bookbox">' +
                                            '<div style="height:125px;">' +
                                                '<img src="' + r[i].MidiumImageURL +'" height="120px">' +
                                            '</div>' +
                                            '<div class="book_title">' + r[i].Title + '</div>' +
                                            '<div class="lib_icon">' +
			                        getHtmlRentaledIcons(r[i].CityLibRentaledInfo) + 
                                                getHtmlRecommended(r[i].CityLibRecommended) +
                                            '</div>' +
                                        '</div>' +
                                    '</a>';

                      bookList.append(html_string);

                    } else if (vs == 'カルーセル') {

    var html_string = '<div><div class="book_detail_before"></div>' +
                        '<div class="book_detail">' + 
                            '<table class="book_info">' + 
                                '<tr><td colspan="2"><span class="recom_comment">↓オススメ本をクリックすると図書館司書さんからの紹介文が読めます！</span></td></tr>' +
                                '<tr>' + 
                                    '<td class="book_big_image" style="background-image:url(' + r[i].MidiumImageURL + '); background-size: contain; background-repeat:no-repeat;">' + 
                                    '</td>' + 
                                    '<td>' + 
                                        '<a href="#"><img src="/images/koreyomo.png"></a>' + 
                                    '</td>' + 
                                '</tr>' + 
                                '<tr>' + 
                                    '<td class="heading_td">タイトル：</td>' + 
                                    '<td colspan="2">'+ r[i].Title + '</td>' + 
                                '</tr>' + 
                                '<tr>' + 
                                    '<td class="heading_td">作：</td>' + 
                                    '<td>' + r[i].Author + '</td>' + 
                                '</tr>' + 
                                '<tr>' + 
                                    '<td class="heading_td">蔵書図書館：</td>' + 
                                    '<td>' + 
                                            '<div class="lib_icon">' +
                                                '<img src="/images/icon_eki.png"><img src="/images/icon_ikoma.png">' +
                                                '<img src="/images/icon_kita.png"><img src="/images/icon_minami.png">' +
                                                '<img src="/images/icon_shika.png"><img src="/images/icon_recommend.png">' +
                                            '</div>' +
                                    '</td>' + 
                                '</tr>' + 
                                '<tr>' + 
                                    '<td></td>' + 
                                    '<td>' +
                                        '<a href="#"><input type="button" value="この本を買う" onclick=""></a>' +
                                        '<div class="rakuten"><!-- Rakuten Web Services Attribution Snippet FROM HERE -->' +
                                            '<a href="http://webservice.rakuten.co.jp/" target="_blank">Supported by 楽天ウェブサービス</a>' +
                                            '<!-- Rakuten Web Services Attribution Snippet TO HERE -->' +
                                        '</div>' +
                                    '</td>' + 
                                '</tr>' +
                            '</table>' + 
                       '</div>' + 
                      '</div></div>';

                      bookList.append(html_string);
                    }
                }

                if (localStorage.getItem('viewStyle') == 'カルーセル') {
                    $('.book-list').slick({
                        dots: true,
                        speed: 100,
                        slidesToShow: 1,
                        slidesToScroll: 1,
                        autoplay: false,
                    });
                }
            },
            error: function(r) {
                alert("APIの呼び出しが失敗しました: " + url);
            },
            complete: function(r) {
                $("#loading").empty();
            }
           });
};

var ajaxSearchApi = function() {
    var vs = localStorage.getItem('viewStyle');
    var q = '';
    var title = localStorage.getItem('optionTitle');
    var author = localStorage.getItem('optionAuthor');
    var publisherName = localStorage.getItem('optionPublisherName');
    if (title != "") q += 'title=' + title;
    if (author != "") {
        if (q.length > 6) q += '&';
        q += 'author=' + author;
    }
    if (publisherName != "") {
        if (q.length > 12) q += '&';
        q += '&publisherName=' + publisherName;
    }
    var url = (location.hostname == "localhost") ? "http://localhost:3000/api/v1?" + q : "https://" + location.hostname + "/api/v1?" + q;
    $("#loading").html("<img src=\"/images/loading.gif\" />");
    $.ajax({type: "GET",
            url: url,
            success: function(r) {
                if (r == 'none') {
                    alert('一致する書籍はありませんでした');
                } else {
                    var obj = JSON.parse(r);
                    var result = $("#result");
                    result.children().remove();
                    result.append('<div class="book-list"></div>');
                    var bookList = $(".book-list");
                    var len = obj.Items.length;
                    for (var i = 0; i < len; i++) {
                        if (vs == 'ノーマル') {
                          bookList.append("<p>" + obj.Items[i].title +"<br><div class=\"book\"><img src=\"" + obj.Items[i].mediumImageUrl + "\"></div></p>");
                        } else if (vs == 'タイル') {
                          var attr = 'src="' + obj.Items[i].mediumImageUrl + '" alt="' + obj.Items[i].title + '"';
                          attr += 'author="' + obj.Items[i].author + '" isbn="' + obj.Items[i].isbn + '"';
                          var html_string ='<a ' + attr + ' onClick="goToDetail(this)">' + 
                                            '<div class="bookbox">' +
                                                '<div style="height:125px;">' +
                                                    '<img src="' + obj.Items[i].mediumImageUrl +'" height="120px">' +
                                                '</div>' +
                                                '<div class="book_title">' + obj.Items[i].title + '</div>' +
                                                '<div class="lib_icon">' +
                                                '</div>' +
                                            '</div>' +
                                        '</a>';
    
                      bookList.append(html_string);
                        } else if (vs == 'カルーセル') {
    var html_string = '<div><div class="book_detail_before"></div>' +
                        '<div class="book_detail">' + 
                            '<table class="book_info">' + 
                                '<tr><td colspan="2"><span class="recom_comment">↓オススメ本をクリックすると図書館司書さんからの紹介文が読めます！</span></td></tr>' +
                                '<tr>' + 
                                    '<td class="book_big_image" style="background-image:url(' + obj.Items[i].mediumImageUrl + '); background-size: contain; background-repeat:no-repeat;">' + 
                                    '</td>' + 
                                    '<td>' + 
                                        '<a href="#"><img src="/images/koreyomo.png"></a>' + 
                                    '</td>' + 
                                '</tr>' + 
                                '<tr>' + 
                                    '<td class="heading_td">タイトル：</td>' + 
                                    '<td colspan="2">'+ obj.Items[i].title + '</td>' + 
                                '</tr>' + 
                                '<tr>' + 
                                    '<td class="heading_td">作：</td>' + 
                                    '<td>' + obj.Items[i].author + '</td>' + 
                                '</tr>' + 
                                '<tr>' + 
                                    '<td class="heading_td">蔵書図書館：</td>' + 
                                    '<td>' + 
                                            '<div class="lib_icon">' +
                                            '</div>' +
                                    '</td>' + 
                                '</tr>' + 
                                '<tr>' + 
                                    '<td></td>' + 
                                    '<td>' +
                                        '<a href="#"><input type="button" value="この本を買う" onclick=""></a>' +
                                        '<div class="rakuten"><!-- Rakuten Web Services Attribution Snippet FROM HERE -->' +
                                            '<a href="http://webservice.rakuten.co.jp/" target="_blank">Supported by 楽天ウェブサービス</a>' +
                                            '<!-- Rakuten Web Services Attribution Snippet TO HERE -->' +
                                        '</div>' +
                                    '</td>' + 
                                '</tr>' +
                            '</table>' + 
                        '</div>' + 
                      '</div></div>';
    
                          bookList.append(html_string);
                        }
                    }
                    if (localStorage.getItem('viewStyle') == 'カルーセル') {
                        $('.book-list').slick({
                            dots: true,
                            speed: 100,
                            slidesToShow: 1,
                            slidesToScroll: 1,
                            autoplay: false,
                        });
                    }
                }
            },
            error: function(r) {
                alert("APIの呼び出しが失敗しました: " + url);
            },
            complete: function() {
                $("#loading").empty();
            }
           });
};

gCurrentISBN = 0;
gSession = 0;

var ajaxCalil = function(isbn) {
    gCurrentISBN = isbn;
    var target = $("#target_of_calil_result");
    target.children().remove();
    target.append("<img id=\"calling_calil\" src=\"/images/calling_calil.gif\">");
    var url = "https://api.calil.jp/check?";
    if (gSession != 0) url += "session=" + gSession + "&";
    url += "callback=no&appkey=3494d30088f8133e67f0092098fe9aa7&systemid=Nara_Ikoma&format=json&isbn=" + gCurrentISBN;
    $.ajax({type: "GET",
	    url: url,
	    dataType: 'json',
            success: function(r) {
                if (r.continue == 0) {
		    var a = Object.keys(r.books);
		    if (a.length == 1) {
			var ikoma = r.books[a[0]].Nara_Ikoma;
			var status = ikoma.status;
			var reserveurl = ikoma.reserveurl;
			var libkey = ikoma.libkey;
			if (status == "OK" || status == "Cache") {
			    target.children().remove();
			    if (libkey["北分館"] == "貸出可") {	target.append("<img src=\"/images/icon_kita.png\">") }
			    if (libkey["南分館"] == "貸出可") { target.append("<img src=\"/images/icon_minami.png\">") }
			    if (libkey["生駒市図書館（本館）"] == "貸出可") { target.append("<img src=\"/images/icon_ikoma.png\">") }
			    if (libkey["生駒駅前図書室"] == "貸出可") { target.append("<img src=\"/images/icon_eki.png\">") }
			    if (libkey["鹿ノ台ふれあいホール"] == "貸出可") { target.append("<img src=\"/images/icon_shika.png\">") }
			    gSession = 0;
			}
		    }
		} else if (r.continue == 1) {
		    gSession = r.session;
		    setTimeout(ajaxCalil, 2100);
		}
	    },
            error: function(r) {
		console.log("カーリルAPIの呼び出しが失敗しました: ");
	    },
            complete: function(r) {
	    }
	   });
};


var onSearch = function() {
    var isRecommendation = localStorage.getItem('optionIsRecommendation');
    if (isRecommendation == 'ON') {
        ajaxRecommendationApi();
    } else {
        ajaxSearchApi();
    }
};

var onSearchBySpeech = function() {
    $('#mic').attr({disabled: true});
    gSpeechRecognition.start();
};

var onSearchRecommendation = function() {
    clearChildren();
    localStorage.setItem('optionIsRecommendation', 'ON');
    ajaxRecommendationApi();
};

var onSearchTitle = function(genre) {
    clearChildren();
    localStorage.setItem('optionIsRecommendation', 'OFF');
    localStorage.setItem('optionTitle', genre);
    localStorage.setItem('optionAuthor', '');
    localStorage.setItem('optionPublisherName', '');
    ajaxSearchApi();
};

var onSearchGenreAnimal = function() {
    onSearchTitle('どうぶつ');
};

var onSearchGenreVehicle = function() {
    onSearchTitle('のりもの');
};

var onSearchPublisherKoguma = function() {
    clearChildren();
    localStorage.setItem('optionIsRecommendation', 'OFF');
    localStorage.setItem('optionTitle', '');
    localStorage.setItem('optionAuthor', '');
    localStorage.setItem('optionPublisherName', 'こぐま社');
    ajaxSearchApi();
};

var setViewStyle = function(s) {
    localStorage.setItem('viewStyle', s);
    $("#viewStyle").text('表示形式:' + s);
    $("#viewStyle").append('<span class="caret">')
};

var setOptionIsRecommendation = function(s) {
    localStorage.setItem('optionIsRecommendation', s);
    if (s == 'ON') {
	$("#optionLibraries").attr({disabled: 'disabled'});
	$("#optionTitle").attr({disabled: 'disabled'});
	$("#optionAuthor").attr({disabled: 'disabled'});
	$("#optionPublisherName").attr({disabled: 'disabled'});
    } else {
	$("#optionLibraries").removeAttr('disabled');
	$("#optionTitle").removeAttr('disabled');
	$("#optionAuthor").removeAttr('disabled');
	$("#optionPublisherName").removeAttr('disabled');
    }
    $("#optionIsRecommendation").text('おすすめ:' + s);
    $("#optionIsRecommendation").append('<span class="caret">')
};

var setOptionLibraries = function(s) {
    localStorage.setItem('optionLibraries', s);
    $("#optionLibraries").text('借りる図書館:' + s);
    $("#optionLibraries").append('<span class="caret">')
};

$(function() {
    gSpeechRecognition.lang = 'ja';
    gSpeechRecognition.onresult = function(event){
	var text = event.results.item(0).item(0).transcript;
	onSearchTitle(text);
    };
    //gSpeechRecognition.onaudiostart = function(event){ console.log("onaudiostart"); };
    //gSpeechRecognition.onsoundend = function(event){ console.log("onsoundend"); };
    //gSpeechRecognition.onaudioend = function(event){ console.log("onaudioend"); };
    //gSpeechRecognition.onnomatch = function(event){ console.log("onnomatch"); };
    gSpeechRecognition.onend = function(event){
	$('#mic').attr({disabled: false});
    };

    var isRecommendation = localStorage.getItem('optionIsRecommendation');
    if (isRecommendation == null) { localStorage.setItem('optionIsRecommendation', 'ON'); }
    var vs = localStorage.getItem('viewStyle');
    if (vs == null) { localStorage.setItem('viewStyle', 'タイル'); }
    var publisherName = localStorage.getItem('optionPublisherName');
    if (publisherName == null) { localStorage.setItem('optionPublisherName', 'こぐま社'); }
    var initialized = localStorage.getItem('initialized');
    if (initialized == null) {
	createInitialSetLibraries();
    } else {
	goToGenreSelection();
    }
});
