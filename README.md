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
  a) Paid Amount to be always less than invoice amount.
  b) Repayment amount to be always greater than payment amount.
  
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

