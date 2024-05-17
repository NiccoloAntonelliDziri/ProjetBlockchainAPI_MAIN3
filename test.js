const fs = require('fs');
const filePath = 'sortie.json';

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
