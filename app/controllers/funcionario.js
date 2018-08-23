module.exports.index = function( application, req, res ){
    
    if( req.session.usuario == undefined ) {
		res.redirect("/login");
		return;			
    }
    
    var connection = application.config.dbConnection();
    var funcionarioDao = new application.app.models.FuncionarioDAO(connection);
    
    funcionarioDao.listar(function(error, funcionarios){
        connection.end();
        if( error ) {
            res.render('funcionario', { validacao : [ {'msg': error }], funcionarios : {}, sessao: {}  });
            return;
        }
        res.render('funcionario', { validacao : {}, funcionarios : funcionarios, sessao: {} });
    
    });
}

module.exports.editar = function( application, req, res ){
    
    var connection = application.config.dbConnection();
    var funcionarioDao = new application.app.models.FuncionarioDAO(connection);
    
    var id = req.params._id;

    if( !id ) {
        funcionarioDao.listar(function(error, funcionarios){
            connection.end();
            res.render('funcionario', { validacao : [ {'msg': 'ID de edição não foi informado.' }], funcionarios : funcionarios, sessao: {}  });
            return;
        });
    }

    funcionarioDao.editar( id, function(error, result){
       
        if( error ) {
            funcionarioDao.listar(function(error, funcionarios){
                connection.end();
                res.render('funcionario', { validacao : [ {'msg': error }], funcionarios : funcionarios, sessao: {}  });
                return;
            });
        }
        connection.end();
        res.render('funcionario', { validacao : {}, funcionarios : result, sessao: {} });
        return;
    });
}

module.exports.excluir = function( application, req, res ){
    
    var connection = application.config.dbConnection();
    var funcionarioDao = new application.app.models.FuncionarioDAO(connection);
    
    var id = req.params._id;
    
    if( !id ) {
        res.render('funcionario', { validacao : [ {'msg': 'ID de edição não foi informado.' }], funcionarios : {}, sessao: {}  });
        return;
    }

    funcionarioDao.excluir( id, function(error, result){
        
        if( error ) {

            funcionarioDao.listar(function(error, funcionarios){ 

                if(error.errno != undefined && error.errno == 1451) { 
                    connection.end();
                    res.render('funcionario', { validacao : [ {'msg': "Não se pode excluir dados com vínculos em outras tabelas." }], funcionarios : funcionarios, sessao: {}  });
                } else {                
                    res.render('funcionario', { validacao : [ {'msg': error }], funcionarios : funcionarios, sessao: {}   });
                    return;
                }
            });
        }
        connection.end();
        res.redirect("/funcionario");
    });
}

module.exports.salvar = function( application, req, res ){
    
    var dadosForms = req.body;

    req.assert('nome', 'Nome é obrigatório!').notEmpty();       

    var erros = req.validationErrors();

    if(erros){
        res.render('funcionario', {validacao: erros,  funcionarios: [dadosForms], sessao: {}});
        return;
    }
    
    var connection = application.config.dbConnection();
    var funcionarioDao = new application.app.models.FuncionarioDAO(connection);      
    
    funcionarioDao.salvar(dadosForms, function(error, result){
        
        
        if( error ) {
            
            funcionarioDao.listar(function(error, funcionarios){      
                connection.end();               
                res.render('funcionario', { validacao : error, funcionarios : funcionarios, empresas: {}, sessao: {} });
                return;
            });
        }
        connection.end();  
        res.redirect('/funcionario');
    });
     
}