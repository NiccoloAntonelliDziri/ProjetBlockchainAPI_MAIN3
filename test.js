const fs = require('fs');
const filePath = 'sortie.json';

fs.readFile(filePath, 'utf-8', (err, data) => {
	if (err) {
		console.error('Error reading file: ' + err);
		return;
	}
	try {
		
		// console.log("Fichier JASON: ",data);
		// console.log("Type: ", typeof data);
		const jsonData = JSON.parse(data);
		console.log("JSONData: ", jsonData);
		// console.log("Type: ", typeof JSONData);

		const extractedData = jsonData.graph;
		// console.log("extractedData: ", extractedData);
		// console.log("Type: ", typeof extractedData);
		console.log("Length: ", extractedData.length);

		if (Array.isArray(extractedData) && extractedData.length >= 2) {
      		console.log('First job:', extractedData[0]);
     		console.log('Second job:', JSON.stringify(extractedData[0]));
      	// 	console.log('4 job:', extractedData[3]);
     	 // 	console.log('5 job:', extractedData[5]);

			// console.log("Type of 4 job: ", typeof extractedData[3]);
    	} else {
      		console.log('Graph data is not in the expected format.');
		}

	}catch (parseError) {
    	console.error('Error parsing JSON: ' + parseError);
  	}
});
