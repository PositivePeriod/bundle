/* eslint-disable no-undef */

const { AsyncSet } = require("./asyncSet.js");

test("basic", async () => {
    const set = new AsyncSet();
    expect(await set.add(1)).toEqual(new Set([1]));
    expect(await set.has(1)).toBe(true);
    expect(await set.size()).toBe(1);
    expect(await set.delete(1)).toBe(true);
    expect(await set.delete(1)).toBe(false);
    expect(await set.add(2)).toEqual(new Set([2]));
    expect(await set.add(3)).toEqual(new Set([2, 3]));
    expect(await set.toArray()).toEqual([2, 3]);
});
