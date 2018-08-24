module.exports.index = function( application, req, res ){
    
    if( req.session.usuario == undefined ) {
		res.redirect("/login");
		return;			
    }

    var connection = application.config.dbConnection();
    var produtoDao = new application.app.models.ProdutoDAO(connection);
    var categoriaDao = new application.app.models.CategoriaDAO(connection);

    categoriaDao.listar(function(error, categorias){
        console.log(categorias)
        produtoDao.listar(function(error, produtos){
            console.log(produtos)
            connection.end();
            if( error ) {
                res.render('produto', { validacao : [ {'msg': error }], produtos : {}, categorias:categorias, sessao: req.session.usuario  });
                return;
            }
            res.render('produto', { validacao : {}, produtos : produtos, categorias:categorias, sessao: req.session.usuario });
        
        });
    });
}

module.exports.editar = function( application, req, res ){
    
    var connection = application.config.dbConnection();
    var produtoDao = new application.app.models.ProdutoDAO(connection);
    var categoriaDao = new application.app.models.CategoriaDAO(connection);

    
    var id = req.params._id;

    if( !id ) {
        categoriaDao.listar(function(error, categorias){

            produtoDao.listar(function(error, produtos){
                connection.end();
                res.render('produto', { validacao : [ {'msg': 'ID de edição não foi informado.' }], produtos : produtos, categorias:categorias, sessao: req.session.usuario  });
                return;
            });
        });
    }

    produtoDao.editar( id, function(error, result){
       
        if( error ) {
            categoriaDao.listar(function(error, categorias){
                produtoDao.listar(function(error, produtos){
                    connection.end();
                    res.render('produto', { validacao : [ {'msg': error }], produtos : produtos, categorias:categorias, sessao: req.session.usuario  });
                    return;
                });
            });
        }
        categoriaDao.listar(function(error, categorias){
            connection.end();
            res.render('produto', { validacao : {}, produtos : result, categorias:categorias, sessao: req.session.usuario });
            return;
        });
    });
}

module.exports.excluir = function( application, req, res ){
    
    var connection = application.config.dbConnection();
    var produtoDao = new application.app.models.ProdutoDAO(connection);
    var categoriaDao = new application.app.models.CategoriaDAO(connection);

    var id = req.params._id;
    
    if( !id ) {
        categoriaDao.listar(function(error, categorias){
            res.render('produto', { validacao : [ {'msg': 'ID de edição não foi informado.' }], produtos : {}, categorias:categorias, sessao: req.session.usuario  });
            return;
        });
    }

    produtoDao.excluir( id, function(error, result){
        
        if( error ) {
            categoriaDao.listar(function(error, categorias){
                produtoDao.listar(function(error, produtos){ 

                    if(error.errno != undefined && error.errno == 1451) { 
                        connection.end();
                        res.render('produto', { validacao : [ {'msg': "Não se pode excluir dados com vínculos em outras tabelas." }], produtos : produtos, categorias:categorias, sessao: req.session.usuario  });
                    } else {                
                        res.render('produto', { validacao : [ {'msg': error }], produtos : produtos, categorias:categorias, sessao: req.session.usuario   });
                        return;
                    }
                });
            });
        }
        connection.end();
        res.redirect("/produto");
    });
}

module.exports.salvar = function( application, req, res ){
    
    var dadosForms = req.body;

    req.assert('nome', 'Nome é obrigatório!').notEmpty();       

    var connection = application.config.dbConnection();
    var produtoDao = new application.app.models.ProdutoDAO(connection);
    var categoriaDao = new application.app.models.CategoriaDAO(connection);

    var erros = req.validationErrors();

    if(erros){
        res.render('produto', {validacao: erros,  produtos: [dadosForms], sessao: req.session.usuario});
        return;
    }

    var pathImagem = !dadosForms.pathImagem ? '/images/noImagem.png' : dadosForms.pathImagem;

    if ( req.files.imageFile ) {
        let sampleFile = req.files.imageFile;
        pathImagem = '/images/' + sampleFile.name;
        sampleFile.mv('app/public/images/' + sampleFile.name , function(err) {
            if (err)
              return res.status(500).send(err);
        });
    }
   
    dadosForms.pathImagem = pathImagem;
   
    var preco =  parseFloat(dadosForms.preco.replace('.','').replace(',','.'));
    dadosForms.preco = preco;

    var estoque =  parseFloat(dadosForms.estoque.replace('.','').replace(',','.'));
    dadosForms.estoque = estoque;

    var connection = application.config.dbConnection();
    var produtoDao = new application.app.models.ProdutoDAO(connection);       
    
    produtoDao.salvar(dadosForms, function(error, result){
        
        
        if( error ) {
            categoriaDao.listar(function(error, categorias){
                produtoDao.listar(function(error, produtos){      
                    connection.end();               
                    res.render('produto', { validacao : error, produtos : produtos, categorias: categorias, sessao: req.session.usuario });
                    return;
                });
            });
        }
        connection.end();  
        res.redirect('/produto');
    });
     
}