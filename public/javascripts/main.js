var clearChildren = function() {
    var main = $("#main");
    var result = $("#result");
    main.text('');
    main.children().remove();
    result.children().remove();
};

var createInitialSetLibraries = function() {
    clearChildren();
    var source = $("#createInitialSetLibraries").html();
    var template = Handlebars.compile(source);
    $("#main").append(template);
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
    $("#main").append(template);
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
    var value = {
        title: title,
        author: author,
        publisherName: publisherName,
    }
    var source = $("#createSearchOptions").html();
    var template = Handlebars.compile(source);
    var html = template(value);
    $("#main").append(html);

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
    var source = $("#goToSettings").html();
    var template = Handlebars.compile(source);
    $("#main").append(template);
    setViewStyle(localStorage.getItem('viewStyle'));
    $('.hamburger.is-open').click();
};

var goToDetail = function(obj) {
    var result = $("#result");
    result.hide();
    var value = {
        title : obj.getAttribute('alt'),
        author : obj.getAttribute('author'),
        isbn : obj.getAttribute('isbn'),
        imageUrl : obj.getAttribute('src'),
    }
    var source = $("#book-detail").html();
    var template = Handlebars.compile(source);
    var html = template(value);
    $("#main").append(html);

};

var ajaxRecommendationApi = function() {
    var vs = localStorage.getItem('viewStyle');
    var url = "https://" + location.hostname + "/api/recommendation";
    $("#loading").html('<img src="/images/loading.gif" />');
    $.ajax({type: "GET",
            url: url,
            dataType: 'json',
            success: function(r) {
                $("#result").children().remove();
                $("#result").append('<div class="padding_box"></div><div class="inner_container"><div class="book-list"></div></div>');
                var bookList = $(".book-list");

                if (vs == 'ノーマル') {
                    var source = $("#book-list-normal").html();
                    
                } else if (vs == 'タイル') {
                    var source = $("#book-list-horizontal-scroll").html();
                } else if (vs == 'カルーセル') {
                    var source = $("#book-list-carousel").html();
                } else{
                    var source = $("#book-list-horizontal-scroll").html();
                }
                var template = Handlebars.compile(source);
                var html = template(r);
                $(".book-list").append(html);

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
                          var attr = 'src="' + obj.Items[i].mediumImageUrl + '" alt="' + obj.Items[i].title + '"';
                          attr += 'author="' + obj.Items[i].author + '" isbn="' + obj.Items[i].isbn + '"';
                          var html_string ='<a ' + attr + ' onClick="goToDetail(this)">' + 
                                            '<div class="bookbox">' +
                                                '<div style="height:125px;">' +
                                                    '<img src="' + obj.Items[i].mediumImageUrl +'" height="120px">' +
                                                '</div>' +
                                                '<div class="book_title">' + obj.Items[i].title + '</div>' +
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
