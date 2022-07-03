// START of "Test bid and bidder" test cases
describe('Test bid and bidder', () => {
    const items = require('../server/items-db.json');

    it('checks if item exists', () => { //#1 exists in items-db
        expect(items.find(item => item.id == 1)).toBeDefined();
    });

    it('checks if item exists', () => { //#999 exists in items-db
        expect(items.find(item => item.id == 999)).toBeUndefined();
    });
    
    it('checks if current price of item 1 was successfully obtained', () => {
        expect(items.find(item => item.id == 1).lastBid).toBeDefined();
    });

    it('checks if current price of item 1 is equal 8000', () => {
        expect(items.find(item => item.id == 1).lastBid).toEqual(8000);
    });

    it('checks if last bidder of item 1 was successfully obtained', () => {
        expect(items.find(item => item.id == 1).lastBidUser).toBeDefined();
    });

    it('checks if last bidder of item 1 is equal null', () => { //null is the value in items-db
        expect(items.find(item => item.id == 1).lastBidUser).toEqual(null);
    });
})
// END of "Test bid and bidder" test cases

// START of "Submit Bid" test cases
describe('Submit bid cases', () => {
    const rootValue = require('../server/server.js');
  
    it('doesnt submit bid if bid is missing', () => {
        expect(rootValue.submitBid({id: 1, newBidUser:'testname'})).toEqual({accepted: false, reason: "new bid is missing"});
    });

    it('doesnt submit bid if bidder is undefined', () => {
        expect(rootValue.submitBid({id: 1, newBid: 50000})).toEqual({accepted: false, reason: "new bid user is missing"});
    });

    it('doesnt submit bid if ID doesnt match', () => {
        expect(rootValue.submitBid({id: 99999, newBid: 50000, newBidUser:'testuser'})).toEqual({accepted: false, reason: "invalid or missing item ID"});
    });

    it('doesnt submit bid if bid is not high enough', () => {
        // in items-db the last bid for item #1 is 8000
        let lastBid = 8000;
        let newBid = 7999;
        if (lastBid>newBid){
            expect(rootValue.submitBid({id: 1, newBid: 7999, newBidUser:'testuser'})).toEqual({accepted: false, reason: "Bid is not high enough"});
        }
    });

    it('submits bid', () => {
        // in items-db the last bid for item #1 is 8000
        expect(rootValue.submitBid({id: 1, newBid: 8001, newBidUser:'testuser'})).toEqual({accepted: true, reason: null});
    });
})
// END of "Submit Bid" test cases