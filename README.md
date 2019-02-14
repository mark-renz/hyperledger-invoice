#hyperledger-invoice

This is a hyperledger project using the fabric-samples template.
The project is a simple supply chain management DAPP in hyperledger.
The application is consist of the following functions:

a) Raise Invoice (only supplier can create invoice)

b) Goods Received (only OEM can register GR)

c) Bank Payment to supplier (only bank can pay to supplier)

d) OEM repays to bank (only OEM can pay back to bank)

e) Transaction log (audit history) for invoice

f) Display invoice per supplier

g) Display invoice per OEM

h) Display all invoices

  Additional validation at chaincode
  
  a) Paid Amount to be always less than invoice amount
  
  b) Repayment amount to be always greater than payment amount
  
  
  
Pre-requisites:

Operating System: Ubuntu 18.04 64-bit
Hardware: atleast 4gb ram
Docker engine: 17.03 or higher
Docker-Compose: 1.8 or higher
Node: 8.9 or higher
npm: v5.x
git: 2.9.x or higher
python: 2.7.x
fabric-samples repository: 1.4 
  command to clone fabric-samples: git clone https://github.com/hyperledger/fabric-samples

To run the application follow this steps:
1. Clone the repository. Paste this command to terminal to clone: git clone https://github.com/mark-renz/hyperledger-invoice
2. Go to the repository and go to the invoice folder
3. In the invoice folder open a terminal then input the following commands:
  ./startFabric.sh
  npm install
  node enrollAdmin.js
  node registerUser.js
  node app.js
  
Once the "Example app listening on port 3000!" appears you can open a browser and go to localhost:3000 to test the application

contents:
chaincode/go/invoice.go
  contains the smart contract and all the functions to run the app

invoice/startFabric.sh
  contains PATHS and commands to initiate the network

invoice/enrollAdmin.js
  contains the commands to create the certificates for admin
   *admin is needed to generate different users

invoice/registerUser.js
  contains the commands to generate users and their respective certificate
   *this file generates 4 users user1,oem,supplier and bank
   
invoice/app.js
  contains the paths to access/routing of the functions in the app using the browser (localhost:3000)
  -localhost:3000/raiseInvoice
  -localhost:3000/invoice
  -localhost:3000/invoices
  -localhost:3000/block
  
  
