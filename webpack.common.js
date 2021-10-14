const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    entry: { game: "./code/client/src/app.js" },
    output: { filename: "[name].[contenthash].js", path: path.resolve(__dirname, "dist") },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: { loader: "babel-loader", options: { presets: ["@babel/preset-env"] } },
            },
            {
                test: /\.css$/,
                use: [{ loader: MiniCssExtractPlugin.loader }, "css-loader"],
            },
        ],
    },
    plugins: [
        new MiniCssExtractPlugin({ filename: "[name].[contenthash].css" }),
        new HtmlWebpackPlugin({ filename: "index.html", template: "code/client/page/index.html" }),
    ],
};
