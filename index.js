const fs = require("fs");
const path = require("path");
const express = require("express");
const app = express();
const { compile } = require("@textlint/compiler");

const wrap = fn => (req, res, next) => fn(req, res, next).catch(next);

app.get("/", wrap(async (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <title>textlint compiler</title>
</head>
<body>

<h1>Download <a href="/textlint.js">textlint.js</a></h1>

</body>
</html>`)
}));

app.get("/textlint.js", wrap(async (req, res) => {
    const outDir = path.join(__dirname, "dist");
    const outFile = path.join(outDir, "textlint.js");
    await compile({
        compileTarget: "webworker",
        mode: "production",
        configFilePath: path.join(__dirname, ".textlintrc.json"),
        outputDir: outDir,
    });
    if (!fs.existsSync(outFile)) {
        res.status(500)
        res.render("Can not compile");
        return;
    }
    res.setHeader('Content-disposition', 'attachment; filename=textlint.js');
    res.setHeader('Content-type', "text/javascript");
    const filestream = fs.createReadStream(path.join(outDir, "textlint.js"));
    filestream.pipe(res);
}));

app.listen(8080, () => {
    console.log("App listening on port 8080!");
})
