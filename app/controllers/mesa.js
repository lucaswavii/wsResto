module.exports.index = function( application, req, res ){
    
    if( req.session.usuario == undefined ) {
		res.redirect("/login");
		return;			
    }
    var connection = application.config.dbConnection();
    var mesaDao = new application.app.models.MesaDAO(connection);
    var empresaDao = new application.app.models.EmpresaDAO(connection);
        
    empresaDao.listar(function(error, empresas){
        
        mesaDao.listar(function(error, mesas){

            connection.end();
            if( error ) {
                res.render('mesa', { validacao : [ {'msg': error }], mesas : {}, empresas:empresas, sessao: req.session.usuario  });
                return;
            }
            res.render('mesa', { validacao : {}, mesas : mesas,  empresas:empresas, sessao: req.session.usuario });
        
        });
    });
}

module.exports.editar = function( application, req, res ){
    
    var connection = application.config.dbConnection();
    var mesaDao = new application.app.models.MesaDAO(connection);
    var empresaDao = new application.app.models.EmpresaDAO(connection);
        
    
    var id = req.params._id;

    if( !id ) {
        empresaDao.listar(function(error, empresas){

            mesaDao.listar(function(error, mesas){
                connection.end();
                res.render('mesa', { validacao : [ {'msg': 'ID de edição não foi informado.' }], mesas : mesas, empresas:empresas, sessao: req.session.usuario  });
                return;
            });
        });
    }

    mesaDao.editar( id, function(error, result){
       
        if( error ) {
            empresaDao.listar(function(error, empresas){

                mesaDao.listar(function(error, mesas){
                    connection.end();
                    res.render('mesa', { validacao : [ {'msg': error }], mesas : mesas, empresas:empresas, sessao: req.session.usuario  });
                    return;
                });
            });
        }
        empresaDao.listar(function(error, empresas){
            connection.end();
            res.render('mesa', { validacao : {}, mesas : result, empresas:empresas, sessao: req.session.usuario });
            return;
        });
    });
}

module.exports.excluir = function( application, req, res ){
    
    var connection = application.config.dbConnection();
    var mesaDao = new application.app.models.MesaDAO(connection);
    var empresaDao = new application.app.models.EmpresaDAO(connection);
    var id = req.params._id;
    
    if( !id ) {
        empresaDao.listar(function(error, empresas){
            res.render('mesa', { validacao : [ {'msg': 'ID de edição não foi informado.' }], mesas : {}, empresas:empresas, sessao: req.session.usuario  });
            return;
        });
    }

    mesaDao.excluir( id, function(error, result){
        
        if( error ) {
            
            empresaDao.listar(function(error, empresas){

                mesaDao.listar(function(error, mesas){ 

                    if(error.errno != undefined && error.errno == 1451) { 
                        connection.end();
                        res.render('mesa', { validacao : [ {'msg': "Não se pode excluir dados com vínculos em outras tabelas." }], mesas : mesas, empresas:empresas, sessao: req.session.usuario  });
                    } else {                
                        res.render('mesa', { validacao : [ {'msg': error }], mesas : mesas, empresas:empresas, sessao: req.session.usuario   });
                        return;
                    }
                });
            });
        }
        connection.end();
        res.redirect("/mesa");
    });
}

module.exports.salvar = function( application, req, res ){
    
    var dadosForms = req.body;

    req.assert('nome', 'Nome é obrigatório!').notEmpty();       

    var erros = req.validationErrors();

    if(erros){
        res.render('mesa', {validacao: erros,  mesas: [dadosForms], sessao: req.session.usuario});
        return;
    }
    
    var connection = application.config.dbConnection();
    var mesaDao = new application.app.models.MesaDAO(connection);       
    
    mesaDao.salvar(dadosForms, function(error, result){        
        
        if( error ) {
            empresaDao.listar(function(error, empresas){

                mesaDao.listar(function(error, mesas){      
                    connection.end();               
                    res.render('mesa', { validacao : error, mesas : mesas, empresas: empresas, sessao: req.session.usuario });
                    return;
                });
            });
        }
        connection.end();  
        res.redirect('/mesa');
    });
     
}