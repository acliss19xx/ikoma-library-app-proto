//////////////////////////////////////////////////////////////////////
// 最寄りの図書館/市内図書館に該当本があるか否か(カーリルAPI)
//
// 設定画面にてカーリルを利用する旨　表示必要　https://calil.jp/doc/api_ref.html
// http://calil.jp/library/{libid}/{図書館の正式名称}
//
// [制限事項]　１時間に1000リクエストまで
//////////////////////////////////////////////////////////////////////

var http = require('http');
var $ = require('jquery-deferred');
var _ = require('underscore');  //npm install underscore 

var CALIL_API_DOMAIN = "api.calil.jp";
var CALIL_API_URL = "/check?format=json&callback=no&";
var APP_KEY = "3494d30088f8133e67f0092098fe9aa7";   //code for生駒正式APP_KEY (他所での利用時は変更ください)
var SYSTEM_ID = "Nara_Ikoma";
var MAX_CALIL_RETRY_CNT = 10;	//10回リトライするとエラーとする(傾向的に10回以上リトライする場合は30回程度かかる）
var mSystemId = SYSTEM_ID; //TODO：今は固定だが将来的に動的に変更するようにするのがよい

var FLAG_1st_CALL = 0;  //retry_flagに入れる値
var FLAG_RETRY = 1;     //retry_flagに入れる値

//var session;

var dfd_calil;

//var dfd_backup;

var calil_books_status = new Array();

var CALIL_STATUS_INIT = 0;
var CALIL_STATUS_API_REQUESTING = 1;
var CALIL_STATUS_RETRY_WAITING = 5;
var CALIL_STATUS_RETRY_REQUESTING = 6;
var CALIL_STATUS_ERROR = 8;
var CALIL_STATUS_DONE = 9;



//////////////////////////////////////////////////////////////////////
// 最寄りの図書館/市内図書館に該当本があるか否か(カーリルAPI) 公開関数
//////////////////////////////////////////////////////////////////////
module.exports.get_bookinfo_about_lib = function(){
//function get_bookinfo_about_lib(){
    if(DEBUG=1)
        console.log("get_bookinfo_about_lib call");
    
    var i;

////////
    //booklist[0].Isbn = "9784834000825";
    //booklist[1].Isbn = "9784834000824";
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
    
    
    var book_status;    // ①init/sending/retry_waiting/retry_sending/done のstatusと②Sessionidのarray
    for (i = 0; i<booklist.length; i++){
    //for (i = 0; i<10; i++){
        book_status = get_bookinfo_about_lib_with_arg( booklist[i], Setting, FLAG_1st_CALL );
        
        calil_books_status[i] = book_status;
        
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
    }
    
    
    return dfd_calil.promise();
    
//}
};

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
// １冊の本の状態をBookInfoにセットするサービス関数
// 戻り値　下記３つの値を持つobject
//        [1] isbn
//        [2] status: カーリルAPI呼ぶ状態(INIT/API_REQUESTING/RETRY_WAITING/RETRY_REQUESTING/ERROR/DONE)
//        [3] SessionId
//////////////////////////////////////////////////////////////////////////////////////

function get_bookinfo_about_lib_with_arg( BookInfo, Setting, retry_flag ){
    
    var calil_status_obj = { isbn:BookInfo.Isbn, status:0, SessionId:"" };
    
    if(DEBUG=1){
        console.log("Setting.age = "+Setting.age);
    }
    
    if( BookInfo.Isbn.length == 0 ){    //10桁、13桁もチェックした方が望ましい
        calil_status_obj.status = CALIL_STATUS_ERROR;
        return( calil_status_obj );
    }
    
    
    if( retry_flag == FLAG_1st_CALL ){
        session = "";
        //dfd_backup = "";    //初期化
        //var dfd_calil = new $.Deferred;
    }else{
        //dfd_calil = dfd_backup;     //retry時はbackupから復元
        
        session = getSessionId_from_Isbn( BookInfo.Isbn );  //isbnからsessionid検索
    }
    


    
    //カーリルAPI call
    var query = makeUrl( session, BookInfo.Isbn );
    
    
    /* ======================================================== */
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
	r.on('end', function() {   //楽天APIからデータ取得成功！
		if(DEBUG=1)  console.log("CALIL API done!");

		console.log("json=" + json);
        
        if( json.indexOf('<html>') != -1){      //htmlでエラーが返る場合がある
            console.log("temporary error. Isbn=" + BookInfo.Isbn);
            //dfd_calil.reject();

            calil_status_obj.status = CALIL_STATUS_ERROR;
            set_and_judge_calil_books_status( BookInfo, calil_status_obj );

            return( calil_status_obj );
        }
        
	    var data = JSON.parse(json);
        
	    if (typeof data === 'undefined') {
            if(DEBUG=1){
                console.log("CALIL retrieve fail!");       //★★[ToDO]なぞの404エラー(NOT FOUND)頻発。要調査
                console.log(data);
            }
            //dfd_calil.reject();


            calil_status_obj.status = CALIL_STATUS_ERROR;
            set_and_judge_calil_books_status( BookInfo, calil_status_obj );
            return( calil_status_obj );
		      
	    } else {
            
            var result = parseCalil( data, BookInfo );
        
            if( result == "" ){
                //dfd_calil.resolve();
                calil_status_obj.status = CALIL_STATUS_DONE;
                set_and_judge_calil_books_status( BookInfo, calil_status_obj );
                return( calil_status_obj );
            }
            else if( !(result =="error") ){  //case : session id
                session = result;

                //MAX_CALIL_RETRY_CNT回リトライするとエラーとして返す（処理時間短縮のため）
                if( BookInfo.Calil_retry_cnt >= MAX_CALIL_RETRY_CNT ){
                    console.log("over MAX_CALIL_CNT. ISBN =  " + BookInfo.Isbn);
                    //dfd_calil.reject();

                    calil_status_obj.status = CALIL_STATUS_ERROR;
                    set_and_judge_calil_books_status( BookInfo, calil_status_obj );

                    return( calil_status_obj );
                }
                //失敗した場合は2秒後にリトライする(カーリルAPIの仕様)
                //dfd_backup = dfd_calil;     //backup

                calil_status_obj.status = CALIL_STATUS_RETRY_WAITING;
                calil_status_obj.SessionId = session;
                set_and_judge_calil_books_status( BookInfo, calil_status_obj );

                setTimeout( function(){
                    retry_calil(BookInfo, Setting, FLAG_RETRY)
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
	    }
        
	});
    }).end();
    
    /* ============= ajax利用しない for node.js (ここから)=====================
    $.ajax({
        type: 'GET',
        url: query,
        dataType: 'jsonp',
        jsonp: 'callback',  
    })
    .done( function(data) {     //データ取得成功！
        if(DEBUG=1)  console.log("CALIL API done!");
        if(DEBUG=1)  console.log(data);
        

        var result = parseCalil( data, BookInfo );
        
        if( result == "" ){
            //dfd_calil.resolve();
            calil_status_obj.status = CALIL_STATUS_DONE;
            set_and_judge_calil_books_status( BookInfo, calil_status_obj );
            return( calil_status_obj );
        }
        else if( !(result =="error") ){  //case : session id
            session = result;
            
            //MAX_CALIL_RETRY_CNT回リトライするとエラーとして返す（処理時間短縮のため）
            if( BookInfo.Calil_retry_cnt >= MAX_CALIL_RETRY_CNT ){
                console.log("over MAX_CALIL_CNT. ISBN =  " + BookInfo.Isbn);
                //dfd_calil.reject();
                
                calil_status_obj.status = CALIL_STATUS_ERROR;
                set_and_judge_calil_books_status( BookInfo, calil_status_obj );
                
                return( calil_status_obj );
            }
            //失敗した場合は2秒後にリトライする(カーリルAPIの仕様)
            //dfd_backup = dfd_calil;     //backup
            
            calil_status_obj.status = CALIL_STATUS_RETRY_WAITING;
            calil_status_obj.SessionId = session;
            set_and_judge_calil_books_status( BookInfo, calil_status_obj );
            
            setTimeout( function(){
                retry_calil(BookInfo, Setting, FLAG_RETRY)
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
    
    ============= ajax利用しない for node.js (ここまで)===================== */
    
    if( retry_flag == FLAG_1st_CALL ){
        calil_status_obj.status = CALIL_STATUS_API_REQUESTING;
        //return dfd_calil.promise();
    }
    else{
        calil_status_obj.status = CALIL_STATUS_RETRY_REQUESTING;
    }
  
        
    if(DEBUG) console.log("get_bookinfo_about_lib_with_arg after API call");
    
    return( calil_status_obj );
}

//カーリルAPIを再度呼ぶ
var retry_calil = function( BookInfo, Setting, retry_flag ){
    get_bookinfo_about_lib_with_arg( BookInfo, Setting, retry_flag );
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
// カーリルから返却されてきたjson object解析
//
// return: jsonのcontinueフィールドが1(失敗なら)sessionの文字列を返す。
//         0（成功）なら空文字""を返す
//         エラーなら"error"を返す
//////////////////////////////////////////////////////////////////////
function parseCalil( json, BookInfo ) {
    

    var CALIL_BOOKS = "books";
    var CALIL_NARA_IKOMA = "Nara_Ikoma";
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
        // if('name' in obj)　これでいける？？　★★
 
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
            //if(json.has(CALIL_BOOKS)) {
            
            //★★★★
            var books = _.property( CALIL_BOOKS )(json);
            //JSONObject books = json.getJSONObject(CALIL_BOOKS);
            
            if( BookInfo.Isbn ){
            //if(books.has(outBook.getIsbn())) {
                var bookByIsbn = _.property( BookInfo.Isbn )(books);
                //JSONObject bookByIsbn = books.getJSONObject(outBook.getIsbn());

                if( _.has( bookByIsbn, CALIL_NARA_IKOMA)){
                //if (bookByIsbn.has(CALIL_NARA_IKOMA)) {
                    var naraIkoma = _.property( CALIL_NARA_IKOMA )(bookByIsbn);
                    //JSONObject naraIkoma = bookByIsbn.getJSONObject(CALIL_NARA_IKOMA);
                    
                    if( _.has( naraIkoma, CALIL_LIBKEY)){
                    //if (naraIkoma.has(CALIL_LIBKEY)) {
                        
                        var libkey = _.property( CALIL_LIBKEY )(naraIkoma);
                        //JSONObject libkey = naraIkoma.getJSONObject(CALIL_LIBKEY);
                        
                        var libraries = _.keys( libkey );
                        //JSONArray libraries = libkey.names();
                        
                        if ( libraries.length != 0 ) {
                            var name = _.values( libkey );
                            
                            setBookLibRentaledInfo( BookInfo, Setting, libraries, name );
                            
                            if(DEBUG){
                                for( var i=0; i < libraries.length; i++){
                                    console.log(libraries[i] +"=" + name[i]);
                                }
                            }
                        }
                        
                        if( _.has( naraIkoma, CALIL_STATUS )){
                        //if (naraIkoma.has(CALIL_STATUS)) {
                            var status = _.property( CALIL_STATUS )(naraIkoma);
                            //String status = naraIkoma.getString(CALIL_STATUS);
                            BookInfo.IsCityLibRentaled = status;
                            //outBook.setIsRentaled(status);
                        }
                        if( _.has( naraIkoma, CALIL_RESERVE_URL)){
                        
                        //if (naraIkoma.has(CALIL_RESERVE_URL)) {
                            var reserveUrl = _.property( CALIL_RESERVE_URL )(naraIkoma);
                            //String reserveUrl = naraIkoma.getString(CALIL_RESERVE_URL);
                            BookInfo.CityLibRentalURL = reserveUrl;
                            //outBook.setReserveUrl(reserveUrl);
                        }
                    }
                }
            }
            return "";
        }
    }catch (e) {
         if(DEBUG) console.log("Json Exception!" + e);
         return ERROR_CODE;
    }
    
}


// BookInfoへセットするサービス関数
function setBookLibRentaledInfo( BookInfo, Setting, libraries, name ){
    //var LIB = [ "北分館", "南分館", "生駒市図書館（本館）", "生駒駅前図書室", "鹿ノ台ふれあいホール", "奈良先端科学技術大学院大学"];
    
    
    if(Setting.libplace.length != 0)
        var nearLib = Setting.libplace.split("|");
    else return;

    
    if(DEBUG){
        for(var k=0; k<nearLib.length; k++){
            console.log("nearLib="+nearLib[k]);
        }
    }
    
    
    //市図書館に該当本有無セット
    if( libraries.length != 0 )
        BookInfo.IsCityLib = 1; //市図書館に該当本あり
    else
        BookInfo.IsCityLib = 0; //市図書館に該当本無し
    
    if(DEBUG)   console.log("IsCityLib=" + BookInfo.IsCityLib);
    
    
    var i;
    for(i=0; i<libraries.length; i++){
        for(j=0; j<nearLib.length; j++){
            if( libraries[i] == nearLib[j] ){   
                BookInfo.IsCityLibRentaled1 = checkLibRentaledStatus(name[i]);
                
            }
            
        }
    }
    
    BookInfo.IsCityLibRentaledNum = nearLib.length;     //★★★★図書館２つあるケースやどう返ってくるか要確認
    
    if(DEBUG)   console.log("IsCityLibRentaled1="+BookInfo.IsCityLibRentaled1);
    
/*
    this.IsCityLibRentaled1 = 0;     //最寄りの図書館1在庫有無( 1=貸出可能、2=貸出中、0=蔵書無　)
    this.IsCityLibRentaled2 = 0;     //最寄りの図書館2在庫有無( 1=貸出可能、2=貸出中、0=蔵書無　)
    this.IsCityLibRentaled3 = 0;     //最寄りの図書館3在庫有無( 1=貸出可能、2=貸出中、0=蔵書無　)
  */
    
}

//最寄りの図書館1在庫有無( 1=貸出可能、2=貸出中、0=蔵書無　)
function checkLibRentaledStatus( word ){
    var ret;
    
    switch( word){
        case "貸出可":
        case "蔵書あり":
            ret = 1;
            break;
            
        case "貸出中":
        case "予約中":
        case "準備中":
        case "休館中":
            ret = 2;
            break;
            
        case "蔵書なし":
        default:
            ret = 0;
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