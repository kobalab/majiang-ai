# 過去の思考ルーチン

### 0305
[麻雀の打牌選択アルゴリズム(9)](https://blog.kobalab.net/entry/20170826/1503705167)
  - Player
    - select_dapai()
      - 染め手を考慮して打牌を選択する
  - SuanPai
    - make_paijia()
      - 手牌から染め手補正した牌の評価値を返す関数を生成する

### 0304
[麻雀の副露判断アルゴリズム(5)](https://blog.kobalab.net/entry/20170822/1503401216)
  - Player
    - select_fulou()
      - 評価値を元に副露判断する
    - select_gang()
      - 評価値を元に加槓・暗槓を判断する
    - eval_shoupai()
      - 副露しない判断した場合の処理を追加
    - eval_fulou()
      - 副露しない判断した場合の処理を追加

### 0303
[麻雀の打牌選択アルゴリズム(8)](https://blog.kobalab.net/entry/20170819/1503150574)
  - Player
    - eval_shoupai()
      - 副露したパターンも評価値に加える
    - eval_fulou()
      - 副露したパターンの手牌を評価する

### 0302
[麻雀の打牌選択アルゴリズム(6)](https://blog.kobalab.net/entry/20170806/1502026197)<br>
[麻雀の打牌選択アルゴリズム(7)](https://blog.kobalab.net/entry/20170813/1502605785)
  - Player
    - select_dapai()
      - シャンテン戻しの評価値も計算する
    - eval_shoupai()
      - シャンテン数に応じて評価値を調整する
      - シャンテン戻しの場合、フリテンとなった牌姿の評価値を0とする
    - eval_backtrack()
      - シャンテン戻しの手牌を評価する

### 0301
[麻雀の打牌選択アルゴリズム(4)](https://blog.kobalab.net/entry/20170731/1501502063)<br>
[麻雀の打牌選択アルゴリズム(5)](https://blog.kobalab.net/entry/20170802/1501673312)
  - Player
    - select_dapai()
      - 和了打点を元にした評価値で打牌を選択する
    - eval_shoupai()
      - 和了打点から評価値を算出する
    - get_defen()
      - 評価値算出用の和了打点を計算する
  - SuanPai
    - paishu_all()
      - 赤牌を区別して残り牌数を返す


## 0202
[麻雀の副露判断アルゴリズム(4)](https://blog.kobalab.net/entry/20161215/1481809226)
  - Player
    - select_dapai()
      - 副露を考慮した待ち牌の枚数で打牌を選択する
    - tingpai()
      - 役ありで副露可能な牌に印をつける

### 0201
[麻雀の副露判断アルゴリズム(1)](https://blog.kobalab.net/entry/20161212/1481471543)<br>
[麻雀の副露判断アルゴリズム(2)](https://blog.kobalab.net/entry/20161213/1481557260)<br>
[麻雀の副露判断アルゴリズム(3)](https://blog.kobalab.net/entry/20161214/1481644278)
  - Player
    - select_fulou()
      - 役ありでシャンテン数が進む場合、副露する
      - 役ありでシャンテン数が変わらなければ大明槓する
      - リーチ者がいる場合、2シャンテン以前で副露しない
    - select_gang()
      - リーチ者がいる場合、テンパイしていなければカンしない
    - select_dapai()
      - 役ありでシャンテン数が減る牌を有効牌とする
    - xiangting()
      - 役ありのシャンテン数を返す
    - tingpai()
      - 役ありの有効牌を返す

## 0102
[ベタオリのアルゴリズム](https://blog.kobalab.net/entry/20161204/1480808089) (後半)
  - Player
    - select_dapai()
      - リーチ者に2シャンテン以前はベタオリする
      - 1シャンテンは回し打ちする
      - テンパイなら全押しする

### 0101
[ベタオリのアルゴリズム](https://blog.kobalab.net/entry/20161204/1480808089) (前半)
  - Player
    - select_dapai()
      - リーチ者にはベタオリする
  - SuanPai
    - suan_weixian()
      - 牌の危険度を判定する

## 0004
[麻雀の打牌選択ルゴリズム(3)](https://blog.kobalab.net/entry/20160105/1451998413)
  - Player
    - select_dapai()
      - 同点の打牌候補がある場合は「牌の評価値」の大きい方を残すよう選択する
  - SuanPai
    - paijia()
      - 搭子のできやすさから「牌の評価値」を求める

### 0003
[麻雀の打牌選択アルゴリズム(2)](https://blog.kobalab.net/entry/20160104/1451907283)
  - Player
    - select_dapai()
      - 最も有効牌の(実際の)枚数が多くなる打牌を選択する
  - SuanPai
    - 新規追加
    - 捨て牌、副露牌、ドラ表示牌、自身の手牌の牌数をカウントする

### 0002
[麻雀の打牌選択アルゴリズム(1)](https://blog.kobalab.net/entry/20160103/1451781343) (後半)
  - select_dapai()
    - 最も有効牌の(論理上の)枚数が多くなる打牌を選択する

### 0001
[麻雀の打牌選択アルゴリズム(1)](https://blog.kobalab.net/entry/20160103/1451781343) (前半)
  - select_hule()
    - 和了可能な場合は必ず和了する
  - select_pingju()
    - 4シャンテン以上で九種九牌なら流局を選択する
  - select_fulou()
    - 鳴かない
  - select_gang()
    - シャンテン数が変わらない槓はする
  - select_dapai()
    - 最も有効牌の種類が多くなる打牌を選択する
  - select_lizhi()
    - リーチ可能な場合は必ずリーチする
  - select_daopai
    - 流局時にテンパイなら必ずテンパイ宣言する

## 0000
[麻雀AIのプログラム構造](https://blog.kobalab.net/entry/20160102/1451703115)
  - 空の応答を返すのみ
