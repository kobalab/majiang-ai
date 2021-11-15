/*
 *  思考ルーチン 0000
 *      - 空応答を返すのみ
 */
"use strict";

const Majiang = require('@kobalab/majiang-core');

module.exports = class Player extends Majiang.Player {

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
        if (dapai.l == this._menfeng) return this._callback();
        let m;
        if      (this.select_hule(dapai)) this._callback({hule: '-'});
        else if (m = this.select_fulou()) this._callback({fulou: m});
        else                              this._callback();
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

    select_hule(data, hupai) {}
    select_pingju() {}
    select_fulou(dapai) {}
    select_gang() {}
    select_dapai() {}
    select_lizhi(p) {}
}
