const express = require("express");
const multer = require("multer");
const cors = require("cors");
const app = express();
const port = 5000;

app.use(cors());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

function countWords(text) {
    const regex = /<([^<>]+)>([^<>\n]+(?:\n[^<>\n]+)*)/g;
    let match;
    const wordCountsByUser = {};

    while ((match = regex.exec(text)) !== null) {
        const username = match[1].trim();
        const messages = match[2].trim().split('\n');

        // Count words in each line of the message without adding extra counts for line breaks
        const messageWordCount = messages.reduce((totalWords, messageLine) => {
            // Split the message line into words and add the word count to the totalWords
            const words = messageLine.split(/\s+/).filter(word => word.length > 0); // Filter out empty strings
            return totalWords + words.length;
        }, 0);

        if (!wordCountsByUser[username]) {
            wordCountsByUser[username] = 0;
        }

        wordCountsByUser[username] += messageWordCount;
    }

    return wordCountsByUser;
}

app.post("/upload", upload.array("files"), (req, res) => {
    const files = req.files;
    let fileData = [];

    files.forEach((file) => {
        const content = file.buffer.toString("utf-8");
        const wordCountsByUser = countWords(content);

        // Sort wordCountsByUser object in descending order based on word counts
        const sortedWordCounts = Object.entries(wordCountsByUser)
            .sort(([, a], [, b]) => b - a)
            .reduce((acc, [key, value]) => {
                acc[key] = value;
                return acc;
            }, {});

        fileData.push({ name: file.originalname, wordCountsByUser: sortedWordCounts });
    });

    res.json(fileData);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
