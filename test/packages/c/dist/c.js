function Xt(e, t) {
  const n = /* @__PURE__ */ Object.create(null), r = e.split(",");
  for (let s = 0; s < r.length; s++)
    n[r[s]] = !0;
  return t ? (s) => !!n[s.toLowerCase()] : (s) => !!n[s];
}
const P = process.env.NODE_ENV !== "production" ? Object.freeze({}) : {}, Zt = process.env.NODE_ENV !== "production" ? Object.freeze([]) : [], ft = () => {
}, kt = /^on[^a-z]/, en = (e) => kt.test(e), D = Object.assign, tn = (e, t) => {
  const n = e.indexOf(t);
  n > -1 && e.splice(n, 1);
}, nn = Object.prototype.hasOwnProperty, m = (e, t) => nn.call(e, t), h = Array.isArray, K = (e) => be(e) === "[object Map]", pt = (e) => be(e) === "[object Set]", E = (e) => typeof e == "function", I = (e) => typeof e == "string", Ne = (e) => typeof e == "symbol", w = (e) => e !== null && typeof e == "object", rn = (e) => (w(e) || E(e)) && E(e.then) && E(e.catch), dt = Object.prototype.toString, be = (e) => dt.call(e), ht = (e) => be(e).slice(8, -1), _t = (e) => be(e) === "[object Object]", Fe = (e) => I(e) && e !== "NaN" && e[0] !== "-" && "" + parseInt(e, 10) === e, sn = (e) => {
  const t = /* @__PURE__ */ Object.create(null);
  return (n) => t[n] || (t[n] = e(n));
}, on = sn((e) => e.charAt(0).toUpperCase() + e.slice(1)), X = (e, t) => !Object.is(e, t), cn = (e, t, n) => {
  Object.defineProperty(e, t, {
    configurable: !0,
    enumerable: !1,
    value: n
  });
};
let Ye;
const Re = () => Ye || (Ye = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {});
function Ae(e) {
  if (h(e)) {
    const t = {};
    for (let n = 0; n < e.length; n++) {
      const r = e[n], s = I(r) ? fn(r) : Ae(r);
      if (s)
        for (const o in s)
          t[o] = s[o];
    }
    return t;
  } else if (I(e) || w(e))
    return e;
}
const ln = /;(?![^(]*\))/g, un = /:([^]+)/, an = /\/\*[^]*?\*\//g;
function fn(e) {
  const t = {};
  return e.replace(an, "").split(ln).forEach((n) => {
    if (n) {
      const r = n.split(un);
      r.length > 1 && (t[r[0].trim()] = r[1].trim());
    }
  }), t;
}
function je(e) {
  let t = "";
  if (I(e))
    t = e;
  else if (h(e))
    for (let n = 0; n < e.length; n++) {
      const r = je(e[n]);
      r && (t += r + " ");
    }
  else if (w(e))
    for (const n in e)
      e[n] && (t += n + " ");
  return t.trim();
}
const pn = (e) => I(e) ? e : e == null ? "" : h(e) || w(e) && (e.toString === dt || !E(e.toString)) ? JSON.stringify(e, gt, 2) : String(e), gt = (e, t) => t && t.__v_isRef ? gt(e, t.value) : K(t) ? {
  [`Map(${t.size})`]: [...t.entries()].reduce((n, [r, s]) => (n[`${r} =>`] = s, n), {})
} : pt(t) ? {
  [`Set(${t.size})`]: [...t.values()]
} : w(t) && !h(t) && !_t(t) ? String(t) : t;
function Ge(e, ...t) {
  console.warn(`[Vue warn] ${e}`, ...t);
}
let mt;
function dn(e, t = mt) {
  t && t.active && t.effects.push(e);
}
function hn() {
  return mt;
}
const ye = (e) => {
  const t = new Set(e);
  return t.w = 0, t.n = 0, t;
}, Et = (e) => (e.w & z) > 0, wt = (e) => (e.n & z) > 0, _n = ({ deps: e }) => {
  if (e.length)
    for (let t = 0; t < e.length; t++)
      e[t].w |= z;
}, gn = (e) => {
  const { deps: t } = e;
  if (t.length) {
    let n = 0;
    for (let r = 0; r < t.length; r++) {
      const s = t[r];
      Et(s) && !wt(s) ? s.delete(e) : t[n++] = s, s.w &= ~z, s.n &= ~z;
    }
    t.length = n;
  }
}, Ie = /* @__PURE__ */ new WeakMap();
let ee = 0, z = 1;
const De = 30;
let O;
const W = Symbol(process.env.NODE_ENV !== "production" ? "iterate" : ""), Ce = Symbol(process.env.NODE_ENV !== "production" ? "Map key iterate" : "");
class mn {
  constructor(t, n = null, r) {
    this.fn = t, this.scheduler = n, this.active = !0, this.deps = [], this.parent = void 0, dn(this, r);
  }
  run() {
    if (!this.active)
      return this.fn();
    let t = O, n = U;
    for (; t; ) {
      if (t === this)
        return;
      t = t.parent;
    }
    try {
      return this.parent = O, O = this, U = !0, z = 1 << ++ee, ee <= De ? _n(this) : Qe(this), this.fn();
    } finally {
      ee <= De && gn(this), z = 1 << --ee, O = this.parent, U = n, this.parent = void 0, this.deferStop && this.stop();
    }
  }
  stop() {
    O === this ? this.deferStop = !0 : this.active && (Qe(this), this.onStop && this.onStop(), this.active = !1);
  }
}
function Qe(e) {
  const { deps: t } = e;
  if (t.length) {
    for (let n = 0; n < t.length; n++)
      t[n].delete(e);
    t.length = 0;
  }
}
let U = !0;
const Nt = [];
function bt() {
  Nt.push(U), U = !1;
}
function Ot() {
  const e = Nt.pop();
  U = e === void 0 ? !0 : e;
}
function x(e, t, n) {
  if (U && O) {
    let r = Ie.get(e);
    r || Ie.set(e, r = /* @__PURE__ */ new Map());
    let s = r.get(n);
    s || r.set(n, s = ye());
    const o = process.env.NODE_ENV !== "production" ? { effect: O, target: e, type: t, key: n } : void 0;
    En(s, o);
  }
}
function En(e, t) {
  let n = !1;
  ee <= De ? wt(e) || (e.n |= z, n = !Et(e)) : n = !e.has(O), n && (e.add(O), O.deps.push(e), process.env.NODE_ENV !== "production" && O.onTrack && O.onTrack(
    D(
      {
        effect: O
      },
      t
    )
  ));
}
function j(e, t, n, r, s, o) {
  const i = Ie.get(e);
  if (!i)
    return;
  let c = [];
  if (t === "clear")
    c = [...i.values()];
  else if (n === "length" && h(e)) {
    const a = Number(r);
    i.forEach((d, l) => {
      (l === "length" || !Ne(l) && l >= a) && c.push(d);
    });
  } else
    switch (n !== void 0 && c.push(i.get(n)), t) {
      case "add":
        h(e) ? Fe(n) && c.push(i.get("length")) : (c.push(i.get(W)), K(e) && c.push(i.get(Ce)));
        break;
      case "delete":
        h(e) || (c.push(i.get(W)), K(e) && c.push(i.get(Ce)));
        break;
      case "set":
        K(e) && c.push(i.get(W));
        break;
    }
  const u = process.env.NODE_ENV !== "production" ? { target: e, type: t, key: n, newValue: r, oldValue: s, oldTarget: o } : void 0;
  if (c.length === 1)
    c[0] && (process.env.NODE_ENV !== "production" ? ie(c[0], u) : ie(c[0]));
  else {
    const a = [];
    for (const d of c)
      d && a.push(...d);
    process.env.NODE_ENV !== "production" ? ie(ye(a), u) : ie(ye(a));
  }
}
function ie(e, t) {
  const n = h(e) ? e : [...e];
  for (const r of n)
    r.computed && Xe(r, t);
  for (const r of n)
    r.computed || Xe(r, t);
}
function Xe(e, t) {
  (e !== O || e.allowRecurse) && (process.env.NODE_ENV !== "production" && e.onTrigger && e.onTrigger(D({ effect: e }, t)), e.scheduler ? e.scheduler() : e.run());
}
const wn = /* @__PURE__ */ Xt("__proto__,__v_isRef,__isVue"), St = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((e) => e !== "arguments" && e !== "caller").map((e) => Symbol[e]).filter(Ne)
), Ze = /* @__PURE__ */ Nn();
function Nn() {
  const e = {};
  return ["includes", "indexOf", "lastIndexOf"].forEach((t) => {
    e[t] = function(...n) {
      const r = p(this);
      for (let o = 0, i = this.length; o < i; o++)
        x(r, "get", o + "");
      const s = r[t](...n);
      return s === -1 || s === !1 ? r[t](...n.map(p)) : s;
    };
  }), ["push", "pop", "shift", "unshift", "splice"].forEach((t) => {
    e[t] = function(...n) {
      bt();
      const r = p(this)[t].apply(this, n);
      return Ot(), r;
    };
  }), e;
}
function bn(e) {
  const t = p(this);
  return x(t, "has", e), t.hasOwnProperty(e);
}
class xt {
  constructor(t = !1, n = !1) {
    this._isReadonly = t, this._shallow = n;
  }
  get(t, n, r) {
    const s = this._isReadonly, o = this._shallow;
    if (n === "__v_isReactive")
      return !s;
    if (n === "__v_isReadonly")
      return s;
    if (n === "__v_isShallow")
      return o;
    if (n === "__v_raw" && r === (s ? o ? Dt : It : o ? $n : yt).get(t))
      return t;
    const i = h(t);
    if (!s) {
      if (i && m(Ze, n))
        return Reflect.get(Ze, n, r);
      if (n === "hasOwnProperty")
        return bn;
    }
    const c = Reflect.get(t, n, r);
    return (Ne(n) ? St.has(n) : wn(n)) || (s || x(t, "get", n), o) ? c : S(c) ? i && Fe(n) ? c : c.value : w(c) ? s ? Tt(c) : Ct(c) : c;
  }
}
class On extends xt {
  constructor(t = !1) {
    super(!1, t);
  }
  set(t, n, r, s) {
    let o = t[n];
    if (L(o) && S(o) && !S(r))
      return !1;
    if (!this._shallow && (!Te(r) && !L(r) && (o = p(o), r = p(r)), !h(t) && S(o) && !S(r)))
      return o.value = r, !0;
    const i = h(t) && Fe(n) ? Number(n) < t.length : m(t, n), c = Reflect.set(t, n, r, s);
    return t === p(s) && (i ? X(r, o) && j(t, "set", n, r, o) : j(t, "add", n, r)), c;
  }
  deleteProperty(t, n) {
    const r = m(t, n), s = t[n], o = Reflect.deleteProperty(t, n);
    return o && r && j(t, "delete", n, void 0, s), o;
  }
  has(t, n) {
    const r = Reflect.has(t, n);
    return (!Ne(n) || !St.has(n)) && x(t, "has", n), r;
  }
  ownKeys(t) {
    return x(
      t,
      "iterate",
      h(t) ? "length" : W
    ), Reflect.ownKeys(t);
  }
}
class Vt extends xt {
  constructor(t = !1) {
    super(!0, t);
  }
  set(t, n) {
    return process.env.NODE_ENV !== "production" && Ge(
      `Set operation on key "${String(n)}" failed: target is readonly.`,
      t
    ), !0;
  }
  deleteProperty(t, n) {
    return process.env.NODE_ENV !== "production" && Ge(
      `Delete operation on key "${String(n)}" failed: target is readonly.`,
      t
    ), !0;
  }
}
const Sn = /* @__PURE__ */ new On(), xn = /* @__PURE__ */ new Vt(), Vn = /* @__PURE__ */ new Vt(!0), ze = (e) => e, Oe = (e) => Reflect.getPrototypeOf(e);
function ce(e, t, n = !1, r = !1) {
  e = e.__v_raw;
  const s = p(e), o = p(t);
  n || (X(t, o) && x(s, "get", t), x(s, "get", o));
  const { has: i } = Oe(s), c = r ? ze : n ? Ue : We;
  if (i.call(s, t))
    return c(e.get(t));
  if (i.call(s, o))
    return c(e.get(o));
  e !== s && e.get(t);
}
function le(e, t = !1) {
  const n = this.__v_raw, r = p(n), s = p(e);
  return t || (X(e, s) && x(r, "has", e), x(r, "has", s)), e === s ? n.has(e) : n.has(e) || n.has(s);
}
function ue(e, t = !1) {
  return e = e.__v_raw, !t && x(p(e), "iterate", W), Reflect.get(e, "size", e);
}
function ke(e) {
  e = p(e);
  const t = p(this);
  return Oe(t).has.call(t, e) || (t.add(e), j(t, "add", e, e)), this;
}
function et(e, t) {
  t = p(t);
  const n = p(this), { has: r, get: s } = Oe(n);
  let o = r.call(n, e);
  o ? process.env.NODE_ENV !== "production" && Rt(n, r, e) : (e = p(e), o = r.call(n, e));
  const i = s.call(n, e);
  return n.set(e, t), o ? X(t, i) && j(n, "set", e, t, i) : j(n, "add", e, t), this;
}
function tt(e) {
  const t = p(this), { has: n, get: r } = Oe(t);
  let s = n.call(t, e);
  s ? process.env.NODE_ENV !== "production" && Rt(t, n, e) : (e = p(e), s = n.call(t, e));
  const o = r ? r.call(t, e) : void 0, i = t.delete(e);
  return s && j(t, "delete", e, void 0, o), i;
}
function nt() {
  const e = p(this), t = e.size !== 0, n = process.env.NODE_ENV !== "production" ? K(e) ? new Map(e) : new Set(e) : void 0, r = e.clear();
  return t && j(e, "clear", void 0, void 0, n), r;
}
function ae(e, t) {
  return function(r, s) {
    const o = this, i = o.__v_raw, c = p(i), u = t ? ze : e ? Ue : We;
    return !e && x(c, "iterate", W), i.forEach((a, d) => r.call(s, u(a), u(d), o));
  };
}
function fe(e, t, n) {
  return function(...r) {
    const s = this.__v_raw, o = p(s), i = K(o), c = e === "entries" || e === Symbol.iterator && i, u = e === "keys" && i, a = s[e](...r), d = n ? ze : t ? Ue : We;
    return !t && x(
      o,
      "iterate",
      u ? Ce : W
    ), {
      // iterator protocol
      next() {
        const { value: l, done: f } = a.next();
        return f ? { value: l, done: f } : {
          value: c ? [d(l[0]), d(l[1])] : d(l),
          done: f
        };
      },
      // iterable protocol
      [Symbol.iterator]() {
        return this;
      }
    };
  };
}
function $(e) {
  return function(...t) {
    if (process.env.NODE_ENV !== "production") {
      const n = t[0] ? `on key "${t[0]}" ` : "";
      console.warn(
        `${on(e)} operation ${n}failed: target is readonly.`,
        p(this)
      );
    }
    return e === "delete" ? !1 : this;
  };
}
function Rn() {
  const e = {
    get(o) {
      return ce(this, o);
    },
    get size() {
      return ue(this);
    },
    has: le,
    add: ke,
    set: et,
    delete: tt,
    clear: nt,
    forEach: ae(!1, !1)
  }, t = {
    get(o) {
      return ce(this, o, !1, !0);
    },
    get size() {
      return ue(this);
    },
    has: le,
    add: ke,
    set: et,
    delete: tt,
    clear: nt,
    forEach: ae(!1, !0)
  }, n = {
    get(o) {
      return ce(this, o, !0);
    },
    get size() {
      return ue(this, !0);
    },
    has(o) {
      return le.call(this, o, !0);
    },
    add: $("add"),
    set: $("set"),
    delete: $("delete"),
    clear: $("clear"),
    forEach: ae(!0, !1)
  }, r = {
    get(o) {
      return ce(this, o, !0, !0);
    },
    get size() {
      return ue(this, !0);
    },
    has(o) {
      return le.call(this, o, !0);
    },
    add: $("add"),
    set: $("set"),
    delete: $("delete"),
    clear: $("clear"),
    forEach: ae(!0, !0)
  };
  return ["keys", "values", "entries", Symbol.iterator].forEach((o) => {
    e[o] = fe(
      o,
      !1,
      !1
    ), n[o] = fe(
      o,
      !0,
      !1
    ), t[o] = fe(
      o,
      !1,
      !0
    ), r[o] = fe(
      o,
      !0,
      !0
    );
  }), [
    e,
    n,
    t,
    r
  ];
}
const [
  yn,
  In,
  Dn,
  Cn
] = /* @__PURE__ */ Rn();
function He(e, t) {
  const n = t ? e ? Cn : Dn : e ? In : yn;
  return (r, s, o) => s === "__v_isReactive" ? !e : s === "__v_isReadonly" ? e : s === "__v_raw" ? r : Reflect.get(
    m(n, s) && s in r ? n : r,
    s,
    o
  );
}
const Tn = {
  get: /* @__PURE__ */ He(!1, !1)
}, vn = {
  get: /* @__PURE__ */ He(!0, !1)
}, Pn = {
  get: /* @__PURE__ */ He(!0, !0)
};
function Rt(e, t, n) {
  const r = p(n);
  if (r !== n && t.call(e, r)) {
    const s = ht(e);
    console.warn(
      `Reactive ${s} contains both the raw and reactive versions of the same object${s === "Map" ? " as keys" : ""}, which can lead to inconsistencies. Avoid differentiating between the raw and reactive versions of an object and only use the reactive version if possible.`
    );
  }
}
const yt = /* @__PURE__ */ new WeakMap(), $n = /* @__PURE__ */ new WeakMap(), It = /* @__PURE__ */ new WeakMap(), Dt = /* @__PURE__ */ new WeakMap();
function Mn(e) {
  switch (e) {
    case "Object":
    case "Array":
      return 1;
    case "Map":
    case "Set":
    case "WeakMap":
    case "WeakSet":
      return 2;
    default:
      return 0;
  }
}
function Fn(e) {
  return e.__v_skip || !Object.isExtensible(e) ? 0 : Mn(ht(e));
}
function Ct(e) {
  return L(e) ? e : Ke(
    e,
    !1,
    Sn,
    Tn,
    yt
  );
}
function Tt(e) {
  return Ke(
    e,
    !0,
    xn,
    vn,
    It
  );
}
function pe(e) {
  return Ke(
    e,
    !0,
    Vn,
    Pn,
    Dt
  );
}
function Ke(e, t, n, r, s) {
  if (!w(e))
    return process.env.NODE_ENV !== "production" && console.warn(`value cannot be made reactive: ${String(e)}`), e;
  if (e.__v_raw && !(t && e.__v_isReactive))
    return e;
  const o = s.get(e);
  if (o)
    return o;
  const i = Fn(e);
  if (i === 0)
    return e;
  const c = new Proxy(
    e,
    i === 2 ? r : n
  );
  return s.set(e, c), c;
}
function B(e) {
  return L(e) ? B(e.__v_raw) : !!(e && e.__v_isReactive);
}
function L(e) {
  return !!(e && e.__v_isReadonly);
}
function Te(e) {
  return !!(e && e.__v_isShallow);
}
function ve(e) {
  return B(e) || L(e);
}
function p(e) {
  const t = e && e.__v_raw;
  return t ? p(t) : e;
}
function An(e) {
  return cn(e, "__v_skip", !0), e;
}
const We = (e) => w(e) ? Ct(e) : e, Ue = (e) => w(e) ? Tt(e) : e;
function S(e) {
  return !!(e && e.__v_isRef === !0);
}
function jn(e) {
  return S(e) ? e.value : e;
}
const zn = {
  get: (e, t, n) => jn(Reflect.get(e, t, n)),
  set: (e, t, n, r) => {
    const s = e[t];
    return S(s) && !S(n) ? (s.value = n, !0) : Reflect.set(e, t, n, r);
  }
};
function Hn(e) {
  return B(e) ? e : new Proxy(e, zn);
}
const J = [];
function Kn(e) {
  J.push(e);
}
function Wn() {
  J.pop();
}
function b(e, ...t) {
  if (process.env.NODE_ENV === "production")
    return;
  bt();
  const n = J.length ? J[J.length - 1].component : null, r = n && n.appContext.config.warnHandler, s = Un();
  if (r)
    q(
      r,
      n,
      11,
      [
        e + t.join(""),
        n && n.proxy,
        s.map(
          ({ vnode: o }) => `at <${Lt(n, o.type)}>`
        ).join(`
`),
        s
      ]
    );
  else {
    const o = [`[Vue warn]: ${e}`, ...t];
    s.length && o.push(`
`, ...Bn(s)), console.warn(...o);
  }
  Ot();
}
function Un() {
  let e = J[J.length - 1];
  if (!e)
    return [];
  const t = [];
  for (; e; ) {
    const n = t[0];
    n && n.vnode === e ? n.recurseCount++ : t.push({
      vnode: e,
      recurseCount: 0
    });
    const r = e.component && e.component.parent;
    e = r && r.vnode;
  }
  return t;
}
function Bn(e) {
  const t = [];
  return e.forEach((n, r) => {
    t.push(...r === 0 ? [] : [`
`], ...Jn(n));
  }), t;
}
function Jn({ vnode: e, recurseCount: t }) {
  const n = t > 0 ? `... (${t} recursive calls)` : "", r = e.component ? e.component.parent == null : !1, s = ` at <${Lt(
    e.component,
    e.type,
    r
  )}`, o = ">" + n;
  return e.props ? [s, ...qn(e.props), o] : [s + o];
}
function qn(e) {
  const t = [], n = Object.keys(e);
  return n.slice(0, 3).forEach((r) => {
    t.push(...vt(r, e[r]));
  }), n.length > 3 && t.push(" ..."), t;
}
function vt(e, t, n) {
  return I(t) ? (t = JSON.stringify(t), n ? t : [`${e}=${t}`]) : typeof t == "number" || typeof t == "boolean" || t == null ? n ? t : [`${e}=${t}`] : S(t) ? (t = vt(e, p(t.value), !0), n ? t : [`${e}=Ref<`, t, ">"]) : E(t) ? [`${e}=fn${t.name ? `<${t.name}>` : ""}`] : (t = p(t), n ? t : [`${e}=`, t]);
}
const Pt = {
  sp: "serverPrefetch hook",
  bc: "beforeCreate hook",
  c: "created hook",
  bm: "beforeMount hook",
  m: "mounted hook",
  bu: "beforeUpdate hook",
  u: "updated",
  bum: "beforeUnmount hook",
  um: "unmounted hook",
  a: "activated hook",
  da: "deactivated hook",
  ec: "errorCaptured hook",
  rtc: "renderTracked hook",
  rtg: "renderTriggered hook",
  0: "setup function",
  1: "render function",
  2: "watcher getter",
  3: "watcher callback",
  4: "watcher cleanup function",
  5: "native event handler",
  6: "component event handler",
  7: "vnode hook",
  8: "directive hook",
  9: "transition hook",
  10: "app errorHandler",
  11: "app warnHandler",
  12: "ref function",
  13: "async component loader",
  14: "scheduler flush. This is likely a Vue internals bug. Please open an issue at https://new-issue.vuejs.org/?repo=vuejs/core"
};
function q(e, t, n, r) {
  let s;
  try {
    s = r ? e(...r) : e();
  } catch (o) {
    $t(o, t, n);
  }
  return s;
}
function Pe(e, t, n, r) {
  if (E(e)) {
    const o = q(e, t, n, r);
    return o && rn(o) && o.catch((i) => {
      $t(i, t, n);
    }), o;
  }
  const s = [];
  for (let o = 0; o < e.length; o++)
    s.push(Pe(e[o], t, n, r));
  return s;
}
function $t(e, t, n, r = !0) {
  const s = t ? t.vnode : null;
  if (t) {
    let o = t.parent;
    const i = t.proxy, c = process.env.NODE_ENV !== "production" ? Pt[n] : n;
    for (; o; ) {
      const a = o.ec;
      if (a) {
        for (let d = 0; d < a.length; d++)
          if (a[d](e, i, c) === !1)
            return;
      }
      o = o.parent;
    }
    const u = t.appContext.config.errorHandler;
    if (u) {
      q(
        u,
        null,
        10,
        [e, i, c]
      );
      return;
    }
  }
  Ln(e, n, s, r);
}
function Ln(e, t, n, r = !0) {
  if (process.env.NODE_ENV !== "production") {
    const s = Pt[t];
    if (n && Kn(n), b(`Unhandled error${s ? ` during execution of ${s}` : ""}`), n && Wn(), r)
      throw e;
    console.error(e);
  } else
    console.error(e);
}
let ge = !1, $e = !1;
const C = [];
let F = 0;
const Q = [];
let v = null, M = 0;
const Mt = /* @__PURE__ */ Promise.resolve();
let Be = null;
const Yn = 100;
function Gn(e) {
  const t = Be || Mt;
  return e ? t.then(this ? e.bind(this) : e) : t;
}
function Qn(e) {
  let t = F + 1, n = C.length;
  for (; t < n; ) {
    const r = t + n >>> 1, s = C[r], o = se(s);
    o < e || o === e && s.pre ? t = r + 1 : n = r;
  }
  return t;
}
function Je(e) {
  (!C.length || !C.includes(
    e,
    ge && e.allowRecurse ? F + 1 : F
  )) && (e.id == null ? C.push(e) : C.splice(Qn(e.id), 0, e), Ft());
}
function Ft() {
  !ge && !$e && ($e = !0, Be = Mt.then(jt));
}
function At(e) {
  h(e) ? Q.push(...e) : (!v || !v.includes(
    e,
    e.allowRecurse ? M + 1 : M
  )) && Q.push(e), Ft();
}
function Xn(e) {
  if (Q.length) {
    const t = [...new Set(Q)];
    if (Q.length = 0, v) {
      v.push(...t);
      return;
    }
    for (v = t, process.env.NODE_ENV !== "production" && (e = e || /* @__PURE__ */ new Map()), v.sort((n, r) => se(n) - se(r)), M = 0; M < v.length; M++)
      process.env.NODE_ENV !== "production" && zt(e, v[M]) || v[M]();
    v = null, M = 0;
  }
}
const se = (e) => e.id == null ? 1 / 0 : e.id, Zn = (e, t) => {
  const n = se(e) - se(t);
  if (n === 0) {
    if (e.pre && !t.pre)
      return -1;
    if (t.pre && !e.pre)
      return 1;
  }
  return n;
};
function jt(e) {
  $e = !1, ge = !0, process.env.NODE_ENV !== "production" && (e = e || /* @__PURE__ */ new Map()), C.sort(Zn);
  const t = process.env.NODE_ENV !== "production" ? (n) => zt(e, n) : ft;
  try {
    for (F = 0; F < C.length; F++) {
      const n = C[F];
      if (n && n.active !== !1) {
        if (process.env.NODE_ENV !== "production" && t(n))
          continue;
        q(n, null, 14);
      }
    }
  } finally {
    F = 0, C.length = 0, Xn(e), ge = !1, Be = null, (C.length || Q.length) && jt(e);
  }
}
function zt(e, t) {
  if (!e.has(t))
    e.set(t, 1);
  else {
    const n = e.get(t);
    if (n > Yn) {
      const r = t.ownerInstance, s = r && qt(r.type);
      return b(
        `Maximum recursive updates exceeded${s ? ` in component <${s}>` : ""}. This means you have a reactive effect that is mutating its own dependencies and thus recursively triggering itself. Possible sources include component template, render function, updated hook or watcher source function.`
      ), !0;
    } else
      e.set(t, n + 1);
  }
}
const k = /* @__PURE__ */ new Set();
process.env.NODE_ENV !== "production" && (Re().__VUE_HMR_RUNTIME__ = {
  createRecord: Se(kn),
  rerender: Se(er),
  reload: Se(tr)
});
const me = /* @__PURE__ */ new Map();
function kn(e, t) {
  return me.has(e) ? !1 : (me.set(e, {
    initialDef: ne(t),
    instances: /* @__PURE__ */ new Set()
  }), !0);
}
function ne(e) {
  return Yt(e) ? e.__vccOpts : e;
}
function er(e, t) {
  const n = me.get(e);
  n && (n.initialDef.render = t, [...n.instances].forEach((r) => {
    t && (r.render = t, ne(r.type).render = t), r.renderCache = [], r.update();
  }));
}
function tr(e, t) {
  const n = me.get(e);
  if (!n)
    return;
  t = ne(t), rt(n.initialDef, t);
  const r = [...n.instances];
  for (const s of r) {
    const o = ne(s.type);
    k.has(o) || (o !== n.initialDef && rt(o, t), k.add(o)), s.appContext.propsCache.delete(s.type), s.appContext.emitsCache.delete(s.type), s.appContext.optionsCache.delete(s.type), s.ceReload ? (k.add(o), s.ceReload(t.styles), k.delete(o)) : s.parent ? Je(s.parent.update) : s.appContext.reload ? s.appContext.reload() : typeof window < "u" ? window.location.reload() : console.warn(
      "[HMR] Root or manually mounted instance modified. Full reload required."
    );
  }
  At(() => {
    for (const s of r)
      k.delete(
        ne(s.type)
      );
  });
}
function rt(e, t) {
  D(e, t);
  for (const n in e)
    n !== "__file" && !(n in t) && delete e[n];
}
function Se(e) {
  return (t, n) => {
    try {
      return e(t, n);
    } catch (r) {
      console.error(r), console.warn(
        "[HMR] Something went wrong during Vue component hot-reload. Full reload required."
      );
    }
  };
}
let A = null, nr = null;
const rr = Symbol.for("v-ndc"), sr = (e) => e.__isSuspense;
function or(e, t) {
  t && t.pendingBranch ? h(e) ? t.effects.push(...e) : t.effects.push(e) : At(e);
}
const de = {};
function ir(e, t, { immediate: n, deep: r, flush: s, onTrack: o, onTrigger: i } = P) {
  var c;
  process.env.NODE_ENV !== "production" && !t && (n !== void 0 && b(
    'watch() "immediate" option is only respected when using the watch(source, callback, options?) signature.'
  ), r !== void 0 && b(
    'watch() "deep" option is only respected when using the watch(source, callback, options?) signature.'
  ));
  const u = (g) => {
    b(
      "Invalid watch source: ",
      g,
      "A watch source can only be a getter/effect function, a ref, a reactive object, or an array of these types."
    );
  }, a = hn() === ((c = Z) == null ? void 0 : c.scope) ? Z : null;
  let d, l = !1, f = !1;
  if (S(e) ? (d = () => e.value, l = Te(e)) : B(e) ? (d = () => e, r = !0) : h(e) ? (f = !0, l = e.some((g) => B(g) || Te(g)), d = () => e.map((g) => {
    if (S(g))
      return g.value;
    if (B(g))
      return G(g);
    if (E(g))
      return q(g, a, 2);
    process.env.NODE_ENV !== "production" && u(g);
  })) : E(e) ? t ? d = () => q(e, a, 2) : d = () => {
    if (!(a && a.isUnmounted))
      return _ && _(), Pe(
        e,
        a,
        3,
        [V]
      );
  } : (d = ft, process.env.NODE_ENV !== "production" && u(e)), t && r) {
    const g = d;
    d = () => G(g());
  }
  let _, V = (g) => {
    _ = y.onStop = () => {
      q(g, a, 4);
    };
  }, R = f ? new Array(e.length).fill(de) : de;
  const H = () => {
    if (y.active)
      if (t) {
        const g = y.run();
        (r || l || (f ? g.some((Gt, Qt) => X(Gt, R[Qt])) : X(g, R))) && (_ && _(), Pe(t, a, 3, [
          g,
          // pass undefined as the old value when it's changed for the first time
          R === de ? void 0 : f && R[0] === de ? [] : R,
          V
        ]), R = g);
      } else
        y.run();
  };
  H.allowRecurse = !!t;
  let oe;
  s === "sync" ? oe = H : s === "post" ? oe = () => lt(H, a && a.suspense) : (H.pre = !0, a && (H.id = a.uid), oe = () => Je(H));
  const y = new mn(d, oe);
  return process.env.NODE_ENV !== "production" && (y.onTrack = o, y.onTrigger = i), t ? n ? H() : R = y.run() : s === "post" ? lt(
    y.run.bind(y),
    a && a.suspense
  ) : y.run(), () => {
    y.stop(), a && a.scope && tn(a.scope.effects, y);
  };
}
function cr(e, t, n) {
  const r = this.proxy, s = I(e) ? e.includes(".") ? lr(r, e) : () => r[e] : e.bind(r, r);
  let o;
  E(t) ? o = t : (o = t.handler, n = t);
  const i = Z;
  at(this);
  const c = ir(s, o.bind(r), n);
  return i ? at(i) : Dr(), c;
}
function lr(e, t) {
  const n = t.split(".");
  return () => {
    let r = e;
    for (let s = 0; s < n.length && r; s++)
      r = r[n[s]];
    return r;
  };
}
function G(e, t) {
  if (!w(e) || e.__v_skip || (t = t || /* @__PURE__ */ new Set(), t.has(e)))
    return e;
  if (t.add(e), S(e))
    G(e.value, t);
  else if (h(e))
    for (let n = 0; n < e.length; n++)
      G(e[n], t);
  else if (pt(e) || K(e))
    e.forEach((n) => {
      G(n, t);
    });
  else if (_t(e))
    for (const n in e)
      G(e[n], t);
  return e;
}
/*! #__NO_SIDE_EFFECTS__ */
// @__NO_SIDE_EFFECTS__
function ur(e, t) {
  return E(e) ? (
    // #8326: extend call and options.name access are considered side-effects
    // by Rollup, so we have to wrap it in a pure-annotated IIFE.
    D({ name: e.name }, t, { setup: e })
  ) : e;
}
const Me = (e) => e ? Cr(e) ? Tr(e) || e.proxy : Me(e.parent) : null, re = (
  // Move PURE marker to new line to workaround compiler discarding it
  // due to type annotation
  /* @__PURE__ */ D(/* @__PURE__ */ Object.create(null), {
    $: (e) => e,
    $el: (e) => e.vnode.el,
    $data: (e) => e.data,
    $props: (e) => process.env.NODE_ENV !== "production" ? pe(e.props) : e.props,
    $attrs: (e) => process.env.NODE_ENV !== "production" ? pe(e.attrs) : e.attrs,
    $slots: (e) => process.env.NODE_ENV !== "production" ? pe(e.slots) : e.slots,
    $refs: (e) => process.env.NODE_ENV !== "production" ? pe(e.refs) : e.refs,
    $parent: (e) => Me(e.parent),
    $root: (e) => Me(e.root),
    $emit: (e) => e.emit,
    $options: (e) => pr(e),
    $forceUpdate: (e) => e.f || (e.f = () => Je(e.update)),
    $nextTick: (e) => e.n || (e.n = Gn.bind(e.proxy)),
    $watch: (e) => cr.bind(e)
  })
), ar = (e) => e === "_" || e === "$", xe = (e, t) => e !== P && !e.__isScriptSetup && m(e, t), fr = {
  get({ _: e }, t) {
    const { ctx: n, setupState: r, data: s, props: o, accessCache: i, type: c, appContext: u } = e;
    if (process.env.NODE_ENV !== "production" && t === "__isVue")
      return !0;
    let a;
    if (t[0] !== "$") {
      const _ = i[t];
      if (_ !== void 0)
        switch (_) {
          case 1:
            return r[t];
          case 2:
            return s[t];
          case 4:
            return n[t];
          case 3:
            return o[t];
        }
      else {
        if (xe(r, t))
          return i[t] = 1, r[t];
        if (s !== P && m(s, t))
          return i[t] = 2, s[t];
        if (
          // only cache other properties when instance has declared (thus stable)
          // props
          (a = e.propsOptions[0]) && m(a, t)
        )
          return i[t] = 3, o[t];
        if (n !== P && m(n, t))
          return i[t] = 4, n[t];
        i[t] = 0;
      }
    }
    const d = re[t];
    let l, f;
    if (d)
      return t === "$attrs" ? (x(e, "get", t), process.env.NODE_ENV !== "production" && void 0) : process.env.NODE_ENV !== "production" && t === "$slots" && x(e, "get", t), d(e);
    if (
      // css module (injected by vue-loader)
      (l = c.__cssModules) && (l = l[t])
    )
      return l;
    if (n !== P && m(n, t))
      return i[t] = 4, n[t];
    if (
      // global properties
      f = u.config.globalProperties, m(f, t)
    )
      return f[t];
    process.env.NODE_ENV !== "production" && A && (!I(t) || // #1091 avoid internal isRef/isVNode checks on component instance leading
    // to infinite warning loop
    t.indexOf("__v") !== 0) && (s !== P && ar(t[0]) && m(s, t) ? b(
      `Property ${JSON.stringify(
        t
      )} must be accessed via $data because it starts with a reserved character ("$" or "_") and is not proxied on the render context.`
    ) : e === A && b(
      `Property ${JSON.stringify(t)} was accessed during render but is not defined on instance.`
    ));
  },
  set({ _: e }, t, n) {
    const { data: r, setupState: s, ctx: o } = e;
    return xe(s, t) ? (s[t] = n, !0) : process.env.NODE_ENV !== "production" && s.__isScriptSetup && m(s, t) ? (b(`Cannot mutate <script setup> binding "${t}" from Options API.`), !1) : r !== P && m(r, t) ? (r[t] = n, !0) : m(e.props, t) ? (process.env.NODE_ENV !== "production" && b(`Attempting to mutate prop "${t}". Props are readonly.`), !1) : t[0] === "$" && t.slice(1) in e ? (process.env.NODE_ENV !== "production" && b(
      `Attempting to mutate public property "${t}". Properties starting with $ are reserved and readonly.`
    ), !1) : (process.env.NODE_ENV !== "production" && t in e.appContext.config.globalProperties ? Object.defineProperty(o, t, {
      enumerable: !0,
      configurable: !0,
      value: n
    }) : o[t] = n, !0);
  },
  has({
    _: { data: e, setupState: t, accessCache: n, ctx: r, appContext: s, propsOptions: o }
  }, i) {
    let c;
    return !!n[i] || e !== P && m(e, i) || xe(t, i) || (c = o[0]) && m(c, i) || m(r, i) || m(re, i) || m(s.config.globalProperties, i);
  },
  defineProperty(e, t, n) {
    return n.get != null ? e._.accessCache[t] = 0 : m(n, "value") && this.set(e, t, n.value, null), Reflect.defineProperty(e, t, n);
  }
};
process.env.NODE_ENV !== "production" && (fr.ownKeys = (e) => (b(
  "Avoid app logic that relies on enumerating keys on a component instance. The keys will be empty in production mode to avoid performance overhead."
), Reflect.ownKeys(e)));
function st(e) {
  return h(e) ? e.reduce(
    (t, n) => (t[n] = null, t),
    {}
  ) : e;
}
function pr(e) {
  const t = e.type, { mixins: n, extends: r } = t, {
    mixins: s,
    optionsCache: o,
    config: { optionMergeStrategies: i }
  } = e.appContext, c = o.get(t);
  let u;
  return c ? u = c : !s.length && !n && !r ? u = t : (u = {}, s.length && s.forEach(
    (a) => Ee(u, a, i, !0)
  ), Ee(u, t, i)), w(t) && o.set(t, u), u;
}
function Ee(e, t, n, r = !1) {
  const { mixins: s, extends: o } = t;
  o && Ee(e, o, n, !0), s && s.forEach(
    (i) => Ee(e, i, n, !0)
  );
  for (const i in t)
    if (r && i === "expose")
      process.env.NODE_ENV !== "production" && b(
        '"expose" option is ignored when declared in mixins or extends. It should only be declared in the base component itself.'
      );
    else {
      const c = dr[i] || n && n[i];
      e[i] = c ? c(e[i], t[i]) : t[i];
    }
  return e;
}
const dr = {
  data: ot,
  props: ct,
  emits: ct,
  // objects
  methods: te,
  computed: te,
  // lifecycle
  beforeCreate: N,
  created: N,
  beforeMount: N,
  mounted: N,
  beforeUpdate: N,
  updated: N,
  beforeDestroy: N,
  beforeUnmount: N,
  destroyed: N,
  unmounted: N,
  activated: N,
  deactivated: N,
  errorCaptured: N,
  serverPrefetch: N,
  // assets
  components: te,
  directives: te,
  // watch
  watch: _r,
  // provide / inject
  provide: ot,
  inject: hr
};
function ot(e, t) {
  return t ? e ? function() {
    return D(
      E(e) ? e.call(this, this) : e,
      E(t) ? t.call(this, this) : t
    );
  } : t : e;
}
function hr(e, t) {
  return te(it(e), it(t));
}
function it(e) {
  if (h(e)) {
    const t = {};
    for (let n = 0; n < e.length; n++)
      t[e[n]] = e[n];
    return t;
  }
  return e;
}
function N(e, t) {
  return e ? [...new Set([].concat(e, t))] : t;
}
function te(e, t) {
  return e ? D(/* @__PURE__ */ Object.create(null), e, t) : t;
}
function ct(e, t) {
  return e ? h(e) && h(t) ? [.../* @__PURE__ */ new Set([...e, ...t])] : D(
    /* @__PURE__ */ Object.create(null),
    st(e),
    st(t ?? {})
  ) : t;
}
function _r(e, t) {
  if (!e)
    return t;
  if (!t)
    return e;
  const n = D(/* @__PURE__ */ Object.create(null), e);
  for (const r in t)
    n[r] = N(e[r], t[r]);
  return n;
}
const lt = or, gr = (e) => e.__isTeleport, Ht = Symbol.for("v-fgt"), mr = Symbol.for("v-txt"), Er = Symbol.for("v-cmt"), he = [];
let T = null;
function wr(e = !1) {
  he.push(T = e ? null : []);
}
function Nr() {
  he.pop(), T = he[he.length - 1] || null;
}
function br(e) {
  return e.dynamicChildren = T || Zt, Nr(), T && T.push(e), e;
}
function Or(e, t, n, r, s, o) {
  return br(
    Ut(
      e,
      t,
      n,
      r,
      s,
      o,
      !0
      /* isBlock */
    )
  );
}
function Sr(e) {
  return e ? e.__v_isVNode === !0 : !1;
}
const xr = (...e) => Bt(
  ...e
), Kt = "__vInternal", Wt = ({ key: e }) => e ?? null, _e = ({
  ref: e,
  ref_key: t,
  ref_for: n
}) => (typeof e == "number" && (e = "" + e), e != null ? I(e) || S(e) || E(e) ? { i: A, r: e, k: t, f: !!n } : e : null);
function Ut(e, t = null, n = null, r = 0, s = null, o = e === Ht ? 0 : 1, i = !1, c = !1) {
  const u = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e,
    props: t,
    key: t && Wt(t),
    ref: t && _e(t),
    scopeId: nr,
    slotScopeIds: null,
    children: n,
    component: null,
    suspense: null,
    ssContent: null,
    ssFallback: null,
    dirs: null,
    transition: null,
    el: null,
    anchor: null,
    target: null,
    targetAnchor: null,
    staticCount: 0,
    shapeFlag: o,
    patchFlag: r,
    dynamicProps: s,
    dynamicChildren: null,
    appContext: null,
    ctx: A
  };
  return c ? (qe(u, n), o & 128 && e.normalize(u)) : n && (u.shapeFlag |= I(n) ? 8 : 16), process.env.NODE_ENV !== "production" && u.key !== u.key && b("VNode created with invalid key (NaN). VNode type:", u.type), // avoid a block node from tracking itself
  !i && // has current parent block
  T && // presence of a patch flag indicates this node needs patching on updates.
  // component nodes also should always be patched, because even if the
  // component doesn't need to update, it needs to persist the instance on to
  // the next vnode so that it can be properly unmounted later.
  (u.patchFlag > 0 || o & 6) && // the EVENTS flag is only for hydration and if it is the only flag, the
  // vnode should not be considered dynamic due to handler caching.
  u.patchFlag !== 32 && T.push(u), u;
}
const Vr = process.env.NODE_ENV !== "production" ? xr : Bt;
function Bt(e, t = null, n = null, r = 0, s = null, o = !1) {
  if ((!e || e === rr) && (process.env.NODE_ENV !== "production" && !e && b(`Invalid vnode type when creating vnode: ${e}.`), e = Er), Sr(e)) {
    const c = we(
      e,
      t,
      !0
      /* mergeRef: true */
    );
    return n && qe(c, n), !o && T && (c.shapeFlag & 6 ? T[T.indexOf(e)] = c : T.push(c)), c.patchFlag |= -2, c;
  }
  if (Yt(e) && (e = e.__vccOpts), t) {
    t = Rr(t);
    let { class: c, style: u } = t;
    c && !I(c) && (t.class = je(c)), w(u) && (ve(u) && !h(u) && (u = D({}, u)), t.style = Ae(u));
  }
  const i = I(e) ? 1 : sr(e) ? 128 : gr(e) ? 64 : w(e) ? 4 : E(e) ? 2 : 0;
  return process.env.NODE_ENV !== "production" && i & 4 && ve(e) && (e = p(e), b(
    "Vue received a Component which was made a reactive object. This can lead to unnecessary performance overhead, and should be avoided by marking the component with `markRaw` or using `shallowRef` instead of `ref`.",
    `
Component that was made reactive: `,
    e
  )), Ut(
    e,
    t,
    n,
    r,
    s,
    i,
    o,
    !0
  );
}
function Rr(e) {
  return e ? ve(e) || Kt in e ? D({}, e) : e : null;
}
function we(e, t, n = !1) {
  const { props: r, ref: s, patchFlag: o, children: i } = e, c = t ? Ir(r || {}, t) : r;
  return {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e.type,
    props: c,
    key: c && Wt(c),
    ref: t && t.ref ? (
      // #2078 in the case of <component :is="vnode" ref="extra"/>
      // if the vnode itself already has a ref, cloneVNode will need to merge
      // the refs so the single vnode can be set on multiple refs
      n && s ? h(s) ? s.concat(_e(t)) : [s, _e(t)] : _e(t)
    ) : s,
    scopeId: e.scopeId,
    slotScopeIds: e.slotScopeIds,
    children: process.env.NODE_ENV !== "production" && o === -1 && h(i) ? i.map(Jt) : i,
    target: e.target,
    targetAnchor: e.targetAnchor,
    staticCount: e.staticCount,
    shapeFlag: e.shapeFlag,
    // if the vnode is cloned with extra props, we can no longer assume its
    // existing patch flag to be reliable and need to add the FULL_PROPS flag.
    // note: preserve flag for fragments since they use the flag for children
    // fast paths only.
    patchFlag: t && e.type !== Ht ? o === -1 ? 16 : o | 16 : o,
    dynamicProps: e.dynamicProps,
    dynamicChildren: e.dynamicChildren,
    appContext: e.appContext,
    dirs: e.dirs,
    transition: e.transition,
    // These should technically only be non-null on mounted VNodes. However,
    // they *should* be copied for kept-alive vnodes. So we just always copy
    // them since them being non-null during a mount doesn't affect the logic as
    // they will simply be overwritten.
    component: e.component,
    suspense: e.suspense,
    ssContent: e.ssContent && we(e.ssContent),
    ssFallback: e.ssFallback && we(e.ssFallback),
    el: e.el,
    anchor: e.anchor,
    ctx: e.ctx,
    ce: e.ce
  };
}
function Jt(e) {
  const t = we(e);
  return h(e.children) && (t.children = e.children.map(Jt)), t;
}
function yr(e = " ", t = 0) {
  return Vr(mr, null, e, t);
}
function qe(e, t) {
  let n = 0;
  const { shapeFlag: r } = e;
  if (t == null)
    t = null;
  else if (h(t))
    n = 16;
  else if (typeof t == "object")
    if (r & 65) {
      const s = t.default;
      s && (s._c && (s._d = !1), qe(e, s()), s._c && (s._d = !0));
      return;
    } else {
      n = 32;
      const s = t._;
      !s && !(Kt in t) ? t._ctx = A : s === 3 && A && (A.slots._ === 1 ? t._ = 1 : (t._ = 2, e.patchFlag |= 1024));
    }
  else
    E(t) ? (t = { default: t, _ctx: A }, n = 32) : (t = String(t), r & 64 ? (n = 16, t = [yr(t)]) : n = 8);
  e.children = t, e.shapeFlag |= n;
}
function Ir(...e) {
  const t = {};
  for (let n = 0; n < e.length; n++) {
    const r = e[n];
    for (const s in r)
      if (s === "class")
        t.class !== r.class && (t.class = je([t.class, r.class]));
      else if (s === "style")
        t.style = Ae([t.style, r.style]);
      else if (en(s)) {
        const o = t[s], i = r[s];
        i && o !== i && !(h(o) && o.includes(i)) && (t[s] = o ? [].concat(o, i) : i);
      } else
        s !== "" && (t[s] = r[s]);
  }
  return t;
}
let Z = null, Le, Y, ut = "__VUE_INSTANCE_SETTERS__";
(Y = Re()[ut]) || (Y = Re()[ut] = []), Y.push((e) => Z = e), Le = (e) => {
  Y.length > 1 ? Y.forEach((t) => t(e)) : Y[0](e);
};
const at = (e) => {
  Le(e), e.scope.on();
}, Dr = () => {
  Z && Z.scope.off(), Le(null);
};
function Cr(e) {
  return e.vnode.shapeFlag & 4;
}
function Tr(e) {
  if (e.exposed)
    return e.exposeProxy || (e.exposeProxy = new Proxy(Hn(An(e.exposed)), {
      get(t, n) {
        if (n in t)
          return t[n];
        if (n in re)
          return re[n](e);
      },
      has(t, n) {
        return n in t || n in re;
      }
    }));
}
const vr = /(?:^|[-_])(\w)/g, Pr = (e) => e.replace(vr, (t) => t.toUpperCase()).replace(/[-_]/g, "");
function qt(e, t = !0) {
  return E(e) ? e.displayName || e.name : e.name || t && e.__name;
}
function Lt(e, t, n = !1) {
  let r = qt(t);
  if (!r && t.__file) {
    const s = t.__file.match(/([^/\\]+)\.\w+$/);
    s && (r = s[1]);
  }
  if (!r && e && e.parent) {
    const s = (o) => {
      for (const i in o)
        if (o[i] === t)
          return i;
    };
    r = s(
      e.components || e.parent.type.components
    ) || s(e.appContext.components);
  }
  return r ? Pr(r) : n ? "App" : "Anonymous";
}
function Yt(e) {
  return E(e) && "__vccOpts" in e;
}
function Ve(e) {
  return !!(e && e.__v_isShallow);
}
function $r() {
  if (process.env.NODE_ENV === "production" || typeof window > "u")
    return;
  const e = { style: "color:#3ba776" }, t = { style: "color:#0b1bc9" }, n = { style: "color:#b62e24" }, r = { style: "color:#9d288c" }, s = {
    header(l) {
      return w(l) ? l.__isVue ? ["div", e, "VueInstance"] : S(l) ? [
        "div",
        {},
        ["span", e, d(l)],
        "<",
        c(l.value),
        ">"
      ] : B(l) ? [
        "div",
        {},
        ["span", e, Ve(l) ? "ShallowReactive" : "Reactive"],
        "<",
        c(l),
        `>${L(l) ? " (readonly)" : ""}`
      ] : L(l) ? [
        "div",
        {},
        ["span", e, Ve(l) ? "ShallowReadonly" : "Readonly"],
        "<",
        c(l),
        ">"
      ] : null : null;
    },
    hasBody(l) {
      return l && l.__isVue;
    },
    body(l) {
      if (l && l.__isVue)
        return [
          "div",
          {},
          ...o(l.$)
        ];
    }
  };
  function o(l) {
    const f = [];
    l.type.props && l.props && f.push(i("props", p(l.props))), l.setupState !== P && f.push(i("setup", l.setupState)), l.data !== P && f.push(i("data", p(l.data)));
    const _ = u(l, "computed");
    _ && f.push(i("computed", _));
    const V = u(l, "inject");
    return V && f.push(i("injected", V)), f.push([
      "div",
      {},
      [
        "span",
        {
          style: r.style + ";opacity:0.66"
        },
        "$ (internal): "
      ],
      ["object", { object: l }]
    ]), f;
  }
  function i(l, f) {
    return f = D({}, f), Object.keys(f).length ? [
      "div",
      { style: "line-height:1.25em;margin-bottom:0.6em" },
      [
        "div",
        {
          style: "color:#476582"
        },
        l
      ],
      [
        "div",
        {
          style: "padding-left:1.25em"
        },
        ...Object.keys(f).map((_) => [
          "div",
          {},
          ["span", r, _ + ": "],
          c(f[_], !1)
        ])
      ]
    ] : ["span", {}];
  }
  function c(l, f = !0) {
    return typeof l == "number" ? ["span", t, l] : typeof l == "string" ? ["span", n, JSON.stringify(l)] : typeof l == "boolean" ? ["span", r, l] : w(l) ? ["object", { object: f ? p(l) : l }] : ["span", n, String(l)];
  }
  function u(l, f) {
    const _ = l.type;
    if (E(_))
      return;
    const V = {};
    for (const R in l.ctx)
      a(_, R, f) && (V[R] = l.ctx[R]);
    return V;
  }
  function a(l, f, _) {
    const V = l[_];
    if (h(V) && V.includes(f) || w(V) && f in V || l.extends && a(l.extends, f, _) || l.mixins && l.mixins.some((R) => a(R, f, _)))
      return !0;
  }
  function d(l) {
    return Ve(l) ? "ShallowRef" : l.effect ? "ComputedRef" : "Ref";
  }
  window.devtoolsFormatters ? window.devtoolsFormatters.push(s) : window.devtoolsFormatters = [s];
}
function Mr() {
  $r();
}
process.env.NODE_ENV !== "production" && Mr();
const Ar = /* @__PURE__ */ ur({
  __name: "HelloWorld",
  props: {
    message: { type: String, default: "default hello message" }
  },
  setup(e) {
    return (t, n) => (wr(), Or("h2", null, pn(e.message), 1));
  }
});
export {
  Ar as HelloWorld
};
