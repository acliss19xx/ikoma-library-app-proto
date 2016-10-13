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
var SchoolRecomend = require('./SchoolRecomend.js');


////// テスト用
//document.write( "<script type='text/javascript' src='./sync_test/log1.js'></script>" );
//document.write( "<script type='text/javascript' src='./sync_test/log2.js'></script>" );
//////
               
//var DEBUG=1;
global.DEBUG=1;
global.NOT_NODEJS = 1;
var BOOK_LIST_NUM =  30;    //１画面に取得/表示する本の数

global.IKOMA_LIB_NONE = "無し";
global.IKOMA_LIB_1 = "北分館";
global.IKOMA_LIB_2 = "南分館";
global.IKOMA_LIB_3 = "生駒市図書館（本館）";
global.IKOMA_LIB_4 = "生駒駅前図書室";
global.IKOMA_LIB_5 = "鹿ノ台ふれあいホール";
//global.IKOMA_LIB_6 = "奈良先端科学技術大学院大学";   //普通の人は借りれないので利用しない。カーリルで取得は可能

global.LIB_STATUS_NOTHING = 0;         //図書館無
global.LIB_STATUS_ENABLE_LEND = 1;     //図書館貸出可能
global.LIB_STATUS_ENABLE_RESEARVE = 2; //図書館在庫無。予約可能
    

global.MAX_SCHOOL_NUM = 128;   //最大学校数
global.IKOMA_SCHOOL_DEFAULT = 0;

//school 1～15 は小学校  http://www.city.ikoma.lg.jp/0000000859.html
global.IKOMA_SCHOOL_1 = 1;
global.IKOMA_SCHOOL_2 = 2;

//school 16～30 は中学校 http://www.city.ikoma.lg.jp/0000000859.html

//school 31～50 は幼稚園 http://www.city.ikoma.lg.jp/0000004137.html

//school 51～80 は保育園 http://www.city.ikoma.lg.jp/0000001265.html
global.IKOMA_SCHOOL_HOIKUEN_SAHO = 51;   //"鹿ノ台佐保保育園";
global.IKOMA_SCHOOL = 51;   //"鹿ノ台佐保保育園";

var POINT_HIGH = 3;
var POINT_MID = 2;
var POINT_LOW = 1;

global.session_retry_counter=0;

//設定オブジェクト
var SettingDB = function( ){
    this.libplace = "生駒市図書館（本館）|鹿ノ台ふれあいホール";   // 複数ある場合は"|"で繋ぐ。 北分館 / 南分館 / 生駒市図書館（本館）/ 生駒駅前図書室 / 鹿ノ台ふれあいホール / 奈良先端科学技術大学院大学
    this.age = 1;   // 1 = ０～２歳
                    // 2 = ３歳～小学生
                    // 3 = 小１～小３
                    // 4 = 小４～小６
                    // 5 = 中１～中３
    //重み付けポイント　1～3
    this.weight_rakuten = POINT_LOW;
    this.weight_is_nearest_lib = POINT_HIGH;         //最寄りの図書館で今すぐ借りれる
    this.weight_canlend_nearest_lib = POINT_LOW;    //最寄りの図書館で予約可能    
    this.weight_is_ikoma_lib = POINT_LOW;           //市図書館に本有
    this.weight_is_recommended = POINT_HIGH;         //市図書館司書お薦め
    
}


global.Setting = new SettingDB();
//Setting.weight_is_nearest_lib = 2;

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
    this.CityLibRentaledInfo = new Array();       //最寄りの図書館情報 {LIB:●●図書館, status:1} などのarray形式で格納( 1=貸出可能、2=貸出中、0=蔵書無　)
    //this.IsCityLibRentaledNum = 0;
    //this.IsCityLibRentaled1 = 0;     //最寄りの図書館1在庫有無( 1=貸出可能、2=貸出中、0=蔵書無　)
    //this.IsCityLibRentaled2 = 0;     //最寄りの図書館2在庫有無( 1=貸出可能、2=貸出中、0=蔵書無　)
    //this.IsCityLibRentaled3 = 0;     //最寄りの図書館3在庫有無( 1=貸出可能、2=貸出中、0=蔵書無　)
    this.CityLibRentalURL = "";     //図書館予約ページへのURL
    
    this.CityLibRecommended = 0;    //図書館司書お薦め=1, NOT=0
    this.CityLibComment = "";       //図書館司書コメント
    this.CityLibCategory = "";      //図書館カテゴリ
    
    this.CitySchoolRecommended = new Array();   //お薦め学校一覧　IKOMA_SCHOOL_1などの定数のarray
    
    this.weight = 3;                //優先度ポイント（大きい方が優先度高い）
    this.Calil_retry_cnt = 0;
}


/* Deferred/then形式を使うにはなぜかグローバル変数にしないとダメなのでget_booklist()の外に出してみる */
//ToDo★★★★★★もうちょっとうまいオブジェクト型配列作り方ない？　＞大川さん猪上さん
//var booklist = new Array();
global.booklist = new Array();


var m;
var nearLib, nearLibNum=0;
if(Setting.libplace.length != 0){
    nearLib = Setting.libplace.split("|");
    nearLibNum = nearLib.length;    //最寄り図書館数
}

console.log("nearLibNum=" + nearLibNum);
 
/*
for(var i = 0; i < BOOK_LIST_NUM; i++){  //[ToDO]途中で本の数増やせない★★課題
    booklist[i] = new BookInfo();
    
    for(m=0; m<nearLibNum; m++){
        booklist[i].CityLibRentaledInfo[m] = {
            LIB: "IKOMA_LIB_NONE",
            status: 0
        };
    }
    
    for(m=0; m< MAX_SCHOOL_NUM; m++){
        booklist[i].CitySchoolRecommended[m] = IKOMA_SCHOOL_DEFAULT;
    }
}
*/

function init_booklist(){
    
    //テーブル初期化
    if( booklist.length != 0 ){
        while( booklist.length > 0 ){
            booklist.pop();
        }
    }
    
    for(var i = 0; i < BOOK_LIST_NUM; i++){  //[ToDO]途中で本の数増やせない★★課題
        booklist[i] = new BookInfo();

        for(m=0; m<nearLibNum; m++){
            booklist[i].CityLibRentaledInfo[m] = {
                LIB: "IKOMA_LIB_NONE",
                status: 0
            };
        }

        for(m=0; m< MAX_SCHOOL_NUM; m++){
            booklist[i].CitySchoolRecommended[m] = IKOMA_SCHOOL_DEFAULT;
        }
    }
    
}

//本セッション固有の設定データ
var sessionSetting = function( ){
    this.page = 1;  //表示ページ番号指定（1～30)
    
    this.searchkeyword = "";     //キーワード検索。指定された文字列で連想検索
    //this.searchkeyword = "title=いないいないばあ";
    //this.searchkeyword = "クリスマス";
    //this.searchkeyword = "title=いないいないばあ&author=吉岡靖晃&publisherName=講談社";
    //this.searchkeyword = "いないいないばあ";
    // もし書名/著者/出版社指定検索ならば下記フォーマットで呼び元で指定してください。
    // 1つの場合　title=●●
    // 複数の場合 title=●●&author=●●&publisherName=●●
    
    this.historykeyword="";    //履歴キーワード検索（履歴を加味した本とそれ以外の本もおススメします）
}
     
global.SelectBooks = new sessionSetting();


//////////////////////////////////////////////////////////////////////
// 優先度に従った本リストを提供する
// 
// 戻り値：BookInfoオブジェクトのリスト（最大BOOK_LIST_NUM件分）
//////////////////////////////////////////////////////////////////////
module.exports.get_booklist = function(res){
//function get_booklist( Setting, page ){	//node.jsの時にはコメントアウト(上記を有効化)
    
	console.log("start get_booklist");
    init_booklist();
/*
    var a = ["12-3", "12+3", "12;", "12 3", "-12", "+123", " 123"];
    //var b = parseInt(a, 10);
    
    for(var i=0; i< a.length; i++){
    var b = /[^0-9|^-]/.test(a[i]);       //false=数字以外が無い
    
    
    console.log(b);
    }
    return;
  */  
    /* ★★★カーリルTEST ★★★ */
    //CalilServerConnection.get_bookinfo_about_lib();
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
        //　学校お薦めデータチェック（ローカルチェックなので同期型）
        ///////////////////////////////////
        SchoolRecomend.judge_school_recomended();

        ///////////////////////////////////
        //　不正ISBNの本はbooklistから削除(常に30冊返るわけでは無くなる)
        ///////////////////////////////////
        delete_invalid_booklist(booklist);
        
        ///////////////////////////////////
        //　本毎に重み付けを考慮して優先度ポイント計算
        ///////////////////////////////////
        calc_allbooks_priority_point( booklist, Setting );


        ///////////////////////////////////
        //　本毎の優先度ポイントを元にソート
        ///////////////////////////////////
        sort_booklist( booklist );
        
        console.log("=====================================");
        debug_print_console_log();
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
// 不正ISBNの本をリストから削除
//////////////////////////////////////////////////////////////////////
function delete_invalid_booklist( booklist ){
    
    var i;
    
    var max_num = booklist.length;
    var counter=0;
    
    //不正isbnの本を削除
    for(i=0; i<max_num; i++){
        
        if(( booklist[counter].Isbn == "" ) | (booklist[counter].Isbn == "0000000000" )){
            booklist.splice( counter, 1 );
            //booklist[i] = void 0;   //undefinedを代入。要素の数は変わらない
        }
        else    counter++;
    }
    
}

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



//////////////////////////////////////////////////////////////////////
// 1冊の本のポイント計算
//////////////////////////////////////////////////////////////////////
function calc_book_priority_point( bookinfo, weight_setting ){
    
    var point = 0;
    
    
    // 最寄りの図書館にあるか否か？（複数図書館対応）
    var CityLibRentaledStatus = check_CityLibRentaledStatus(bookinfo.CityLibRentaledInfo);
    
    if( CityLibRentaledStatus == LIB_STATUS_ENABLE_LEND ){       //今すぐ借りることが可能   
        point += weight_setting.weight_is_nearest_lib;
    }else if( CityLibRentaledStatus == LIB_STATUS_ENABLE_RESEARVE ){ //予約すれば最寄りの図書館で借りることが可能
        point += weight_setting.weight_canlend_nearest_lib;
    }
    
    
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

//////////////////////////////////////////////////////////////////////
// 複数図書館の状況から今すぐ借りれるか否かチェック
// return: 1=貸出可能、2=貸出中、0=蔵書無
//////////////////////////////////////////////////////////////////////
function check_CityLibRentaledStatus( rentaledInfo ){
    
    var i, better_status=0;
    for(i=0; i<rentaledInfo.length; i++){
        if( rentaledInfo[i].status == LIB_STATUS_ENABLE_LEND){
            better_status = rentaledInfo[i].status;
            return(better_status);  //今すぐ貸出可能があれば即リターン（以降チェックする必要性無）
        }
        else if( rentaledInfo[i].status == LIB_STATUS_ENABLE_RESEARVE){
            better_status = rentaledInfo[i].status;
        }
    }
    return(better_status);
}

//////////////////////////////////////////////////////////////////////
// 本情報ログ出し for debug
//////////////////////////////////////////////////////////////////////
function debug_print_console_log( ){
    var i=j=k=0;
    
    console.log("booklist num = " + booklist.length);
    
    for(j=0; j< booklist.length; j++){
        console.log("=====" + j + "番目出力=====");
        console.log("ISBN = " + booklist[j].Isbn);
        console.log("Title = " + booklist[j].Title);
        console.log("Author = " + booklist[j].Author);
        console.log("publisherName = " + booklist[j].publisherName);
        console.log("IMAGE_URL(M) = " + booklist[j].MidiumImageURL);
        console.log("RAKUTEN_URL = " + booklist[j].rakutenURL);
        console.log("IsCityLib = " + booklist[j].IsCityLib);
        //console.log("IsCityLibRentaledNum = " + booklist[j].IsCityLibRentaledNum);
        //console.log("IsCityLibRentaled1 = " + booklist[j].IsCityLibRentaled1);
        //console.log("IsCityLibRentaled2 = " + booklist[j].IsCityLibRentaled2);
        
        for(k=0; k<booklist[j].CityLibRentaledInfo.length; k++){
            console.log("nearLibstatus[" + j + "]: " 
                        + booklist[j].CityLibRentaledInfo[k].LIB + "=" + booklist[j].CityLibRentaledInfo[k].status);
        }
        console.log("CityLibRentalURL = " + booklist[j].CityLibRentalURL);
        console.log("CityLibRecommended = " + booklist[j].CityLibRecommended);
        console.log("CityLibComment = " + booklist[j].CityLibComment);
        console.log("CityLibCategory = " + booklist[j].CityLibCategory);
        
        for(k=0; k<booklist[j].CitySchoolRecommended.length; k++){
            console.log("SchoolRecommended図書館No= " + booklist[j].CitySchoolRecommended[k]);
        }
        
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
        //console.log("IsCityLibRentaledNum = " + booklist[j].IsCityLibRentaledNum);
        //console.log("IsCityLibRentaled1 = " + booklist[j].IsCityLibRentaled1);
        //console.log("IsCityLibRentaled2 = " + booklist[j].IsCityLibRentaled2);
        for(k=0; k<booklist[j].CityLibRentaledInfo.length; k++){
            console.log("nearLibstatus[" + j + "]: " 
                        + booklist[j].CityLibRentaledInfo[k].LIB + "=" + booklist[j].CityLibRentaledInfo[k].status);
        }
        console.log("CityLibRentalURL = " + booklist[j].CityLibRentalURL);
        console.log("CityLibRecommended = " + booklist[j].CityLibRecommended);
        console.log("CityLibComment = " + booklist[j].CityLibComment);
        console.log("CityLibCategory = " + booklist[j].CityLibCategory);
        
        for(k=0; k<booklist[j].CitySchoolRecommended.length; k++){
            console.log("SchoolRecommended図書館No= " + booklist[j].CitySchoolRecommended[k]);
        }
        console.log("weight = " + booklist[j].weight);
        console.log("Calil_retry_cnt = " + booklist[j].Calil_retry_cnt);
        
        j += booklist.length -1;
    }
    */
    
    console.log("session_retry_counter = " + session_retry_counter );
    
}
