var Fabric_Client = require('fabric-client');
var path = require('path');

// import Fabric_Client from 'fabric-client';
// import path from 'path';
// import util from 'util';

var fabric_client = new Fabric_Client();

var channel = fabric_client.newChannel('mychannel');
var peer = fabric_client.newPeer('grpc://localhost:7051');
channel.addPeer(peer);
var orderer = fabric_client.newOrderer('grpc://localhost:7050');
channel.addOrderer(orderer);

var member_user = null;
var store_path = path.join(__dirname, 'hfc-key-store');
console.log('Store path: '+store_path);
var tx_id=null;

// import express from 'express';
var express = require('express');
const app = express();
const port = 3000;
// import bodyParser from 'body-parser';
// import cors from 'cors';
var bodyParser = require('body-parser');
var cors = require('cors');

app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.get('/test', (req,res) => res.send('Hello World!'));
app.listen(port, () => console.log(`listening on port ${port}!`));

app.get('/invoices', function (req, res) {

    // create the key value store as defined in the fabric-client/config/default.json 'key-value-store' setting
    Fabric_Client.newDefaultKeyValueStore({ path: store_path
    }).then((state_store) => {
        // assign the store to the fabric client
        fabric_client.setStateStore(state_store);
        var crypto_suite = Fabric_Client.newCryptoSuite();
        // use the same location for the state store (where the users' certificate are kept)
        // and the crypto store (where the users' keys are kept)
        var crypto_store = Fabric_Client.newCryptoKeyStore({path: store_path});
        crypto_suite.setCryptoKeyStore(crypto_store);
        fabric_client.setCryptoSuite(crypto_suite);

        // get the enrolled user from persistence, this user will sign all requests
        return fabric_client.getUserContext('user1', true);
    }).then((user_from_store) => {
        if (user_from_store && user_from_store.isEnrolled()) {
            console.log('Successfully loaded user1 from persistence');
            member_user = user_from_store;
        } else {
            throw new Error('Failed to get user1.... run registerUser.js');
        }

        // queryInvoice chaincode function - requires 1 argument, ex: args: ['INVOICE4'],
        // queryAllInvoices chaincode function - requires no arguments , ex: args: [''],
        const request = {
            //targets : --- letting this default to the peers assigned to the channel
            chaincodeId: 'invoice',
            fcn: 'displayAllInvoices',
            args: ['']
        };

        var ar = [];
        var attr = req.query.attr;

        // send the query proposal to the peer
        return channel.queryByChaincode(request);
    }).then((query_responses) => {
        console.log("Query has completed, checking results");
    // query_responses could have more than one  results if there multiple peers were used as targets
        if (query_responses && query_responses.length == 1) {
            if (query_responses[0] instanceof Error) {
                console.error("error from query = ", query_responses[0]);
            } else {
                console.log("Response is ", query_responses[0].toString());
                res.send(query_responses[0].toString());
            }
        } else {
            console.log("No payloads were returned from query");
        }
    }).catch((err) => {
        console.error('Failed to query successfully :: ' + err);
    });
});

app.all('/invoice', function(req, res){    

    Fabric_Client.newDefaultKeyValueStore({ path: store_path
    }).then((state_store) => {
        fabric_client.setStateStore(state_store);
        var crypto_suite = Fabric_Client.newCryptoSuite();
        var crypto_store = Fabric_Client.newCryptoKeyStore({path: store_path});
        crypto_suite.setCryptoKeyStore(crypto_store);
        fabric_client.setCryptoSuite(crypto_suite);

        return fabric_client.getUserContext('user1', true);
    }).then((user_from_store) => {
        if (user_from_store && user_from_store.isEnrolled()) {
            console.log('Successfully loaded user1 from persistence');
            member_user = user_from_store;
        } else {
            throw new Error('Failed to get user1.... run registerUser.js');
        }

        tx_id = fabric_client.newTransactionID();
        console.log("Assigning transaction_id: ", tx_id._transaction_id);

        var request = {
            chaincodeId: 'invoice',
            chainId: 'mychannel',
            txId: tx_id
        };

        var newinvoice = [];
        
        var invoicenumber = req.body.invoicenumber;
        var billedto = req.body.billedto;
        var invoicedate = req.body.invoicedate;
        var invoiceamount = req.body.invoiceamount;
        var itemdescription = req.body.itemdescription;
        var gr = req.body.gr;
        var ispaid = req.body.ispaid;
        var paidamount = req.body.paidamount;
        var repaid = req.body.repaid;
        var repaymentamount = req.body.repaymentamount;
        
        newinvoice.push(invoicenumber);

        if (req.method == "POST") {
            request.fcn='raiseInvoice';
            newinvoice.push(billedto);
            newinvoice.push(invoicedate);
            newinvoice.push(invoiceamount);
            newinvoice.push(itemdescription);
            newinvoice.push(gr);
            newinvoice.push(ispaid);
            newinvoice.push(paidamount);
            newinvoice.push(repaid); 
            newinvoice.push(repaymentamount);
            
        } else if (req.method == "PUT") {
        // if(owner)    
        // {
        //     request.fcn= 'goodsReceived',
        //     newinvoice.push(owner);
        // }

        // else if(color)
        // {
        //   request.fcn= 'changeCarColour',
        //   newcar.push(color);
        // }
        }

        request.args=newinvoice;
        console.log(request);

        return channel.sendTransactionProposal(request);
    }).then((results) => {
        var proposalResponses = results[0];
        var proposal = results[1];
        let isProposalGood = false;
        if (proposalResponses && proposalResponses[0].response &&
            proposalResponses[0].response.status === 200) {
            isProposalGood = true;
            console.log('Transaction proposal was good');
        } else {
            console.error('Transaction proposal was bad');
        }
        if (isProposalGood) {
            console.log(util.format(
            'Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s"',
            proposalResponses[0].response.status, proposalResponses[0].response.message));

        var request = {
            proposalResponses: proposalResponses,
            proposal: proposal
        };

        var transaction_id_string = tx_id.getTransactionID();
        var promises = [];

        var sendPromise = channel.sendTransaction(request);
        promises.push(sendPromise);
        
        let event_hub = channel.newChannelEventHub(peer);
        
        let txPromise = new Promise((resolve, reject) => {
            let handle = setTimeout(() => {
                event_hub.unregisterTxEvent(transaction_id_string);
                event_hub.disconnect();
                resolve({event_status : 'TIMEOUT'}); //we could use reject(new Error('Trnasaction did not complete within 30 seconds'));
            }, 3000);
            event_hub.registerTxEvent(transaction_id_string, (tx, code) => {
                    clearTimeout(handle);

                    var return_status = {event_status : code, tx_id : transaction_id_string};
                    if (code !== 'VALID') {
                        console.error('The transaction was invalid, code = ' + code);
                        resolve(return_status); // we could use reject(new Error('Problem with the tranaction, event status ::'+code));
                    } else {
                        console.log('The transaction has been committed on peer ' + event_hub.getPeerAddr());
                        resolve(return_status);
                    }
                }, (err) => {
                    //this is the callback if something goes wrong with the event registration or processing
                    reject(new Error('There was a problem with the eventhub ::'+err));
                },
                {disconnect: true} //disconnect when complete
            );
            event_hub.connect();

        });
        promises.push(txPromise);

        return Promise.all(promises);
        } else {
            console.error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
            throw new Error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
        }
    }).then((results) => {
        console.log('Send transaction promise and event listener promise have completed');
        // check the results in the order the promises were added to the promise all list
        if (results && results[0] && results[0].status === 'SUCCESS') {
            console.log('Successfully sent transaction to the orderer.');
        } else {
            console.error('Failed to order the transaction. Error code: ' + results[0].status);
        }

        if(results && results[1] && results[1].event_status === 'VALID') {
            console.log('Successfully committed the change to the ledger by the peer');
            res.json({'result': 'success'});
        } else {
            console.log('Transaction failed to be committed to the ledger due to ::'+results[1].event_status);
        }
    }).catch((err) => {
        console.error('Failed to invoke successfully :: ' + err);
    });
})