// Importation de la librairie JS web3
const { Web3 } = require('web3');

// Initialisation de web3 avec un provider pour Sepolia
const web3 = new Web3('https://rpc.sepolia.org/');

// wallet
// Clé privé du compte
const privateKey = '0x4d5b0ad7aaba555525e615ee2c434eedda4dd32d4296f91ef0f870dd86e45a8a'
// Rajouter 0x devant le nombre
const wallet = web3.eth.accounts.wallet.add(privateKey);

// Affiche les détails du compte
//console.log("Account 1:", wallet[0]);

// Adresse du contract
const address = '0x1714407ec758887845565a7E6865784b2cEB4E22';
// JSON descriptif du smart contract
const abi = 
[
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "personWhoModified",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "newValue",
				"type": "uint256"
			}
		],
		"name": "ValueChanged",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "newValue",
				"type": "uint256"
			}
		],
		"name": "setValue",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "initialBlock",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "value",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]

const contract = new web3.eth.Contract(abi, address);

async function getNumber(){
	const num = await contract.methods.value().call();
	console.log("The number is: ", num);
}

async function setNumber(){
	const tx = await contract.methods.setValue(42).send({from: wallet[0].address});
	const txReceipt = await web3.eth.getTransactionReceipt(tx.transactionHash);
	console.log(txReceipt);
}

// setNumber();

getNumber();

contract.getPastEvents('ValueChanged', {
	fromBlock: 5837157,
	toBlock: 'latest'
})
.then(function(events){
	console.log(events);	// Affiche les events
})
.catch(function(error){
	console.error(error);
});
