module.exports = function(application){
    application.get('/', function(req, res){
        application.app.controllers.index.index(application, req, res);
    });
  
    application.get('/index', function(req, res){		
        application.app.controllers.index.index(application, req, res);
    });

    application.get('/empresa', function(req, res){		
        application.app.controllers.empresa.index(application, req, res);
    });

    application.get('/usuario', function(req, res){		
        application.app.controllers.usuario.index(application, req, res);
    });

    application.get('/grupo', function(req, res){		
        application.app.controllers.grupo.index(application, req, res);
    });

    application.get('/funcionario', function(req, res){		
        application.app.controllers.funcionario.index(application, req, res);
    });

    
    
}  