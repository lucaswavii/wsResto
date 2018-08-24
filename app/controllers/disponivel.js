module.exports.index = function( application, req, res ){
    
    if( req.session.usuario == undefined ) {
		res.redirect("/login");
		return;			
    }
    var connection = application.config.dbConnection();
    var disponivelDao = new application.app.models.DisponivelDAO(connection);
    
    disponivelDao.listar(function(error, disponiveis){
        connection.end();
        if( error ) {
            res.render('disponivel', { validacao : [ {'msg': error }], disponiveis : {}, sessao: req.session.usuario  });
            return;
        }
        res.render('disponivel', { validacao : {}, disponiveis : disponiveis, sessao: req.session.usuario });
    
    });
}

module.exports.editar = function( application, req, res ){
    
    var connection = application.config.dbConnection();
    var disponivelDao = new application.app.models.DisponivelDAO(connection);
    
    var id = req.params._id;

    if( !id ) {
        disponivelDao.listar(function(error, disponiveis){
            connection.end();
            res.render('disponivel', { validacao : [ {'msg': 'ID de edição não foi informado.' }], disponiveis : disponiveis, sessao: req.session.usuario  });
            return;
        });
    }

    disponivelDao.editar( id, function(error, result){
       
        if( error ) {
            disponivelDao.listar(function(error, disponiveis){
                connection.end();
                res.render('disponivel', { validacao : [ {'msg': error }], disponiveis : disponiveis, sessao: req.session.usuario  });
                return;
            });
        }
        connection.end();
        res.render('disponivel', { validacao : {}, disponiveis : result, sessao: req.session.usuario });
        return;
    });
}

module.exports.excluir = function( application, req, res ){
    
    var connection = application.config.dbConnection();
    var disponivelDao = new application.app.models.DisponivelDAO(connection);
    
    var id = req.params._id;
    
    if( !id ) {
        res.render('disponivel', { validacao : [ {'msg': 'ID de edição não foi informado.' }], disponiveis : {}, sessao: req.session.usuario  });
        return;
    }

    disponivelDao.excluir( id, function(error, result){
        
        if( error ) {

            disponivelDao.listar(function(error, disponiveis){ 

                if(error.errno != undefined && error.errno == 1451) { 
                    connection.end();
                    res.render('disponivel', { validacao : [ {'msg': "Não se pode excluir dados com vínculos em outras tabelas." }], disponiveis : disponiveis, sessao: req.session.usuario  });
                } else {                
                    res.render('disponivel', { validacao : [ {'msg': error }], disponiveis : disponiveis, sessao: req.session.usuario   });
                    return;
                }
            });
        }
        connection.end();
        res.redirect("/disponivel");
    });
}

module.exports.salvar = function( application, req, res ){
    
    var dadosForms = req.body;

    req.assert('nome', 'Nome é obrigatório!').notEmpty();       

    var erros = req.validationErrors();

    if(erros){
        res.render('disponivel', {validacao: erros,  disponiveis: [dadosForms], sessao: req.session.usuario});
        return;
    }
    
    var connection = application.config.dbConnection();
    var disponivelDao = new application.app.models.DisponivelDAO(connection);       
    
    disponivelDao.salvar(dadosForms, function(error, result){
        
        
        if( error ) {
            
            disponivelDao.listar(function(error, disponiveis){      
                connection.end();               
                res.render('disponivel', { validacao : error, disponiveis : disponiveis, empresas: {}, sessao: req.session.usuario });
                return;
            });
        }
        connection.end();  
        res.redirect('/disponivel');
    });
     
}