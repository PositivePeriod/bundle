const bundle = [[1, 2], [3, 4], [5, 6], [7, 8]];

console.log(bundle.some((x, y) => { console.log(x); return x[0] + y[1] === 13; }));
