const fs = require("fs");
const path = require("path");
const express = require("express");
const app = express();
const { compile } = require("@textlint/compiler");

const wrap = fn => (req, res, next) => fn(req, res, next).catch(next);

app.get(
    "/",
    wrap(async (req, res) => {
        res.sendFile(__dirname + "/index.html");
    })
);

app.get(
    "/textlint.js",
    wrap(async (req, res) => {
        const outDir = path.join(__dirname, "dist");
        const outFile = path.join(outDir, "textlint.js");

        if (fs.existsSync(outFile)) {
            res.setHeader('content-type', 'text/javascript');
            const content = await fs.promises.readFile(outFile, "utf-8");
            return res.send(content);
        }
        await compile({
            compileTarget: "webworker",
            mode: "production",
            configFilePath: path.join(__dirname, ".textlintrc.json"),
            outputDir: outDir
        });
        if (!fs.existsSync(outFile)) {
            res.status(500);
            res.render("Can not compile");
            return;
        }
        res.setHeader('content-type', 'text/javascript');
        const content = await fs.promises.readFile(outFile, "utf-8");
        return res.send(content);
    })
);

app.listen(8080, () => {
    console.log("App listening on port 8080!");
});
