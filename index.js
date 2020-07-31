const fs = require("fs");
const path = require("path");
const express = require("express");
const { compile } = require("@textlint/compiler");
const app = express();

const wrap = fn => (req, res, next) => fn(req, res, next).catch(next);
/**
 * Workaround for CodeSandbox
 * @see https://twitter.com/azu_re/status/1289238077139906561
 */
const escapeCodeSandbox = (code) => {
    return code.replace(/<\/head>/g, "< /head>");
}
app.get(
    "/",
    wrap(async (req, res) => {
        res.sendFile(__dirname + "/index.html");
    })
);

app.use("/dist", express.static(__dirname + "/dist"));
app.get(
    "/textlint.js",
    wrap(async (req, res) => {
        const outDir = path.join(__dirname, "dist");
        const outFile = path.join(outDir, "textlint.js");
        if (fs.existsSync(outFile)) {
            return res.redirect("/dist/textlint.js");
        }
        await compile({
            compileTarget: "webworker",
            mode: "development",
            configFilePath: path.join(__dirname, ".textlintrc.json"),
            outputDir: outDir
        });
        if (!fs.existsSync(outFile)) {
            res.status(500);
            res.render("Can not compile");
            return;
        }
        const content = await fs.promises.readFile(outFile, "utf-8");
        const escapedContent = escapeCodeSandbox(content);
        await fs.promises.writeFile(escapedContent, "utf-8");
        return res.redirect("/dist/textlint.js");
    })
);

app.listen(8080, () => {
    console.log("App listening on port 8080!");
});
