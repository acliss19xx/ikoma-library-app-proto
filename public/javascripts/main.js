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
    var source = $("#create-initial-set-libraries").html();
    var template = Handlebars.compile(source);
    var html = template();
    main.append(html);
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
    var source = $("#create-initial-set-age").html();
    var template = Handlebars.compile(source);
    var html = template();
    main.append(html);
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

    var source = $("#create-search-options").html();
    var template = Handlebars.compile(source);
    var html = template();
    main.append(html);
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

    var source = $("#go-to-settings").html();
    var template = Handlebars.compile(source);
    var html = template();
    main.append(html);
    setViewStyle(localStorage.getItem('viewStyle'));
    $('.hamburger.is-open').click();
};

var goToDetail = function(obj) {
    clearChildren();
    var main = $("#main");
    var r = {};
    r.title = obj.getAttribute('alt');
    r.author = obj.getAttribute('author');
    r.isbn = obj.getAttribute('isbn');
    r.imageUrl = obj.getAttribute('src');

    var source = $("#go-to-detail").html();
    var template = Handlebars.compile(source);
    var html = template(r);
    main.append(html);
};

var ajaxRecommendationApi = function() {
    var vs = localStorage.getItem('viewStyle');
    var url = "http://" + location.hostname + "/api/recommendation";
    $("#loading").html("<img src=\"/images/loading.gif\" />");
    $.ajax({type: "GET",
            url: url,
            dataType: 'json',
            success: function(r) {
                var result = $("#result");
                result.children().remove();
                if (vs == 'ノーマル') {
                    bookList.append("<p>" + r[i].Title +"<br><div class=\"book\"><img src=\"" + r[i].MidiumImageURL + "\"></div></p>");
                } else if (vs == 'タイル') {
                    var source = $("#holizontal-list").html();
                    var template = Handlebars.compile(source);
                    var html = template(r);
                    $('#result').append(html);
                } else if (vs == 'カルーセル') {
                    bookList.append("<div class=\"book\"><img src=\"" + r[i].MidiumImageURL + "\">" + r[i].Title + "</div>");
                }

                if (localStorage.getItem('viewStyle') == 'カルーセル') {
                    $('.book-list').slick({
                        dots: true,
                        speed: 100,
                        slidesToShow: 1,
                        slidesToScroll: 1,
                        autoplay: true,
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
    var url = "http://" + location.hostname + ":3000/api/v1?" + q;
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
                    
                    if (vs == 'ノーマル') {
                      bookList.append("<p>" + obj.Items[i].title +"<br><div class=\"book\"><img src=\"" + obj.Items[i].mediumImageUrl + "\"></div></p>");
                    } else if (vs == 'タイル') {
                        var source = $("#holizontal-list").html();
                        var template = Handlebars.compile(source);
                        var html = template(r);
                        $('#result').append(html);

                    } else if (vs == 'カルーセル') {
                        bookList.append("<div class=\"book\"><img src=\"" + obj.Items[i].mediumImageUrl + "\">" + obj.Items[i].title + "</div>");
                    }
                }
                if (localStorage.getItem('viewStyle') == 'カルーセル') {
                    $('.book-list').slick({
                        dots: true,
                        speed: 100,
                        slidesToShow: 1,
                        slidesToScroll: 1,
                        autoplay: true,
                    });
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
