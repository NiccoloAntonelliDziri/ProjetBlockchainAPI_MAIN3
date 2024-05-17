require('dotenv').config();
// Importation de la librairie JS 
const { Web3 } = require('web3');

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

/////////////////////////////////////

// Compression et décompression de données
const pako = require('pako');


// convert hex to string
function hex2a(hex) {
	var arr = [];
	for (var i = 0; i < hex.length; i += 2) {
		arr.push(parseInt(hex.substr(i, 2), 16));
		
	}
	console.log("hex2a function final array:", arr);
	return new Uint8Array(arr);
}

// Fonctions pour lire la valeur stockée dans le contrat
/////////////////////////////////////
async function readJSON(){
	console.log("Reading JSON string from contract...");
	const value = await contract.methods.JSONfile().call();
	
	// decompress
	console.log("Reading compressed JSON string from contract:", value);
	console.log("JSON parsed:", value);

	// Type of value
	console.log("Type of value:", typeof value);

	// hex= value.slice(2);
	// var arr= [];
	// for (var i = 0; i < hex.length; i += 2) {
	// 	arr.push(parseInt(hex.substr(i, 2), 16));
	// }
	// console.log("Array:", arr);

	// console.log("Après avoir enlever 0x:", value);
	try{
		const fromHexToString = (hexString) =>
			Uint8Array.from(hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
		
		const shifted = fromHexToString(value.slice(2));
		console.log("Shifted:", shifted);
		const decompressed = pako.inflate(shifted, {"to": "string"});
		console.log("Reading JSON output", atob(decompressed));
		return atob(decompressed);
	} catch (err){
		console.log("Error while decompressing:", err);
	}
}

async function readJSONhash(){
	console.log("Reading JSON hash from contract...");
	const value = await contract.methods.JSONhash().call();
	return value;
}

// readJSON().then(value => {
// 	console.log("Current JSON stored in contract:", value);
// }).catch(err => {
// 	console.log("Error while reading JSON:", err);
// });

async function readInitialBlock(){
	console.log("Reading initisal block value from contract...");
	const value = await contract.methods.initialblock().call();
	return value;
}
////////////////////////////////////


async function writeContract(jsonstring){
	// Ecriture dans le contrat
	console.log("Writing value to contract...");
	console.log("JSON string to write:", jsonstring);
	
	// jsonstring = JSON.stringify(jsonstring).replace(/^"(.+(?="$))"$/, '$1');
	console.log("stringify string:", JSON.stringify(jsonstring));
	// console.log("stringify + btoa string:", btoa(JSON.stringify(jsonstring)));
	
	// compress
	const compressedDATA = pako.deflate(btoa(JSON.stringify(jsonstring)));
	console.log("Compressed string:", compressedDATA);

	// console.log("Type of string:", typeof jsonstring);gcc

	const tx = await contract.methods.storeJson(compressedDATA).send({from: userAddress});
	// console.log("Transaction hash:", tx.transactionHash);
	// console.log("Transaction receipt:", tx.events);
	// console.log("logs:", tx.logs);
	// console.log("Bgresrgergre", tx.logs.topics);

	// console.log("getParams", getParameters(tx));
	return tx;
}

// Informations sur la transaction
async function getTransaction(txHash){
	const tx = await web3.eth.getTransaction(txHash);
	return tx
}

// tx = getTransaction('0xa5bc6f234ea7edd4d8e86879a00d35a3c900654e77b0a26f459bd1e335f81a9e');

// writeContract(700);
//console.log("ABI:", contract.methods.setValue(700).encodeABI());

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
	console.log("Body received is",req.body);
	res.json("File received successfully (I hope by this line of code)");

	// writing to contract
	writeContract(req.body).then(tx => {
		console.log(tx.events);
	})
});

// app.post("/upload", upload.single('file'), (req, res) => {
// 	if (!req.file) {
//     	return res.status(400).json({ error: 'No file uploaded' });
//   	}
// 	res.json({ "message": "File uploaded successfully" });
// });
 

app.listen(PORT, () => {
	console.log("Server listening on port", PORT);
});
