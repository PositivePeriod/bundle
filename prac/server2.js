const http = require("http");
const cookie = require("cookie");

const app = http.createServer((request, response) => {
    if (request.headers.cookie !== undefined) {
        console.log(cookie.parse(request.headers.cookie));
    }
    response.writeHead(200, {
        "Set-Cookie": ["yummy_cookie=choco",
            "tasty_cooke=strawberry",
            "Permanent1=cookies; Expires=Wed, 21 Oct 8000 07:28:00",
            `Permanent2=cookies; Max-Age=${60 * 60 * 24}`],
    });
    response.end("hello world2");
});

app.listen(80);
