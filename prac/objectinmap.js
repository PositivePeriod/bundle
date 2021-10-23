const a = { p: 1, q: "qwert" };
const b = { p: 2, q: "op" };
const c = new Map([["a", a], ["b", b]]);
console.log(c);
(c.get("a")).p += 1;
console.log(c);
