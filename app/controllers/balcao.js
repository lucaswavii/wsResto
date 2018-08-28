module.exports.index = function( application, req, res ){
    
    this._meuIp = require('ip');        
    var ip = this._meuIp.address();
    var idPdv = req.params._id;
   // var ipCliente  = req.clientIp.split(':')[3];
    //var net = require('net');
   // var ip = net.isIP(ipNovo)
    
    if( req.session.usuario == undefined ) {
		  res.redirect("/login");
		  return;			
    }
    var connection = application.config.dbConnection();
    var produtoDao = new application.app.models.ProdutoDAO(connection);
    var categoriaDao = new application.app.models.CategoriaDAO(connection);
    var clienteDao = new application.app.models.ClienteDAO(connection);
    var movimentoDao = new application.app.models.MovimentoDAO(connection);
    var itemDao = new application.app.models.ItemDAO(connection);
    var pagamentoDao = new application.app.models.PagamentoDAO(connection);
    var pagarDao = new application.app.models.PagarDAO(connection);

    clienteDao.listar(function(error, clientes){

        categoriaDao.listar(function(error, categorias){
        
            produtoDao.listar(function(error, produtos){

                pagamentoDao.listar(function(error, pagamentos){

                    movimentoDao.listaVendaBalcao( idPdv, function(error, movimentos){
                        
                        if( movimentos.length > 0 ) {

                            itemDao.listar(movimentos[0].id, function(error, itens){
                                
                                pagarDao.listar(movimentos[0].id, function(error, pagar){
                                
                                    connection.end();
                                    res.render('balcao', { validacao :{}, pdv: idPdv, categorias: categorias, produtos:produtos, clientes:clientes, movimentos:movimentos, itens:itens, pagamentos:pagamentos, pagar:pagar, sessao: req.session.usuario  });
                                    return;
                                });
                            });
                        } else {
                            connection.end();
                            res.render('balcao', { validacao :{}, pdv: idPdv, categorias: categorias, produtos:produtos, clientes:clientes, movimentos:{}, itens: {},  pagamentos:pagamentos, pagar:{}, sessao: req.session.usuario  });
                            return;
                        }                    
                    });
                });
            });        
        });
    });
}

module.exports.abreVendaBalcao = function( application, req, res ){

    this._meuIp = require('ip');        
    var ip = this._meuIp.address();
    var idPdv = req.params._id;
    var dadosForms = req.body;
 
    var connection = application.config.dbConnection();
    var movimentoDao = new application.app.models.MovimentoDAO(connection);

    movimentoDao.salvar( dadosForms, function(error, movimentos){
        connection.end();
        res.redirect("/balcao/" + idPdv);
    });  

}

module.exports.incluirItemPorEan = function( application, req, res ){

    this._meuIp = require('ip');        
    var ip = this._meuIp.address();
    var idPdv = req.params._id;
    var dadosForms = req.body;
 
    var connection = application.config.dbConnection();    
    var produtoDao = new application.app.models.ProdutoDAO(connection);
    var itemDao = new application.app.models.ItemDAO(connection);
    var movimentoDao = new application.app.models.MovimentoDAO(connection);

    produtoDao.ean( dadosForms.ean, function(error, produtos){
        
        movimentoDao.listaVendaBalcao( idPdv, function(error, movimentos){

            if( produtos.length > 0 ) {
                
                var item = {
                    movimento: movimentos[0].id,
                    produto: produtos[0].id,
                    quantidade: 1,
                    unitario: produtos[0].preco,
                    total: produtos[0].preco
                };
                
                itemDao.salvar(item, function(error, result){
                    produtos[0].estoque = produtos[0].estoque -1; 
                    produtoDao.salvar( produtos[0], function(error, produtos){});
                    connection.end();
                    req.flash('successMessage', 'Produto incluído com sucesso!');
                    res.redirect("/balcao/" + idPdv);
                });
            } else {
                connection.end();
                req.flash('errorMessage', 'Produto não localizado ou inválido!')
                res.redirect("/balcao/" + idPdv);
            }
        });
    });

}

module.exports.cancelarVendas = function( application, req, res ){
    var idPdv = req.params._id;

    var connection = application.config.dbConnection();
    var movimentoDao = new application.app.models.MovimentoDAO(connection);        
    var itemDao = new application.app.models.ItemDAO(connection); 
    var produtoDao = new application.app.models.ProdutoDAO(connection);

    function leftPad(value, totalWidth, paddingChar) { 
        var length = totalWidth - value.toString().length + 1; 
        return Array(length).join(paddingChar || '0') + value; 
    };

    movimentoDao.listaVendaBalcao( idPdv, function(error, movimentos){
        
        movimentos[0].fim = new Date();
        movimentos[0].fimh = leftPad(movimentos[0].fim.getHours(),2) + ":" + leftPad(movimentos[0].fim.getMinutes(),2); 
        
        itemDao.listar( movimentos[0].id, function(error, itens ){
            
            if( itens.length > 0 ) {
                for(var i=0; i < itens.length; i++) {
                    var prod = itens[i]
                    produtoDao.editar(itens[i].produto, function(error, produto ){
                        produto[0].estoque += parseFloat( prod.quantidade );
                        produtoDao.salvar(produto[0], function(error, result ){});
                    })
                }
    
                itemDao.cancelarTodaVenda( movimentos[0], function(error, itensCancelado ){
                
                    movimentoDao.salvar(movimentos[0], function(error, result){
    
                        connection.end();  
                        res.redirect('/balcao/' + idPdv);
                    });
                });

            } else {
                movimentoDao.salvar(movimento[0], function(error, result){    
                    connection.end();  
                    res.redirect('/balcao/' + idPdv);
                });
            }            
        });
    });
   
}


module.exports.pagamentoVendas = function( application, req, res ){
    
    var idPdv = req.params._id;
    var dadosForms = req.body;

    var connection = application.config.dbConnection();           
    var pagarDao = new application.app.models.PagarDAO(connection); 
    var movimentoDao = new application.app.models.MovimentoDAO(connection); 
    var pdvDao = new application.app.models.PdvDAO(connection); 
    var caixaDao = new application.app.models.CaixaDAO(connection);         
    
    movimentoDao.listaVendaBalcao( idPdv, function(error, movimentos){

        pdvDao.listar(function(error, pdvs){
            
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
                    res.redirect('/balcao/' + idPdv);
                });
            })
        });
    });
}

module.exports.cancelarPagamentoVendas = function( application, req, res ){

    
    var id = req.params._id;
   
    var connection = application.config.dbConnection();           
    var pagarDao = new application.app.models.PagarDAO(connection); 
    var movimentoDao = new application.app.models.MovimentoDAO(connection); 

    pagarDao.editar( id, function(error, pagamentos){

        movimentoDao.editar( pagamentos[0].movimento, function(error, movimentos){
            
            pagarDao.excluir( id, function(error, pagamentos){
                connection.end();  
                res.redirect('/balcao/' + movimentos[0].pdv );

            });
        });
    });
}

module.exports.finalizarVendas = function( application, req, res ){
    var idPdv = req.params._id;
    var date 		= require('datejs');

    function leftPad(value, totalWidth, paddingChar) { 
        var length = totalWidth - value.toString().length + 1; 
        return Array(length).join(paddingChar || '0') + value; 
    };

    var connection = application.config.dbConnection();           
    var pagarDao = new application.app.models.PagarDAO(connection); 
    var movimentoDao = new application.app.models.MovimentoDAO(connection); 
    var pagamentoDao = new application.app.models.PagamentoDAO(connection);
    var financeiroDao = new application.app.models.FinanceiroDAO(connection);
    var movdispoDao = new application.app.models.MovdispoDAO(connection); 

    movimentoDao.listaVendaBalcao( idPdv, function(error, movimentos){
        
        var hoje = new Date(); 
        movimentos[0].fim  = hoje;
        movimentos[0].fimh  = leftPad(hoje.getHours(),2) + ":" + leftPad(hoje.getMinutes(),2);  
        
        var arrDisponiveis = [];
        
        pagarDao.listar(movimentos[0].id, function(error, pagar){

            for (let index = 0; index < pagar.length; index++) {
                                    
                const element = pagar[index];

                pagamentoDao.editar(element.condpagamento, function(error, condicaoPagamento){
                
                    if( !element.recebimento ) {
                    
                        var parcelas = condicaoPagamento[0].formula.toUpperCase().split('/');                        
                    
                        if( parcelas.length  > 1 ) {
                            
                            for(var i=0; i < parcelas.length; i++) {
                                    
                                var separacao = parcelas[i].split('DD');
                                var dias      = separacao[0];
                                var percentual= separacao[1].replace('%','');

                                if( percentual.indexOf(',') >=0 ) {
                                    percentual = percentual.replace(',', '.')
                                }
                                var valor = element.valor > element.pago ? element.pago : element.valor;
                                var lancamento = { 
                                                    data: new Date(), 
                                                    cliente: movimentos[0].cliente, 
                                                    pagamento: element.id,
                                                    disponivel: element.disponivel, 
                                                    vencimento: Date.today().addDays(dias),
                                                    correcao: Date.today().addDays(dias),
                                                    valor : ( valor*percentual)/100,
                                                    pago:condicaoPagamento[0].financeiro  }

                                financeiroDao.salvar(lancamento, function(error, result){                                
                                    
                                    element.recebimento = new Date();
                                    
                                    if( condicaoPagamento[0].financeiro == 'S') {
                                        
                                        var params= { 
                                                        data: lancamento.correcao, 
                                                        disponivel: lancamento.disponivel, 
                                                        financeiro: result.insertId,
                                                        valor : lancamento.valor
                                                    }
                                                    console.log(params)
                                        movdispoDao.salvar(params, function(error, result){
                                            console.log(error)
                                        }); 
                                        pagarDao.salvar(element, function(error, result){}); 
                                    }  else {
                                        pagarDao.salvar(element, function(error, result){});
                                    }                                   
                                        
                                });
                                
                            }

                        } else {

                            var separacao = parcelas[0].split('DD');
                            var dias      = separacao[0];
                            var percentual= separacao[1].replace('%','');
                            
                            var valor = element.valor > element.pago ? element.pago : element.valor;
                                
                                
                            if( percentual.indexOf(',') >=0 ) {
                                percentual = percentual.replace(',', '.')
                            }

                            var lancamento = { 
                                                data: new Date(), 
                                                cliente: movimentos[0].cliente, 
                                                pagamento: element.id, 
                                                vencimento: Date.today().addDays(dias),
                                                correcao: Date.today().addDays(dias),
                                                disponivel: element.disponivel,
                                                valor : ( valor*percentual )/100, 
                                                pago:condicaoPagamento[0].financeiro 
                                            }
                            
                            financeiroDao.salvar(lancamento, function(error, result){
                                console.log(result)
                                element.recebimento = new Date();

                                if( condicaoPagamento[0].financeiro == 'S') {
                                    
                                    var params =    { 
                                                        data: lancamento.correcao, 
                                                        disponivel: lancamento.disponivel, 
                                                        financeiro: result.insertId,
                                                        valor : lancamento.valor
                                                    }
                                                    console.log(params)
                                    movdispoDao.salvar(params, function(error, result){
                                        console.log(error)
                                    });
                                    pagarDao.salvar(element, function(error, result){});                                                                            
                                }  else {
                                    pagarDao.salvar(element, function(error, result){});
                                }
                            });
                        }                            
                    }   
                });
            }

            console.log(arrDisponiveis)
            // Finaliza Venda finalizando o movimento
            movimentoDao.salvar(movimentos[0], function(error, pagar){
                connection.end();  
                res.redirect('/balcao/' + idPdv );
            })
        });
       
    });
    
}