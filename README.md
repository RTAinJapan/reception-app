# 受付アプリ

# 準備

- Webサーバー
  - PHPが動くこと
- データ取得元の外部サービス
  - GASとか

# データ取得元の外部サービスの準備
- Google Formを作成する。以下3つの短文項目を用意
  - name
  - code
  - date
- 各項目のkey名を取得
  - `事前入力したURLを取得` とかで取得できる
- フォームに紐付けたスプレッドシートを準備
- スプレッドシートのスクリプトとして `src/gas/index.js` を記述
- デプロイし、アプリのリンクを取得

# PHPの準備

- 任意の場所に `src/php/reception.php` を配置
- CURLOPT_URLを記載
  - 1個目はGoogle FormのURL。`/formResponse` で終わるようにする
  - 2個目は↑で取得したアプリのリンク
- 入場記録ファイルのファイルパスを記載

# Webアプリの準備

- ビルドする

```
yarn
yarn build
```

- ビルドしたファイルを好きな場所に配置する
- 入場者リストとして`visitor.json`を作成し、好きな場所に配置
```js
Visitor[]
```

- 入場記録リストとして `accepted.json` を作成し、PHPで指定した場所に配置

```js
{
  status: string;
  data: Accepted[];
}
```

- `config.json` を作成し、同ディレクトリに置く

```json
{
  "api": {
    "reception": "PHPのパス"
  },
  "data": {
    "visitor": "visitor.jsonのパス",
    "accepted": "accepted.jsonのパス"
  }
}
```

# 動作概要
- 受付アプリでQRコードを登録
- 受付アプリがPHPにデータをPOST。PHPがGoogleFormに登録し、GAS経由で入場記録のjsonを更新
  - 受付アプリからjsonpでGASにデータを投入してもいいんだけど、サーバ上にjsonを置いた方がAPIのリクエスト回数を気にしなくてよいのでそうしたかった。
- 受付アプリが更新後の入場記録のjsonを取得
