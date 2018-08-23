module.exports.index = function( application, req, res ){
    
    if( req.session.usuario == undefined ) {
		res.redirect("/login");
		return;			
    }
    var connection = application.config.dbConnection();
    var grupoDao = new application.app.models.GrupoDAO(connection);
    
    grupoDao.listar(function(error, grupos){
        connection.end();
        if( error ) {
            res.render('grupo', { validacao : [ {'msg': error }], grupos : {}, sessao: {}  });
            return;
        }
        res.render('grupo', { validacao : {}, grupos : grupos, sessao: {} });
    
    });
}

module.exports.editar = function( application, req, res ){
    
    var connection = application.config.dbConnection();
    var grupoDao = new application.app.models.GrupoDAO(connection);
    
    var id = req.params._id;

    if( !id ) {
        grupoDao.listar(function(error, grupos){
            connection.end();
            res.render('grupo', { validacao : [ {'msg': 'ID de edição não foi informado.' }], grupos : grupos, sessao: {}  });
            return;
        });
    }

    grupoDao.editar( id, function(error, result){
       
        if( error ) {
            grupoDao.listar(function(error, grupos){
                connection.end();
                res.render('grupo', { validacao : [ {'msg': error }], grupos : grupos, sessao: {}  });
                return;
            });
        }
        connection.end();
        res.render('grupo', { validacao : {}, grupos : result, sessao: {} });
        return;
    });
}

module.exports.excluir = function( application, req, res ){
    
    var connection = application.config.dbConnection();
    var grupoDao = new application.app.models.GrupoDAO(connection);
    
    var id = req.params._id;
    
    if( !id ) {
        res.render('grupo', { validacao : [ {'msg': 'ID de edição não foi informado.' }], grupos : {}, sessao: {}  });
        return;
    }

    grupoDao.excluir( id, function(error, result){
        
        if( error ) {

            grupoDao.listar(function(error, grupos){ 

                if(error.errno != undefined && error.errno == 1451) { 
                    connection.end();
                    res.render('grupo', { validacao : [ {'msg': "Não se pode excluir dados com vínculos em outras tabelas." }], grupos : grupos, sessao: {}  });
                } else {                
                    res.render('grupo', { validacao : [ {'msg': error }], grupos : grupos, sessao: {}   });
                    return;
                }
            });
        }
        connection.end();
        res.redirect("/grupo");
    });
}

module.exports.salvar = function( application, req, res ){
    
    var dadosForms = req.body;

    req.assert('nome', 'Nome é obrigatório!').notEmpty();       

    var erros = req.validationErrors();

    if(erros){
        res.render('grupo', {validacao: erros,  grupos: [dadosForms], sessao: {}});
        return;
    }
    
    var connection = application.config.dbConnection();
    var grupoDao = new application.app.models.GrupoDAO(connection);       
    
    grupoDao.salvar(dadosForms, function(error, result){
        
        
        if( error ) {
            
            grupoDao.listar(function(error, grupos){      
                connection.end();               
                res.render('grupo', { validacao : error, grupos : grupos, empresas: {}, sessao: {} });
                return;
            });
        }
        connection.end();  
        res.redirect('/grupo');
    });
     
}