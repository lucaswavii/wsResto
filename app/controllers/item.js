module.exports.atendimento = function( application, req, res ){
    
    if( req.session.usuario == undefined ) {
		res.redirect("/login");
		return;			
    }
    var idCupom = req.params._id;

    var connection = application.config.dbConnection();
    var produtoDao = new application.app.models.ProdutoDAO(connection);
    var itemDao = new application.app.models.ItemDAO(connection);
    var pagarDao = new application.app.models.PagarDAO(connection);
    var pagamentoDao = new application.app.models.PagamentoDAO(connection);
    var categoriaDao = new application.app.models.CategoriaDAO(connection);
    var movimentoDao = new application.app.models.MovimentoDAO(connection);
    var mesaDao = new application.app.models.MesaDAO(connection);
    var clienteDao = new application.app.models.ClienteDAO(connection);
 
    movimentoDao.editar( idCupom, function(error, movimentos ){

        clienteDao.editar( movimentos[0].cliente, function(error, cliente ){
            
            mesaDao.editar( movimentos[0].mesa, function(error, mesas ){
                
                categoriaDao.listar(function(error, categorias){

                    pagamentoDao.listar(function(error, pagamentos){

                        produtoDao.listar(function(error, produtos){

                            itemDao.listar(idCupom, function(error, itens){
                            
                                pagarDao.listar(idCupom, function(error, pagar){
                                    
                                    clienteDao.listar(function(error, clientes ){
                                        res.render('item', { validacao :{}, cliente:cliente[0], clientes:clientes, idCupom:idCupom, mesas:mesas, itens:itens, categorias:categorias, produtos:produtos, pagar:pagar, pagamentos:pagamentos, sessao:req.session.usuario  });
                                        return;
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
}

module.exports.incluirItem = function( application, req, res ){
    
    var cupom = req.params._id;
    var dadosForms = req.body;
 
    if( req.session.usuario == undefined ) {
		res.redirect("/login");
		return;			
    }

    var connection = application.config.dbConnection();
    var movimentoDao = new application.app.models.MovimentoDAO(connection);
    var itemDao = new application.app.models.ItemDAO(connection);
    var produtoDao = new application.app.models.ProdutoDAO(connection);

    var item = { movimento: cupom, produto: dadosForms.produto, quantidade: dadosForms.quantidade, unitario: 0, total: 0, atendente: req.session.usuario.fcid }
    
    movimentoDao.editar( cupom, function(error, movimentos){
        
        if( !movimentos[0].fim ) {
            
            produtoDao.editar( item.produto, function(error, produtos){
                
                item.unitario = produtos[0].preco;
                item.total    = item.quantidade > 1 ? item.quantidade * item.unitario : item.unitario;
               
                if( produtos[0].estoque >= item.quantidade) {
                    
                    produtos[0].estoque = produtos[0].estoque - item.quantidade;
                    
                    itemDao.salvar(item, function(error, result){
                        
                        produtoDao.salvar(produtos[0], function(error, result){
                            
                            res.redirect("/item/" + cupom);
                            return;
                        });
                    });

                } else {
                    req.flash('errorMessage', 'Saldo insuficiente para atender o pedido.')
                    res.redirect("/item/" + cupom);
                    return;
                }
            });
        } else {
            req.flash('errorMessage', 'Não se pode incluir itens com a mesa fechada. Verifique na tela de salão.')
            res.redirect("/item/" + cupom);
            return;
        }
    });
}

module.exports.pagamentoMesa = function( application, req, res ){
    
    var cupom = req.params._id;
    var dadosForms = req.body;
    var empresa = req.session.usuario.emid;

    if( req.session.usuario == undefined ) {
        res.redirect("/login");
        return;			
    }

    var empresa = req.session.usuario.emid;
    var connection = application.config.dbConnection();           
    var pagarDao = new application.app.models.PagarDAO(connection); 
    var movimentoDao = new application.app.models.MovimentoDAO(connection); 
    var pdvDao = new application.app.models.PdvDAO(connection); 
    var caixaDao = new application.app.models.CaixaDAO(connection);         
    var itemDao = new application.app.models.ItemDAO(connection); 

    movimentoDao.editar( cupom, function(error, movimentos){

        pdvDao.listar(empresa, function(error, pdvs){
            
            var frenteDeLojaAberto =  pdvs.find((it) => { return it.id === movimentos[0].pdv; });
            
            caixaDao.editar(frenteDeLojaAberto.caixa, function(error, caixas ){
        
                var total = dadosForms.total.replace('.', '').replace(',', '.');
                var pago = dadosForms.pago.replace('.', '').replace(',', '.');

                var pagamento = {
                                    movimento:movimentos[0].id,
                                    condpagamento:dadosForms.condicaoPagamento,
                                    disponivel: caixas[0].disponivel, 
                                    valor: total, 
                                    pago:pago, 
                                    troco: pago - total                         
                                };
                                
                pagarDao.salvar(pagamento, function(error, result){
                    connection.end();  
                    res.redirect('/item/' + cupom);
                });
            })
        });
    });
}

module.exports.cancelarPagamentoMesa = function( application, req, res ){

    
    var id = req.params._id;
   
    if( req.session.usuario == undefined ) {
        res.redirect("/login");
        return;			
    }
    var connection = application.config.dbConnection();           
    var pagarDao = new application.app.models.PagarDAO(connection); 
    var movimentoDao = new application.app.models.MovimentoDAO(connection); 

    pagarDao.editar( id, function(error, pagamentos){

        movimentoDao.editar( pagamentos[0].movimento, function(error, movimentos){
            
            pagarDao.excluir( pagamentos[0].id, function(error, pagamentos){
                connection.end();  
                res.redirect('/item/' + movimentos[0].id );

            });
        });
    });
}

module.exports.cancelaItemMesa = function( application, req, res ){
    var id = req.params._id;

    if( req.session.usuario == undefined ) {
        res.redirect("/login");
        return;			
    }

    var connection = application.config.dbConnection();           
    var itemDao = new application.app.models.ItemDAO(connection);
    var produtoDao = new application.app.models.ProdutoDAO(connection);

    itemDao.editar( id, function(error, item){
        
        var cupom = item[0].movimento;

        item[0].cancelamento = new Date();
        item[0].cancelador = req.session.usuario.fcid
        item[0].total = 0;

        var idProduto = item[0].produto;
        var quantidade = item[0].quantidade;

        itemDao.salvar( item[0], function(error, result){

            produtoDao.editar(idProduto,function(error, produtos){
       
                produtos[0].estoque = produtos[0].estoque +  quantidade;
                
                produtoDao.salvar(produtos,function(error, result){
       
                    connection.end();
                    res.redirect('/item/'+ cupom );
                });
            });            
        });
    });
}

module.exports.fechamentoMesa = function( application, req, res ){

    var id = req.params._id;
   
    if( req.session.usuario == undefined ) {
        res.redirect("/login");
        return;			
    }

    function leftPad(value, totalWidth, paddingChar) { 
        var length = totalWidth - value.toString().length + 1; 
        return Array(length).join(paddingChar || '0') + value; 
    };

    var connection = application.config.dbConnection();           
    var pagarDao = new application.app.models.PagarDAO(connection); 
    var movimentoDao = new application.app.models.MovimentoDAO(connection); 

    movimentoDao.editar( id, function(error, movimentos){
        
        movimentos[0].fim  = new Date()
        movimentos[0].fimh = leftPad(movimentos[0].fim.getHours(),2) + ":" + leftPad(movimentos[0].fim.getMinutes(),2); 

        movimentoDao.salvar( movimentos[0], function(error, movimentos){
            connection.end();  
            res.redirect('/salao')
        });
    });
}