const assert = require('assert');

const SuanPai = require('../lib/suanpai');

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
        test('配牌後の牌価値が正しいこと', function(){
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

    suite('suan_weixian(p, l)', function(){
        let suanpai = new SuanPai({m:1,p:1,s:1});
        test('現物: 0', function(){
            suanpai.dapai({l:1,p:'z1'});
            assert.equal(suanpai.suan_weixian('z1', 1), 0);
        })
        test('字牌 生牌: 3', function(){
            assert.equal(suanpai.suan_weixian('z2', 1), 3);
        });
        test('字牌 1枚見え: 3', function(){
            suanpai.dapai({l:2,p:'z2'});
            assert.equal(suanpai.suan_weixian('z2', 1), 3);
        });
        test('字牌 2枚見え: 2', function(){
            suanpai.dapai({l:2,p:'z2'});
            assert.equal(suanpai.suan_weixian('z2', 1), 2);
        });
        test('字牌 3枚見え: 1', function(){
            suanpai.dapai({l:2,p:'z2'});
            assert.equal(suanpai.suan_weixian('z2', 1), 1);
        });
        test('字牌 ラス牌: 0', function(){
            suanpai.dapai({l:2,p:'z2'});
            assert.equal(suanpai.suan_weixian('z2', 1), 0);
        });
        test('数牌 無スジ(一九牌): 6', function(){
            assert.equal(suanpai.suan_weixian('m1', 1), 6);
            assert.equal(suanpai.suan_weixian('m9', 1), 6);
        });
        test('数牌 無スジ(二八牌): 8', function(){
            assert.equal(suanpai.suan_weixian('m2', 1), 8);
            assert.equal(suanpai.suan_weixian('m8', 1), 8);
        });
        test('数牌 無スジ(三七牌): 8', function(){
            assert.equal(suanpai.suan_weixian('m3', 1), 8);
            assert.equal(suanpai.suan_weixian('m7', 1), 8);
        });
        test('数牌 無スジ(四五六牌): 12', function(){
            assert.equal(suanpai.suan_weixian('m4', 1), 12);
            assert.equal(suanpai.suan_weixian('m5', 1), 12);
            assert.equal(suanpai.suan_weixian('m6', 1), 12);
        });
        test('数牌 スジ(一九牌): 3', function(){
            suanpai.dapai({l:1,p:'m4'});
            assert.equal(suanpai.suan_weixian('m1', 1), 3);
            suanpai.dapai({l:1,p:'m6'});
            assert.equal(suanpai.suan_weixian('m9', 1), 3);
        });
        test('数牌 スジ(二八牌): 4', function(){
            suanpai.dapai({l:1,p:'m5'});
            assert.equal(suanpai.suan_weixian('m2', 1), 4);
            assert.equal(suanpai.suan_weixian('m8', 1), 4);
        });
        test('数牌 スジ(三七牌): 5', function(){
            assert.equal(suanpai.suan_weixian('m3', 1), 5);
            assert.equal(suanpai.suan_weixian('m7', 1), 5);
        });
        test('数牌 片スジ(四五六牌): 8', function(){
            suanpai.dapai({l:1,p:'p1'});
            assert.equal(suanpai.suan_weixian('p4', 1), 8);
            suanpai.dapai({l:1,p:'p2'});
            assert.equal(suanpai.suan_weixian('p5', 1), 8);
            suanpai.dapai({l:1,p:'p3'});
            assert.equal(suanpai.suan_weixian('p6', 1), 8);
        });
        test('数牌 両スジ(四五六牌): 4', function(){
            suanpai.dapai({l:1,p:'p7'});
            assert.equal(suanpai.suan_weixian('p4', 1), 4);
            suanpai.dapai({l:1,p:'p8'});
            assert.equal(suanpai.suan_weixian('p0', 1), 4);
            suanpai.dapai({l:1,p:'p9'});
            assert.equal(suanpai.suan_weixian('p6', 1), 4);
        });
    });
});
