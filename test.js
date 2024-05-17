const fs = require('fs');
const filePath = 'sortie.json';

fs.readFile(filePath, 'utf-8', (err, data) => {
	if (err) {
		console.error('Error reading file: ' + err);
		return;
	}
	try {
		
		const JSONData = JSON.parse(data);
		console.log(JSONData.graph[0]);

	}catch (parseError) {
    	console.error('Error parsing JSON: ' + parseError);
  	}
});
