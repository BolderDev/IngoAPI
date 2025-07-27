const express = require("express");
const router = express.Router();
const Model = require("@schemas/model");
const  userServiceBase  = require("@user-service/base");

router.use(express.urlencoded({ extended: true }));
router.use(express.json());

function renderMainPage(docs, currentQuery = "") {
    let html = `
    <html>
    <head>
        <title>MongoDB Model Viewer</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
            body {
                font-family: monospace;
                background: #f9f9f9;
                padding: 15px;
                margin: 0;
            }
            h1 {
                font-size: 22px;
                margin-bottom: 15px;
            }
            .search-bar input[type="text"] {
                width: 100%;
                max-width: 600px;
                padding: 10px;
                font-size: 14px;
                margin-bottom: 20px;
                border: 1px solid #ccc;
                border-radius: 5px;
            }
            .item {
                background: #fff;
                border: 1px solid #ccc;
                padding: 12px;
                margin-bottom: 20px;
                border-radius: 6px;
            }
            pre {
                white-space: pre-wrap;
                font-size: 13px;
                background: #f0f0f0;
                padding: 8px;
                border-radius: 4px;
                overflow-x: auto;
            }
            button, a.edit {
                padding: 6px 12px;
                font-size: 13px;
                margin-right: 6px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                text-decoration: none;
                display: inline-block;
            }
            .edit { background: #64b5f6; color: #fff; }
            .delete { background: #e57373; color: #fff; }
            .ban { background: #ff9800; color: #fff; }
            input, textarea {
                width: 100%;
                font-family: monospace;
                font-size: 13px;
                padding: 8px;
            }
            .controls, .ban-form {
                margin-top: 10px;
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
            }
        </style>
    </head>
    <body>
        <h1>📦 MongoDB Model Viewer</h1>
        <form class="search-bar" method="GET" action="/database/schemas/search">
            <input type="text" name="query" placeholder="Search userId, modelName, or _id" value="${currentQuery}" />
        </form>
    `;

    for (const doc of docs) {
        const preview = JSON.stringify(doc, null, 2);
        const userId = doc.userId || "-";
        const modelName = doc.modelName || "Unknown";

        html += `
        <div class="item">
            <strong>User ID:</strong> ${userId}<br/>
            <strong>Model:</strong> ${modelName}<br/>
            <strong>_id:</strong> ${doc._id}<br/>
            <pre>${preview}</pre>

            <div class="controls">
                <form method="POST" action="/database/schemas/delete" style="display:inline;">
                    <input type="hidden" name="id" value="${doc._id}" />
                    <button type="submit" class="delete" onclick="return confirm('Delete this model?')">❌ Delete</button>
                </form>
                <a class="edit" href="/database/schemas/edit/${doc._id}">✏️ Edit</a>
            </div>

            <form method="POST" action="/database/schemas/ban" class="ban-form">
                <input type="hidden" name="userId" value="${userId}" />
                <input type="datetime-local" name="stopToTime" required />
                <input type="text" name="stopReason" placeholder="Ban Reason" required />
                <button type="submit" class="ban">🚫 Ban</button>
            </form>
        </div>
        `;
    }

    html += `</body></html>`;
    return html;
}

function renderEditPage(doc) {
    const json = JSON.stringify(doc, null, 2);
    return `
    <html>
    <head>
        <title>Edit ${doc._id}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.5/codemirror.min.css" />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.5/codemirror.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.5/mode/javascript/javascript.min.js"></script>
        <style>
            body {
                font-family: monospace;
                background: #f9f9f9;
                padding: 20px;
                margin: 0;
            }
            h1 {
                font-size: 20px;
                margin-bottom: 15px;
                word-break: break-word;
            }
            form {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }
            .CodeMirror {
                height: 60vh;
                font-size: 14px;
                border: 1px solid #ccc;
                border-radius: 6px;
            }
            button {
                padding: 10px 20px;
                font-size: 16px;
                background: #4caf50;
                color: white;
                border: none;
                border-radius: 6px;
                align-self: flex-start;
                cursor: pointer;
            }
            textarea {
                width: 100%;
                height: 60vh;
            }
        </style>
    </head>
    <body>
        <h1>📝 Editing Document:<br>${doc._id}</h1>
        <form method="POST" action="/database/schemas/edit">
            <input type="hidden" name="id" value="${doc._id}" />
            <textarea id="editor" name="json">${json}</textarea>
            <button type="submit">💾 Save</button>
        </form>
        <script>
            const editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
                lineNumbers: true,
                mode: { name: "javascript", json: true },
                lineWrapping: true
            });

            // Sync back to textarea on submit
            document.querySelector("form").addEventListener("submit", () => {
                document.getElementById("editor").value = editor.getValue();
            });
        </script>
    </body>
    </html>
    `;
}
// Routes
router.get("/database/schemas", async (req, res) => {
    const docs = await Model.find({}).limit(300).lean();
    res.send(renderMainPage(docs));
});

router.get("/database/schemas/search", async (req, res) => {
    const q = (req.query.query || "").toLowerCase();
    const docs = await Model.find({}).limit(300).lean();
    const filtered = docs.filter(doc => {
        const userId = (doc.userId || "").toString().toLowerCase();
        const modelName = (doc.modelName || "").toLowerCase();
        const id = (doc._id || "").toString().toLowerCase();
        return userId.includes(q) || modelName.includes(q) || id.includes(q);
    });
    res.send(renderMainPage(filtered, req.query.query));
});

router.post("/database/schemas/delete", async (req, res) => {
    await Model.deleteOne({ _id: req.body.id });
    res.redirect("/database/schemas");
});

router.get("/database/schemas/edit/:id", async (req, res) => {
    const doc = await Model.findById(req.params.id).lean();
    if (!doc) return res.status(404).send("Document not found");
    res.send(renderEditPage(doc));
});

router.post("/database/schemas/edit", async (req, res) => {
        const data = JSON.parse(req.body.json);
        delete data._id;
        await Model.updateOne({ _id: req.body.id }, { $set: data });
       res.redirect("/database/schemas");
});

router.post("/database/schemas/ban", async (req, res) => {
        const { userId, stopToTime, stopReason } = req.body;
        await userServiceBase.setBanUser(userId, stopToTime, stopReason);
        res.redirect("/database/schemas");
});

module.exports = router;
