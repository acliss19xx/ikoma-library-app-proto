//////////////////////////////////////////////////////////////////////
// 本の売れ筋ランキングを取得(楽天API)
//////////////////////////////////////////////////////////////////////

var https = require('https');
//var $ = require('jquery');
var $ = require('jquery-deferred');
var _ = require('underscore');  //npm install underscore  
// [REF] http://code-maven.com/using-underscore-in-nodejs-and-in-the-borwser

var RAKUTEN_RANKING_DOMAIN = "app.rakuten.co.jp";
var RAKUTEN_RANKING_URL = "/services/api/IchibaItem/Ranking/20120927?format=json";
var RAKUTEN_APPLICATION_ID = "1051519673428866160";     //code for 生駒用 正式ApplicationId(他利用の場合は変更ください)

//[REF] yieldでコールバック地獄回避　http://tech.nitoyon.com/ja/blog/2013/06/27/node-yield/

module.exports.get_rakuten_ranking_list = function(){
//function get_rakuten_ranking_list( ){
    return get_rakuten_ranking_list_with_arg( booklist, Setting );
//}
};

function get_rakuten_ranking_list_with_arg( booklist, Setting ){
    if(DEBUG=1)
        console.log("get_rakuten_ranking_list call");
    
    
    var dfd = new $.Deferred;     //node.jsではdeferred使えない？？？ 右記記事では使えてるんだけどなぁhttp://zuqqhi2.com/jquery-deferred
    
    var query = makeUrl( Setting.age, SelectBooks.page );
    
    var options = {
	host: RAKUTEN_RANKING_DOMAIN,
	port: 443,
	//path: RAKUTEN_RANKING_URL
	   // + "&applicationId=" + RAKUTEN_APPLICATION_ID 
        //+ "&" + "genreId=101263" +"&" + "page=1",
    path: query,    
	method: 'GET'
    };
	console.log('options.path: ' + options.path);

    https.request(options, function(r) {
	r.setEncoding('utf8');
	var json = '';
	r.on('data', function(chunk) {
	    json += chunk;
	});
	r.on('end', function() {   //楽天APIからデータ取得成功！
		console.log("rakuten done");

	    var ret = {"Items": []};

		//console.log("json=" + json);
	    var data = JSON.parse(json);
        
	    if (typeof data.Items === 'undefined') {
            if(DEBUG=1)  console.log("RAKUTEN API retrieve fail!" + json);
            
            
            dfd.reject();
            
            res.send('none');
		      
	    } else {
            
            //booklist objectへデータセット
            parse_and_set_rakuten_data( data, booklist );
        
            if(DEBUG)   console.log("rakuten API finish");
            
            dfd.resolve();
            
            
            /*
		console.log("length=" + body.Items.length);

		ret.Items = new Array(body.Items.length);
		for (i = 0; i < body.Items.length; i++) {
		    //ret.Items[i] = {title: body.Items[i].Item.title, mediumImageUrl: body.Items[i].Item.mediumImageUrl};
			ret.Items[i] = {title: body.Items[i].Item.itemName, mediumImageUrl: body.Items[i].Item.mediumImageUrls[0].imageUrl};
			
			console.log("title=" + body.Items[i].Item.itemName);

		}
//		res.json(util.format('%j', ret));
        */
	    }
        
	});
    }).end();

/* node.jsではajaxは使えない？？？
    $.ajax({
        type: 'GET',
        url: RAKUTEN_RANKING_URL,
        data:{
            format:'json',
            genreId:'101263',   //絵本
            applicationId:RAKUTEN_APPLICATION_ID    
        },
        dataType: 'jsonp',
        jsonp: 'callback',  
    })
    .done( function(data) {     //楽天APIからデータ取得成功！
        if(DEBUG=1)  console.log("RAKUTEN API return!");
        //if(DEBUG=1)  console.log(data);
        
        
        //booklist objectへデータセット
        parse_and_set_rakuten_data( data, booklist );
        
        dfd.resolve();
        
    })
    .fail( function(data) {     //楽天APIからデータ取得失敗！
        if(DEBUG=1)  console.log("RAKUTEN API retrieve fail!");
        
        dfd.reject();
    });
*/
    console.log("get_rakuten_ranking_list after API call");
    
    return dfd.promise();
    
}


//////////////////////////////////////////////////////////////////////
// 楽天APIで取得したjson objectから
// 上位へ渡すbooklistオブジェクトへデータセット
//////////////////////////////////////////////////////////////////////
function parse_and_set_rakuten_data( json, booklist ){
    

    //if( DEBUG=1 )   console.log("ITEM NUM=" + json.Items.length);


    for( i=0; i< json.Items.length; i++){   //取得した本の件数分ループ
        
        //本のタイトルと著者名 (ItemNameから切り出す必要性有)
        if( _.has( json.Items[i].Item, 'itemName') ){
            //booklist[i].Title = json.Items[i].Item.itemName;
            booklist[i].Title = getTitleFromItemName( json.Items[i].Item.itemName );    //タイトル
            booklist[i].Author = getAuthorFromItemName( json.Items[i].Item.itemName );  //著者名
        }
        //本のISBN。（ItemCaptionの中から切り出す必要性有）
        if( _.has( json.Items[i].Item, 'itemCaption') ){
            booklist[i].Isbn = getIsbnFromCaption( json.Items[i].Item.itemCaption );
        }
        //該当本の楽天URL
        if( _.has( json.Items[i].Item, 'itemUrl') ){
            booklist[i].rakutenURL = json.Items[i].Item.itemUrl;
        }
        //サムネイル画像
        if( _.has( json.Items[i].Item, 'smallImageUrls') ){
            booklist[i].SmallImageURL = json.Items[i].Item.smallImageUrls[0].imageUrl;
        }
        if( _.has( json.Items[i].Item, 'mediumImageUrls') ){
            booklist[i].MidiumImageURL = json.Items[i].Item.mediumImageUrls[0].imageUrl;
        }
        //出版社名は取得できないようだ。。。
    }

    //debug_print_console_log2( booklist );
    
}


//////////////////////////////////////////////////////////////////////
// itemNameから本のタイトルを取得するサービス関数 for 楽天API専用
//////////////////////////////////////////////////////////////////////
function getTitleFromItemName( ItemName ){
    var title = "";
    var search1 = "[";      // []の間に著者名が入っているので[の前までをタイトルとする
    
    var exclution1 = "(";       // （3冊化粧ケース入り）などが入ってるので(と)の間を省く
    var exclution2 = ")";       // （3冊化粧ケース入り）などが入ってるので(と)の間を省く
    var exclution3 = "【";      //【バーゲン本】などが入ってるので【と】の間を省く
    var exclution4 = "】";      //【バーゲン本】などが入ってるので【と】の間を省く
    var exclution5 = "（";       // （3冊化粧ケース入り）などが入ってるので(と)の間を省く(全角)
    var exclution6 = "）";       // （3冊化粧ケース入り）などが入ってるので(と)の間を省く（全角）
    
    
    
    // [の前までを本のタイトルとする
    var titleIndex = ItemName.indexOf(search1);
    if( titleIndex != -1 ){
        title = ItemName.substring( 0, titleIndex );
    }
    else{
        title = ItemName;
    }
    
    //"()"と"【】"の中を除外する
    
    title = exclutionCharacter( title, exclution1, exclution2 );
    title = exclutionCharacter( title, exclution3, exclution4 ); 
    title = exclutionCharacter( title, exclution5, exclution6 );   

    return title;
}

//////////////////////////////////////////////////////////////////////
// 入力したstringから start_wordとend_wordの間を除去する(start_wordなども除去する)
// ※start_wordとend_wordは１つしか無い想定
//////////////////////////////////////////////////////////////////////
function exclutionCharacter( string, start_word, end_word ){
    
    var output1 = "";
    var output2 = "";
    var output = "";
    
    var index1 = string.indexOf( start_word );
    
    if( index1 != -1 ){
        var index2 = string.indexOf( end_word );
        if( index2 != -1 ){
            index2 += end_word.length;
            
            if( index1 != 0){               //index1が先頭では無い
                output1 = string.substring( 0, index1 );
            }
            if( index2 < string.length-1){  //index2が終端では無い
                output2 = string.substring( index2 );
                
                output = output.concat( output1, output2 );
                
                return output;
            }
            else{                           //index2が終端の場合
                return output1;
            }
        }
    }

    return string;  //入力データそのまま
}

//////////////////////////////////////////////////////////////////////
// itemNameから本の著者を取得するサービス関数　for 楽天API専用
//////////////////////////////////////////////////////////////////////
function getAuthorFromItemName( ItemName ){
    var author = "";
    var search1 = "[ ";
    var search2 = " ]";
    
    var authorIndex1 = ItemName.indexOf(search1);
    if( authorIndex1 != -1 ){
        authorIndex1 += search1.length;
        
        var authorIndex2 = ItemName.indexOf(search2);
        if( authorIndex2 != -1 ){
            author = ItemName.substring( authorIndex1, authorIndex2 );
        }
    }
    
    return author;
}



//////////////////////////////////////////////////////////////////////
// captionからISBN取得するサービス関数　for 楽天API専用
//////////////////////////////////////////////////////////////////////
function getIsbnFromCaption( caption ){
    var isbn = "";
    var search1 = "ISBN：";
    var search2 = "ISBNコード";
    var search3 = "ISBN";
    var search4 = "JAN：978";	//本来はJANコードは間違いだが"978"で始まってるのでISBNの事なので含める
    
    
    var isbnIndex = caption.indexOf(search1);
    if(isbnIndex != -1)
    	isbnIndex += search1.length;
    else{
    	isbnIndex = caption.indexOf(search2);

    	if(isbnIndex != -1){
        	isbnIndex += search2.length;
        	console.log("ISBNコード　ケース");
    	}
    	else{
    		isbnIndex = caption.indexOf(search3);
    		if(isbnIndex != -1){
    			isbnIndex += search3.length;
    			console.log("ISBNコロン無しケース");
    		}
    		else{
    			isbnIndex = caption.indexOf(search4);
        		if(isbnIndex != -1){
        			isbnIndex = isbnIndex + search4.length -3;
        			console.log("JANコードケース");
        		}
        		else{
        			console.log("[invalid ISBN]We CANNOT find ISBN. caption = " + caption);
        			return "";
        		}
    		}
    	}
    }



    isbn = caption.substring(isbnIndex, isbnIndex + 13);
        
      //if( $.isNumeric(isbn) ){
        if( typeof isbn != "number"){   //後ほど要検証★★★★★  
        return isbn;
    } else {
    	//TODO "-"が入った正常ケースを救う必要性有り。今後対応すべし！
        console.log("[invalid ISBN]this caption has invalid ISBN!! isbn = " + isbn + " caption=" + caption);
        return "";
    }
}

//////////////////////////////////////////////////////////////////////
// リクエストURL生成
//////////////////////////////////////////////////////////////////////
function makeUrl( age, page ){

    
    var AGE_0_2 = 1;    //0-2歳
    var AGE_3_6 = 2;    //3-6歳
    var AGE_7_9 = 3;    //小学校低学年
    var AGE_10_12 = 4;  //小学校高学年
    var AGE_13_15 = 5;  //中学生
    
    var RAKUTEN_GENRU_EHON = "101263";  //絵本
    var RAKUTEN_GENRU_JIDOSHO = "101260";  //児童書
    var RAKUTEN_GENRU_JIDOBUNKO = "208869";  //児童文庫
    
    var url;
    var rakuten_genruId;
    
    
    switch( age ){
        case AGE_3_6:
        case AGE_7_9:
            rakuten_genruId = RAKUTEN_GENRU_EHON;
            break;
        case AGE_10_12:
            rakuten_genruId = RAKUTEN_GENRU_JIDOSHO;
            break;
        case AGE_13_15:
            rakuten_genruId = RAKUTEN_GENRU_JIDOBUNKO;
            break;
        default:
            rakuten_genruId = RAKUTEN_GENRU_EHON;
            break;
    }
    
    url = RAKUTEN_RANKING_URL + "&applicationId=" + RAKUTEN_APPLICATION_ID 
        + "&" + "genreId=" + rakuten_genruId + "&page=" + page;
    
    if(DEBUG)   console.log("url=" + url);
    
    return( url );
}

// debug用
function debug_print_console_log2( booklist ){
    /*
    for(i=0; i< booklist.length; i++){
        console.log("Title = " + booklist[i].Title);
        console.log("Author = " + booklist[i].Author);
        console.log("ISBN = " + booklist[i].Isbn);
        console.log("RAKUTEN_URL = " + booklist[i].rakutenURL);
        console.log("IMAGE_URL(M) = " + booklist[i].MidiumImageURL);
    }
    */
    

        console.log("=====0番目出力=====");
        console.log("Title = " + booklist[0].Title);
        console.log("Author = " + booklist[0].Author);
        console.log("ISBN = " + booklist[0].Isbn);
        console.log("RAKUTEN_URL = " + booklist[0].rakutenURL);
        console.log("IMAGE_URL(M) = " + booklist[0].MidiumImageURL);

        console.log("=====29番目出力=====");
        console.log("Title = " + booklist[29].Title);
        console.log("Author = " + booklist[29].Author);
        console.log("ISBN = " + booklist[29].Isbn);
        console.log("RAKUTEN_URL = " + booklist[29].rakutenURL);
        console.log("IMAGE_URL(M) = " + booklist[29].MidiumImageURL);

}