module.exports.index = function( application, req, res ){
    
    var connection = application.config.dbConnection();
    var empresaDao = new application.app.models.EmpresaDAO(connection);
    
    empresaDao.listar(function(error, empresas){
        connection.end();
        if( error ) {
            res.render('empresa', { validacao : [ {'msg': error }], empresas : {}, sessao: {}  });
            return;
        }
        res.render('empresa', { validacao : {}, empresas : empresas, sessao: {} });
    
    });
}

module.exports.editar = function( application, req, res ){
    
    var connection = application.config.dbConnection();
    var empresaDao = new application.app.models.EmpresaDAO(connection);
    
    var id = req.params._id;

    if( !id ) {
        empresaDao.listar(function(error, empresas){
            connection.end();
            res.render('empresa', { validacao : [ {'msg': 'ID de edição não foi informado.' }], empresas : empresas, sessao: {}  });
            return;
        });
    }

    empresaDao.editar( id, function(error, result){
       
        if( error ) {
            empresaDao.listar(function(error, empresas){
                connection.end();
                res.render('empresa', { validacao : [ {'msg': error }], empresas : empresas, sessao: {}  });
                return;
            });
        }
        connection.end();
        res.render('empresa', { validacao : {}, empresas : result, sessao: {} });
        return;
    });
}

module.exports.excluir = function( application, req, res ){
    
    var connection = application.config.dbConnection();
    var empresaDao = new application.app.models.EmpresaDAO(connection);
    
    var id = req.params._id;
    
    if( !id ) {
        res.render('empresa', { validacao : [ {'msg': 'ID de edição não foi informado.' }], empresas : {}, sessao: {}  });
        return;
    }

    empresaDao.excluir( id, function(error, result){
        
        if( error ) {

            empresaDao.listar(function(error, empresas){ 

                if(error.errno != undefined && error.errno == 1451) { 
                    connection.end();
                    res.render('empresa', { validacao : [ {'msg': "Não se pode excluir dados com vínculos em outras tabelas." }], empresas : empresas, sessao: {}  });
                } else {                
                    res.render('empresa', { validacao : [ {'msg': error }], empresas : empresas, sessao: {}   });
                    return;
                }
            });
        }
        connection.end();
        res.redirect("/empresa");
    });
}

module.exports.salvar = function( application, req, res ){
    
    var dadosForms = req.body;

    req.assert('nome', 'Nome é obrigatório!').notEmpty();       

    var erros = req.validationErrors();

    if(erros){
        res.render('empresa', {validacao: erros,  empresas: [dadosForms], sessao: {}});
        return;
    }
    
    var connection = application.config.dbConnection();
    var empresaDao = new application.app.models.EmpresaDAO(connection);      
    
    empresaDao.salvar(dadosForms, function(error, result){
        
        
        if( error ) {
            console.log(error)
            empresaDao.listar(function(error, empresas){      
                connection.end();               
                res.render('empresa', { validacao : error, empresas : empresas, sessao: {} });
                return;
            });
        }
        connection.end();  
        res.redirect('/empresa');

    });
     
}