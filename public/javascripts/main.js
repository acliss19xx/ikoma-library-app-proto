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
    var url = "https://app.rakuten.co.jp/services/api/BooksBook/Search/20130522?" + 
	"applicationId=XXXX&publisherName=%E3%81%93%E3%81%90%E3%81%BE%E7%A4%BE";
    $.ajax({type: "GET", url: url}).then(function(r){
	console.log(r);

	var result = $("#result");
	result.children().remove();
	result.append("<div class=\"book-list\"></div>");
	var bookList = $(".book-list");

	var len = r.Items.length;
	for (var i = 0; i < len; i++) {
	    bookList.append("<div class=\"book\" style=\"background-color: white;\"><img src=\"" + r.Items[i].Item.mediumImageUrl + "\">" +
			    r.Items[i].Item.title + "</div>");
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

$(function() {
    createOptions();
});
