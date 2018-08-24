module.exports = function(application){
  
    application.get('/login', function(req, res){		
        res.render('login');
    });

    application.post('/acessar', function(req, res){		
        application.app.controllers.usuario.login(application, req, res);
    });

    
}  