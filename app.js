const express = require('express');

const app = express();
app.use(express.json());

// set up port for the server to listen on
const PORT = process.env.PORT || 3000;




app.get("/api", (request, response) => {
	response.json({ count });
});

app.post("/api", (request, response) => {
	count++;
	response.json({ count });
});

// set up the server to listen on the port
app.listen(PORT, () => {
	console.log("Server listening on port", PORT);
});
