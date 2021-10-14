/* eslint-disable no-new */
const express = require("express");
const webpack = require("webpack");
const webpackDevMiddleware = require("webpack-dev-middleware");
const cookieParser = require("cookie-parser");
const path = require("path");
const cors = require("cors");
const webpackConfig = require("../../webpack.dev");
const SocketManager = require("./socket");
// console.log(__dirname); // C:\Users\jeukh\Documents\GitHub\bundle\code\server
const viewDir = path.join(__dirname, "../client/page");
// console.log(viewDir);

class ServerManager {
    constructor() {
        this.app = express();
        this.route();
        const port = process.env.PORT || 5000;
        const onServer = () => { console.log(`Bundle : http://localhost:${port}`); };
        this.server = this.app.listen(port, onServer);
        // this.io = new SocketManager(this.server);
    }

    route() {
        // this.app.use(express.json());
        // this.app.use(express.urlencoded({ extended: true }));
        this.app.use(cors());
        this.app.use(cookieParser);
        if (process.env.NODE_ENV === "development") {
            // Setup Webpack for development
            const compiler = webpack(webpackConfig);
            this.app.use(webpackDevMiddleware(compiler));
        } else {
            // Static serve the dist/ folder in production
            this.app.use(express.static("code/dist"));
        }
        this.app.all("*", (req, res, next) => {
            console.log("Connected! ...");
            next();
        });

        this.app.use("/static", express.static(path.join(__dirname, "../static")));
        const fileList = ["about", "version", "lobby"];
        fileList.forEach((fileName) => {
            this.app.get(`/${fileName}`, (req, res) => { res.sendFile(`${viewDir}/${fileName}.html`); });
        });
        // lobby는 JS로 lobby 현 상황 실시간으로 가져와서 보여줌

        this.app.get("/", (req, res) => { res.sendFile(`${viewDir}/index.html`); });
        this.app.set("views", viewDir);
        this.app.set("view-engine", "ejs");

        this.app.get("/user/:userName", (req, res) => {
            const { userName } = req.params;
            // getUserDataFromUserID
            const data = { name: userName, point: null, statistic: null, registerDate: null };
            res.render("user.ejs", data);
        });
        this.app.get("/map/:mapID", (req, res) => {
            const { mapID } = req.params;
            // getMapDataFromMapID
            const data = { id: mapID, map: null, rating: null };
            res.render("map.ejs", data);
        });

        this.app.get("/game/:gameID", (req, res) => {
            const { gameID } = req.params;
            // getGameDataFromGameID
            // JS -> socketio 통신으로 game 상황에 따라 queue 접속, 튕김, 관전, replay 보기 등으로 나뉨
            const data = { id: gameID, status: null, rating: null };
            res.render("game.ejs", data);
        });

        this.app.use((req, res, next) => {
            console.log(req.url);
            // res.status(404).redirect("/404/");
            res.sendFile(`${viewDir}/404.html`);
        });
    }
}

var server = new ServerManager();
