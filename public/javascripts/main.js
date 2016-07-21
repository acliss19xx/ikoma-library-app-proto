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

var goToSearch = function() {
    clearChildren();
    createSearch();
    $('.hamburger.is-open').click();
};

var createSearchOptions = function() {
    var main = $("#main");
    main.append("<p><input type=\"button\" class=\"btn btn-default\" id=\"goToSearch\" value=\"戻る\" onClick=\"goToSearch()\">");
    main.append("<p><div class=\"dropdown\"><button id=\"optionLibraries\" class=\"btn btn-default dropdown-toggle\" type=\"button\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"true\"></span></button><ul class=\"dropdown-menu\" aria-labelledby=\"dropdownMenu1\"><li><a href=\"#\" onClick=\"setOptionLibraries('本館')\">本館</a></li><li><a href=\"#\" onClick=\"setOptionLibraries('駅前')\">駅前</a></li><li><a href=\"#\" onClick=\"setOptionLibraries('北館')\">北館</a></li><li><a href=\"#\" onClick=\"setOptionLibraries('南館')\">南館</a></li><li><a href=\"#\" onClick=\"setOptionLibraries('鹿ノ台')\">鹿ノ台</a></li></ul></div></p>");
    setOptionLibraries(localStorage.getItem('optionLibraries'));
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
    var url = "http://" + location.hostname + ":3000/api/v1?publisherName=%E3%81%93%E3%81%90%E3%81%BE%E7%A4%BE";
    $.ajax({type: "GET", url: url}).then(function(r){
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
    if (vs == "null") { localStorage.setItem('viewStyle', 'カルーセル'); }
    createSearch();
});
