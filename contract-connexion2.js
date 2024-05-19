require('dotenv').config();
// Importation de la librairie JS 
const { Web3 } = require('web3');

// Compression et décompression de données
const pako = require('pako');

// RPC endpoint. Sepolia provider
const web3 = new Web3('https://rpc.sepolia.org/');

// Informations about the contract déployé sur Sepolia
const contractAddress = process.env.CONTRACT_ADDRESS_2;
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
				"indexed": true,
				"internalType": "bytes32",
				"name": "hash_of_uuid",
				"type": "bytes32"
			},
			{
				"indexed": false,
				"internalType": "bytes",
				"name": "json",
				"type": "bytes"
			}
		],
		"name": "jsonStored",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "stringArgument",
				"type": "string"
			}
		],
		"name": "hashString",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "pure",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "hash_of_uuid",
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
		"inputs": [],
		"name": "json_block",
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
		"inputs": [
			{
				"internalType": "bytes",
				"name": "_json_in_str",
				"type": "bytes"
			},
			{
				"internalType": "string",
				"name": "_uuid",
				"type": "string"
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

async function readlastTransaction(){
	console.log("Reading JSON string from contract...");
	
	try{
		// appeler la méthode JSONfile du contrat pour obtenir la valeur
		const value = await contract.methods.json_block().call();
		console.log("Value read from contract:", value);

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


// effectue une transaction pour écrire une valeur dans le contrat
// Fonctionne probablement pas à cause de la séparation du JSON en blocs
async function writeContract(jsonstring){
	// Ecriture dans le contrat
	console.log("Writing to contract...");
	
	// compress
	const compressedDATA = pako.deflate(btoa(JSON.stringify(jsonstring)));
	console.log("Compressed string:", compressedDATA);

	const tx = await contract.methods.storeJson(compressedDATA).send({from: userAddress});
	console.log("Transaction:", tx);
	return tx;
}


const { parse: uuidParse } = require('uuid');

// Effectue toutes les transactions nécessaires pour écrire le JSON dans le contrat
async function writeJsonInBlocks(graph, uuid) {
	console.log("Writing to contract (but in littles blocks of Json)...");

	// Tableau pour stocker toutes les transactions
	// nécessaire pour écrire le JSON dans le contrat
	const txarray = [];

	for (let index = 0; index < graph.length; index++) {
		const element = graph[index];
		console.log("Writing the node", index + 1, "out of", graph.length);

		const compressedDATA = pako.deflate(btoa(JSON.stringify(element)));

		console.log("uuid:", uuid);

		const tx = await contract.methods.storeJson(compressedDATA, uuid).send({from: userAddress});

		const hash_of_uuid = await contract.methods.hash_of_uuid().call();
		console.log("Hash of UUID read from contract:", hash_of_uuid);

		txarray.push(tx);
	}

	return txarray;
}

// Informations sur la transaction
async function getTransaction(txHash){
	console.log("Getting transaction...", txHash);
	const tx = await web3.eth.getTransaction(txHash);
	return tx
}

const { stringify: uuidStringify } = require('uuid');

async function getLastUUIDstored(){
	const uuid = await contract.methods.hash_of_uuid().call();
	console.log("Hash of UUID read from contract:", uuid);

	// Fonction pour convertir une chaîne hexadécimale en chaîne de caractères
	// const fromHexToString = (hexString) =>
		// Uint8Array.from(hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
	
	// Enlever le '0x' du début de la chaîne
	// const shifted = fromHexToString(uuid.slice(2));

	return uuid;
}

// Retourne JSON de tous les events passés
function getAllPastEvents(){
	const evengs = contract.getPastEvents('jsonStored', {
		fromBlock: 5913684,
		toBlock: 'latest'
	})
	return evengs;
}

async function getLastJsonStored(){
	try{
		console.log("Getting last JSON stored in contract...");
		const uuid = await contract.methods.hash_of_uuid().call();
		console.log("Hash of UUID read from contract:", uuid);

		const fromHexToString = (hexString) =>
			Uint8Array.from(hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
		

		const events = await contract.getPastEvents('jsonStored', {
			filter: {hash_of_uuid: uuid},
			fromBlock: 5913684,
			toBlock: 'latest'
		});

		console.log("Events:", events);

		const outputarray = [];

		// Lire les données du JSON et les remettre ensemble
		for (let index = 0; index < events.length; index++) {
			const element = events[index];
			// récupération de la compression du bout de JSON
			const json = element.returnValues.json;
			// Enlever le '0x' du début de la chaîne
			const shifted = fromHexToString(json.slice(2));
			// Décompression
			const decompressed = pako.inflate(shifted, {"to": "string"});
			// Conversion en JSON
			const jsondata = JSON.parse(atob(decompressed));
			// Ajout dans le tableau
			outputarray.push(jsondata);
		}
		// Création du JSON final
		const finaljson = outputarray.reduce((acc, val) => {
			acc.graph.push(val);
			return acc;
		}, {graph: []});

		return finaljson;
	} catch (err){
		console.log("Error while getting last JSON stored:", err);
		return err;
	}
}

///////////////// api

const express = require('express');
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;

app.get("/currentJson", (req, res) => {

	getLastJsonStored().then(value => {
		console.log("Current JSON stored in contract:", value);
		res.send(value);
	})

	// readlastTransaction().then(value => {
	// 	console.log("Current JSON stored in contract:", value);
	// 	res.send(value);
	// })
});

app.get("/lastTransaction", (req, res) => {
	readlastTransaction().then(value => {
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

app.get("/lastUUID", (req, res) => {
	getLastUUIDstored().then(uuid => {
		console.log("Last hash of  UUID stored in contract:", uuid);
		res.send(uuid);
	})
});



BigInt.prototype['toJSON'] = function () { 
	return this.toString()
}

// UUID sert à générer un identifiant unique pour chaque fichier
// Permet ensuite de retrouver le fichier dans la blockchain
// car il est stocké sur des transactions différentes
const { v5: uuidv5 } = require('uuid');
const { v4: uuidv4 } = require('uuid');
const NAMESPACE = process.env.UUID_NAMESPACE;

app.post("/sendJson", (req, res) => {
	const file = req.body;

	// console.log("File received is",file);

	// Génération d'un UUID aléatoire pour chaque fichier
	const random_uuid = uuidv4();
	console.log("Random UUID is",random_uuid);

	// Génération d'un UUID pour chaque fichier (hash fichier + namespace)
	// const file_uuid = uuidv5(JSON.stringify(file), NAMESPACE);
	// console.log("File UUID is",file_uuid);

	const graph = file.graph;
	console.log("Graph is",graph);
	console.log("Graph length is (number of nodes):",graph.length);

	if (Array.isArray(graph) && graph.length >= 2) {
		writeJsonInBlocks(graph, random_uuid).then(tx => {
			console.log(tx);
			res.json(tx);
		})

	} else {
		console.log('Graph data is not in the expected format.');
		res.json('Graph data is not in the expected format.');
	}

	// writing to contract
	// writeContract(req.body).then(tx => {
	// 	console.log(tx.events);
	// 	res.json(tx);
	// })
});


app.listen(PORT, () => {
	console.log("Server listening on port", PORT);
});
