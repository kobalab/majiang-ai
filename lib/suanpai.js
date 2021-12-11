/*
 *  SuanPai
 */
"use strict";

module.exports = class SuanPai {

    constructor(hongpai) {

        this._paishu = {
            m: [hongpai.m, 4,4,4,4,4,4,4,4,4],
            p: [hongpai.p, 4,4,4,4,4,4,4,4,4],
            s: [hongpai.s, 4,4,4,4,4,4,4,4,4],
            z: [        0, 4,4,4,4,4,4,4]
        };
        this._zhuangfeng;
        this._menfeng;
    }

    decrease(p) {
        this._paishu[p[0]][p[1]]--;
        if (p[1] == 0) this._paishu[p[0]][5]--;
    }

    qipai(qipai, menfeng) {

        this._zhuangfeng = qipai.zhuangfeng
        this._menfeng    = menfeng;

        this.decrease(qipai.baopai);

        let paistr = qipai.shoupai[menfeng];
        for (let suitstr of paistr.match(/[mpsz]\d[\d\+\=\-]*/g) || []) {
            let s = suitstr[0];
            for (let n of suitstr.match(/\d/g)) {
                this.decrease(s+n);
            }
        }
    }

    zimo(zimo) {
        if (zimo.l == this._menfeng) this.decrease(zimo.p);
    }

    dapai(dapai) {
        if (dapai.l != this._menfeng) this.decrease(dapai.p);
    }

    fulou(fulou) {
        if (fulou.l != this._menfeng) {
            let s = fulou.m[0];
            for (let n of fulou.m.match(/\d(?![\+\=\-])/g)) {
                this.decrease(s+n);
            }
        }
    }

    gang(gang) {
        if (gang.l != this._menfeng) {
            if (gang.m.match(/^[mpsz]\d{4}$/)) {
                let s = gang.m[0];
                for (let n of gang.m.match(/\d/g)) {
                    this.decrease(s+n);
                }
            }
            else {
                let s = gang.m[0], n = gang.m.substr(-1);
                this.decrease(s+n);
            }
        }
    }

    kaigang(kaigang) {
        this.decrease(kaigang.baopai);
    }
}
