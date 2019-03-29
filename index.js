var express = require("express");
var fs = require('fs');
var app = express();
var giphy = require('giphy-api')();
var Dictionary = require("oxford-dictionary-api");
var dict = new Dictionary(process.env.DICTIONARY_APP_ID, process.env.DICTIONARY_API_KEY);

/* serves main page */
app.get("/", function (req, res) {
    res.sendfile('index.html')
});

app.get("/read", function (req, res) {
    res.sendfile('save.json')
});

app.post("/dictionary", function (req, res) {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        const YouTube = require('simple-youtube-api');
        const youtube = new YouTube(process.env.YOUTUBE_API_KEY);
        dict.find(body, function (error, data) {
            res.send(data.results[0].lexicalEntries[0].entries[0].senses[0].definitions[0])
        })
    });
})

app.post("/youtube", function (req, res) {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        const YouTube = require('simple-youtube-api');
        const youtube = new YouTube(process.env.YOUTUBE_API_KEY);
        youtube.searchVideos(body, 1)
            .then(results => {
                res.end(results[0].id)
            })
            .catch(err => {
                res.end('error')
                console.log(err)
            });
    });
})

app.post("/write", function (req, res) {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        fs.writeFile('save.json', body, 'utf8', () => {
            res.end('ok');
        });
    });
});

app.post("/chatbot", function (req, res) {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        chatbot(body).then((data) => {
            res.send(data);
        })

    });
});

app.post("/giphy", function (req, res) {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        giphy.search(body, function (err, data) {
            res.send(data.data);
        });
    });
});

app.post("/read", function (req, res) {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        fs.writeFile('save.json', body, 'utf8', () => {
            res.end('ok');
        });
    });
});

/* serves all the static files */
app.get(/^(.+)$/, function (req, res) {
    res.sendFile(__dirname + req.params[0]);
});

var port = process.env.PORT || 5000;
app.listen(port, function () {
    console.log("Listening on " + port);
});

const dialogflow = require('dialogflow');
const uuid = require('uuid');

/**
 * Send a query to the dialogflow agent, and return the query result.
 * @param {string} projectId The project to be used
 */
async function chatbot(text) {
    var projectId = 'eva-xfhffo'
    // A unique identifier for the given session
    const sessionId = uuid.v4();

    this.sessionClient = new dialogflow.SessionsClient()
    const sessionPath = sessionClient.sessionPath(projectId, sessionId);

    // The text query request.
    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                // The query to send to the dialogflow agent
                text: text,
                // The language used by the client (en-US)
                languageCode: 'en',
            },
        },
    };

    // Send request and log result
    const responses = await sessionClient.detectIntent(request);
    console.log('Detected intent');
    const result = responses[0].queryResult;
    console.log(`  Query: ${result.queryText}`);
    console.log(`  Response: ${result.fulfillmentText}`);
    if (result.intent) {
        console.log(`  Intent: ${result.intent.displayName}`);
    } else {
        console.log(`  No intent matched.`);
    }
    return result.fulfillmentText
}