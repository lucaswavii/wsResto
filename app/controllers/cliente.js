module.exports.index = function( application, req, res ){
    
    if( req.session.usuario == undefined ) {
		res.redirect("/login");
		return;			
    }
    
    var connection = application.config.dbConnection();
    var clienteDao = new application.app.models.ClienteDAO(connection);
    
    clienteDao.listar(function(error, clientes){
        connection.end();
        if( error ) {
            res.render('cliente', { validacao : [ {'msg': error }], clientes : {}, sessao: req.session.usuario  });
            return;
        }
        res.render('cliente', { validacao : {}, clientes : clientes, sessao: req.session.usuario });
    
    });
}

module.exports.editar = function( application, req, res ){
    
    var connection = application.config.dbConnection();
    var clienteDao = new application.app.models.ClienteDAO(connection);
    
    var id = req.params._id;

    if( !id ) {
        clienteDao.listar(function(error, clientes){
            connection.end();
            res.render('cliente', { validacao : [ {'msg': 'ID de edição não foi informado.' }], clientes : clientes, sessao: req.session.usuario  });
            return;
        });
    }

    clienteDao.editar( id, function(error, result){
       
        if( error ) {
            clienteDao.listar(function(error, clientes){
                connection.end();
                res.render('cliente', { validacao : [ {'msg': error }], clientes : clientes, sessao: req.session.usuario  });
                return;
            });
        }
        connection.end();
        res.render('cliente', { validacao : {}, clientes : result, sessao: req.session.usuario });
        return;
    });
}

module.exports.excluir = function( application, req, res ){
    
    var connection = application.config.dbConnection();
    var clienteDao = new application.app.models.ClienteDAO(connection);
    
    var id = req.params._id;
    
    if( !id ) {
        res.render('cliente', { validacao : [ {'msg': 'ID de edição não foi informado.' }], clientes : {}, sessao: req.session.usuario  });
        return;
    }

    clienteDao.excluir( id, function(error, result){
        
        if( error ) {

            clienteDao.listar(function(error, clientes){ 

                if(error.errno != undefined && error.errno == 1451) { 
                    connection.end();
                    res.render('cliente', { validacao : [ {'msg': "Não se pode excluir dados com vínculos em outras tabelas." }], clientes : clientes, sessao: req.session.usuario  });
                } else {                
                    res.render('cliente', { validacao : [ {'msg': error }], clientes : clientes, sessao: req.session.usuario   });
                    return;
                }
            });
        }
        connection.end();
        res.redirect("/cliente");
    });
}

module.exports.salvar = function( application, req, res ){
    
    var dadosForms = req.body;

    req.assert('nome', 'Nome é obrigatório!').notEmpty();       

    var erros = req.validationErrors();

    if(erros){
        res.render('cliente', {validacao: erros,  clientes: [dadosForms], sessao: req.session.usuario});
        return;
    }
    
    var connection = application.config.dbConnection();
    var clienteDao = new application.app.models.ClienteDAO(connection);      
    
    clienteDao.salvar(dadosForms, function(error, result){
        
        
        if( error ) {
            
            clienteDao.listar(function(error, clientes){      
                connection.end();               
                res.render('cliente', { validacao : error, clientes : clientes, empresas: {}, sessao: req.session.usuario });
                return;
            });
        }
        connection.end();  
        res.redirect('/cliente');
    });
     
}