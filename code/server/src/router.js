const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
    res.send("Bundle API");
});

// Used in In-Game
router.get("/join/1v1/:userID", (req, res) => {
    res.send("Bundle API");
});

router.get("/join/private/:userID", (req, res) => {
    res.send("Bundle API");
});

router.get("/leave/1v1/:userID", (req, res) => {
    res.send("Bundle API");
});

router.get("/leave/private/:userID", (req, res) => {
    res.send("Bundle API");
});

router.get("/leave/private/:userID", (req, res) => {
    res.send("Bundle API");
});

router.get("/user/:userID/join/1v1", (req, res) => {
    res.send("Bundle API");
});

router.get("/user/:userID/leave/1v1", (req, res) => {
    res.send("Bundle API");
});

router.get("/user/:userID/leave/1v1", (req, res) => {
    res.send("Bundle API");
});

router.get("/user/:userID/cancel", (req, res) => {
    res.send("Bundle API");
});

router.get("/user/:userID/join/private", (req, res) => {
    res.send("Bundle API");
});

router.get("/user/:userID/leave/private", (req, res) => {
    res.send("Bundle API");
});

router.get("/user/:userName/join/", (req, res) => {
    res.send("Bundle API");
});

// Static information

router.get("/leaderboard", (req, res) => {
    res.send("Bundle API");
});

router.get("/user/:userName", (req, res) => {
    res.send("Bundle API");
});

router.get("/map/:mapID", (req, res) => {
    res.send("Bundle API");
});

router.get("/game/:gameID", (req, res) => {
    res.send("Bundle API");
});

module.exports = { apiRouter: router };
