# 開発ツール

## スクリプト

### デュプリケート対局用牌山生成
```sh
$ node dev/make_shan.js --times=1000 --hongpai=1 --jushu=40 > shan.json
```
[デュプリケート対局](https://blog.kobalab.net/entry/2020/12/19/075529) 用の牌山データを生成し、標準出力に出力します。
デュプリケート対局で使用する際には gzip 圧縮されている必要がありますので、保存・圧縮してください。

#### --times, -t
生成する対局数を指定します(デフォルト値は 1000)。
#### --hongpai, -h
赤牌の数を指定します(デフォルト値は萬子・筒子・索子に各1)。
赤牌なしの場合は ``--hongpai=0`` と指定します。
筒子のみ赤牌ありとする場合は ``--hongpai=010`` と指定します。
#### --jushu, -j
1対局当たりの牌山数を指定します(デフォルト値は 40)。
不足した場合、以降はランダムな牌山で対戦を行います。

### AI自動対局スクリプト
```sh
$ node dev/testplay.js --input=shan.json.gz --output=log.json --times=100 --skip=10 0305
```
CLIでAI同士を自動対戦させます。

#### --input, -i
デュプリケート対局用の牌山を指定します。省略した場合はランダムな牌山で自動対戦します。
#### --output, -o
指定されたファイルに [牌譜](https://github.com/kobalab/majiang-core/wiki/%E7%89%8C%E8%AD%9C) を出力します。
#### --times, -t
対戦回数を指定します。省略時は指定された牌山内の対局数にしたがいます。牌山も指定がない場合は1戦だけ対戦します。
#### --skip, -s
指定された数分牌山をスキップします。特定の牌山でだけ対戦させたいときに便利です。
#### *legacy*
[過去の思考ルーチン](https://github.com/kobalab/majiang-ai/tree/master/legacy)のアルゴリズム番号を指定します。
省略時は現在のアルゴリズムでの対戦となります。
アルゴリズム番号 0304 と 0305 を比較したい場合は 0304 0305 と指定すれば 0304 3名と 0305 1名の対戦となります。

### 手牌の評価値計算スクリプト
```sh
$ node dev/eval_shoupai.js m123p1234789s3388/0/0/s3
```
[何切る解答機](https://kobalab.net/majiang/dapai.html) のCLI版。
パラメータは何切る解答機と同じ。
ただし13枚の手牌の場合は有効牌ごとの評価値を表示します。

## テストケース

### select_dapai.js
[麻雀 定石「何切る」301選](https://www.amazon.co.jp/exec/obidos/ASIN/4861999847/hatena-blog-22/) を解く [mocha](https://mochajs.org/) のテストスクリプト。
以下のようにアルゴリズム番号を指定することもできます。
```sh
$ LEGACY=0305 npm test dev/select_dapai.js
```


## ライブラリ

### shan.js
デュプリケート対局用の牌山を操作する クラス [Majiang.Shan](https://github.com/kobalab/majiang-core/wiki/Majiang.Shan) のスタブ。

### game.js
デュプリケート対局用の牌山を使用してゲームを進行するドライバ。
[Majiang.Game](https://github.com/kobalab/majiang-core/wiki/Majiang.Game) のサブクラスとして実装。
