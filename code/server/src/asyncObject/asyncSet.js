const { AsyncObject } = require("./asyncObject.js");

class AsyncSet extends AsyncObject {
    constructor() {
        super(Set);
    }

    add(element) { return this.run(() => this.object.add(element)); }

    has(element) { return this.run(() => this.object.has(element)); }

    size() { return this.run(() => this.object.size); }

    delete(element) { return this.run(() => this.object.delete(element)); }

    toArray() { return this.run(() => [...this.object]); }
}

module.exports = { AsyncSet };
