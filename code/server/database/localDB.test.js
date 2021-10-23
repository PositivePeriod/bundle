/* eslint-disable no-undef */
const { LocalDB } = require("./localDB.js");

test("basic", async () => {
    // eslint-disable-next-line no-self-compare
    expect(new LocalDB() === new LocalDB()).toBe(true);
});
