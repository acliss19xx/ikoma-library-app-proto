# ikoma-library-app-proto

### ローカルPCでの動作確認環境を構築する手順

* `node`と`npm`と`git`をインストールしてください
   * Node.js
      * https://nodejs.org/en/download/
   * Git
      * https://git-scm.com/downloads
   * 確認するにはシェルで以下のように確認してください

```
$ node --version
v6.3.0

$ npm --version
3.10.3

$ git --version
git version 1.7.9.5
```

* 最新のソースツリーを取得します

```
$ git clone https://github.com/hiroaki-ohkawa/ikoma-library-app-proto.git
```

* 実行に必要なライブラリ等を取得します

```
$ cd ikoma-library-app-proto
$ npm install
```

* WebサーバのURLを環境に合わせて修正してください
   * 修正前はherokuにデプロイして動作する設定になっています

`public/javascripts/main.js`の●行目

修正前

```
    var url = "https://" + location.hostname + "/api/v1?" + q;
```

修正後

```
    var url = "http://" + location.hostname + ":3000/api/v1?" + q;
```

`public/javascripts/main.js`の●行目

修正前

```
    var url = "https://" + location.hostname + "/api/recommendation";
```

修正後

```
    var url = "http://" + location.hostname + ":3000/api/recommendation";
```

* 環境変数を設定します
   * 楽天ウェブサービスのアプリIDを設定します
   * アプリIDは各自で取得してください
   * アプリIDは`routes/api/v1.js`で参照されます

```
(Windows)
# set RAKUTEN_APP_ID=XXXXXXXXXXXXXXXXXXX

(Linux)
$ export RAKUTEN_APP_ID=XXXXXXXXXXXXXXXXXXX
```

* Webアプリを起動します

```
$ ./bin/www
```

```
ブラウザで下記入力
http://localhost:3000/
```