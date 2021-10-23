const async = require("async");

class AsyncObject {
    constructor(Object) {
        this.object = new Object();
        this.taskQueue = async.queue((task, callback) => {
            if (callback) { callback(task.bind(this)()); } else { task.bind(this)(); }
        }, 1);
    }

    run(task) {
        let resolveFunc = null;
        const result = new Promise((resolve) => { resolveFunc = resolve; });
        this.taskQueue.push(task, resolveFunc);
        return result;
    }
}

module.exports = { AsyncObject };
