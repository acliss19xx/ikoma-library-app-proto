//////////////////////////////////////////////////////////////////////
// 学校お薦め本か否か？ (サーバーストレージから取得)
//////////////////////////////////////////////////////////////////////

var http = require('http');
var $ = require('jquery-deferred');

var AGE_BABY = 1;               //赤ちゃん
var AGE_KINDERGARTEN = 2;       //３さいから
var AGE_LOW_ELEMENTARY = 3;     //小学校１～３年生
var AGE_HIGH_ELEMENTARY = 4;    //小学校４～６年生
var AGE_JUNIOR_HIGH = 5;        //中学生


/* ------- 暫定（ここから) -------------- */
/* ------- 最終的にはcsvから呼ぶように or オープンデータとしてAPIコール ------ */
var school_recom_data =
    [
        // isbn10, title, school(テーブルの中にglobalな定数は入れれないようだ), 年齢層
        [ "4893251767", "ねずみのでんしゃ", 51, AGE_KINDERGARTEN ],
        [ "9784834061673", "ぐりとぐらカレンダー", 51, AGE_KINDERGARTEN ],
        [ "4834000826", "ぐりとぐら", 51, AGE_KINDERGARTEN ],
        [ "4834000826", "ぐりとぐら", 3, AGE_KINDERGARTEN ],
        [ "4834022994", "ちょっとだけ", 51, AGE_KINDERGARTEN ],
        [ "4772100318", "しろくまちゃんのほっとけーき", 51, AGE_KINDERGARTEN ],
        [ "9784834000627", "おおきなかぶ", 51, AGE_KINDERGARTEN ]
    ];
/* ------- 暫定（ここまで) -------------- */


////////////////////////////////////////////////////////
// booklistを与えて、学校お薦め本の BookInfo.CitySchoolRecommendedの中に学校名をセットする
// (外部提供API)
////////////////////////////////////////////////////////

//module.exports.judge_school_recomended = function(){      //他サーバーを介さないので同期型で良いだろう
exports.judge_school_recomended = function(){
    var i;
    
    if(DEBUG)   console.log("judge_school_recomended called.Booklist.len="+booklist.length);
    
    for (i = 0; i<booklist.length; i++){
        judge_school_recomended_with_arg( booklist[i], Setting );
    }
    
    if(DEBUG){
        //debug_print_console_log_school_recomended();
    }
    
    return;
};



function judge_school_recomended_with_arg( BookInfo, Setting ){
    
    //var dfd_schoolrecom = new $.Deferred;
    var i;
    
    var isbn = ISBN13_to_ISBN10( BookInfo.Isbn );
    
    if( checkValidIsbn(isbn) ){
        for(i=0; i< school_recom_data.length; i++){

             if((( isbn == ISBN13_to_ISBN10(school_recom_data[i][0]))
                && (Setting.age == school_recom_data[i][3]))){
                 add_Info_school_recom(BookInfo.CitySchoolRecommended, school_recom_data[i][2]);
             }
        }
    }

    
    //最後にCitySchoolRecommendedのリストを減らす
    del_Info_school_recom( BookInfo.CitySchoolRecommended );
    
    if(DEBUG){
        //var l = BookInfo.CitySchoolRecommended.length;
        //console.log("CitySchoolRecommendedの長さ="+l);
        
    }
    //dfd_librecom.resolve();
    //return dfd_schoolrecom.promise();
    
}
        

//////////////////////////////////////////////////////////////////////
// おすすめ学校を登録
//////////////////////////////////////////////////////////////////////
function add_Info_school_recom( recom_array, school_info ){
    var i;
    
    for(i=0; i< MAX_SCHOOL_NUM; i++){
        if( recom_array[i] == IKOMA_SCHOOL_DEFAULT){
            recom_array[i] = school_info;
            return;
        }
        
    }
    console.log("add_Info_school_recom: ここまで来たらエラー");
}

//////////////////////////////////////////////////////////////////////
// 空のリストを整理
//////////////////////////////////////////////////////////////////////
function del_Info_school_recom( recom_array ){
    var i;
    
    var max_num = recom_array.length;
    var counter=0;
    
    
    //不正isbnの本を削除
    for(i=0; i<max_num; i++){        
        if( recom_array[counter] == IKOMA_SCHOOL_DEFAULT ){
            recom_array.splice( counter, 1 );
        }
        else    counter++;
    }
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


//////////////////////////////////////////////////////////////////////
// 不正isbnか否かチェック    1:正常　0:異常
//////////////////////////////////////////////////////////////////////
function checkValidIsbn( isbn ){
    if(( isbn == "") || (isbn == " ")){
        return 0;
    }
    else if( /[^0-9\-x]/.test(isbn)){   //数字以外があればtrue
        console.log("invalid isbn: " + isbn);
        return 0;
    }
    else if(isbn == "0000000000"){
        console.log("invalid isbn: " + isbn);
        return 0;
    }
    else{
        return 1;
    }
}

//////////////////////////////////////////////////////////////////////
// デバッグ用ログ出し
//////////////////////////////////////////////////////////////////////
function debug_print_console_log_school_recomended(){
    
    var i, j;
    
    for (i = 0; i<booklist.length; i++){
        for(j=0; j<booklist[i].CitySchoolRecommended.length;j++){
            console.log("CitySchoolRecommended[" +i+ "]=" + booklist[i].CitySchoolRecommended[j]);
        }
    }
    
    
}
