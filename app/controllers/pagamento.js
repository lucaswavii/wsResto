module.exports.index = function( application, req, res ){
    
    if( req.session.usuario == undefined ) {
		res.redirect("/login");
		return;			
    }
    var connection = application.config.dbConnection();
    var pagamentoDao = new application.app.models.PagamentoDAO(connection);
    
        
    pagamentoDao.listar(function(error, pagamentos){

        connection.end();
        if( error ) {
            res.render('pagamento', { validacao : [ {'msg': error }], pagamentos : {},  sessao: req.session.usuario  });
            return;
        }
        res.render('pagamento', { validacao : {}, pagamentos : pagamentos,   sessao: req.session.usuario });
    
    });

}

module.exports.editar = function( application, req, res ){
    
    var connection = application.config.dbConnection();
    var pagamentoDao = new application.app.models.PagamentoDAO(connection);
    
    var id = req.params._id;

    if( !id ) {
        

        pagamentoDao.listar(function(error, pagamentos){
            connection.end();
            res.render('pagamento', { validacao : [ {'msg': 'ID de edição não foi informado.' }], pagamentos : pagamentos,  sessao: req.session.usuario  });
            return;
        });
    
    }

    pagamentoDao.editar( id, function(error, result){
       
        if( error ) {
           
            pagamentoDao.listar(function(error, pagamentos){
                connection.end();
                res.render('pagamento', { validacao : [ {'msg': error }], pagamentos : pagamentos,  sessao: req.session.usuario  });
                return;
            });

        }
        
        connection.end();
        res.render('pagamento', { validacao : {}, pagamentos : result,  sessao: req.session.usuario });
        return;
    
    });
}

module.exports.excluir = function( application, req, res ){
    
    var connection = application.config.dbConnection();
    var pagamentoDao = new application.app.models.PagamentoDAO(connection);
 
    var id = req.params._id;
    
    if( !id ) {
    
        res.render('pagamento', { validacao : [ {'msg': 'ID de edição não foi informado.' }], pagamentos : {},  sessao: req.session.usuario  });
        return;

    }

    pagamentoDao.excluir( id, function(error, result){
        
        if( error ) {
            
            

            pagamentoDao.listar(function(error, pagamentos){ 

                if(error.errno != undefined && error.errno == 1451) { 
                    connection.end();
                    res.render('pagamento', { validacao : [ {'msg': "Não se pode excluir dados com vínculos em outras tabelas." }], pagamentos : pagamentos,  sessao: req.session.usuario  });
                } else {                
                    res.render('pagamento', { validacao : [ {'msg': error }], pagamentos : pagamentos,  sessao: req.session.usuario   });
                    return;
                }
            });
            
        }
        connection.end();
        res.redirect("/pagamento");
    });
}

module.exports.salvar = function( application, req, res ){
    
    var dadosForms = req.body;

    req.assert('nome', 'Nome é obrigatório!').notEmpty();       

    var erros = req.validationErrors();

    if(erros){
        res.render('pagamento', {validacao: erros,  pagamentos: [dadosForms], sessao: req.session.usuario});
        return;
    }
    
    var connection = application.config.dbConnection();
    var pagamentoDao = new application.app.models.PagamentoDAO(connection);       
    
    pagamentoDao.salvar(dadosForms, function(error, result){        
        
        if( error ) {
            

            pagamentoDao.listar(function(error, pagamentos){      
                connection.end();               
                res.render('pagamento', { validacao : error, pagamentos : pagamentos, empresas: empresas, sessao: req.session.usuario });
                return;
            });
        
        }
        connection.end();  
        res.redirect('/pagamento');
    });
     
}