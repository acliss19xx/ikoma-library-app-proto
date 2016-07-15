var initialize = function() {
    $("#main").append("<p><input type=\"button\" id=\"SelectLibrary\" value=\"図書館を選ぶ\" onClick=\"onSelectLibrary()\"></p>");
    $("#main").append("<p><input type=\"button\" id=\"SelectGenre\" value=\"ジャンルを選ぶ\" onClick=\"onSelectGenre()\"></p>");
    $("input").button().click(function(event) {	event.preventDefault(); });
};

var returnFromLibraries = function() {
    $("#main").children().remove();
    initialize();
    $('.hamburger.is-open').click();
};

var createLibraries = function() {
    $("#main").append("<p><input type=\"button\" id=\"return\" value=\"戻る\" onClick=\"returnFromLibraries()\"></p>");
    $("#main").append("<p><input type=\"button\" id=\"ekimae\" value=\"生駒駅前図書室\" onClick=\"\"></p>");
    $("#main").append("<p><input type=\"button\" id=\"kita\" value=\"北分館\" onClick=\"\"></p>");
    $("#main").append("<p><input type=\"button\" id=\"minami\" value=\"南分館\" onClick=\"\"></p>");
};

var onSelectLibrary = function() {
    $("#SelectLibrary").remove();
    $("#SelectGenre").remove();
    createLibraries();
    $("input").button().click(function(event) {	event.preventDefault(); });
};

var settings = function() {
    $("#main").children().remove();
    $("#main").append("<p><input type=\"button\" id=\"return\" value=\"表示形式\" onClick=\"\"></p>");
    $("#main").append("<p><input type=\"button\" id=\"return\" value=\"データの保存先\" onClick=\"\"></p>");
    $('.hamburger.is-open').click();
};

$(function() {
    initialize();
});
