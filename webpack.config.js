const webpack = require("webpack");

module.exports = {
    entry: {
        app: "./src/app.ts",
        "player-worker": "./node_modules/wasy/dist/player/player-worker.js",
    },
    output: {
        filename: "./build/[name].js"
    },
    devtool: "source-map",
    resolve: {
        extensions: [".ts", ".js"]
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: [
                    {loader: "ts-loader"}
                ]
            }
        ]
    }
};
