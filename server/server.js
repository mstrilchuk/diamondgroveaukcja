const express = require("express");
const cors = require("cors");
const { graphqlHTTP } = require("express-graphql");
const gql = require("graphql-tag");
const { buildASTSchema, defaultTypeResolver } = require("graphql");

const dbJson = require("./items-db.json");
const { response } = require("express");

const app = express();

// allows cross origin access
app.use(cors({ origin: "*", credentials: true }));

// serve static files
app.use("/images", express.static("public"));

const schema = buildASTSchema(gql(`

    type Query {
        hello: String!
        merchandises: [ Merchandise ]
        merchandise(id: ID): Merchandise
    }

    type Merchandise {
        id: ID
        name: String
        description: String
        lastBid: Float
        lastBidUser: String
        imageUrl: String
    }

    type BidResult {
        accepted: Boolean!
        reason: String
    }

    type Mutation {
        submitBid(id: ID, newBid: Float, newBidUser: String): BidResult
    }

`));

const rootValue = {
    hello: () => "Hello World!",

    merchandises: () => dbJson,

    merchandise: ({ id }) => dbJson.find(item => item.id == id),

    submitBid: ({id, newBid, newBidUser}) => {

        if (newBid === undefined) {
            return { accepted: false, reason: "new bid is missing" };     
        }
    
        if (newBidUser === undefined) {
            return { accepted: false, reason: "new bid user is missing" };
        }
    
        const match = dbJson.find(item => item.id == id);
    
        if (match == undefined)  {
            return { accepted: false, reason: "invalid or missing item ID" };
        }
    
        if (match.lastBid >= newBid) {
            return { accepted: false, reason: "Bid is not high enough" };
        }

        match.lastBid = newBid;
        match.lastBidUser = newBidUser;
        return { accepted: true, reason: null };
    }
};

app.listen(3000,
    () => {
        setInterval(virtualBid, 5000);
        console.log("Server started and listening on port 3000...");
    }
);

app.get("/", (req,res) => {
    res.send(dbJson);
})

app.use("/", graphqlHTTP( { schema, rootValue }) );

// virtual bidder
function virtualBid() {

    const virtualBidders = [ "orange-fox", "magical-hobbit", "lazy-koala", "monkeydon", "jan-ko", "ewa-b", "ryba-k"]

    dbJson.forEach((item) => {

        // generate a random percentage from 1 to 2
        const increase = Math.random() * 2;
        item.lastBid *= Number(1.0 + (increase / 100));

        // select a random fake user ID
        const index = Math.floor(Math.random() * 7);
        item.lastBidUser = virtualBidders[ index ];
    })
}

module.exports = rootValue