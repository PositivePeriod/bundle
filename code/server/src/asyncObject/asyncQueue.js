/* eslint-disable max-classes-per-file */
const { AsyncObject } = require("./asyncObject.js");

class Queue {
    constructor() { this.data = []; }

    get length() { return this.data.length; }

    get empty() { return this.data.length === 0; }

    push(element) { this.data.push(element); }

    shift() { return this.data.shift(); }

    unshift(element) { return this.data.unshift(element); }

    clear() { this.data = []; }

    includes(element) { return this.data.includes(element); }

    remove(element) {
        const index = this.data.indexOf(element);
        if (index !== -1) {
            this.data.splice(index, 1);
        }
    }
}

class AsyncQueue extends AsyncObject {
    constructor() {
        super(Queue);
    }

    length() { return this.run(() => this.object.length); }

    empty() { return this.run(() => this.object.empty); }

    push(element) { return this.run(() => this.object.push(element)); }

    shift() { return this.run(() => this.object.shift()); }

    unshift(element) { return this.run(() => this.object.unshift(element)); }

    clear() { return this.run(() => this.object.clear()); }

    includes(element) { return this.run(() => this.object.includes(element)); }

    remove(element) { return this.run(() => this.object.remove(element)); }
}

module.exports = { AsyncQueue };
