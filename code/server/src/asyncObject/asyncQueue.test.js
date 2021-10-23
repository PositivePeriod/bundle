/* eslint-disable no-undef */
const { AsyncQueue } = require("./asyncQueue.js");

test("basic", async () => {
    const queue = new AsyncQueue();
    expect(await queue.push(1)).toBe(undefined);
    expect(await queue.length()).toBe(1);
    expect(await queue.empty()).toBe(false);
    expect(await queue.shift()).toBe(1);
    expect(await queue.length()).toBe(0);
    expect(await queue.empty()).toBe(true);
    expect(await queue.shift()).toBe(undefined);
    expect(await queue.push(2)).toBe(undefined);
    expect(await queue.push(3)).toBe(undefined);
    expect(await queue.length()).toBe(2);
    expect(await queue.shift()).toBe(2);
    expect(await queue.clear()).toBe(undefined);
    expect(await queue.length()).toBe(0);
});
