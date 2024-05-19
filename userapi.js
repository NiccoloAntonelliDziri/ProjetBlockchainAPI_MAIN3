async function postJSON(data){
	const response = await fetch('http://localhost:3000/sendJson', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: data,
	});
	const jsonResponse = await response.json();
	console.log(jsonResponse);
}

async function getLastJSON(){
		fetch('http://localhost:3000/currentJson')
			.then((response) => response.text())
			.then((body) => {
				console.log(JSON.parse(body));
		  	});
}

async function getLastUUID() {
	fetch('http://localhost:3000/lastUUID')
		.then((response) => response.text())
		.then((body) => {
			console.log(body);
		});
}

async function getPastTx() {
	fetch('http://localhost:3000/PastTx')
		.then((response) => response.text())
		.then((body) => {
			console.log(JSON.parse(body)[0]);
		});
}

async function getLastTx() {
	fetch('http://localhost:3000/lastTransaction')
		.then((response) => response.text())
		.then((body) => {
			console.log(JSON.parse(body));
		});
}

const fs = require('fs');
const filePath = 'sortie_example.json';

const pako = require('pako');

fs.readFile(filePath, 'utf-8', (err, data) => {
	if (err) {
		console.error('Error reading file: ' + err);
		return;
	}
	try {
		
		// postJSON(data);

		getLastJSON();
		
		// getLastUUID();

		// getPastTx();

		// getLastTx();
	
	}catch (parseError) {
    	console.error('Error parsing JSON: ' + parseError);
  	}
});


