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

    application.get('/cliente', function(req, res){		
        application.app.controllers.cliente.index(application, req, res);
    });

    application.get('/funcionario', function(req, res){		
        application.app.controllers.funcionario.index(application, req, res);
    });

    application.get('/produto', function(req, res){		
        application.app.controllers.produto.index(application, req, res);
    });

    application.get('/disponivel', function(req, res){		
        application.app.controllers.disponivel.index(application, req, res);
    });

    application.get('/pagamento', function(req, res){		
        application.app.controllers.pagamento.index(application, req, res);
    });


    application.get('/categoria', function(req, res){		
        application.app.controllers.categoria.index(application, req, res);
    });

    application.get('/mesa', function(req, res){		
        application.app.controllers.mesa.index(application, req, res);
    });

    application.get('/caixa', function(req, res){		
        application.app.controllers.caixa.index(application, req, res);
    });

    application.get('/pdv', function(req, res){		
        application.app.controllers.pdv.index(application, req, res);
    });

    application.get('/balcao/:_id', function(req, res){		
        application.app.controllers.balcao.index(application, req, res);
    });

    application.get('/salao/:_id', function(req, res){		
        application.app.controllers.salao.index(application, req, res);
    });

    application.get('/usuario', function(req, res){		
        application.app.controllers.usuario.index(application, req, res);
    });

    application.get('/grupo', function(req, res){		
        application.app.controllers.grupo.index(application, req, res);
    });

    

    
    
}  