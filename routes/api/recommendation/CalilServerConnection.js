//////////////////////////////////////////////////////////////////////
// 最寄りの図書館/市内図書館に該当本があるか否か(カーリルAPI)
//
// 設定画面にてカーリルを利用する旨　表示必要　https://calil.jp/doc/api_ref.html
// http://calil.jp/library/{libid}/{図書館の正式名称}
//
// [制限事項]　１時間に1000リクエストまで
//////////////////////////////////////////////////////////////////////

var NODEJS=1;

if(NODEJS){ //★★★NODEJS時は復活要
    var http = require('http');
    var $ = require('jquery-deferred');
    var _ = require('underscore');  //npm install underscore 
}
else{
    //var http;
    
}

var CALIL_API_DOMAIN = "api.calil.jp";
var CALIL_API_URL = "/check?format=json&callback=no&";
var APP_KEY = "3494d30088f8133e67f0092098fe9aa7";   //code for生駒正式APP_KEY (他所での利用時は変更ください)
var SYSTEM_ID = "Nara_Ikoma";
var MAX_CALIL_RETRY_CNT = 30;	//10回リトライするとエラーとする(傾向的に10回以上リトライする場合は30回程度かかる）
var mSystemId = SYSTEM_ID; //TODO：今は固定だが将来的に動的に変更するようにするのがよい

var FLAG_1st_CALL = 0;  //retry_flagに入れる値
var FLAG_RETRY = 1;     //retry_flagに入れる値

//var session;

var dfd_calil;

//var dfd_backup;

var calil_books_status = new Array();
var calil_session_status;
var calil_sessionid;
var session_retry_counter=0;

var CALIL_STATUS_INIT = 0;
var CALIL_STATUS_API_REQUESTING = 1;
var CALIL_STATUS_API_RE_REQUESTING = 2;
var CALIL_STATUS_RETRY_WAITING = 5;
var CALIL_STATUS_RETRY_REQUESTING = 6;
var CALIL_STATUS_ERROR = 8;
var CALIL_STATUS_DONE = 9;

//get_list.jsへ移動
//var LIB_STATUS_NOTHING = 0;         //図書館無
//var LIB_STATUS_ENABLE_LEND = 1;     //図書館貸出可能
//var LIB_STATUS_ENABLE_RESEARVE = 2; //図書館在庫無。予約可能

//////////////////////////////////////////////////////////////////////
// 最寄りの図書館/市内図書館に該当本があるか否か(カーリルAPI) 公開関数
//////////////////////////////////////////////////////////////////////

module.exports.get_bookinfo_about_lib = function(){   //★★★★NODEJS時はこちら
//function get_bookinfo_about_lib(){                  //★★★★NODEJS使わずに通常javascriptはこちら

    if(DEBUG=1)
        console.log("get_bookinfo_about_lib call");
    
    var i;

////////
    //booklist[0].Isbn = "9784864104449";
    //booklist[1].Isbn = "9784834022995";
    //dfd_calil = new $.Deferred;
    //var book_status = get_bookinfo_about_lib_with_arg( booklist[0], Setting, FLAG_1st_CALL );
        
    //calil_books_status[0] = book_status;
    //return dfd_calil.promise();
    
////////
    
    //これだと１件目要求出しただけでreturnして２件目にいかない。。。
    /*
    for (i = 0; i<booklist.length; i++)
        return( get_bookinfo_about_lib_with_arg( booklist[i], Setting, FLAG_1st_CALL ));
    */
    
    
    dfd_calil = new $.Deferred;
    
    
    //var book_status;    // ①init/sending/retry_waiting/retry_sending/done のstatusと②Sessionidのarray
    
    
    init_calil_books_status( booklist );
    calil_session_status = CALIL_STATUS_INIT;
    calil_sessionid = "";
        
    //book_status = get_bookinfo_about_lib_with_arg( booklist[i], Setting, FLAG_1st_CALL );
    get_bookinfo_about_lib_with_arg( booklist, Setting, FLAG_1st_CALL );
        
    //calil_books_status[i] = book_status;
        
        
        
        /*
        if(DEBUG){
            console.log(
                "calil_books_status["+i+"]: "
                + " Isbn=" + book_status.isbn 
                + " status=" + book_status.status
                + " SessionId=" + book_status.SessionId
            );
        }
        */
    
    return dfd_calil.promise();
    
//}
};




//////////////////////////////////////////////////////////////////////////////////////
// 複数冊の本の状態をそれぞれの本のBookInfoにセットするサービス関数
// 戻り値：　無
//////////////////////////////////////////////////////////////////////////////////////

function get_bookinfo_about_lib_with_arg( booklist, Setting, retry_flag ){
    
    //var calil_status_obj = { isbn:"", status:0, SessionId:"" };
    
    if(DEBUG=1){
        console.log("Setting.age = "+Setting.age);
    }
    
    /*
    if( BookInfo.Isbn.length == 0 ){    //10桁、13桁もチェックした方が望ましい
        calil_status_obj.status = CALIL_STATUS_ERROR;
        return( calil_status_obj );
    }
    */
    
    if( retry_flag == FLAG_1st_CALL ){
        session = "";
        //dfd_backup = "";    //初期化
        //var dfd_calil = new $.Deferred;
    }else{
        //dfd_calil = dfd_backup;     //retry時はbackupから復元
        
        //session = getSessionId_from_Isbn( BookInfo.Isbn );  //isbnからsessionid検索
        switch( calil_session_status ){
            case CALIL_STATUS_API_REQUESTING:
            case CALIL_STATUS_API_RE_REQUESTING:
            case CALIL_STATUS_RETRY_REQUESTING:
            case CALIL_STATUS_RETRY_WAITING:
                session = calil_sessionid;
                break;
            default:
                console.log("無いはず");
                session = "";
                break;
        }
    }
    
    
    //カーリルAPI call
    var query_isbns = get_query_isbns();
    var query = makeUrl( session, query_isbns );
    //var query = makeUrl( session, BookInfo.Isbn );
    
    
    /* =========== NODEJS 非利用時はコメントアウト(ajax利用)=============== */
    
    var options = {
        host: CALIL_API_DOMAIN,
        //port: 443,
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
	r.on('end', function() {   //カーリルAPIからデータ取得成功！
		if(DEBUG=1)  console.log("CALIL API done!");

		console.log("json=" + json);
        
        if( json.indexOf('<html>') != -1){      //htmlでエラーが返る場合がある
            console.log("temporary error.");
            
            calil_session_status = CALIL_STATUS_ERROR;
            dfd_calil.reject();
            return;

            //calil_status_obj.status = CALIL_STATUS_ERROR;
            //set_and_judge_calil_books_status( BookInfo, calil_status_obj );
            //return( calil_status_obj );
        }
        
	    var data = JSON.parse(json);
        
	    if (typeof data === 'undefined') {
            if(DEBUG=1){
                console.log("CALIL retrieve fail!");       //なぞの404エラー(NOT FOUND)出ることがある。（１秒間に規定回数超過した場合など）
                console.log(data);
            }
            calil_session_status = CALIL_STATUS_ERROR;
            dfd_calil.reject();
            return;


            //calil_status_obj.status = CALIL_STATUS_ERROR;
            //set_and_judge_calil_books_status( BookInfo, calil_status_obj );
            //return( calil_status_obj );
		      
	    } else {
            
            var result = parseCalil( data );
        
            if( result == "" ){ //成功！
                //dfd_calil.resolve();
                //calil_status_obj.status = CALIL_STATUS_DONE;
                //set_and_judge_calil_books_status( BookInfo, calil_status_obj );
                //return( calil_status_obj );
                
                
                if( get_calil_books_done_count() != calil_books_status.length ){
                     /* -------------------------------------------------
                        全ての本の情報が返ってこなかったら、完了本を抜いて再度トライ！
                        生駒市図書館は３０件渡しても１１件しか結果返ってこない。生駒市図書館システムの仕様のようだ。
                        （経験的には３回かかる。最低６秒かかる。。。痛い）
                        他の図書館では３０件渡すと一発で３０件揃う。
                    ------------------------------------------------- */
                    if( session_retry_counter >= MAX_CALIL_RETRY_CNT){
                        calil_session_status = CALIL_STATUS_ERROR;
                        dfd_calil.reject();
                        return;
                    }else{
                        
                        /* なぜか生駒市でもnode.jsでは30件返ってくるようなので再開処理やめる
                        calil_session_status = CALIL_STATUS_API_RE_REQUESTING;
                        retry_calil( Setting, FLAG_1st_CALL );
                        */
                        
                        dfd_calil.resolve();    //全件完了！
                        calil_session_status = CALIL_STATUS_DONE;
                        return;
                    }
                }
                else{
                    dfd_calil.resolve();    //全件完了！
                    calil_session_status = CALIL_STATUS_DONE;
                    return;
                }
                
            }
            else if( !(result =="error") ){  //case : session id
                calil_sessionid = result;

                //MAX_CALIL_RETRY_CNT回リトライするとエラーとして返す（処理時間短縮のため）
                if( session_retry_counter >= MAX_CALIL_RETRY_CNT ){
                    console.log("over MAX_CALIL_CNT.");
                    calil_session_status = CALIL_STATUS_ERROR;
                    dfd_calil.reject();
                    return;

                    //calil_status_obj.status = CALIL_STATUS_ERROR;
                    //set_and_judge_calil_books_status( BookInfo, calil_status_obj );
                    //return( calil_status_obj );
                }
                //失敗した場合は2秒後にリトライする(カーリルAPIの仕様)
                //dfd_backup = dfd_calil;     //backup

                //calil_status_obj.status = CALIL_STATUS_RETRY_WAITING;
                //calil_status_obj.SessionId = session;
                //set_and_judge_calil_books_status( BookInfo, calil_status_obj );
                
                calil_session_status = CALIL_STATUS_RETRY_WAITING;

                setTimeout( function(){
                    retry_calil( Setting, FLAG_RETRY )
                }, 2000 );




            }
            else{
                //TODO:JSONExceptionやjsonがnullだった場合はとりあえずそのまま返す
                calil_session_status = CALIL_STATUS_ERROR;
                dfd_calil.reject();
                return;

                //set_and_judge_calil_books_status( BookInfo, calil_status_obj );
                //return( calil_status_obj );
            }
	    }
        
	});
    }).end();
    
    /* ============= ajax利用しない for node.js (ここから)===================== */
    /* 
    $.ajax({
        type: 'GET',
        url: "http://"+CALIL_API_DOMAIN+query,
        dataType: 'jsonp',
        jsonp: 'callback',  
    })
    .done( function(data) {     //データ取得成功！
        if(DEBUG=1)  console.log("CALIL API done!");
        if(DEBUG=1)  console.log(data);
        

        var result = parseCalil( data );
        
        if( result == "" ){
                if( get_calil_books_done_count() != calil_books_status.length ){
                    
                    if( session_retry_counter >= MAX_CALIL_RETRY_CNT){
                        
                        calil_session_status = CALIL_STATUS_ERROR;
                        dfd_calil.reject();
                        return;
                        
                    }else{ 
                        
                        //全ての本の情報が返ってこなかったら、完了本を抜いて再度トライ！
                        //生駒市図書館は３０件渡しても１１件しか結果返ってこない。生駒市図書館システムの仕様のようだ。
                        //（経験的には３回かかる。最低６秒かかる。。。痛い）
                        //他の図書館では３０件渡すと一発で３０件揃う。
                        
                        calil_session_status = CALIL_STATUS_API_RE_REQUESTING;
                        calil_sessionid = "";
                        if(DEBUG)   console.log("一部を抜いて最初から");
                        retry_calil( Setting, FLAG_1st_CALL );
                    }
                }
                else{
                    //dfd_calil.resolve();    //全件完了！  ★★★NODEJS時には復活要
                    calil_session_status = CALIL_STATUS_DONE;
                    
                    //debug_print_calil();
                    return;
                }
        }
        else if( !(result =="error") ){  //case : session id
                calil_sessionid = result;

                //MAX_CALIL_RETRY_CNT回リトライするとエラーとして返す（処理時間短縮のため）
                //if( BookInfo.Calil_retry_cnt >= MAX_CALIL_RETRY_CNT ){
                if( session_retry_counter >= MAX_CALIL_RETRY_CNT){
                    console.log("over MAX_CALIL_CNT.");
                    calil_session_status = CALIL_STATUS_ERROR;
                    dfd_calil.reject();
                    return;

                    //calil_status_obj.status = CALIL_STATUS_ERROR;
                    //set_and_judge_calil_books_status( BookInfo, calil_status_obj );
                    //return( calil_status_obj );
                }
                //失敗した場合は2秒後にリトライする(カーリルAPIの仕様)
                //dfd_backup = dfd_calil;     //backup

                //calil_status_obj.status = CALIL_STATUS_RETRY_WAITING;
                //calil_status_obj.SessionId = session;
                //set_and_judge_calil_books_status( BookInfo, calil_status_obj );
                
                calil_session_status = CALIL_STATUS_RETRY_WAITING;

                setTimeout( function(){
                    retry_calil( Setting, FLAG_RETRY )
                }, 2000 );
            
            
            
            
        }
        else{
            //TODO:JSONExceptionやjsonがnullだった場合はとりあえずそのまま返す
            //dfd_calil.reject();
            //return;
            
            calil_status_obj.status = CALIL_STATUS_ERROR;
            set_and_judge_calil_books_status( BookInfo, calil_status_obj );
            return( calil_status_obj );
        }
        
        
    })
    .fail( function(data) {     //データ取得失敗！
        if(DEBUG=1){
            console.log("CALIL retrieve fail!");       //★★[ToDO]なぞの404エラー(NOT FOUND)頻発。要調査
            console.log(data);
        }
        //dfd_calil.reject();
        
        
        calil_status_obj.status = CALIL_STATUS_ERROR;
        set_and_judge_calil_books_status( BookInfo, calil_status_obj );
        return( calil_status_obj );
        
    });
    */
    /* ============= ajax利用しない for node.js (ここまで)===================== */
    
    if( retry_flag == FLAG_1st_CALL ){
        calil_session_status = CALIL_STATUS_API_REQUESTING;
        //calil_status_obj.status = CALIL_STATUS_API_REQUESTING;
        //return dfd_calil.promise();
    }
    else{
        calil_session_status = CALIL_STATUS_RETRY_REQUESTING;
        //calil_status_obj.status = CALIL_STATUS_RETRY_REQUESTING;
    }
  
        
    if(DEBUG) console.log("get_bookinfo_about_lib_with_arg after API call");
    
    return;
}

//カーリルAPIを再度呼ぶ
var retry_calil = function( Setting, retry_flag ){
    session_retry_counter++;
    get_bookinfo_about_lib_with_arg( booklist, Setting, retry_flag );
}


//複数件のISBNをカンマで連結する
function get_query_isbns(){
    var output_isbns="";
    
        var i;
    if(calil_books_status.length == 0 )   return( output_isbns );
    
    for(i=0; i<calil_books_status.length; i++){
        switch( calil_books_status[i].status ){
            case CALIL_STATUS_DONE:
            case CALIL_STATUS_ERROR:
                break;
            default:
                if(output_isbns == ""){
                    output_isbns = calil_books_status[i].isbn;
                }else{
                    output_isbns = output_isbns + "," + calil_books_status[i].isbn;
                }
                break;
        }
    }
    return( output_isbns );
}

function makeUrl( session, isbn ) {
    var url;
    if( session.length == 0 ) { //最初のアクセス時
        url = CALIL_API_URL + "appkey="+ APP_KEY + "&isbn=" + isbn + "&systemid=" + SYSTEM_ID;
    	console.log("url = " + url);
    	
    } else { //リトライ時(session id でアクセスする)
        url = CALIL_API_URL + "appkey="+ APP_KEY + "&session=" + session;
    	console.log("url = " + url);
    }
    return url;
}


//////////////////////////////////////////////////////////////////////
// カーリルから返却されてきた複数本情報json object解析
// カーリルから取得した結果はグローバル変数のbooklistとcalil_books_statusにセットする
//
// return: jsonのcontinueフィールドが1(失敗なら)sessionの文字列を返す。
//         0（成功）なら空文字""を返す
//         エラーなら"error"を返す
//////////////////////////////////////////////////////////////////////
function parseCalil( json ) {
    

    var CALIL_BOOKS = "books";
    var CALIL_NARA_IKOMA = "Nara_Ikoma";    //他地域はここを変更要
    var CALIL_LIBKEY = "libkey";
    var CALIL_RESERVE_URL = "reserveurl";
    var CALIL_STATUS = "status";
    var CALIL_CONTINUE = "continue";
    var CALIL_SESSION = "session";
    var ERROR_CODE = "error";
    
    
    if (json == null) {
        if(DEBUG) console.log("json is null");
        return ERROR_CODE;
    }
    
    /* ★★★★★
    http://www.red.oit-net.jp/tatsuya/js/string.htm 
    http://www.underscorejs.org
    ★★★★★
    */
    
    try {
        //continue=1の場合は続きがあるので取り直す必要がある
 
        if ( _.has( json, CALIL_CONTINUE) ) {
            var isContinue = _.property( CALIL_CONTINUE )(json);
        	if(DEBUG) console.log("retry continue = "+ isContinue);
                
        	if (isContinue == 1) {
        		var session = "";
                
                if( _.has( json, CALIL_SESSION )){
                    session = _.property( CALIL_SESSION )(json);
        
                    if(DEBUG) console.log("retry session = "+ session);
        		}
        		return session;
        	}
        }

        //continue=0の場合はparseしてOK
        if( _.has( json, CALIL_BOOKS )){

            var books = _.property( CALIL_BOOKS )(json);

            
            for( var Isbn_by_calil in books ){  //本の数だけ取得する(ここから)

                //Isbn_by_calil がISBN条件に合っているかcheck
                
                
            
            //if( BookInfo.Isbn ){
            
                var bookByIsbn = _.property( Isbn_by_calil )(books);

                if( _.has( bookByIsbn, CALIL_NARA_IKOMA)){
                    var naraIkoma = _.property( CALIL_NARA_IKOMA )(bookByIsbn);
                    
                    if( _.has( naraIkoma, CALIL_LIBKEY)){
                        
                        var libkey = _.property( CALIL_LIBKEY )(naraIkoma);
                        
                        var libraries = _.keys( libkey );
                        
                        if ( libraries.length != 0 ) {
                            var name = _.values( libkey );
                            
                            setBookLibRentaledInfo( Isbn_by_calil, Setting, libraries, name );
                            
                            if(DEBUG){
                                for( var i=0; i < libraries.length; i++){
                                    console.log(libraries[i] +"=" + name[i]);
                                }
                            }
                        }
                        
                        if( _.has( naraIkoma, CALIL_STATUS )){  
                            //statusは"OK", "Cache", "Running", "Error"のいづれか
                            //"Cache"は"OK"と同様（カーリルサーバーのキャッシュを利用）
                            var status = _.property( CALIL_STATUS )(naraIkoma);
                            
                            if(status != "Running"){
                                set_calil_books_status( Isbn_by_calil, status );
                            }
                            
                        }
                        if( _.has( naraIkoma, CALIL_RESERVE_URL)){
                        
                        //if (naraIkoma.has(CALIL_RESERVE_URL)) {
                            var reserveUrl = _.property( CALIL_RESERVE_URL )(naraIkoma);

                            setBookLibCityURL( Isbn_by_calil, reserveUrl );

                        }
                    }
                }
            //}
            }   //本の数だけ取得(Isbn_by_calilへの代入for文ここまで)
            
            return "";  //成功
        }
    }catch (e) {
         if(DEBUG) console.log("Json Exception!" + e);
         return ERROR_CODE;
    }
    
}

/* ----------------------------------------------------
 BookInfoへ図書館有無をセットするサービス関数
------------------------------------------------------ */
function setBookLibRentaledInfo( isbn, Setting, libraries, name ){
    //var LIB = [ "北分館", "南分館", "生駒市図書館（本館）", "生駒駅前図書室", "鹿ノ台ふれあいホール", "奈良先端科学技術大学院大学"];
    
    
    if(Setting.libplace.length != 0)
        var nearLib = Setting.libplace.split("|");
    else return;

    var k;
    if(DEBUG){
        for(k=0; k<nearLib.length; k++){
            console.log("nearLib="+nearLib[k]);
        }
    }
    
    
    var book;
    
    for(var k=0; k< booklist.length; k++){
        if( isbn == booklist[k].Isbn ){
            book = booklist[k];
            //console.log(book);
        }
    }
    
    if( typeof(book) != 'object' )  return;
    
    
    //市図書館に該当本有無セット
    if( libraries.length != 0 )
        book.IsCityLib = 1; //市図書館に該当本あり
    else
        book.IsCityLib = 0; //市図書館に該当本無し
    
    if(DEBUG)   console.log("IsCityLib=" + book.IsCityLib);
    
    if( book.IsCityLib == 0 )   return;


    
    var i, j;
    var nearLibstatus;
    
    var CityLibRentaledInfoDetail = new Array();
    
    for(j=0; j<nearLib.length; j++){
        
        
        nearLibstatus = { 
            LIB: LibName2Const(nearLib[j]),
            status: LIB_STATUS_ENABLE_RESEARVE  //最寄り図書館に無かった場合は予約可能扱い　★★[TODO]動作見て最終判断
        };         
        //nearLibstatus = { "nearLib[j]": LIB_STATUS_ENABLE_RESEARVE };
        
        
        for(i=0; i<libraries.length; i++){
        
            if( libraries[i] == nearLib[j] ){   //いづれも図書館名(character形式)
                //book.IsCityLibRentaled1 = checkLibRentaledStatus(name[i]);
                
                nearLibstatus = { 
                    LIB: LibName2Const(nearLib[j]),
                    status: checkLibRentaledStatus(name[i])
                };
            }
            
        }
        CityLibRentaledInfoDetail[j] = nearLibstatus;
    }
    
    book.CityLibRentaledInfo = CityLibRentaledInfoDetail;
    
    /*
    if(DEBUG){
        for(j=0; j<book.CityLibRentaledInfo.length; j++){
            console.log("表示図書館情報2");
            console.log("nearLibstatus[" + j + "]=" + book.CityLibRentaledInfo[j].LIB + "=" + book.CityLibRentaledInfo[j].status);
        }
    }
    */
    
    
}

/* ----------------------------------------------------
 図書館名を定数へ変換
------------------------------------------------------ */
function LibName2Const(name){
    
    switch( name ){
        case "北分館":
            ret = "IKOMA_LIB_1";
            break;
        case "南分館":
            ret = "IKOMA_LIB_2";
            break;
            
        case "生駒市図書館（本館）":
            ret = "IKOMA_LIB_3";
            break;
        case "生駒駅前図書室":
            ret = "IKOMA_LIB_4";
            break;
        case "鹿ノ台ふれあいホール":
            ret = "IKOMA_LIB_5";
            break;
        default:
            ret = "IKOMA_LIB_3";
            break;
    }

    return( ret );
}

/* ----------------------------------------------------
 BookInfoへ図書館内該当本URLをセットするサービス関数
------------------------------------------------------ */
function setBookLibCityURL( isbn, url ){
    
    var book;
    
    for(var k=0; k< booklist.length; k++){
        if( isbn == booklist[k].Isbn )
            book = booklist[k];
    }
    if( typeof(book) != 'object' )  return;
    
    book.CityLibRentalURL = url;
}

/* ----------------------------------------------------
 最寄りの図書館1在庫有無( 1=貸出可能、2=貸出中、0=蔵書無　)
------------------------------------------------------ */
function checkLibRentaledStatus( word ){
    var ret;
    
    switch( word){
        case "貸出可":
        case "蔵書あり":
            ret = LIB_STATUS_ENABLE_LEND;
            break;
            
        case "貸出中":
        case "予約中":
        case "準備中":
        case "休館中":
            ret = LIB_STATUS_ENABLE_RESEARVE;
            break;
            
        case "蔵書なし":
        default:
            ret = LIB_STATUS_NOTHING;
            break;
    }
    return ret;
}

//////////////////////////////////////////////////////////////////////////////////////
//　ISBNからSessionIdを探すサービス関数
//////////////////////////////////////////////////////////////////////////////////////
function getSessionId_from_Isbn( isbn ){
    for(var i=0; i<calil_books_status.length; i++){
        if(calil_books_status[i].isbn == isbn )
            return calil_books_status[i].SessionId;
    }
    
    return "";
    
}


//////////////////////////////////////////////////////////////////////////////////////
//　複数冊の本の状態を初期化
//
//////////////////////////////////////////////////////////////////////////////////////
function init_calil_books_status( booklist ){

    var i;
    //var calil_status_obj = { isbn:"", status:CALIL_STATUS_INIT, SessionId:"" };
    //var calil_status_obj = { isbn:"", status:CALIL_STATUS_INIT };
    
    if(booklist.length == 0 )   return;
    
    for(i=0; i<booklist.length; i++){
    //for(i=0; i<10; i++){
        
        if( checkIsbn(booklist[i].Isbn) ){
            calil_books_status[i] = { isbn:booklist[i].Isbn, status:CALIL_STATUS_INIT };
        }
        else{   //ISBN不正なら最初からエラーとしておく
            calil_books_status[i] = { isbn:booklist[i].Isbn, status:CALIL_STATUS_ERROR };
        }
    }

    
    /*
    if(DEBUG){
        for(i=0; i<calil_books_status.length; i++){
            console.log("calil_book_status[" + i + "].isbn="+calil_books_status[i].isbn+"status="+calil_books_status[i].status);
        }
    }
    */
    
    
}

function checkIsbn( isbn ){
    if(( isbn == "") || (isbn == " ")){
        return 0;
    }
    else if( /[^0-9|^-]/.test(isbn)){   //数字以外があればtrue
        console.log("invalid isbn: " + isbn);
        return 0;
    }
    else{
        return 1;
    }
}

//////////////////////////////////////////////////////////////////////////////////////
//　完了状態を管理するテーブルcalil_books_statusへセットする
//
//////////////////////////////////////////////////////////////////////////////////////
function set_calil_books_status( input_isbn, status ){
    
    var i;
    for(i = 0; i< calil_books_status.length; i++){
        if( calil_books_status[i].isbn == input_isbn ){
            if((status == "OK") || (status=="Cache")){
                calil_books_status[i].status = CALIL_STATUS_DONE;
                //if(DEBUG)   console.log("set calil_books_status: "+ input_isbn);
                return;
            }
            else if( status == "Error"){
                calil_books_status[i].status = CALIL_STATUS_ERROR;
                return;
            }
        }
    }
    
    console.log("set_calil_books_status: invalid ISBN"+ input_isbn);
    
}


//////////////////////////////////////////////////////////////////////////////////////
//　このsessionで既に完了した本の数をカウントする
//
//////////////////////////////////////////////////////////////////////////////////////
function get_calil_books_done_count( ){
    var i;
    
    var count = 0;
    
    for(i = 0; i< calil_books_status.length; i++){
        switch( calil_books_status[i].status ){
            case CALIL_STATUS_ERROR:
            case CALIL_STATUS_DONE:
                count++;
                break;
            default:
                break;
        }
    }
    
    if(DEBUG){
        console.log("THIS session status: done = " + count + " , ALL = " + calil_books_status.length );
    }

    return( count );
}


//////////////////////////////////////////////////////////////////////////////////////
//　カーリルAPIコール状態を管理する　＆　全件完了を判断する
//
//////////////////////////////////////////////////////////////////////////////////////
function set_and_judge_calil_books_status( BookInfo, book_status_obj ){
    
    var i;
    var books_volume = calil_books_status.length;
    
    //渡されたobjectをcalil_books_statusにマージ
    for(i=0; i< books_volume; i++){
        if( calil_books_status[i].isbn == book_status_obj.isbn ){   //isbnは必ず１つヒットする前提
            calil_books_status[i].status = book_status_obj.status;
            
            if(book_status_obj.SessionId.length != 0)
                calil_books_status[i].SessionId = book_status_obj.SessionId;
            
            break;
        }
    }
    
    //もし全件データがそろっていれば終了     
    //★[ToDo]フェールセーフタイマーを設けて１分で全件揃わなければエラー終了して次へ行くべきかもしれない。（未実装）
    var finish_counter=0;
    for( i=0; i< books_volume; i++){
        if(( calil_books_status[i].status == CALIL_STATUS_DONE) 
           || ( calil_books_status[i].status == CALIL_STATUS_ERROR ))
            finish_counter++;
    }

    if(DEBUG)   console.log("calil finish progress = " + finish_counter + "/" + books_volume);
    
    if( finish_counter == books_volume ){
        if(DEBUG){
            console.log("get_bookinfo_about_lib FINISH!!!!!");
            
            var success_count=0;
            var error_count=0;
            for(i=0; i< books_volume; i++){
                if( calil_books_status[i].status == CALIL_STATUS_DONE)  success_count++;
                else if( calil_books_status[i].status == CALIL_STATUS_ERROR ) error_count++;
            }
            console.log("CALIL success=" + success_count + "  fail=" + error_count);
        }
        
        
        dfd_calil.resolve();
        
    }
}


//////////////////////////////////////////////////////////////////////////////////////
//　debug print
//
//////////////////////////////////////////////////////////////////////////////////////
function debug_print_calil(){
    
    console.log("=========================================");
    
    var i;
    for(i=0; i< booklist.length; i++){
        console.log("=====" + i + "番目出力=====");

        console.log("Isbn = " + booklist[i].Isbn);
        console.log("Title= " + booklist[i].Title);
        console.log("IsCityLib = " + booklist[i].IsCityLib);
        console.log("IsCityLibRentaledNum = " + booklist[i].IsCityLibRentaledNum);
        console.log("IsCityLibRentaled1 = " + booklist[i].IsCityLibRentaled1);
        console.log("IsCityLibRentaled2 = " + booklist[i].IsCityLibRentaled2);
        console.log("CityLibRentalURL = " + booklist[i].CityLibRentalURL);
        
    }
    
    console.log("=========================================");
    
    for(i=0; i<calil_books_status.length; i++){
        console.log("=====" + i + "番目出力=====");
        console.log("ISBN="+calil_books_status[i].isbn + 
                    " STATUS=" + calil_books_status[i].status);
    }
    
    
    console.log("=========================================");
    
}

