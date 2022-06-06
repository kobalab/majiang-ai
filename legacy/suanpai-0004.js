/*
 *  SuanPai 0004
 *    - paijia()
 *      - 搭子のできやすさから「牌の評価値」を求める
 */
"use strict";

const Majiang = require('@kobalab/majiang-core');

module.exports = class SuanPai {

    constructor(hongpai) {

        this._paishu = {
            m: [hongpai.m, 4,4,4,4,4,4,4,4,4],
            p: [hongpai.p, 4,4,4,4,4,4,4,4,4],
            s: [hongpai.s, 4,4,4,4,4,4,4,4,4],
            z: [        0, 4,4,4,4,4,4,4]
        };
        this._zhuangfeng = 0;
        this._menfeng    = 0;
        this._baopai     = [];
    }

    decrease(p) {
        this._paishu[p[0]][p[1]]--;
        if (p[1] == 0) this._paishu[p[0]][5]--;
    }

    qipai(qipai, menfeng) {

        this._zhuangfeng = qipai.zhuangfeng
        this._menfeng    = menfeng;

        this._baopai = [ qipai.baopai ];
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
        this._baopai.push(kaigang.baopai);
        this.decrease(kaigang.baopai);
    }

    paijia(p) {

        const weight = (s, n)=>{
            if (n < 1 || 9 < n) return 0;
            let rv = 1;
            for (let p of this._baopai) {
                if (s+n == Majiang.Shan.zhenbaopai(p)) rv *= 2;
            }
            return rv;
        }

        let rv = 0;
        let s = p[0], n = +p[1]||5;
        const min = Math.min, max = Math.max, num = this._paishu[s];

        if (s == 'z') {
            rv = p[1] != '0' ? num[n] * weight(s,n) : 0;
            if (n == this._zhuangfeng + 1) rv *= 2;
            if (n == this._menfeng + 1)    rv *= 2;
            if (5 <= n && n <= 7)          rv *= 2;
        }
        else {
            let left   = (1 <= n-2)             ? min(num[n-2], num[n-1]) : 0;
            let center = (1 <= n-1 && n+1 <= 9) ? min(num[n-1], num[n+1]) : 0;
            let right  =             (n+2 <= 9) ? min(num[n+1], num[n+2]) : 0;
            let n_pai = [
                left,
                max(left, center),
                num[n],
                max(center, right),
                right
            ];
            rv = n_pai[0] * weight(s, n-2)
               + n_pai[1] * weight(s, n-1)
               + n_pai[2] * weight(s, n)
               + n_pai[3] * weight(s, n+1)
               + n_pai[4] * weight(s, n+2);
            rv += ! num[0] ? 0
                  : n == 7 ? min(num[0], n_pai[0]) * weight(s, n-2)
                  : n == 6 ? min(num[0], n_pai[1]) * weight(s, n-1)
                  : n == 5 ? min(num[0], n_pai[2]) * weight(s, n)
                  : n == 4 ? min(num[0], n_pai[3]) * weight(s, n+1)
                  : n == 3 ? min(num[0], n_pai[4]) * weight(s, n+2)
                  :          0;
            if (p[1] == '0') rv *= 2;
        }
        rv *= weight(s, n);

        return rv;
    }

    make_paijia() {
        let paijia = {};
        return (p)=> paijia[p] ?? (paijia[p] = this.paijia(p));
    }
}
