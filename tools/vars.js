const path = require("path");
const glob = require("glob");

const rejectUnderscore = (pathstr) => {
    for (let part of pathstr.split("/")) {
        if (part.length && part[0] === "_") {
            return false;
        }
    }
    return true;
};

// directory
const cwd = process.cwd();
const src = path.join(cwd, "src");
const dst = path.join(cwd, "build");

// JS
const src_ts = glob.sync(path.join(src, "**", "*.ts"));
const src_js = glob.sync(path.join(src, "**", "*.js"));
const dst_js = [path.join(dst, "wasy-simple-player.js")];

// HTML
const src_ejs = glob.sync(path.join(src, "**", "*.ejs"));
const src_html = glob.sync(path.join(src, "**", "*.html"));
const html_re = new RegExp(src + "/(.+?)\.(ejs|html)$");
const dst_html = [...src_ejs, ...src_html].map(s => s.replace(html_re, dst + "/$1.html")).filter(rejectUnderscore);;

// CSS
const src_styl = glob.sync(path.join(src, "**", "*.styl"));
const src_css = glob.sync(path.join(src, "**", "*.css"));
const css_re = new RegExp(src + "/(.+?)\.(styl|css)$");
const dst_css = [...src_styl, ...src_css].map(s => s.replace(css_re, dst + "/$1.css")).filter(rejectUnderscore);

// generate *.mk
const conf = {
    src: [src],
    dst: [dst],
    src_ts,
    src_js,
    dst_js,
    src_ejs,
    src_html,
    dst_html,
    src_styl,
    src_css,
    dst_css,
    config: ["package.json", "webpack.config.js", "tsconfig.json"].map((s) => path.join(cwd, s)),
};

for (let key in conf) {
    console.log(`${key.toUpperCase()} := ${conf[key].join(" ")}`);
}
