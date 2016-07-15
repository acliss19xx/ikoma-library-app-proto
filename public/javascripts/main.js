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
    main.append("<p><input type=\"button\" class=\"btn btn-default\" id=\"viewStyle\" value=\"表示形式\" onClick=\"\"></p>");
    main.append("<p><input type=\"button\" class=\"btn btn-default\" id=\"useFromMultiDevice\" value=\"マルチデバイスでの使用\" onClick=\"\"></p>");
    $('.hamburger.is-open').click();
};

var searchBooks = function() {
    var result = $("#result");
    result.children().remove();
    result.append("<div class=\"book-list\"></div>");
    var bookList = $(".book-list");
    bookList.append("<div class=\"book\" style=\"background-color: #ffccff;\">one</div>");
    bookList.append("<div class=\"book\" style=\"background-color: #ccffcc;\">two</div>");
    bookList.append("<div class=\"book\" style=\"background-color: #66ffff;\">three</div>");
    bookList.append("<div class=\"book\" style=\"background-color: #ffff99;\">four</div>");
    $('.book-list').slick({
	dots: true,
	speed: 100,
	slidesToShow: 1,
	slidesToScroll: 1,
	autoplay: true,
    });
};

$(function() {
    createOptions();
});
