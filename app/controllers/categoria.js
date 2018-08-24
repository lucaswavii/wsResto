module.exports.index = function( application, req, res ){
    
    if( req.session.usuario == undefined ) {
		res.redirect("/login");
		return;			
    }
    var connection = application.config.dbConnection();
    var categoriaDao = new application.app.models.CategoriaDAO(connection);
    
    categoriaDao.listar(function(error, categorias){
        connection.end();
        if( error ) {
            res.render('categoria', { validacao : [ {'msg': error }], categorias : {}, sessao: req.session.usuario  });
            return;
        }
        res.render('categoria', { validacao : {}, categorias : categorias, sessao: req.session.usuario });
    
    });
}

module.exports.editar = function( application, req, res ){
    
    var connection = application.config.dbConnection();
    var categoriaDao = new application.app.models.CategoriaDAO(connection);
    
    var id = req.params._id;

    if( !id ) {
        categoriaDao.listar(function(error, categorias){
            connection.end();
            res.render('categoria', { validacao : [ {'msg': 'ID de edição não foi informado.' }], categorias : categorias, sessao: req.session.usuario  });
            return;
        });
    }

    categoriaDao.editar( id, function(error, result){
       
        if( error ) {
            categoriaDao.listar(function(error, categorias){
                connection.end();
                res.render('categoria', { validacao : [ {'msg': error }], categorias : categorias, sessao: req.session.usuario  });
                return;
            });
        }
        connection.end();
        res.render('categoria', { validacao : {}, categorias : result, sessao: req.session.usuario });
        return;
    });
}

module.exports.excluir = function( application, req, res ){
    
    var connection = application.config.dbConnection();
    var categoriaDao = new application.app.models.CategoriaDAO(connection);
    
    var id = req.params._id;
    
    if( !id ) {
        res.render('categoria', { validacao : [ {'msg': 'ID de edição não foi informado.' }], categorias : {}, sessao: req.session.usuario  });
        return;
    }

    categoriaDao.excluir( id, function(error, result){
        
        if( error ) {

            categoriaDao.listar(function(error, categorias){ 

                if(error.errno != undefined && error.errno == 1451) { 
                    connection.end();
                    res.render('categoria', { validacao : [ {'msg': "Não se pode excluir dados com vínculos em outras tabelas." }], categorias : categorias, sessao: req.session.usuario  });
                } else {                
                    res.render('categoria', { validacao : [ {'msg': error }], categorias : categorias, sessao: req.session.usuario   });
                    return;
                }
            });
        }
        connection.end();
        res.redirect("/categoria");
    });
}

module.exports.salvar = function( application, req, res ){
    
    var dadosForms = req.body;

    req.assert('nome', 'Nome é obrigatório!').notEmpty();       

    var erros = req.validationErrors();

    if(erros){
        res.render('categoria', {validacao: erros,  categorias: [dadosForms], sessao: req.session.usuario});
        return;
    }
    
    var connection = application.config.dbConnection();
    var categoriaDao = new application.app.models.CategoriaDAO(connection);       
    
    categoriaDao.salvar(dadosForms, function(error, result){
        
        
        if( error ) {
            
            categoriaDao.listar(function(error, categorias){      
                connection.end();               
                res.render('categoria', { validacao : error, categorias : categorias, empresas: {}, sessao: req.session.usuario });
                return;
            });
        }
        connection.end();  
        res.redirect('/categoria');
    });
     
}