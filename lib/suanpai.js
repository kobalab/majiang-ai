/*
 *  SuanPai
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

        this._dapai = [{},{},{},{}];
        this._lizhi = [];
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
        if (dapai.l != this._menfeng) {
            this.decrease(dapai.p);
            if (dapai.p.slice(-1) == '*') this._lizhi[dapai.l] = true;
        }
        let p = dapai.p[0] + (+dapai.p[1]||5);
        this._dapai[dapai.l][p] = true;
        for (let l = 0; l < 4; l++) {
            if (this._lizhi[l]) this._dapai[l][p] = true;
        }
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
                let s = gang.m[0], n = gang.m.slice(-1);
                this.decrease(s+n);
            }
        }
    }

    kaigang(kaigang) {
        this._baopai.push(kaigang.baopai);
        this.decrease(kaigang.baopai);
    }

    paishu_all() {
        let paishu = {};
        for (let s of ['m','p','s','z']) {
            for (let n of s == 'z' ? [1,2,3,4,5,6,7] : [0,1,2,3,4,5,6,7,8,9]) {
                paishu[s+n] = n == 5 ? this._paishu[s][5] - this._paishu[s][0]
                                     : this._paishu[s][n];
            }
        }
        return paishu;
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

    make_paijia(shoupai) {

        let n_suit = {};
        for (let s of ['m','p','s','z']) {
            n_suit[s] = shoupai._bingpai[s].slice(1).reduce((x, y)=> x + y);
        }
        let n_sifeng  = shoupai._bingpai.z.slice(1,5).reduce((x, y)=> x + y);
        let n_sanyuan = shoupai._bingpai.z.slice(5).reduce((x, y)=> x + y);
        for (let m of shoupai._fulou) {
            n_suit[m[0]] += 3;
            if (m.match(/^z[1234]/)) n_sifeng  += 3;
            if (m.match(/^z[567]/))  n_sanyuan += 3;
        }

        let paijia = {};

        return (p)=> paijia[p] ?? ( paijia[p] = this.paijia(p)
                    * (  p.match(/^z[1234]/) && n_sifeng  >= 9 ? 8
                       : p.match(/^z[567]/)  && n_sanyuan >= 6 ? 8
                       : p[0] == 'z'
                            && Math.max(...['m','p','s'].map(s=>n_suit[s]))
                                      + n_suit.z >= 10         ? 4
                       : n_suit[p[0]] + n_suit.z >= 10         ? 2
                       :                                         1  ) );
    }

    suan_weixian(p, l, c) {

        let s = p[0], n = +p[1]||5;

        let r = 0;
        if (this._dapai[l][s+n]) return r;

        const paishu = this._paishu[s];

        r += paishu[n] - (c ? 0 : 1) == 3 ? (s == 'z' ? 8 : 3)
           : paishu[n] - (c ? 0 : 1) == 2 ?             3
           : paishu[n] - (c ? 0 : 1) == 1 ?             1
           :                                            0;
        if (s == 'z') return r;

        r += n - 2 <  1                              ?  0
           : Math.min(paishu[n-2], paishu[n-1]) == 0 ?  0
           : n - 2 == 1                              ?  3
           : this._dapai[l][s+(n-3)]                 ?  0
           :                                           10;
        r += n - 1 <  1                              ?  0
           : n + 1 >  9                              ?  0
           : Math.min(paishu[n-1], paishu[n+1]) == 0 ?  0
           :                                            3;
        r += n + 2 >  9                              ?  0
           : Math.min(paishu[n+1], paishu[n+2]) == 0 ?  0
           : n + 2 == 9                              ?  3
           : this._dapai[l][s+(n+3)]                 ?  0
           :                                           10;
        return r;
    }

    suan_weixian_all(bingpai) {

        let weixian_all;
        for (let l = 0; l < 4; l++) {
            if (! this._lizhi[l]) continue;
            if (! weixian_all) weixian_all = {};
            let weixian = {}, sum = 0;
            for (let s of ['m','p','s','z']) {
                for (let n = 1; n < this._paishu[s].length; n++) {
                    weixian[s+n] = this.suan_weixian(s+n, l, bingpai[s][n]);
                    sum += weixian[s+n];
                }
            }
            for (let p of Object.keys(weixian)) {
                weixian[p] = weixian[p] / (sum || 1) * 100
                                                     * (l == 0 ? 1.40 : 1);
                if (! weixian_all[p]) weixian_all[p] = 0;
                weixian_all[p] = Math.max(weixian_all[p], weixian[p]);
            }
        }
        if (weixian_all) return (p)=>weixian_all[p[0]+(+p[1]||5)];
    }
}
