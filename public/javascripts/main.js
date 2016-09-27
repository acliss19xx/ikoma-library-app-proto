var clearChildren = function() {
    var main = $("#main");
    var result = $("#result");
    main.text('');
    main.children().remove();
    result.children().remove();
};

var createInitialSetLibraries = function() {
    var main = $("#main");
    clearChildren();
    main.append("<p><div class=\"alert alert-info\" role=\"alert\">よく使う図書館は？</div>");
    main.append("<div class=\"checkbox\"><label><input type=\"checkbox\" id=\"useLibHonkan\">本館</label></div>");
    main.append("<div class=\"checkbox\"><label><input type=\"checkbox\" id=\"useLibEkimae\">駅前</label></div>");
    main.append("<div class=\"checkbox\"><label><input type=\"checkbox\" id=\"useLibKita\">北館</label></div>");
    main.append("<div class=\"checkbox\"><label><input type=\"checkbox\" id=\"useLibMinami\">南館</label></div>");
    main.append("<div class=\"checkbox\"><label><input type=\"checkbox\" id=\"useLibShika\">鹿ノ台</label></div>");
    main.append("</p>");
    main.append("<button type=\"button\" class=\"btn btn-success\" onClick=\"onSetLibraries()\">次へ</button>");
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
    var main = $("#main");
    clearChildren();
    main.append("<p><div class=\"alert alert-info\" role=\"alert\">対象年齢は？</div>");
    main.append("<div class=\"btn-group-vertical\" role=\"group\" aria-label=\"age\">");
    main.append("<input type=\"radio\" name=\"age\" id=\"age_0-2\" checked>0～2歳</br>");
    main.append("<input type=\"radio\" name=\"age\" id=\"age_3-6\">3～6歳</br>");
    main.append("<input type=\"radio\" name=\"age\" id=\"age_7-10\">7～10歳</br>");
    main.append("<input type=\"radio\" name=\"age\" id=\"age_11-13\">11～13歳</br>");
    main.append("</div></p>");
    main.append("<button type=\"button\" class=\"btn btn-warning\" onClick=\"createInitialSetLibraries()\">戻る</button>");
    main.append("<button type=\"button\" class=\"btn btn-success\" onClick=\"onSetAge()\">次へ</button>");
};

var onSetAge = function() {
    var age_0_2 = $('#age_0-2').attr('checked');
    var age_3_6 = $('#age_3-6').attr('checked');
    var age_7_10 = $('#age_7-10').attr('checked');
    var age_11_13 = $('#age_11-13').attr('checked');
    if (age_0_2 == 'checked') { localStorage.setItem('age', '0-2'); }
    if (age_3_6 == 'checked') { localStorage.setItem('age', '3-6'); }
    if (age_7_10 == 'checked') { localStorage.setItem('age', '7-10'); }
    if (age_11_13 == 'checked') { localStorage.setItem('age', '11-13'); }
    localStorage.setItem('initialized', 'true');
    goToSearch();    
};

var setSearchOptions = function() {
    localStorage.setItem('optionTitle', $("#optionTitle")[0].value);
    localStorage.setItem('optionAuthor', $("#optionAuthor")[0].value);
    localStorage.setItem('optionPublisherName', $("#optionPublisherName")[0].value);
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
    var libraries = localStorage.getItem('optionLibraries');
    if (libraries == null) libraries = '本館';
    var title = localStorage.getItem('optionTitle');
    if (title == null) title = '';
    var author = localStorage.getItem('optionAuthor');
    if (author == null)  author = '';
    var publisherName = localStorage.getItem('optionPublisherName');
    if (publisherName == null) publisherName = '';
    main.append("<p><div class=\"dropdown\"><button id=\"optionIsRecommendation\" class=\"btn btn-default dropdown-toggle\" type=\"button\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"true\"></button><ul class=\"dropdown-menu\" aria-labelledby=\"dropdownMenu1\"><li>	<a href=\"#\" onClick=\"setOptionIsRecommendation('ON')\">ON</a></li><li><a href=\"#\" onClick=\"setOptionIsRecommendation('OFF')\">OFF</a></li></ul></div></p>");
    main.append("<p><div class=\"dropdown\"><button id=\"optionLibraries\" class=\"btn btn-default dropdown-toggle\" type=\"button\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"true\"></span></button><ul class=\"dropdown-menu\" aria-labelledby=\"dropdownMenu1\"><li><a href=\"#\" onClick=\"setOptionLibraries('本館')\">本館</a></li><li><a href=\"#\" onClick=\"setOptionLibraries('駅前')\">駅前</a></li><li><a href=\"#\" onClick=\"setOptionLibraries('北館')\">北館</a></li><li><a href=\"#\" onClick=\"setOptionLibraries('南館')\">南館</a></li><li><a href=\"#\" onClick=\"setOptionLibraries('鹿ノ台')\">鹿ノ台</a></li></ul></div></p>");
    main.append("<p><input type=\"text\" id=\"optionTitle\" class=\"form-control\" placeholder=\"書名\" value=\"" + title + "\"></p>");
    main.append("<p><input type=\"text\" id=\"optionAuthor\" class=\"form-control\" placeholder=\"著者名\" value=\"" + author + "\"></p>");
    main.append("<p><input type=\"text\" id=\"optionPublisherName\" class=\"form-control\" placeholder=\"出版社\" value=\"" + publisherName + "\"></p>");
    main.append("<p><input type=\"button\" class=\"btn btn-success\" id=\"goToSearch\" value=\"決定\" onClick=\"setSearchOptions(); goToSearch()\">");
    setOptionLibraries(libraries);
    setOptionIsRecommendation(isRecommendation);
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

    var html_string = '<div class="book_detail_before"></div>' +
                        '<div class="book_detail">' + 
                            '<table class="book_info">' + 
                                '<tr><td colspan="2"><span class="recom_comment">↓オススメ本をクリックすると図書館司書さんからの紹介文が読めます！</span></td></tr>' +
                                '<tr>' + 
                                    '<td class="book_big_image" style="background-image:url(' + imageUrl + '); background-size: contain; background-repeat:no-repeat;">' + 
                                    '<div id="recommend">' +
                                        '<a href="#open_recommend"><img src="/images/recommend.png" ></a>' +
                                        '<div id="modal">' +
                                            '<div id="open_recommend">' + 
                                                '<a href="#" class="close_overlay">×</a>' + 
                                                '<div class="modal_window">' +
                                                    '<h2>生駒図書館司書おすすめ</h2>' + 
                                                    '<p>「せんせいやお母さんは、本をいっぱいよみなさいっていうけど・・・」いこまにすんでいる小学校２年生のよみちゃん。夏休みにはいってからもう１週間もたつのに、まだよみたい本が見つかりません。おうちの近くの図書かんに行ってもたくさん本がならんでいるのを見ると、どれにしようかまよってしまいます。さてさて、よみちゃんのよみたい本はいったいどこにかくれているのでしょうか・・・？本を読みたい気持ちはいっぱいあるのに、なかなか本を決められなくて困っているよみちゃんが、すてきな本に出会うおはなしです。</p>' +
                                                    '<a href="#"><img src="/images/close.png" ></a>' + 
                                                '</div><!--/.modal_window-->'+ 
                                            '</div><!--/#open01-->'+
                                        '</div><!--/#modal-->' +
                                    '</div><!--/#recommend-->' +
                                    '</td>' + 
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
                                    '<td>' + 
                                        '<img src="/images/icon_eki_on.png"><img src="/images/icon_ikoma_on.png">' + 
                                        '<img src="/images/icon_kita_off.png">' + 
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

var ajaxRecommendationApi = function() {
    var vs = localStorage.getItem('viewStyle');
    var url = "https://" + location.hostname + "/api/recommendation";
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
                      attr += 'author="' + r[i].Author + '" isbn="' + r[i].Isbn + '"';
                      var html_string ='<a ' + attr + ' onClick="goToDetail(this)">' + 
                                        '<div class="bookbox">' +
                                            '<div style="height:125px;">' +
                                                '<img src="' + r[i].MidiumImageURL +'" height="120px">' +
                                            '</div>' +
                                            '<div class="book_title">' + r[i].Title + '</div>' +
                                            '<div class="lib_icon">' +
                                                '<img src="/images/icon_eki.png"><img src="/images/icon_ikoma.png">' +
                                                '<img src="/images/icon_kita.png"><img src="/images/icon_minami.png">' +
                                                '<img src="/images/icon_shika.png"><img src="/images/icon_recommend.png">' +
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
    var url = "https://" + location.hostname + "/api/v1?" + q;
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
                          var attr = 'src="' + r[i].MidiumImageURL + '" alt="' + r[i].Title + '"';
                          attr += 'author="' + r[i].Author + '" isbn="' + r[i].Isbn + '"';
                          var html_string ='<a ' + attr + ' onClick="goToDetail(this)">' + 
                                            '<div class="bookbox">' +
                                                '<div style="height:125px;">' +
                                                    '<img src="' + r[i].MidiumImageURL +'" height="120px">' +
                                                '</div>' +
                                                '<div class="book_title">' + r[i].Title + '</div>' +
                                                '<div class="lib_icon">' +
                                                    '<img src="/images/icon_eki.png"><img src="/images/icon_ikoma.png">' +
                                                    '<img src="/images/icon_kita.png"><img src="/images/icon_minami.png">' +
                                                    '<img src="/images/icon_shika.png"><img src="/images/icon_recommend.png">' +
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

var onSearch = function() {
    var isRecommendation = localStorage.getItem('optionIsRecommendation');
    if (isRecommendation == 'ON') {
        ajaxRecommendationApi();
    } else {
        ajaxSearchApi();
    }
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
	goToSearch();
    }
});
