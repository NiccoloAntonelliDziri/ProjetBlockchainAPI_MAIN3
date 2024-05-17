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

const fs = require('fs');
const filePath = 'package.json';


const pako = require('pako');

fs.readFile(filePath, 'ascii', (err, data) => {
  if (err) {
    console.error('Error reading file: ' + err);
    return;
  }

  try {
    
	// const json = JSON.parse(data);
	// console.log("DATA:",data);
	// console.log("DATA:",btoa(data));
	// 
	// const compressedData = pako.deflate(btoa(data));
	//
	// console.log("Compressed Data type",typeof compressedData);
	// console.log("Compressed Data",String(compressedData));
	// 
	// const decompressedData = pako.inflate(compressedData, { to: 'string' });
	//
	// console.log("decompressedData:",atob(decompressedData));

	
    // Call the extractDataFromJson function
    // const extractedData = extractDataFromJson(jsonData);
	
	// postJSON(data);	
	
	fetch('http://localhost:3000/currentJson')
	  .then((response) => response.text())
	  .then((body) => {
		console.log(JSON.parse(body));
	  });
  }catch (parseError) {
    console.error('Error parsing JSON: ' + parseError);
  }
});


