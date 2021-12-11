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
        test('牌数が減算されること', ()=>{
            const suanpai = init_suanpai({baopai:'z1'});
            suanpai.kaigang({ baopai: 's0' });
            assert.deepEqual(suanpai._paishu.s, [0,4,4,4,4,3,4,4,4,4]);
        });
    });
});
