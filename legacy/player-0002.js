/*
 *  思考ルーチン 0001
 *    - select_dapai()
 *      - 最も有効牌の(論理上の)枚数が多くなる打牌を選択する
 */
"use strict";

const Majiang = require('@kobalab/majiang-core');

module.exports = class Player extends Majiang.Player {

    action_kaiju(kaiju) { this._callback() }
    action_qipai(qipai) { this._callback() }

    action_zimo(zimo, gangzimo) {
        if (zimo.l != this._menfeng) return this._callback();
        let m;
        if      (this.select_hule(null, gangzimo))
                                         this._callback({hule: '-'});
        else if (this.select_pingju())   this._callback({daopai: '-'});
        else if (m = this.select_gang()) this._callback({gang: m});
        else this._callback({dapai: this.select_dapai()});
    }

    action_dapai(dapai) {
        if (dapai.l == this._menfeng)  {
            if (this.select_daopai()) this._callback({daopai: '-'});
            else                      this._callback();
            return;
        }
        let m;
        if      (this.select_hule(dapai))      this._callback({hule: '-'});
        else if (m = this.select_fulou(dapai)) this._callback({fulou: m});
        else if (this.select_daopai())         this._callback({daopai: '-'});
        else                                   this._callback();
    }

    action_fulou(fulou) {
        if (fulou.l != this._menfeng) return this._callback();
        this._callback({dapai: this.select_dapai()});
    }

    action_gang(gang) {
        if (gang.l == this._menfeng) return this._callback();
        if (this.select_hule(gang, true)) this._callback({hule: '-'});
        else                              this._callback();
    }

    action_hule(hule)     { this._callback() }
    action_pingju(pingju) { this._callback() }
    action_jieju(jieju)   { this._callback() }


    select_hule(data, hupai) {

        if (! data) return this.allow_hule(this.shoupai, null, hupai);

        if (data.m && data.m.match(/^[mpsz]\d{4}$/)) return false;
        let d = ['','+','=','-'][(4 + this._model.lunban - this._menfeng) % 4];
        let p = data.m ? data.m[0] + data.m.substr(-1) + d
                       : data.p.substr(0,2) + d;
        return this.allow_hule(this.shoupai, p, hupai);
    }

    select_pingju() {
        if (Majiang.Util.xiangting(this.shoupai) < 4) return false;
        return this.allow_pingju(this.shoupai);
    }

    select_fulou(dapai) {}

    select_gang() {
        let n_xiangting = Majiang.Util.xiangting(this.shoupai);
        for (let m of this.get_gang_mianzi(this.shoupai)) {
            let shoupai = this.shoupai.clone().gang(m);
            if (Majiang.Util.xiangting(shoupai) == n_xiangting) return m;
        }
    }

    select_dapai() {

        let dapai, max = 0;
        let n_xiangting = Majiang.Util.xiangting(this.shoupai);
        for (let p of this.get_dapai(this.shoupai)) {
            if (! dapai) dapai = p;
            let shoupai = this.shoupai.clone().dapai(p);
            if (Majiang.Util.xiangting(shoupai) > n_xiangting) continue;

            let x = 0;
            for (let tp of Majiang.Util.tingpai(shoupai)) {
                x += 4 - shoupai._bingpai[tp[0]][tp[1]];
            }
            if (x >= max) {
                max = x;
                dapai = p;
            }
        }
        if (this.select_lizhi(dapai)) dapai += '*';
        return dapai;
    }

    select_lizhi(p) {
        return this.allow_lizhi(this.shoupai, p);
    }

    select_daopai() {
        return this._model.shan.paishu == 0
            && Majiang.Util.xiangting(this.shoupai) == 0
    }
}
