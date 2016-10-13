//////////////////////////////////////////////////////////////////////
// 図書館お薦め本か否か？ (生駒市オープンデータをDKAN APIで取得)
//////////////////////////////////////////////////////////////////////

var http = require('http');
var $ = require('jquery-deferred');
var _ = require('underscore');

// 生駒市オープンデータ　図書館司書お薦め本取得URL。
// DKANを用いてcode for 生駒が提供。
// ２つのテーブルをマージして取得しています。
//　・rawテーブル　→　生駒市図書館司書お薦め生データ(ISBN無)
//　・isbnsテーブル　→本のタイトルとISBNを対にしただけのデータ　
var LIB_RECOMENDED_DOMAIN = "data.code4ikoma.org";
//var LIB_RECOMENDED_URL = "/api/action/datastore/search.jsonp?resource_id[raw]=06d81c6f-4ac0-4877-a249-652d12f7ca1d&resource_id[isbns]=103d51c3-4b36-4ac7-b78e-66246bda85e7&join[raw]=Title1&join[isbns]=Title1";

var LIB_RECOMENDED_URL1 = "/api/action/datastore/search.jsonp?";
var LIB_RECOMENDED_URL2 = "&join[raw]=Title1&join[isbns]=Title1";
var LIB_RECOMENDED_URL3 = "&filters[Age]=";
var LIB_RECOMENDED_URL4 = "&offset=";

var DKAN_RESOURCE_ID1 = "resource_id[raw]=2fdb3a28-733d-4d22-a0a3-4df1345d2236";     //[ToDo]他データ利用の場合は変更ください
var DKAN_RESOURCE_ID2 = "&resource_id[isbns]=dd4d9007-4bda-4826-9e06-9ab89b1f76ad";     //[ToDo]他データ利用の場合は変更ください



var FILTER_AGE_BABY = "赤ちゃん";
var FILTER_AGE_KINDERGARTEN = "３さいから";
var FILTER_AGE_LOW_ELEMENTARY = "小学校１～３年生";
var FILTER_AGE_HIGH_ELEMENTARY = "小学校４～６年生";
var FILTER_AGE_JUNIOR_HIGH = "中学生";

var previous_search_age=0;    //前回検索年齢（同一年齢ならばキャッシュから取得。異年齢ならばAPIから取得)

var CashedRecomBook = function( ){
    this.isbn10 = "0000000000";
    this.title = "";             //書名
    this.author = "";            //著者名
    this.publisherName = "";     //出版社名
    this.libcomment = "";        //司書コメント
    this.libcategory = "";       //図書館カテゴリ
}
var CashedBooks = new Array();

var dfd_librecom = new $.Deferred;
var dfd_flag =0;

var libRecom_retry_counter=0;       //NWアクセスリトライ回数
var MAX_LIB_RECOM_NW_ACCESS_COUNT = 3;        //本の数により変更ください（現在の生駒市オープンデータの場合は100*3=MAX300冊)
var SESSION_LIMIT_NUM = 100;       //1回のセッションで取得本の数

var FLAG_1st_CALL = 0;
var FLAG_RETRY = 1;

////////////////////////////////////////////////////////
// 本１冊情報を与えて、図書館司書お薦め本か否かをBookInfoの中にセットする
// 図書館司書お薦め本ならば図書館司書コメントなどもセットする(外部提供API)
////////////////////////////////////////////////////////
// １冊目はNWから取得するかキャッシュから取得するかcheck(外部提供API)
module.exports.judge_lib_recomended_1st = function(){
//function judge_lib_recomended_1st( ){
    //judge_lib_recomended_with_arg( booklist[0], Setting );
    lib_recomended_set_cache( Setting );
    
    if( dfd_flag == 0 )
        return dfd_librecom.promise();
    
//}
};

////////////////////////////////////////////////////////
// キャッシュから取得(外部提供API)
////////////////////////////////////////////////////////
module.exports.judge_lib_recomended_from_cache = function(){
//function judge_lib_recomended_from_cache( ){
    var i;
    
    if(DEBUG)   console.log("judge_lib_recomended_from_cache called");;
    for (i = 0; i<booklist.length; i++)
        //return( judge_lib_recomended_with_arg( booklist[i], Setting ));
        //judge_lib_recomended_with_arg( booklist[i], Setting );
        lib_recomended_get_cache( booklist[i], Setting );
    
    dfd_librecom.resolve();
    dfd_flag = 1;
    
//}
};


////////////////////////////////////////////////////////
// データ取得してキャッシュへ格納(内部関数)
////////////////////////////////////////////////////////
function lib_recomended_set_cache( Setting ){
    
    /*
    if(DEBUG){
        console.log("judge_lib_recomended call");
        console.log("Setting.age = "+Setting.age);
        console.log("previous_search_age =" +previous_search_age);
    }*/

    
    //var dfd_librecom = new $.Deferred;
    
    
    if( Setting.age == previous_search_age ){
        
        //キャッシュに既にあるので何もしない
        console.log("Already cached. Let's get from cache.");
        
        //前回と同様検索条件(年齢層)ならばキャッシュから取得
        //get_LibRecommended_from_cashe( BookInfo );
        
        
        //dfd_librecom.resolve();
        //dfd_flag = 1;
        
    }
    else{
        // webAPIから取得
        
        //var dfd_librecom;
        get_LibRecommended_server_data( Setting.age, FLAG_1st_CALL );
        //get_LibRecommended_server_data( Setting.age, dfd_librecom, retry_flag );
    }

    //if( dfd_flag == 0 )
    //    return dfd_librecom.promise();
        
}



////////////////////////////////////////////////////////
// キャッシュからデータ取得(内部関数)
////////////////////////////////////////////////////////
function lib_recomended_get_cache( BookInfo, Setting ){
    
    if( Setting.age == previous_search_age ){
        
        //前回と同様検索条件(年齢層)ならばキャッシュから取得
        get_LibRecommended_from_cashe( BookInfo );
        
        
        //dfd_librecom.resolve();
        //dfd_flag = 1;
        
    }else{
        console.log("lib_recomended_get_cache: ERROR");
        console.log("Setting.age = "+Setting.age+" previous_search_age =" +previous_search_age);

    }

        
}



////////////////////////////////////////////////////////
// オリジナル(使用しない)　　これを上記lib_recomended_set_cache()とlib_recomended_get_cache()に分割
////////////////////////////////////////////////////////
function judge_lib_recomended_with_arg( BookInfo, Setting ){
    
    if(DEBUG=1){
        console.log("judge_lib_recomended call");
        console.log("Setting.age = "+Setting.age);
        console.log("previous_search_age =" +previous_search_age);
        console.log("来ないはず");
    }

    
    //var dfd_librecom = new $.Deferred;
    
    
    /*
    if( flag ){
        //
    } */
    
    if( Setting.age == previous_search_age ){
        
        //前回と同様検索条件(年齢層)ならばキャッシュから取得
        get_LibRecommended_from_cashe( BookInfo );
        
        
        //dfd_librecom.resolve();
        //dfd_flag = 1;
        
    }
    else{
        // webAPIから取得
        
        //var dfd_librecom;
        get_LibRecommended_server_data( BookInfo, Setting.age, dfd_librecom );
    }

    //if( dfd_flag == 0 )
    //    return dfd_librecom.promise();
        
}

function get_LibRecommended_server_data( age, retry_flag ){
    
    if( retry_flag == FLAG_1st_CALL ){
        clear_LibRecommended_from_cashe();
        previous_search_age = age;
    }
    
    var offset = libRecom_retry_counter * SESSION_LIMIT_NUM;
    var query = makeUrl( age, offset );
    
    /* ======== ajaxを使わない(ここから)  for node.js ================*/
    var options = {
	host: LIB_RECOMENDED_DOMAIN,
	path: query,
	method: 'GET'
    };
	console.log('options.path: ' + options.path);

    http.request(options, function(r) {
	r.setEncoding('utf8');
	var json = '';
	r.on('data', function(chunk) {
	    json += chunk;
	});
	r.on('end', function() {   //APIからデータ取得成功！
		if(DEBUG=1)  console.log("LIB_RECOMENDED API done!");

        //console.log("json=" + json);
	    var data = JSON.parse(json);
        
        
        if (typeof data.result === 'undefined') {
            if(DEBUG=1)  console.log("LIB_RECOMENDED retrieve fail!" + json);
        
            
            dfd_librecom.reject();
            dfd_flag = 1;
            
        }
        else{
            //キャッシュへバックアップ
            //clear_LibRecommended_from_cashe();    //初回のみクリアするので場所移動
            //previous_search_age = age;
            set_LibRecommended_to_cashe( data );
            

            if(DEBUG)   console.log("age=" + age);  //もしかしたらコールバックではageが取得できないかもしれない

            
            /* ------ 初回はキャッシュへバックアップするのみへ変更
            //BookInfo objectへデータセット(上記セットしたキャッシュから取得)
            get_LibRecommended_from_cashe( BookInfo );
            ---------------- */
            
            if( is_continue( data ) ){
                //続き有の場合は再度NWアクセス
                
                if( libRecom_retry_counter < MAX_LIB_RECOM_NW_ACCESS_COUNT ){
                    setTimeout( function(){
                        retry_libRecom( age, FLAG_RETRY )
                    }, 100 );
                    
                }else{  //来ないはず
                    console.log("MAX RETRY COUNT ERROR. need to check data");
                    dfd_flag = 1;
                    dfd_librecom.resolve();
                }
                
                
            }else{
                //続き無の場合は終了
                dfd_flag = 1;
                dfd_librecom.resolve();
                
                if(DEBUG)   debug_consoleLogOUTPUT( CashedBooks );
                
            }
            
            
        }
        
	});
    }).end();
    /* ======== ajaxを使わない(ここまで)  for node.js ================*/
    
    /* ================== nodejsはajax使えない???(ここから) =================
    if(NOT_NODEJS){
    $.ajax({
        type: 'GET',
        url: LIB_RECOMENDED_URL,
        data:{
            filters:age_filter_word    
        },
        dataType: 'jsonp',
        jsonp: 'callback',  
    })
    .done( function(data) {     //データ取得成功！
        if(DEBUG=1)  console.log("LIB_RECOMENDED API done!");
        //if(DEBUG=1)  console.log(data);
        

        
        //キャッシュへバックアップ
        clear_LibRecommended_from_cashe();
        set_LibRecommended_to_cashe( data );
        previous_search_age = age;
        
    if(DEBUG)   console.log("age=" + age);  //もしかしたらコールバックではageが取得できないかもしれない
        
        //BookInfo objectへデータセット(上記セットしたキャッシュから取得)
        get_LibRecommended_from_cashe( BookInfo );
        
        dfd_librecom.resolve();
        dfd_flag = 1;
        
        
    })
    .fail( function(data) {     //データ取得失敗！
        if(DEBUG=1)  console.log("LIB_RECOMENDED retrieve fail!");
        
        dfd_librecom.reject();
        dfd_flag = 1;
    });
    }
    ================== nodejsはajax使えない???(ここから) ================== */
}

////////////////////////////////////////////////////////
// リトライ
////////////////////////////////////////////////////////
var retry_libRecom = function( age, retry_flag ){
    libRecom_retry_counter++;
    get_LibRecommended_server_data( age, retry_flag );
}


////////////////////////////////////////////////////////
// 要求URL作成
////////////////////////////////////////////////////////
function makeUrl( age, offset ){
    
    var url;
    
    url = LIB_RECOMENDED_URL1 + DKAN_RESOURCE_ID1 + DKAN_RESOURCE_ID2 + LIB_RECOMENDED_URL2 
        + LIB_RECOMENDED_URL3 + ageSetting2filterword(age) + LIB_RECOMENDED_URL4 + offset;
    
    if(DEBUG)   console.log("URL=" + url);
    
    //URL encode (日本語が入っているため)
    var query = encodeURI( url );
    
    return( query );
    
    //参考：http://data.code4ikoma.org/api/action/datastore/search.json?resource_id[raw]=2fdb3a28-733d-4d22-a0a3-4df1345d2236&resource_id[isbns]=dd4d9007-4bda-4826-9e06-9ab89b1f76ad&join[raw]=Title1&join[isbns]=Title1&filters[Age]=３さいから&offset=0;
}

////////////////////////////////////////////////////////
// 年齢層フィルターword
////////////////////////////////////////////////////////
function ageSetting2filterword( age ){
    switch(age){
        case 1:
            age_filter = FILTER_AGE_BABY;
            break;
        case 2:
            age_filter = FILTER_AGE_KINDERGARTEN;
            break;
        case 3:
            age_filter = FILTER_AGE_LOW_ELEMENTARY;
            break;
        case 4:
            age_filter = FILTER_AGE_HIGH_ELEMENTARY;
            break;
        case 5:
            age_filter = FILTER_AGE_JUNIOR_HIGH;
            break;
        default:
            age_filter = FILTER_AGE_KINDERGARTEN;
            break;
    }
    return age_filter;
}

////////////////////////////////////////////////////////
// キャッシュからお薦め本情報取得
////////////////////////////////////////////////////////
function get_LibRecommended_from_cashe( data ){
    
    //if(DEBUG)   debug_consoleLogOUTPUT( CashedBooks );
    //if(DEBUG)   console.log("target ISBN=" +data.Isbn );
    
    var input_data_isbn10;
    
    var input_data_isbn = data.Isbn.replace( /-/g, "");
    if( input_data_isbn.length != 10 ){
        input_data_isbn10 = ISBN13_to_ISBN10( input_data_isbn );
    }
    else{
        input_data_isbn10 = input_data_isbn;
    }
    
    if(!check_ValidIsbn(input_data_isbn10)){
        data.CityLibRecommended = 0;
        return;
    }
    
    for(i=0; i<CashedBooks.length; i++){
        
        //console.log("rakuten="+input_data_isbn10 + "  shisho=" + CashedBooks[i].isbn10 );
        
        //入力データがキャッシュにあるか否かチェック（キャッシュはISBN10フォーマット)
        if( input_data_isbn10 == CashedBooks[i].isbn10 ){
            data.publisherName = CashedBooks[i].publisherName;
            data.CityLibRecommended = 1;
            data.CityLibComment = CashedBooks[i].libcomment;
            data.CityLibCategory = CashedBooks[i].libcategory;
            
            if(DEBUG)   console.log("cache HIT!! ISBN = " + input_data_isbn10);
            return;
        }
    }
    
    data.CityLibRecommended = 0;
    //if(DEBUG)   console.log("cache NOT hit!! ISBN = " + input_data_isbn10);
    
}

////////////////////////////////////////////////////////
// ISBNチェック
////////////////////////////////////////////////////////
function check_ValidIsbn(isbn){
    var ret;
    
    if((isbn=="") || (isbn == " "))
        return 0;
    else if(isbn=="0000000000")
        return 0;
    else
        return 1;
}


////////////////////////////////////////////////////////
// JSONデータから続きの有無をチェック
// Return 1=続き有　0=続き無
////////////////////////////////////////////////////////
function is_continue( data ){
    var IS_CONTINUE = 1;
    var NOT_CONTINUE = 0;
    var ret = NOT_CONTINUE;
    var data_num;

    if( _.has( data.result, 'limit') ){
            data_num = data.result.limit;
    }else{
        console.log("LibRecomend: 異常データ！need to check data.");
        return( ret );
    }
            
    
    if( data_num >= SESSION_LIMIT_NUM ){
        ret = IS_CONTINUE;
    }else{
        ret = NOT_CONTINUE;
    }
        
    if(DEBUG)   console.log("LibRecomend: 続き=" + ret);
    return ret;
    
}

////////////////////////////////////////////////////////
// キャッシュへお薦め本情報セット
////////////////////////////////////////////////////////
function set_LibRecommended_to_cashe( data ){

    //if(DEBUG=1)     console.log ("total=" + data.result.total );
    

    var max_count;
    if( _.has( data.result, 'limit') ){
        max_count = data.result.limit;
        /*
        if( data.result.total >= SESSION_LIMIT_NUM ){
            max_count = data.result.limit;
        }else{ 
            max_count = data.result.total;
        }*/
        
    }else{
        console.log("LibRecomend: 異常データ！need to check data.");
        return;
    }
    
    var already_len = CashedBooks.length;
    
    for(i = 0; i < max_count; i++){
        CashedBooks[ already_len +i ] = new CashedRecomBook();
        
        CashedBooks[ already_len +i ].isbn10 = ISBN13_to_ISBN10( data.result.records[i].Isbn );    //ISBN10フォーマット(ハイフン無)に変換して格納
        CashedBooks[ already_len +i ].title = data.result.records[i].Title1;
        CashedBooks[ already_len +i ].author = data.result.records[i].author1;
        CashedBooks[ already_len +i ].publisherName = data.result.records[i].publisher;
        CashedBooks[ already_len +i ].libcomment = data.result.records[i].comment;
        CashedBooks[ already_len +i ].libcategory = data.result.records[i].category;
        
    }
        
    
}

////////////////////////////////////////////////////////
// キャッシュ削除
////////////////////////////////////////////////////////
function clear_LibRecommended_from_cashe( ){
    var i;
    var len = CashedBooks.length;
    
    for(i=0; i<len; i++ ){
        CashedBooks[i] = void 0;
    }
    if(DEBUG)   console.log("cashed len = " + CashedBooks.length);
    
}

function debug_consoleLogOUTPUT( CashedBooks ){
    
    var i=j=0;
    console.log("======= Lib Recomend cashe START ========");
    for(i=0; i<2; i++){
        console.log("len="+CashedBooks.length);
        console.log("ISBN="+ CashedBooks[j].isbn10);
        console.log("Title="+ CashedBooks[j].title);
        console.log("Author="+ CashedBooks[j].author);
        console.log("publisherName="+ CashedBooks[j].publisherName);
        console.log("libcomment="+ CashedBooks[j].libcomment);
        console.log("libcategory="+ CashedBooks[j].libcategory);
        j=CashedBooks.length-1;
    }
    console.log("======= Lib Recomend cashe END ===========");
    
}

//////////////////////////////////////////////////////////////////////
// ISBN13→ISBN10への変換関数
// 参考：http://dqn.sakusakutto.jp/2013/10/isbn13isbn10.html
//      https://gist.github.com/DQNEO/6960401  ←Thanks!
//      http://www.moongift.jp/2013/05/20130507-2/
// 確認：http://www.hon-michi.net/isbn.cgi
//
// 変換ロジックの解説(例："9784063842760")
// 1. ISBN13の先頭3文字と末尾1文字を捨てる => "4063842760"
// 2. 4*10 + 0*9 + 6*8 + 3*7 + 8*6 + 4*5 + 2*4 +7*3 + 6*2 = 218
// 3. 218 を11で割った余りは9
// 4. 11 - 9 = 2
// 5. 上記の答えが11なら0に,10ならxに置き換える
// 6. 5の結果がチェックディジット。これを1の末尾に付けるとISBN10が得られる。
//
// @param  string "9784063842760"
// @return string "4063842762"
//////////////////////////////////////////////////////////////////////
function ISBN13_to_ISBN10( ISBN13 ){
    var isbn13_raw;
    var tmp1;
    
    isbn13_raw = ISBN13.replace( /-/g, "" );
    
    if( isbn13_raw.length == 10 )   return isbn13_raw;  //ISBN10が入力されていたのでそのままreturn
    if( isbn13_raw.length != 13 )   return "0000000000";    //10桁でも13桁でも無いのでエラー(初期値)
    
    //ここから　https://gist.github.com/DQNEO/6960401　ほぼそのまま利用させて頂く
    isbn13_raw += "";
    var digits = [];
    var sum = 0; var chk_tmp, chk_digit;
    
    digits = isbn13_raw.substr(3,9).split("") ;
    
    for(var i = 0; i < 9; i++) {
        sum += digits[i] * (10 - i);
    }
    
    chk_tmp= 11 - (sum % 11);
    if (chk_tmp == 10) {
        chk_digit = 'x';
    } else if (chk_tmp == 11) {
        chk_digit = 0;
    } else {
        chk_digit = chk_tmp;
    }
  
    digits.push(chk_digit);
    
    return digits.join("");
}