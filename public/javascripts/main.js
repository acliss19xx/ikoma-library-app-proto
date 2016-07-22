var clearChildren = function() {
    var main = $("#main");
    var result = $("#result");
    main.children().remove();
    result.children().remove();
};

var createSearch = function() {
    var main = $("#main");
    main.append("<p><input type=\"button\" class=\"btn btn-default\" id=\"SearchOptions\" value=\"検索条件\" onClick=\"onSearchOptions()\"></p>");
    main.append("<p><input type=\"button\" class=\"btn btn-default\" id=\"Search\" value=\"検索\" onClick=\"onSearch()\"></p>");
    $("input").button().click(function(event) {	event.preventDefault(); });
};

var setSearchOptions = function() {
    localStorage.setItem('optionTitle', $("#optionTitle")[0].value);
    localStorage.setItem('optionAuthor', $("#optionAuthor")[0].value);
    localStorage.setItem('optionPublisherName', $("#optionPublisherName")[0].value);
};

var goToSearch = function() {
    clearChildren();
    createSearch();
    $('.hamburger.is-open').click();
};

var createSearchOptions = function() {
    var main = $("#main");
    var libraries = localStorage.getItem('optionLibraries');
    if (libraries == null) libraries = '本館';
    var title = localStorage.getItem('optionTitle');
    if (title == null) title = '';
    var author = localStorage.getItem('optionAuthor');
    if (author == null)  author = '';
    var publisherName = localStorage.getItem('optionPublisherName');
    if (publisherName == null) publisherName = '';
    main.append("<p><input type=\"button\" class=\"btn btn-default\" id=\"goToSearch\" value=\"戻る\" onClick=\"setSearchOptions(); goToSearch()\">");
    main.append("<p><div class=\"dropdown\"><button id=\"optionLibraries\" class=\"btn btn-default dropdown-toggle\" type=\"button\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"true\"></span></button><ul class=\"dropdown-menu\" aria-labelledby=\"dropdownMenu1\"><li><a href=\"#\" onClick=\"setOptionLibraries('本館')\">本館</a></li><li><a href=\"#\" onClick=\"setOptionLibraries('駅前')\">駅前</a></li><li><a href=\"#\" onClick=\"setOptionLibraries('北館')\">北館</a></li><li><a href=\"#\" onClick=\"setOptionLibraries('南館')\">南館</a></li><li><a href=\"#\" onClick=\"setOptionLibraries('鹿ノ台')\">鹿ノ台</a></li></ul></div></p>");
    main.append("<p><input type=\"text\" id=\"optionTitle\" class=\"form-control\" placeholder=\"書名\" value=\"" + title + "\"></p>");
    main.append("<p><input type=\"text\" id=\"optionAuthor\" class=\"form-control\" placeholder=\"著者名\" value=\"" + author + "\"></p>");
    main.append("<p><input type=\"text\" id=\"optionPublisherName\" class=\"form-control\" placeholder=\"出版社\" value=\"" + publisherName + "\"></p>");
    setOptionLibraries(libraries);
};

var onSearchOptions = function() {
    clearChildren();
    $("#SearchOptions").remove();
    $("#Search").remove();
    createSearchOptions();
    $("input").button().click(function(event) {	event.preventDefault(); });
};

var goToSettings = function() {
    clearChildren();
    var main = $("#main");
    main.append("<p><div class=\"dropdown\"><button id=\"viewStyle\" class=\"btn btn-default dropdown-toggle\" type=\"button\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"true\"></span></button><ul class=\"dropdown-menu\" aria-labelledby=\"dropdownMenu1\"><li><a href=\"#\" onClick=\"setViewStyle('ノーマル')\">ノーマル</a></li><li><a href=\"#\" onClick=\"setViewStyle('タイル')\">タイル</a></li><li><a href=\"#\" onClick=\"setViewStyle('カルーセル')\">カルーセル</a></li></ul></div></p>");
    setViewStyle(localStorage.getItem('viewStyle'));
    main.append("<p><input type=\"button\" class=\"btn btn-default\" id=\"useFromMultiDevice\" value=\"マルチデバイスでの使用\" onClick=\"\"></p>");
    $('.hamburger.is-open').click();
};

var onSearch = function() {
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
    $.ajax({type: "GET", url: url}).then(function(r){
	console.log(r);
	if (r == 'none') {
	    alert('一致する書籍はありませんでした');
	} else {
	    var obj = JSON.parse(r);
	    var result = $("#result");
	    result.children().remove();
	    result.append("<div class=\"book-list\"></div>");
	    var bookList = $(".book-list");
	    var len = obj.Items.length;
	    for (var i = 0; i < len; i++) {
		if (vs == 'ノーマル') {
		bookList.append("<p>" + obj.Items[i].title +"<br><div class=\"book\"><img src=\"" + obj.Items[i].mediumImageUrl + "\"></div></p>");
		} else if (vs == 'タイル') {
		    bookList.append("<img src=\"" + obj.Items[i].mediumImageUrl + "\">");
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
	}
    });
};

var setViewStyle = function(s) {
    localStorage.setItem('viewStyle', s);
    $("#viewStyle").text('表示形式:' + s);
    $("#viewStyle").append('<span class="caret">')
};

var setOptionLibraries = function(s) {
    localStorage.setItem('optionLibraries', s);
    $("#optionLibraries").text('借りる図書館:' + s);
    $("#optionLibraries").append('<span class="caret">')
};

$(function() {
    var vs = localStorage.getItem('viewStyle');
    if (vs == null) { localStorage.setItem('viewStyle', 'タイル'); }
    createSearch();
});
