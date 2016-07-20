var clearChildren = function() {
    var main = $("#main");
    var result = $("#result");
    main.children().remove();
    result.children().remove();
};

var createOptions = function() {
    var main = $("#main");
    main.append("<p><input type=\"button\" class=\"btn btn-default\" id=\"SelectLibrary\" value=\"図書館を選ぶ\" onClick=\"onSelectLibrary()\"></p>");
    main.append("<p><input type=\"button\" class=\"btn btn-default\" id=\"SelectGenre\" value=\"ジャンルを選ぶ\" onClick=\"onSelectGenre()\"></p>");
    main.append("<p><input type=\"button\" class=\"btn btn-default\" id=\"Search\" value=\"検索\" onClick=\"searchBooks()\"></p>");
    $("input").button().click(function(event) {	event.preventDefault(); });
};

var goToLibraries = function() {
    clearChildren();
    createOptions();
    $('.hamburger.is-open').click();
};

var createLibraries = function() {
    var main = $("#main");
    main.append("<p><input type=\"button\" class=\"btn btn-default\" id=\"goToLibraries\" value=\"戻る\" onClick=\"goToLibraries()\"></p>");
    main.append("<p><input type=\"button\" class=\"btn btn-default\" id=\"ekimae\" value=\"生駒駅前図書室\" onClick=\"\"></p>");
    main.append("<p><input type=\"button\" class=\"btn btn-default\" id=\"kita\" value=\"北分館\" onClick=\"\"></p>");
    main.append("<p><input type=\"button\" class=\"btn btn-default\" id=\"minami\" value=\"南分館\" onClick=\"\"></p>");
};

var onSelectLibrary = function() {
    clearChildren();
    $("#SelectLibrary").remove();
    $("#SelectGenre").remove();
    $("#Search").remove();
    createLibraries();
    $("input").button().click(function(event) {	event.preventDefault(); });
};

var onSelectGenre = function() {
};

var goToSettings = function() {
    clearChildren();
    var main = $("#main");
    main.append("<p><div class=\"dropdown\"><button id=\"viewStyle\" class=\"btn btn-default dropdown-toggle\" type=\"button\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"true\"></span></button><ul class=\"dropdown-menu\" aria-labelledby=\"dropdownMenu1\"><li><a href=\"#\" onClick=\"setViewStyle('タイル')\">タイル</a></li><li><a href=\"#\" onClick=\"setViewStyle('カルーセル')\">カルーセル</a></li></ul></div></p>");
    setViewStyle(localStorage.getItem('viewStyle'));
    main.append("<p><input type=\"button\" class=\"btn btn-default\" id=\"useFromMultiDevice\" value=\"マルチデバイスでの使用\" onClick=\"\"></p>");
    $('.hamburger.is-open').click();
};

var searchBooks = function() {
    var url = "https://" + location.hostname + "/api/v1?publisherName=%E3%81%93%E3%81%90%E3%81%BE%E7%A4%BE";
    $.ajax({type: "GET", url: url}).then(function(r){
	var obj = JSON.parse(r);
	var result = $("#result");
	result.children().remove();
	result.append("<div class=\"book-list\"></div>");
	var bookList = $(".book-list");

	var len = obj.Items.length;
	for (var i = 0; i < len; i++) {
	    bookList.append("<div class=\"book\"><img src=\"" + obj.Items[i].mediumImageUrl + "\">" +
			    obj.Items[i].title + "</div>");
	}
	$('.book-list').slick({
	    dots: true,
	    speed: 100,
	    slidesToShow: 1,
	    slidesToScroll: 1,
	    autoplay: true,
	});
    });
};

var setViewStyle = function(s) {
    localStorage.setItem('viewStyle', s);
    $("#viewStyle").text('表示形式:' + s);
    $("#viewStyle").append('<span class="caret">')
};

$(function() {
    var vs = localStorage.getItem('viewStyle');
    if (vs == "null") { localStorage.setItem('viewStyle', 'カルーセル'); }
    createOptions();
});
