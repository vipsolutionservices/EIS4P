import express from "express";

const app = express();

const PORT = 3000;

app.get("/", (req, res) => {
    res.json({
        product: "EIS4P",
        version: "1.0.0",
        status: "running"
    });
});

app.listen(PORT, () => {
    console.log(`EIS4P listening on http://localhost:${PORT}`);
});
