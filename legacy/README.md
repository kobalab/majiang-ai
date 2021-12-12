# 過去の思考ルーチン

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
