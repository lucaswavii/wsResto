module.exports.index = function( application, req, res ){
    
    if( req.session.usuario == undefined ) {
		res.redirect("/login");
		return;			
    }
    
    var connection = application.config.dbConnection();
    var usuarioDao = new application.app.models.UsuarioDAO(connection);
    var grupoDao = new application.app.models.GrupoDAO(connection);
    var empresaDao = new application.app.models.EmpresaDAO(connection);
    var funcionarioDao = new application.app.models.FuncionarioDAO(connection);
    
    
    empresaDao.listar(function(error, empresas){        
    
        grupoDao.listar(function(error, grupos){

            funcionarioDao.listar(function(error, funcionarios){
        
                usuarioDao.listar(function(error, usuarios){

                    connection.end();
                    if( error ) {
                        res.render('usuario', { validacao : [ {'msg': error }], usuarios : {}, empresas:empresas, grupos:grupos, funcionarios:funcionarios, sessao: {}  });
                        return;
                    }
                    res.render('usuario', { validacao : {}, usuarios : usuarios, empresas:empresas, grupos:grupos, funcionarios:funcionarios, sessao: {} });            
                });
            })
        });
    });
}

module.exports.editar = function( application, req, res ){
    
    var connection = application.config.dbConnection();
    var usuarioDao = new application.app.models.UsuarioDAO(connection);
    var grupoDao = new application.app.models.GrupoDAO(connection);
    var empresaDao = new application.app.models.EmpresaDAO(connection);
    
    var id = req.params._id;

    if( !id ) {
        empresaDao.listar(function(error, empresas){        
    
            grupoDao.listar(function(error, grupos){

                usuarioDao.listar(function(error, usuarios){

                    connection.end();
                    res.render('usuario', { validacao : [ {'msg': 'ID de edição não foi informado.' }], usuarios : usuarios, empresas:empresas, grupos:grupos, sessao: {}  });
                    return;
                });
            });
        });
    }

    usuarioDao.editar( id, function(error, result){
       
        if( error ) {
            empresaDao.listar(function(error, empresas){        
    
                grupoDao.listar(function(error, grupos){
    
                    usuarioDao.listar(function(error, usuarios){
    
          
                        connection.end();
                        res.render('usuario', { validacao : [ {'msg': error }], usuarios : usuarios, empresas:empresas, grupos:grupos, sessao: {}  });
                        return;
                    });
                });
            });
        }
        connection.end();
        res.redirect('/usuario');
    });
}

module.exports.excluir = function( application, req, res ){
    
    var connection = application.config.dbConnection();
    var usuarioDao = new application.app.models.UsuarioDAO(connection);
    
    var id = req.params._id;
    
    if( !id ) {
        res.render('usuario', { validacao : [ {'msg': 'ID de edição não foi informado.' }], usuarios : {}, sessao: {}  });
        return;
    }

    usuarioDao.excluir( id, function(error, result){
        
        if( error ) {

            usuarioDao.listar(function(error, usuarios){ 

                if(error.errno != undefined && error.errno == 1451) { 
                    connection.end();
                    res.render('usuario', { validacao : [ {'msg': "Não se pode excluir dados com vínculos em outras tabelas." }], usuarios : usuarios, sessao: {}  });
                } else {                
                    res.render('usuario', { validacao : [ {'msg': error }], usuarios : usuarios, sessao: {}   });
                    return;
                }
            });
        }
        connection.end();
        res.redirect("/usuario");
    });
}

module.exports.salvar = function( application, req, res ){
    var crypto = require('crypto');

    var dadosForms = req.body;

    req.assert('nome', 'Nome é obrigatório!').notEmpty();       

    var erros = req.validationErrors();

    if(erros){
        res.render('usuario', {validacao: erros,  usuarios: [dadosForms], sessao: {}});
        return;
    }
    
    if( dadosForms.senha ) {
        var senha_criptografada = crypto.createHash("md5").update(dadosForms.senha).digest("hex");
        dadosForms.senha = senha_criptografada;
    }
    
    var connection = application.config.dbConnection();
    var usuarioDao = new application.app.models.UsuarioDAO(connection);       
    
    usuarioDao.salvar(dadosForms, function(error, result){
        
        
        if( error ) {
            
            usuarioDao.listar(function(error, usuarios){      
                connection.end();               
                res.render('usuario', { validacao : error, usuarios : usuarios, empresas: {}, sessao: {} });
                return;
            });
        }
        connection.end();  
        res.redirect('/usuario');
    });
     
}