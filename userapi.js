async function postJSON(data){
	const response = await fetch('http://localhost:3000/test', {
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

const fs = require('fs');
const filePath = 'package.json';

const pako = require('pako');

fs.readFile(filePath, 'utf-8', (err, data) => {
	if (err) {
		console.error('Error reading file: ' + err);
		return;
	}
	try {
		
		postJSON(data);

		// getLastJSON();
	
		// fetch('http://localhost:3000/currentJson')
		// 	.then((response) => response.text())
		// 	.then((body) => {
		// 		console.log(JSON.parse(body));
		//   	});

	}catch (parseError) {
    	console.error('Error parsing JSON: ' + parseError);
  	}
});


