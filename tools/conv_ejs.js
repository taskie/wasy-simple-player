const fs = require("fs");
const ejs = require("ejs");


const inpath = process.argv[2];
const outpath = process.argv[3];

ejs.renderFile(inpath, { filename: outpath }, { }, (err, str) => {
    fs.writeFile(outpath, str, (err) => {
        if (err) {
            throw err;
        }
    });
});
