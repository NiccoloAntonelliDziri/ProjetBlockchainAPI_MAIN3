require('dotenv').config();
// Importation de la librairie JS 
const { Web3 } = require('web3');

// Compression et décompression de données
const pako = require('pako');

// RPC endpoint. Sepolia provider
const web3 = new Web3('https://rpc.sepolia.org/');

// Informations about the contract déployé sur Sepolia
const contractAddress = process.env.CONTRACT_ADDRESS;
const contractABI =
[
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "_from",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "bytes",
				"name": "JSONfile",
				"type": "bytes"
			},
			{
				"indexed": false,
				"internalType": "bytes32",
				"name": "JSONhash",
				"type": "bytes32"
			}
		],
		"name": "newStrIsStored",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "JSONfile",
		"outputs": [
			{
				"internalType": "bytes",
				"name": "",
				"type": "bytes"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "JSONhash",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes",
				"name": "_string",
				"type": "bytes"
			}
		],
		"name": "hashStringWithAssembly",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "hash",
				"type": "bytes32"
			}
		],
		"stateMutability": "pure",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "initialblock",
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
		"inputs": [
			{
				"internalType": "bytes",
				"name": "json_in_str",
				"type": "bytes"
			}
		],
		"name": "storeJson",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
]


// Clé privée du compte qui accède au contrat
// Avec le préfixe 0x
const privateKey = process.env.PRIVATE_KEY;
const account = web3.eth.accounts.wallet.add(privateKey);
const userAddress = account[0].address;

// Instantiation du contrat
const contract = new web3.eth.Contract(contractABI, contractAddress);

// Fonctions pour lire la valeur stockée dans le contrat
/////////////////////////////////////
async function readJSON(){
	console.log("Reading JSON string from contract...");
	
	try{
		// appeler la méthode JSONfile du contrat pour obtenir la valeur
		const value = await contract.methods.JSONfile().call();

		// Fonction pour convertir une chaîne hexadécimale en chaîne de caractères
		const fromHexToString = (hexString) =>
			Uint8Array.from(hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
		
		// Enlever le '0x' du début de la chaîne
		const shifted = fromHexToString(value.slice(2));
		// Décompresser la chaîne
		const decompressed = pako.inflate(shifted, {"to": "string"});

		// console.log("Reading JSON output", JSON.parse(atob(decompressed)));
		return JSON.parse(atob(decompressed));
	} catch (err){
		console.log("Error while decompressing:", err);
	}
}

async function readJSONhash(){
	console.log("Reading JSON hash from contract...");
	const value = await contract.methods.JSONhash().call();
	return value;
}

async function readInitialBlock(){
	console.log("Reading initisal block value from contract...");
	const value = await contract.methods.initialblock().call();
	return value;
}

async function writeContract(jsonstring){
	// Ecriture dans le contrat
	console.log("Writing value to contract...");
	
	// compress
	const compressedDATA = pako.deflate(btoa(JSON.stringify(jsonstring)));
	// console.log("Compressed string:", compressedDATA);

	const tx = await contract.methods.storeJson(compressedDATA).send({from: userAddress});
	// console.log("Transaction:", tx);
	return tx;
}

// Informations sur la transaction
async function getTransaction(txHash){
	const tx = await web3.eth.getTransaction(txHash);
	return tx
}

// Retourne JSON de tous les events passés
function getAllPastEvents(){
	const evengs = contract.getPastEvents('newStrIsStored', {
		fromBlock: 5913684,
		toBlock: 'latest'
	})
	return evengs;
}


///////////////// api

const express = require('express');
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;

app.get("/currentJson", (req, res) => {
	readJSON().then(value => {
		console.log("Current JSON stored in contract:", value);
		res.send(value);
	})
});

app.get("/getTxFromHash/:txHash", (req, res) => {
	const txHash = req.params.txHash;
	getTransaction(txHash).then(tx => {
		console.log("Transaction:", tx);
		res.json(tx);
	})
});

app.get("/pastTx", (req, res) => {
	getAllPastEvents().then(events => {
		console.log("All past events:", events);
		res.send(events);
	})
});

BigInt.prototype['toJSON'] = function () { 
	return this.toString()
}

app.post("/test", (req, res) => {
	console.log("File received is",req.body);

	// writing to contract
	writeContract(req.body).then(tx => {
		// console.log(tx.events);
		res.json(tx);
	})
});

 
app.listen(PORT, () => {
	console.log("Server listening on port", PORT);
});
