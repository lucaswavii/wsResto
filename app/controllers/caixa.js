module.exports.index = function( application, req, res ){
    
    if( req.session.usuario == undefined ) {
		res.redirect("/login");
		return;			
    }
    var connection = application.config.dbConnection();
    var caixaDao = new application.app.models.CaixaDAO(connection);
    var empresaDao = new application.app.models.EmpresaDAO(connection);
    var disponivelDao = new application.app.models.DisponivelDAO(connection);
        
    empresaDao.listar(function(error, empresas){
        disponivelDao.listar(function(error, disponiveis){
            caixaDao.listar(function(error, caixas){

                connection.end();
                if( error ) {
                    res.render('caixa', { validacao : [ {'msg': error }], caixas : {}, empresas:empresas, disponiveis:disponiveis, sessao: req.session.usuario  });
                    return;
                }
                res.render('caixa', { validacao : {}, caixas : caixas,  empresas:empresas, disponiveis:disponiveis, sessao: req.session.usuario });
            
            });
        });
    });
}

module.exports.editar = function( application, req, res ){
    
    var connection = application.config.dbConnection();
    var caixaDao = new application.app.models.CaixaDAO(connection);
    var empresaDao = new application.app.models.EmpresaDAO(connection);
    var disponivelDao = new application.app.models.DisponivelDAO(connection);   
    
    var id = req.params._id;

    if( !id ) {
        empresaDao.listar(function(error, empresas){
            disponivelDao.listar(function(error, disponiveis){
                caixaDao.listar(function(error, caixas){
                    connection.end();
                    res.render('caixa', { validacao : [ {'msg': 'ID de edição não foi informado.' }], caixas : caixas, empresas:empresas, disponiveis:disponiveis, sessao: req.session.usuario  });
                    return;
                });
            });
        });
    }

    caixaDao.editar( id, function(error, result){
       
        if( error ) {
            empresaDao.listar(function(error, empresas){
                disponivelDao.listar(function(error, disponiveis){
                    caixaDao.listar(function(error, caixas){
                        connection.end();
                        res.render('caixa', { validacao : [ {'msg': error }], caixas : caixas, empresas:empresas, disponiveis:disponiveis, sessao: req.session.usuario  });
                        return;
                    });
                });
            });
        }
        empresaDao.listar(function(error, empresas){
            disponivelDao.listar(function(error, disponiveis){
                connection.end();
                res.render('caixa', { validacao : {}, caixas : result, empresas:empresas, disponiveis:disponiveis, sessao: req.session.usuario });
                return;
            });
        });
    });
}

module.exports.excluir = function( application, req, res ){
    
    var connection = application.config.dbConnection();
    var caixaDao = new application.app.models.CaixaDAO(connection);
    var empresaDao = new application.app.models.EmpresaDAO(connection);
    var disponivelDao = new application.app.models.DisponivelDAO(connection);

    var id = req.params._id;
    
    if( !id ) {
        empresaDao.listar(function(error, empresas){
            
            disponivelDao.listar(function(error, disponiveis){
                res.render('caixa', { validacao : [ {'msg': 'ID de edição não foi informado.' }], caixas : {}, empresas:empresas, disponiveis:disponiveis, sessao: req.session.usuario  });
                return;
            });
        });
    }

    caixaDao.excluir( id, function(error, result){
        
        if( error ) {
            
            empresaDao.listar(function(error, empresas){

                disponivelDao.listar(function(error, disponiveis){

                    caixaDao.listar(function(error, caixas){ 

                        if(error.errno != undefined && error.errno == 1451) { 
                            connection.end();
                            res.render('caixa', { validacao : [ {'msg': "Não se pode excluir dados com vínculos em outras tabelas." }], caixas : caixas, empresas:empresas, disponiveis:disponiveis, sessao: req.session.usuario  });
                        } else {                
                            res.render('caixa', { validacao : [ {'msg': error }], caixas : caixas, empresas:empresas, disponiveis:disponiveis, sessao: req.session.usuario   });
                            return;
                        }
                    });
                });
            });
        }
        connection.end();
        res.redirect("/caixa");
    });
}

module.exports.salvar = function( application, req, res ){
    
    var dadosForms = req.body;
    
    var connection = application.config.dbConnection();
    var caixaDao = new application.app.models.CaixaDAO(connection);
    var empresaDao = new application.app.models.EmpresaDAO(connection);
    var disponivelDao = new application.app.models.DisponivelDAO(connection);     

    req.assert('nome', 'Nome é obrigatório!').notEmpty();       

    var erros = req.validationErrors();

    if(erros){
        empresaDao.listar(function(error, empresas){
            disponivelDao.listar(function(error, disponiveis){
                res.render('caixa', {validacao: erros,  caixas: [dadosForms], empresas:empresas, disponiveis:disponiveis, sessao: req.session.usuario});
                return;
            });
        });
    }
    
     
    
    caixaDao.salvar(dadosForms, function(error, result){        
        
        if( error ) {
            empresaDao.listar(function(error, empresas){
                disponivelDao.listar(function(error, disponiveis){
                    caixaDao.listar(function(error, caixas){      
                        connection.end();               
                        res.render('caixa', { validacao : error, caixas : caixas, empresas: empresas, disponiveis:disponiveis, sessao: req.session.usuario });
                        return;
                    });
                });
            });
        }
        connection.end();  
        res.redirect('/caixa');
    });
     
}