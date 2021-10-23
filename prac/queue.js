// create a queue object with concurrency 2
const async = require("async");

async function test() {
    console.log("start");
    const q = async.queue((task, callback) => {
        console.log(`hello ${task.name}`);
        callback();
    }, 2);
    // assign a callback
    q.drain(() => {
        console.log("all items have been processed");
    });
    // or await the end
    // await q.drain();

    // assign an error callback
    q.error((err, task) => {
        console.error("task experienced an error");
    });

    // add some items to the queue
    q.push({ name: "1" }, (err) => {
        console.log("finished processing 1");
    });
    await setTimeout(() => { }, 1);
    // callback is optional
    q.push({ name: "2" });

    // add some items to the queue (batch-wise)
    q.push([{ name: "3" }, { name: "4" }, { name: "5" }], (err) => {
        console.log("finished processing item");
    });

    // add some items to the front of the queue
    q.unshift({ name: "6" }, (err) => {
        console.log("finished processing 6");
    });

    console.log("finish");
}

test();
