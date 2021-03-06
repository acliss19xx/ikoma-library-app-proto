//////////////////////////////////////////////////////////////////////
// 表示する本リストを取得する（ユーザー毎に異なる）
//////////////////////////////////////////////////////////////////////

//<script src="http://code.jquery.com/jquery-2.2.4.js" 
//integrity="sha256-iT6Q9iMJYuQiMWNd9lDyBUStIq/8PuOW33aOqmvFpqI=" crossorigin="anonymous"></script>

//http://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js

//他のjsをimport  ★この方法正しい？？？  http://komitsudo.blog70.fc2.com/blog-entry-42.html
//document.write( "<script type='text/javascript' src='http://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js'></script>" );

//document.write( "<script type='text/javascript' src='http://underscorejs.org/underscore-min.js'></script>" );

//document.write( "<script type='text/javascript' src='RakutenServerConnection.js'></script>" );
//document.write( "<script type='text/javascript' src='CalilServerConnection.js'></script>" );
//document.write( "<script type='text/javascript' src='LibRecomend.js'></script>" );

var https = require('https');
var util = require('util');
var $ = require('jquery-deferred');
//var $ = require('jquery');
var RakutenServerConnection = require('./RakutenServerConnection.js');
var CalilServerConnection = require('./CalilServerConnection.js');
var LibRecomend = require('./LibRecomend.js');


////// テスト用
//document.write( "<script type='text/javascript' src='./sync_test/log1.js'></script>" );
//document.write( "<script type='text/javascript' src='./sync_test/log2.js'></script>" );
//////
               
//var DEBUG=1;
global.DEBUG=1;
global.NOT_NODEJS = 1;
var BOOK_LIST_NUM =  30;    //１画面に取得/表示する本の数


//設定オブジェクト
var SettingDB = function( ){
    this.libplace = "生駒駅前図書室";   // 複数ある場合は"|"で繋ぐ。 北分館 / 南分館 / 生駒市図書館（本館）/ 生駒駅前図書室 / 鹿ノ台ふれあいホール / 奈良先端科学技術大学院大学
    this.age = 1;   // 1 = ０～２歳
                    // 2 = ３歳～小学生
                    // 3 = 小１～小３
                    // 4 = 小４～小６
                    // 5 = 中１～中３
    //重み付け　1～3
    this.weight_rakuten = 3;
    this.weight_is_nearest_lib = 3;
    this.weight_is_ikoma_lib = 3;
    this.weight_is_recommended = 3;
    
}


//本オブジェクト   http://www.ituore.com/entry/javascript-basic#データ構造
var BookInfo = function( ){
    this.Isbn = "0000000000";
    this.Title = "初期値";             //書名
    this.Author = "初期値";            //著者名
    this.publisherName = "初期値";     //出版社名
    this.MidiumImageURL = "http:";
    this.SmallImageURL = "http";

    this.rakutenURL = "";           //楽天ページへのURL

    this.IsCityLib = 0;             //市図書館に該当本が有るか否か( 1=有、0=無　)
    // 北分館/南分館/生駒市図書館（本館）/生駒駅前図書室/鹿ノ台ふれあいホール/奈良先端科学技術大学院大学
    this.IsCityLibRentaledNum = 0;
    this.IsCityLibRentaled1 = 0;     //最寄りの図書館1在庫有無( 1=貸出可能、2=貸出中、0=蔵書無　)
    this.IsCityLibRentaled2 = 0;     //最寄りの図書館2在庫有無( 1=貸出可能、2=貸出中、0=蔵書無　)
    this.IsCityLibRentaled3 = 0;     //最寄りの図書館3在庫有無( 1=貸出可能、2=貸出中、0=蔵書無　)
    this.CityLibRentalURL = "";     //図書館予約ページへのURL
    
    this.CityLibRecommended = 0;    //図書館司書お薦め=1, NOT=0
    this.CityLibComment = "";       //図書館司書コメント
    this.CityLibCategory = "";      //図書館カテゴリ
    
    this.weight = 3;                //優先度ポイント（大きい方が優先度高い）
    this.Calil_retry_cnt = 0;
}


/* Deferred/then形式を使うにはなぜかグローバル変数にしないとダメなのでget_booklist()の外に出してみる */
//ToDo★★★★★★もうちょっとうまいオブジェクト型配列作り方ない？　＞大川さん猪上さん
//var booklist = new Array();
global.booklist = new Array();
    
for(var i = 0; i < BOOK_LIST_NUM; i++)
    booklist[i] = new BookInfo();

global.Setting = new SettingDB();
//var Setting = new SettingDB();
Setting.weight_is_nearest_lib = 2;

//////////////////////////////////////////////////////////////////////
// 優先度に従った本リストを提供する
// 
// 戻り値：BookInfoオブジェクトのリスト（最大BOOK_LIST_NUM件分）
//////////////////////////////////////////////////////////////////////
module.exports.get_booklist = function(res){
//function get_booklist( Setting, page ){	//node.jsの時にはコメントアウト(上記を有効化)
    
	console.log("start get_booklist");

    /* ★★★カーリルTEST ★★★ */
    //get_bookinfo_about_lib();
    //return;
    /* ★★★カーリルTEST ★★★ */
    
    /* ★★★ソートTEST ★★★ */
    /*
    booklist[0].Title = "aa";
    booklist[0].weight = 10;
    booklist[1].Title = "bb";
    booklist[1].weight = 11;
    booklist[2].Title = "cc";
    booklist[2].weight = 9;
    */
    /*
    sort_booklist( booklist );
    return;
    */
    
    /* ★★★ソートTEST ★★★ */
    /*
    calc_allbooks_priority_point( booklist, Setting );
    sort_booklist( booklist );
    return;
    */
    
    //ToDo★★★★★★もうちょっとうまいオブジェクト型配列作り方ない？　＞大川さん猪上さん
    /*
    var booklist = new Array();
    
    for(i = 0; i < BOOK_LIST_NUM; i++)
    booklist[i] = new BookInfo();
    */
    
    
    
///////////////////////TEST data set(ここから)
//    booklist[0].Title = "へのへの";
//    booklist[0].Isbn = "4834000370";
//    booklist[1].Title = "へへ";
//    booklist[1].Isbn = "4834000370";
///////////////////////TEST data set(ここまで)  
    
    
    ///////////////////////////////////
    // 各APIを使ってデータを取得
    ///////////////////////////////////

    /////////////////TEST(ここから) ///////////////////
    
    /* ★★★模範サンプル★★★★ */
    /*
    showLog1()
    .then(showLog2)
    .then(showLog1)
    .then(showLog2);
    */
    
    /* 実験ようやく成功！！！！！！！！！！！！
    showLog1()
    .then(get_rakuten_ranking_list2)    //なんと！引数があるとダメ！
    .then(showLog2)
    .then(showLog1)
    .then(showLog2);
    
    return;
    */
    
    /* NG
    get_rakuten_ranking_list( booklist, Setting )
    .then(get_rakuten_ranking_list( booklist, Setting ))    //引数があるとダメ！
    .then(showLog1)
    .then(showLog2)
    .then(showLog1)
    .then(showLog2);
    */
    
    /////////////////TEST(ここまで) ///////////////////
    
    /* OK
    get_rakuten_ranking_list()  // 本の売れ筋ランキングを取得(楽天API)
    .then(judge_lib_recomended_1st)
    .then(judge_lib_recomended_from_cache)
    .done(debug_print_console_log);
    
    return;
    */
    
    ///////////////////////////////////
    //　本の売れ筋ランキングを取得(楽天API)
    ///////////////////////////////////
    //get_rakuten_ranking_list()
	RakutenServerConnection.get_rakuten_ranking_list()
    
    ///////////////////////////////////
    //　生駒市図書館司書お薦めデータチェック（初回）
    ///////////////////////////////////
    .then(LibRecomend.judge_lib_recomended_1st)
    
    ///////////////////////////////////
    //　生駒市図書館司書お薦めデータチェック（2回目以降）
    ///////////////////////////////////
    .then(LibRecomend.judge_lib_recomended_from_cache)
    
    ///////////////////////////////////
    //　最寄り図書館有無
    ///////////////////////////////////
    .then(CalilServerConnection.get_bookinfo_about_lib)
    
    ///////////////////////////////////
    //　データが全て揃った
    ///////////////////////////////////
    .done(function(){

        ///////////////////////////////////
        //　本毎に重み付けを考慮して優先度ポイント計算
        ///////////////////////////////////
        calc_allbooks_priority_point( booklist, Setting );


        ///////////////////////////////////
        //　本毎の優先度ポイントを元にソート
        ///////////////////////////////////
        sort_booklist( booklist );
        
        console.log("=====================================");
        //debug_print_console_log();
        console.log("=====================================");
        console.log("Finish!!!!");
        
	res.json(booklist);

        //クライアントへjsonデータを渡す  
        // この方法でも良いかも？　→ http://www.walbrix.com/jp/blog/2013-08-jquery-json-post.html
        
        // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★
        // TO大川さん、
        // この部分を書き換えてjsonデータをクライアント側へ流してもらえますか？
        //（動作確認できてないです。herokuにあげてないのでNo 'Access-Control-Allow-Origin' header問題が解決できませんでした。。。)
        // http://d.hatena.ne.jp/satosystems/20140108/1389173683
        //http://shogorobe.hatenablog.com/
        
        /* このコメントアウト外す（ここから）
        var express = require("express");       
        router = express.Router();

        router.get("/", function(req, res){         //url変更要
            res.contentType("application/json");
            res.end(JSON.stringfy(booklist));       //booklistオブジェクトをjson形式にして送信！

        }); このコメントアウト外す（ここまで）*/
        }
    );
    
    
    return;
    
    
    /*
    // 本の売れ筋ランキングを取得(楽天API)
    get_rakuten_ranking_list( booklist, Setting );

    for( i = 0; i < booklist.length; i++){
        // 本１件分情報から最寄りの図書館有無や市内図書館有無など取得(カーリルAPI)
        get_bookinfo_about_lib( booklist[i], Setting );

        // 図書館おススメ本か否か？(生駒市オープンデータを元に)
        judge_lib_recomended( booklist[i], Setting );

        // その他　情報をここに追加（９月以降を想定）
    
    }
    */

    

    
    // ソートした本リストを提供
    //return booklist;

};
//}	//node.jsの時にはコメントアウト(上記を有効化)



//////////////////////////////////////////////////////////////////////
// 本毎に重み付けを考慮して優先度ポイント計算
//////////////////////////////////////////////////////////////////////
function calc_allbooks_priority_point( booklist, Setting ){
    if(DEBUG=1)
        console.log("calc_book_priority_point call");
    
    
    for(var i=0; i<booklist.length; i++){
        booklist[i].weight = calc_book_priority_point( booklist[i], Setting );
    }
    
}

//一冊の本のポイント計算
function calc_book_priority_point( bookinfo, weight_setting ){
    
    var point = 0;
    
    
    // 最寄りの図書館にあるか否か？
    point = bookinfo.IsCityLibRentaled1 * weight_setting.weight_is_nearest_lib;
    
    //市図書館にあるか否か？
    point += bookinfo.IsCityLib * weight_setting.weight_is_ikoma_lib;
    
    //司書お薦めか否か？
    point += bookinfo.CityLibRecommended * weight_setting.weight_is_recommended;
    
    //★★★★★評価すべきものが増えればここに追加★★★★★
    
    return( point );
}

//////////////////////////////////////////////////////////////////////
// 本毎の優先度ポイントを元にソート
//////////////////////////////////////////////////////////////////////
function sort_booklist( sort_list ){
    if(DEBUG=1)
        console.log("sort_booklist call");
    
    
    var i;
    
    /*
    if(DEBUG){
        for(i=0; i< 3; i++){
            console.log("[SORT]booklist[" + i + "] = " + sort_list[i].weight 
                        + "Title=" + sort_list[i].Title);
        }
    }
    */
    
    
    //weightを元に並べ替え
    sort_list.sort(
        function(a,b){
            var aWeight = a["weight"];
            var bWeight = b["weight"];
            if( aWeight < bWeight ) return 1;
            if( aWeight > bWeight ) return -1;
            return 0;
        }
    );
    
    /*
    if(DEBUG){
        for(i=0; i< 3; i++){
            console.log("[SORT]booklist[" + i + "] = " + sort_list[i].weight 
                        + "Title=" + sort_list[i].Title);
        }
    }
    */
    
}




// debug用
function debug_print_console_log( ){
    var i=j=0;
    
    
    for(j=0; j< booklist.length; j++){
        console.log("=====" + j + "番目出力=====");
        console.log("ISBN = " + booklist[j].Isbn);
        console.log("Title = " + booklist[j].Title);
        console.log("Author = " + booklist[j].Author);
        console.log("publisherName = " + booklist[j].publisherName);
        console.log("IMAGE_URL(M) = " + booklist[j].MidiumImageURL);
        console.log("RAKUTEN_URL = " + booklist[j].rakutenURL);
        console.log("IsCityLib = " + booklist[j].IsCityLib);
        console.log("IsCityLibRentaledNum = " + booklist[j].IsCityLibRentaledNum);
        console.log("IsCityLibRentaled1 = " + booklist[j].IsCityLibRentaled1);
        console.log("IsCityLibRentaled2 = " + booklist[j].IsCityLibRentaled2);
        console.log("CityLibRecommended = " + booklist[j].CityLibRecommended);
        console.log("CityLibComment = " + booklist[j].CityLibComment);
        console.log("CityLibCategory = " + booklist[j].CityLibCategory);
        console.log("weight = " + booklist[j].weight);
        console.log("Calil_retry_cnt = " + booklist[j].Calil_retry_cnt);
    }
    
    
    
    
    /*
    for(i = 0; i< 2; i++){
        console.log("=====" + j + "番目出力=====");
        console.log("ISBN = " + booklist[j].Isbn);
        console.log("Title = " + booklist[j].Title);
        console.log("Author = " + booklist[j].Author);
        console.log("publisherName = " + booklist[j].publisherName);
        console.log("IMAGE_URL(M) = " + booklist[j].MidiumImageURL);
        console.log("RAKUTEN_URL = " + booklist[j].rakutenURL);
        console.log("IsCityLib = " + booklist[j].IsCityLib);
        console.log("IsCityLibRentaledNum = " + booklist[j].IsCityLibRentaledNum);
        console.log("IsCityLibRentaled1 = " + booklist[j].IsCityLibRentaled1);
        console.log("IsCityLibRentaled2 = " + booklist[j].IsCityLibRentaled2);
        console.log("CityLibRecommended = " + booklist[j].CityLibRecommended);
        console.log("CityLibComment = " + booklist[j].CityLibComment);
        console.log("CityLibCategory = " + booklist[j].CityLibCategory);
        console.log("weight = " + booklist[j].weight);
        console.log("Calil_retry_cnt = " + booklist[j].Calil_retry_cnt);
        
        j += booklist.length -1;
    }
    */
    
    
}
