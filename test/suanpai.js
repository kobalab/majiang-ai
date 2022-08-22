const assert = require('assert');

const SuanPai = require('../lib/suanpai');
const Majiang = require('@kobalab/majiang-core');

function init_suanpai(param = {}) {

    const suanpai = new SuanPai({m:1,p:1,s:1});

    let qipai = { zhuangfeng: 0, jushu: 0, changbang: 0, lizhibang: 0,
                  defen: [ 25000, 25000, 25000, 25000 ], baopai: 'm1',
                  shoupai: ['','','',''] };
    let menfeng            = param.menfeng ?? 0;
    qipai.baopai           = param.baopai  ?? 'm1';
    qipai.shoupai[menfeng] = param.shoupai ?? '';

    suanpai.qipai(qipai, menfeng);

    return suanpai;
}

suite('SuanPai', ()=>{

    test('モジュールが存在すること', ()=> assert.ok(SuanPai));

    suite('constructor(hongpai)', ()=>{
        const suanpai = new SuanPai({m:1,p:2,s:3});
        test('インスタンスが生成できること', ()=>assert.ok(suanpai));
        test('牌数が正しいこと', ()=>
            assert.deepEqual(suanpai._paishu,
                { m: [1,4,4,4,4,4,4,4,4,4],
                  p: [2,4,4,4,4,4,4,4,4,4],
                  s: [3,4,4,4,4,4,4,4,4,4],
                  z: [0,4,4,4,4,4,4,4] }));
    });

    suite('qipai(qipai)', ()=>{
        const suanpai = new SuanPai({m:1,p:1,s:1});
        suanpai.qipai({ zhuangfeng: 1, baopai: 'm1',
                        shoupai: ['','','m123p406s789z1122',''] }, 2);
        test('場風が正しいこと', ()=> assert.equal(suanpai._zhuangfeng, 1));
        test('自風が正しいこと', ()=> assert.equal(suanpai._menfeng, 2));
        test('ドラが正しいこと', ()=> assert.deepEqual(suanpai._baopai, ['m1']));
        test('牌数が正しいこと', ()=>
            assert.deepEqual(suanpai._paishu,
                { m: [1,2,3,3,4,4,4,4,4,4],
                  p: [0,4,4,4,3,3,3,4,4,4],
                  s: [1,4,4,4,4,4,4,3,3,3],
                  z: [0,2,2,4,4,4,4,4] }));
        test('副露のある手牌でも動作すること', ()=>{
            const suanpai = new SuanPai({m:1,p:1,s:1});
            suanpai.qipai({ zhuangfeng: 1, baopai: 'm1',
                            shoupai: ['','','p406s789z1122,m12-3',''] }, 2);
            assert.deepEqual(suanpai._paishu,
                { m: [1,2,3,3,4,4,4,4,4,4],
                  p: [0,4,4,4,3,3,3,4,4,4],
                  s: [1,4,4,4,4,4,4,3,3,3],
                  z: [0,2,2,4,4,4,4,4] });
        });
        test('空の手牌でも動作すること', ()=>{
            const suanpai = new SuanPai({m:1,p:1,s:1});
            suanpai.qipai({ zhuangfeng: 1, baopai: 'm1',
                            shoupai: ['','','_____________',''] }, 2);
            assert.deepEqual(suanpai._paishu,
                { m: [1,3,4,4,4,4,4,4,4,4],
                  p: [1,4,4,4,4,4,4,4,4,4],
                  s: [1,4,4,4,4,4,4,4,4,4],
                  z: [0,4,4,4,4,4,4,4] });
        });
    });

    suite('zimo(zimo)', ()=>{
        test('自分の手番', ()=>{
            const suanpai = init_suanpai({baopai:'z1'});
            suanpai.zimo({ l: 0, p: 'm0' });
            assert.deepEqual(suanpai._paishu.m, [0,4,4,4,4,3,4,4,4,4]);
        });
        test('他者の手番', ()=>{
            const suanpai = init_suanpai({baopai:'z1'});
            suanpai.zimo({ l: 1, p: 'm0' });
            assert.deepEqual(suanpai._paishu.m, [1,4,4,4,4,4,4,4,4,4]);
        });
    });

    suite('dapai(dapai)', ()=>{
        test('自分の手番', ()=>{
            const suanpai = init_suanpai({baopai:'z1'});
            suanpai.dapai({ l: 0, p: 'm0' });
            assert.deepEqual(suanpai._paishu.m, [1,4,4,4,4,4,4,4,4,4]);
        });
        test('他者の手番', ()=>{
            const suanpai = init_suanpai({baopai:'z1'});
            suanpai.dapai({ l: 1, p: 'm0' });
            assert.deepEqual(suanpai._paishu.m, [0,4,4,4,4,3,4,4,4,4]);
        });
    });

    suite('fulou(fulou)', ()=>{
        test('自分の手番', ()=>{
            const suanpai = init_suanpai({baopai:'z1'});
            suanpai.fulou({ l: 0, m: 'p34-0' });
            assert.deepEqual(suanpai._paishu.p, [1,4,4,4,4,4,4,4,4,4]);
        });
        test('他者の手番', ()=>{
            const suanpai = init_suanpai({baopai:'z1'});
            suanpai.fulou({ l: 1, m: 'p34-0' });
            assert.deepEqual(suanpai._paishu.p, [0,4,4,3,4,3,4,4,4,4]);
        });
    });

    suite('gang(gang)', ()=>{
        test('自分の手番', ()=>{
            const suanpai = init_suanpai({baopai:'z1'});
            suanpai.gang({ l: 0, m: 's5550' });
            assert.deepEqual(suanpai._paishu.s, [1,4,4,4,4,4,4,4,4,4]);
        });
        test('他者の手番(暗槓)', ()=>{
            const suanpai = init_suanpai({baopai:'z1'});
            suanpai.gang({ l: 1, m: 's5550' });
            assert.deepEqual(suanpai._paishu.s, [0,4,4,4,4,0,4,4,4,4]);
        });
        test('他者の手番(加槓)', ()=>{
            const suanpai = init_suanpai({baopai:'z1'});
            suanpai.gang({ l: 1, m: 's555+0' });
            assert.deepEqual(suanpai._paishu.s, [0,4,4,4,4,3,4,4,4,4]);
        });
    });

    suite('kaigang(kaigang)', ()=>{
        test('ドラが追加されること', ()=>{
            const suanpai = init_suanpai({baopai:'z1'});
            suanpai.kaigang({ baopai: 's0' });
            assert.deepEqual(suanpai._baopai, ['z1','s0']);
        });
        test('牌数が減算されること', ()=>{
            const suanpai = init_suanpai({baopai:'z1'});
            suanpai.kaigang({ baopai: 's0' });
            assert.deepEqual(suanpai._paishu.s, [0,4,4,4,4,3,4,4,4,4]);
        });
    });

    suite('paishu_all()', ()=>{
        let suanpai = init_suanpai({shoupai:'m456p406s999z1122',baopai:'z1'});
        test('牌数を全て返すこと', function(){
            assert.deepEqual(suanpai.paishu_all(),
                            {m0:1,m1:4,m2:4,m3:4,m4:3,m5:2,m6:3,m7:4,m8:4,m9:4,
                             p0:0,p1:4,p2:4,p3:4,p4:3,p5:3,p6:3,p7:4,p8:4,p9:4,
                             s0:1,s1:4,s2:4,s3:4,s4:4,s5:3,s6:4,s7:4,s8:4,s9:1,
                                  z1:1,z2:2,z3:4,z4:4,z5:4,z6:4,z7:4});
        });
    });

    suite('paijia(p)', ()=>{
        function paijia_all(suanpai) {
            let paijia = {};
            for (let s of ['m','p','s','z']) {
                paijia[s] = [];
                for (let n = 0; n < suanpai._paishu[s].length; n++) {
                    paijia[s][n] = suanpai.paijia(s+n);
                }
            }
            return paijia;
        }
        test('牌価値の初期値が正しいこと', ()=>{
            const suanpai = new SuanPai({m:0,p:1,s:2});
            assert.deepEqual(paijia_all(suanpai), {
                m: [40,12,16,20,20,20,20,20,16,12],
                p: [42,12,16,21,21,21,21,21,16,12],
                s: [44,12,16,22,22,22,22,22,16,12],
                z: [ 0,16, 4, 4, 4, 8, 8, 8]
            });
        });
        test('配牌後の牌価値が正しいこと', ()=>{
            const suanpai = init_suanpai({shoupai:'m233p055s778z1123',
                                          baopai:'z1'});
            suanpai.kaigang({baopai:'z1'});
            assert.deepEqual(paijia_all(suanpai), {
                m: [38, 8, 9,17,17,19,21,21,16,12],
                p: [34,12,16,17,14,17,14,17,16,12],
                s: [38,12,16,21,21,19,17,17, 9, 8],
                z: [ 0, 0,48, 3, 4, 8, 8, 8],
            });
        });
    });

    suite('make_paijia(shoupai)', ()=>{
        test('一色手を狙う場合、染め色の孤立牌の評価値は2倍とする', ()=>{
            const suanpai = init_suanpai();
            const paijia = suanpai.make_paijia(
                            Majiang.Shoupai.fromString('p123s789z1234,p456-'));
            assert.equal(paijia('p1'), 24);
        });
        test('一色手を狙う場合、字牌の孤立牌の評価値は4倍とする', ()=>{
            const suanpai = init_suanpai();
            const paijia = suanpai.make_paijia(
                            Majiang.Shoupai.fromString('p123456s789z1234'));
            assert.equal(paijia('z4'), 16);
        });
        test('風牌が9枚以上ある場合は、風牌の評価値を8倍とする', ()=>{
            const suanpai = init_suanpai();
            const paijia = suanpai.make_paijia(
                            Majiang.Shoupai.fromString('m12p34z111222,z333='));
            assert.equal(paijia('z4'), 32);
        });
        test('三元牌が6枚以上ある場合は、三元牌の評価値を8倍とする', ()=>{
            const suanpai = init_suanpai();
            const paijia = suanpai.make_paijia(
                            Majiang.Shoupai.fromString('m123p4567z555,z666='));
            assert.equal(paijia('z7'), 64);
        });
        test('それ以外の場合は評価値は変化なし', ()=>{
            const suanpai = init_suanpai();
            const paijia = suanpai.make_paijia(
                            Majiang.Shoupai.fromString('m123p456s789z1123'));
            assert.equal(paijia('p1'), 12);
        });
    });

    suite('suan_weixian(p, l, c)', ()=>{
        let suanpai = new SuanPai({m:1,p:1,s:1});
        test('現物: 0', ()=>{
            suanpai.dapai({l:1,p:'z1'});
            assert.equal(suanpai.suan_weixian('z1', 1), 0);
        })
        test('字牌 生牌: 8', ()=>{
            assert.equal(suanpai.suan_weixian('z2', 1), 8);
            suanpai.zimo({l:0,p:'z3'});
            assert.equal(suanpai.suan_weixian('z3', 1, 1), 8);
        });
        test('字牌 1枚見え: 3', ()=>{
            suanpai.dapai({l:2,p:'z2'});
            assert.equal(suanpai.suan_weixian('z2', 1), 3);
            suanpai.dapai({l:3,p:'z3'});
            assert.equal(suanpai.suan_weixian('z3', 1, 1), 3);
        });
        test('字牌 2枚見え: 1', ()=>{
            suanpai.dapai({l:2,p:'z2'});
            assert.equal(suanpai.suan_weixian('z2', 1), 1);
            suanpai.dapai({l:3,p:'z3'});
            assert.equal(suanpai.suan_weixian('z3', 1, 1), 1);
        });
        test('字牌 ラス牌: 0', ()=>{
            suanpai.dapai({l:2,p:'z2'});
            assert.equal(suanpai.suan_weixian('z2', 1), 0);
            suanpai.dapai({l:3,p:'z3'});
            assert.equal(suanpai.suan_weixian('z3', 1, 1), 0);
        });
        test('字牌 なし: 0', ()=>{
            suanpai.dapai({l:2,p:'z2'});
            assert.equal(suanpai.suan_weixian('z2', 1), 0);
            suanpai.dapai({l:0,p:'z3'});
            assert.equal(suanpai.suan_weixian('z3', 1, 1), 0);
        });
        test('数牌 無スジ(一九牌): 13', ()=>{
            assert.equal(suanpai.suan_weixian('m1', 1), 13);
            assert.equal(suanpai.suan_weixian('m9', 1), 13);
        });
        test('数牌 無スジ(二八牌): 16', ()=>{
            assert.equal(suanpai.suan_weixian('m2', 1), 16);
            assert.equal(suanpai.suan_weixian('m8', 1), 16);
        });
        test('数牌 無スジ(三七牌): 19', ()=>{
            assert.equal(suanpai.suan_weixian('m3', 1), 19);
            assert.equal(suanpai.suan_weixian('m7', 1), 19);
        });
        test('数牌 無スジ(四五六牌): 26', ()=>{
            assert.equal(suanpai.suan_weixian('m4', 1), 26);
            assert.equal(suanpai.suan_weixian('m5', 1), 26);
            assert.equal(suanpai.suan_weixian('m6', 1), 26);
        });
        test('数牌 スジ(一九牌): 3', ()=>{
            suanpai.dapai({l:1,p:'m4'});
            assert.equal(suanpai.suan_weixian('m1', 1), 3);
            suanpai.dapai({l:1,p:'m6'});
            assert.equal(suanpai.suan_weixian('m9', 1), 3);
        });
        test('数牌 スジ(二八牌): 6', ()=>{
            suanpai.dapai({l:1,p:'m5'});
            assert.equal(suanpai.suan_weixian('m2', 1), 6);
            assert.equal(suanpai.suan_weixian('m8', 1), 6);
        });
        test('数牌 スジ(三七牌): 9', ()=>{
            assert.equal(suanpai.suan_weixian('m3', 1), 9);
            assert.equal(suanpai.suan_weixian('m7', 1), 9);
        });
        test('数牌 片スジ(四五六牌): 16', ()=>{
            suanpai.dapai({l:1,p:'p1'});
            assert.equal(suanpai.suan_weixian('p4', 1), 16);
            suanpai.dapai({l:1,p:'p2'});
            assert.equal(suanpai.suan_weixian('p5', 1), 16);
            suanpai.dapai({l:1,p:'p3'});
            assert.equal(suanpai.suan_weixian('p6', 1), 16);
        });
        test('数牌 両スジ(四五六牌): 6', ()=>{
            suanpai.dapai({l:1,p:'p7'});
            assert.equal(suanpai.suan_weixian('p4', 1), 6);
            suanpai.dapai({l:1,p:'p8'});
            assert.equal(suanpai.suan_weixian('p0', 1), 6);
            suanpai.dapai({l:1,p:'p9'});
            assert.equal(suanpai.suan_weixian('p6', 1), 6);
        });
        test('数牌 五のカベ 三七牌: 9', ()=>{
            suanpai.gang({l:2,m:'s5550'});
            assert.equal(suanpai.suan_weixian('s3', 1), 9);
            assert.equal(suanpai.suan_weixian('s7', 1), 9);
        });
        test('数牌 五のカベ 四六牌: 13', ()=>{
            assert.equal(suanpai.suan_weixian('s4', 1), 13);
            assert.equal(suanpai.suan_weixian('s6', 1), 13);
        });
        test('数牌 二のカベ 生牌: 3', ()=>{
            suanpai.gang({l:2,m:'s2222'});
            assert.equal(suanpai.suan_weixian('s1', 1), 3);
        });
        test('数牌 二のカベ 1枚見え: 3', ()=>{
            suanpai.dapai({l:2,p:'s1'});
            assert.equal(suanpai.suan_weixian('s1', 1), 3);
        });
        test('数牌 二のカベ 2枚見え: 1', ()=>{
            suanpai.dapai({l:2,p:'s1'});
            assert.equal(suanpai.suan_weixian('s1', 1), 1);
        });
        test('数牌 二のカベ ラス牌: 0', ()=>{
            suanpai.dapai({l:2,p:'s1'});
            assert.equal(suanpai.suan_weixian('s1', 1), 0);
        });
        test('数牌 二のカベ なし: 0', ()=>{
            suanpai.dapai({l:2,p:'s1'});
            assert.equal(suanpai.suan_weixian('s1', 1), 0);
        });
    });

    suite('suan_weixian_all(bingpai)', ()=>{
        let paistr = 'm4579p478s6z14457';
        let suanpai = init_suanpai({shoupai:paistr,baopai:'p7',menfeng:3});
        let shoupai = Majiang.Shoupai.fromString(paistr);
        test('リーチなし', ()=>{
            assert.ifError(suanpai.suan_weixian_all(shoupai._bingpai));
        });
        test('リーチあり', ()=>{
            suanpai.dapai({l:1,p:'m3*'});
            const weixian = suanpai.suan_weixian_all(shoupai._bingpai);
            assert.equal(weixian('m0'), 26 / 544 * 100);
        });
        test('2人リーチ', ()=>{
            suanpai.dapai({l:0,p:'p3*'});
            const weixian = suanpai.suan_weixian_all(shoupai._bingpai);
            assert.equal(weixian('m0'), Math.max(26 / 515 * 100,
                                                 26 / 544 * 100 * 1.40))
        });
        test('全ての牌が安全', ()=>{
            let i = 0;
            for (let s of ['m','p','s','z']) {
                for (let n = 1; n <= (s == 'z' ? 7 : 9); n++) {
                    suanpai.dapai({ l: i++ % 4, p: s+n });
                }
            }
            const weixian = suanpai.suan_weixian_all(shoupai._bingpai);
            assert.equal(weixian('m0'), 0);
        });
    });
});
