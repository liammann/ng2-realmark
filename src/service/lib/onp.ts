/*
 * URL: https://github.com/cubicdaiya/onp
 *
 * Copyright (c) 2013 Tatsuhiko Kubo <cubicdaiya@gmail.com>
 * Copyright (c) 2016 Axosoft, LLC (www.axosoft.com)
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

/**
 * The algorithm implemented here is based on "An O(NP) Sequence Comparison Algorithm"
 * by described by Sun Wu, Udi Manber and Gene Myers
*/
export function onp(a_:any, b_:any) {
    var a:any          = a_,
        b:any          = b_,
        m:any          = a.length,
        n:any          = b.length,
        reverse:any    = false,
        ed:any         = null,
        offset:any     = m + 1,
        path:any       = [],
        pathposi:any   = [],
        ses:any        = [],
        lcs:any        = "",
        SES_DELETE:any = -1,
        SES_COMMON:any = 0,
        SES_ADD:any    = 1;

    var tmp1:any,
        tmp2:any;

    var init = function () {
        if (m >= n) {
            tmp1    = a;
            tmp2    = m;
            a       = b;
            b       = tmp1;
            m       = n;
            n       = tmp2;
            reverse = true;
            offset = m + 1;
        }
    };

    var P = function (x:any, y:any, k:any) {
        return {
            'x' : x,
            'y' : y,
            'k' : k,
        };
    };

    var seselem = function (elem:any, t:any) {
        return {
            'elem' : elem,
            't'    : t,
        };
    };

    var snake = function (k:any, p:any, pp:any) {
        var r:any, x:any, y:any;
        if (p > pp) {
            r = path[k-1+offset];
        } else {
            r = path[k+1+offset];
        }

        y = Math.max(p, pp);
        x = y - k;
        while (x < m && y < n && a[x] === b[y]) {
            ++x;
            ++y;
        }

        path[k+offset] = pathposi.length;
        pathposi[pathposi.length] =  P(x, y, r);
        return y;
    };

    var recordseq = function (epc:any) {
        var x_idx:any, y_idx:any, px_idx:any, py_idx:any, i;
        x_idx  = y_idx  = 1;
        px_idx = py_idx = 0;
        for (i=epc.length-1;i>=0;--i) {
            while(px_idx < epc[i].x || py_idx < epc[i].y) {
                if (epc[i].y - epc[i].x > py_idx - px_idx) {
                    if (reverse) {
                        ses[ses.length] =  seselem(b[py_idx], SES_DELETE);
                    } else {
                        ses[ses.length] =  seselem(b[py_idx], SES_ADD);
                    }
                    ++y_idx;
                    ++py_idx;
                } else if (epc[i].y - epc[i].x < py_idx - px_idx) {
                    if (reverse) {
                        ses[ses.length] =  seselem(a[px_idx], SES_ADD);
                    } else {
                        ses[ses.length] =  seselem(a[px_idx], SES_DELETE);
                    }
                    ++x_idx;
                    ++px_idx;
                } else {
                    ses[ses.length] =  seselem(a[px_idx], SES_COMMON);
                    lcs += a[px_idx];
                    ++x_idx;
                    ++y_idx;
                    ++px_idx;
                    ++py_idx;
                }
            }
        }
    };

    init();

    return {
        SES_DELETE : -1,
        SES_COMMON :  0,
        SES_ADD    :  1,
        editdistance : function () {
            return ed;
        },
        getlcs : function () {
            return lcs;
        },
        getses : function () {
            return ses;
        },
        compose : function () {
            var delta:any, size:any, fp:any, p:any, r:any, epc:any, i:any, k:any;
            delta  = n - m;
            size   = m + n + 3;
            fp     = {};
            for (i=0;i<size;++i) {
                fp[i] = -1;
                path[i] = -1;
            }
            p = -1;
            do {
                ++p;
                for (k=-p;k<=delta-1;++k) {
                    fp[k+offset] = snake(k, fp[k-1+offset]+1, fp[k+1+offset]);
                }
                for (k=delta+p;k>=delta+1;--k) {
                    fp[k+offset] = snake(k, fp[k-1+offset]+1, fp[k+1+offset]);
                }
                fp[delta+offset] = snake(delta, fp[delta-1+offset]+1, fp[delta+1+offset]);
            } while (fp[delta+offset] !== n);

            ed = delta + 2 * p;

            r = path[delta+offset];

            epc  = [];
            while (r !== -1) {
                epc[epc.length] =  P(pathposi[r].x, pathposi[r].y, null);
                r = pathposi[r].k;
            }
            recordseq(epc);
        }
    };
};