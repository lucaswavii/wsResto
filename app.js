var app = require('./config/server');

app.listen(process.env.port || process.env.PORT || 3978, function(){
	console.log("Servidor ON");	
});
