var app = angular.module("diamondGrove", []);

app.controller("mainController", function ($scope, $http) {
    $scope.inventory = [];
    $scope.newBids = [];
    $scope.compareChecked = [];

    // GET list of items and latest bids
    $scope.retrieveItemList = () => {

        console.log("$scope.retrieveItemList() called");

        fetch("http://127.0.0.1:3000",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    query: "{ merchandises { id name description lastBid lastBidUser imageUrl }}"
                })
            }
        )
        .then((res) => res.json())
        .then((result) => { 
            console.log(result.data);
            $scope.$apply( () => $scope.inventory = result.data.merchandises );
        })
        .catch((error) => console.log("Server responsed with an error: " + error) );
    };

    $scope.updateNow = (id, index) => {

        console.log("$scope.updatNow(" + id + ", " + index +  ") called");

        fetch("http://127.0.0.1:3000",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    query: `
                        query Merchandise($id: ID) {
                            merchandise(id: $id) {
                                lastBid
                                lastBidUser
                            }
                        }             
                    `,
                    variables: {
                        id: id
                    }    
                })
            }
        )
        .then((res) => res.json())
        .then((result) => { 
            console.log(result.data);
            $scope.$apply( () => {
                $scope.inventory[index].lastBid = result.data.merchandise.lastBid ;
                $scope.inventory[index].lastBidUser = result.data.merchandise.lastBidUser;
            });
        })
        .catch((error) => console.log("Server responsed with an error: " + error) );        

    }

    // POST a new bid

    $scope.sendBid = (itemId, newBid, newBidUser) => {
        console.log("$scope.sendBid(" + itemId + ", " + newBid + ", " + newBidUser + ") called");

        fetch("http://127.0.0.1:3000",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                query: `
                    mutation submitBid($id: ID, $newBid: Float, $newBidUser: String) {

                        submitBid(id: $id, newBid: $newBid, newBidUser: $newBidUser) {
                            accepted
                            reason
                        }
                    
                    }
                `,
                variables: {
                    id: itemId,
                    newBid: newBid,
                    newBidUser: "mariia.s"
                }
            })
        })
        .then((res) => res.json())
        .then((result) => { 
            console.log(result.data.submitBid);
            if (result.data.submitBid.accepted) {
                $scope.retrieveItemList();
            }
            else {
                alert("Server responsed with an error: " + result.data.submitBid.reason);
            }

        })
        .catch((error) => console.log("Server responsed with an error: " + error) );

    };

    $scope.retrieveItemList();
    setInterval($scope.retrieveItemList, 9000);
});
