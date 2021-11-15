# 過去の思考ルーチン

### 0001
[麻雀の打牌選択アルゴリズム(1)](https://blog.kobalab.net/entry/20160103/1451781343)
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

## 0000
[麻雀AIのプログラム構造](https://blog.kobalab.net/entry/20160102/1451703115)
  - 空の応答を返すのみ
