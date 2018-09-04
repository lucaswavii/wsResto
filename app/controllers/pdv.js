module.exports.index = function( application, req, res ){
    
    this._meuIp = require('ip');        
    var ip = this._meuIp.address();
   // var ipCliente  = req.clientIp.split(':')[3];
    //var net = require('net');
   // var ip = net.isIP(ipNovo)

    if( req.session.usuario == undefined ) {
		res.redirect("/login");
		return;			
    }

    

    var empresa = req.session.usuario.emid;

    var connection = application.config.dbConnection();
    var pdvDao = new application.app.models.PdvDAO(connection);
    var caixaDao = new application.app.models.CaixaDAO(connection);
    var funcionarioDao = new application.app.models.FuncionarioDAO(connection);
    var pagamentoDao = new application.app.models.PagamentoDAO(connection);
    var params = {ip: ip, empresa: empresa }
    
    caixaDao.listar( function(error, caixas){
            //Pega o caixa pelo ip da maquina
        var caixa =  caixas.find((it) => { return it.ip === params.ip && it.empresa === params.empresa; });
        
        if( !caixa ) {
            connection.end(); 
            res.render('pdv', { validacao : [{'msg':'Terminal não configurado. Verifique se o ip ' + params.ip + ' encontra-se configurado no cadastro de caixa.'}],  pdvs:{}, caixas:{}, resumoPagamento:{},  recebiveis: {}, pagamentos:{}, sessao: req.session.usuario  });
            return;
        }
        
        pdvDao.listar(empresa, function(error, pdvs){
            
            var frenteDeLojaAberto =  pdvs.find((it) => { return it.caixa === caixa.id; });
                                  
            if( frenteDeLojaAberto ) {
               
                pdvDao.resumoPagamento( frenteDeLojaAberto, function(error, resumoPagamento){

                    pdvDao.recebiveisPdv( frenteDeLojaAberto, function(error, recebiveis){
                    
                        funcionarioDao.listar( function(error, funcionarios){
                            
                            pagamentoDao.listar( function(error, pagamentos){

                                var funcionarioDeLojaAberto =  funcionarios.find((it) => { return it.id === frenteDeLojaAberto.operador; });
                                             
                                if( funcionarioDeLojaAberto && funcionarioDeLojaAberto.id == req.session.usuario.fcid) {
                                    connection.end(); 
                                    res.render('pdv', { validacao : {}, pdvs : frenteDeLojaAberto, caixas:caixa, resumoPagamento:resumoPagamento, recebiveis:recebiveis, pagamentos:pagamentos, sessao: req.session.usuario  });
                                } else {
                                    connection.end(); 
                                    res.render('pdv', { validacao : [{'msg':'O usuário logado não é o operador do caixa. Entre com o operador do caixa ' + funcionarioDeLojaAberto.nome + '.'}], pdvs : {}, caixas:caixa, resumoPagamento:resumoPagamento, recebiveis:recebiveis, pagamentos:pagamentos, sessao: req.session.usuario  });
                                }
                            });
                        });
                    });
                });
            } else {
                connection.end(); 
                res.render('pdv', { validacao : {}, pdvs :{}, caixas:caixa, resumoPagamento:{}, recebiveis: {}, pagamentos:{}, sessao: req.session.usuario  });
            }
        });
    });
}

module.exports.abre = function( application, req, res ){
    
    this._meuIp = require('ip');        
    var ip = this._meuIp.address();
   // var ipCliente  = req.clientIp.split(':')[3];
    //var net = require('net');
   // var ip = net.isIP(ipNovo)

    if( req.session.usuario == undefined ) {
		res.redirect("/login");
		return;			
    }

    var dadosForms = req.body;
    var empresa = req.session.usuario.emid;

    var connection = application.config.dbConnection();
    var pdvDao = new application.app.models.PdvDAO(connection);
    var caixaDao = new application.app.models.CaixaDAO(connection);
    var params = {ip: ip, empresa: empresa }
    
    caixaDao.listar( function(error, caixas){
            //Pega o caixa pelo ip da maquina
        var caixa =  caixas.find((it) => { return it.ip === params.ip && it.empresa === params.empresa; });
        
        if( !caixa ) {
            connection.end(); 
            res.render('pdv', { validacao : [{'msg':'Terminal não configurado. Verifique se o ip ' + params.ip + ' encontra-se configurado no cadastro de caixa.'}], pdvs : {}, caixas:{}, resumoPagamento:{},sessao: req.session.usuario  });
            return;
        }
        pdvDao.listar(empresa, function(error, pdvs){
            var frenteDeLojaAberto =  pdvs.find((it) => { return it.caixa === caixa.id && it.empresa === caixa.empresa; });

            if( !frenteDeLojaAberto ) {
                var saldo = dadosForms.saldo.replace('.','').replace(',','.');
                dadosForms.saldo = saldo;
                pdvDao.salvar( dadosForms, function(error, pdvs){
                    
                    connection.end(); 
                    res.redirect('/pdv')
                });
            } else {
                connection.end(); 
                res.render('pdv', { validacao : [{'msg':'Problemas ao tentar abrir o pdv.'}], pdvs : frenteDeLojaAberto, caixas:caixa, resumoPagamento:{}, sessao: req.session.usuario  });
            }
        });
    });
}


module.exports.receberConta = function( application, req, res ){

    this._meuIp = require('ip');        
    var ip = this._meuIp.address();
    var date 		= require('datejs');
   // var ipCliente  = req.clientIp.split(':')[3];
    //var net = require('net');
   // var ip = net.isIP(ipNovo)

    if( req.session.usuario == undefined ) {
		res.redirect("/login");
		return;			
    }

    var dadosForms = req.body;

    var empresa = req.session.usuario.emid;

    var connection = application.config.dbConnection();
    var pagarDao = new application.app.models.PagarDAO(connection);
    var pagamentoDao = new application.app.models.PagamentoDAO(connection);
    var movimentoDao = new application.app.models.MovimentoDAO(connection);
    var financeiroDao = new application.app.models.FinanceiroDAO(connection);

    pagamentoDao.editar(dadosForms.condpagamento, function(error, pagamentos){

        pagarDao.editar( dadosForms.id, function(error, pagar){

            movimentoDao.editar( pagar[0].movimento, function(error, movimentos){
                var parcelas = pagamentos[0].formula.toUpperCase().split('/'); 
                if( parcelas.length  > 1 ) {
                        
                    for(var i=0; i < parcelas.length; i++) {
                            
                        var separacao = parcelas[i].split('DD');
                        var dias      = separacao[0];
                        var percentual= separacao[1].replace('%','');

                        if( percentual.indexOf(',') >=0 ) {
                            percentual = percentual.replace(',', '.')
                        }
                        var valor = pagar[0].pago;
                        var lancamento = { 
                                            data: new Date(), 
                                            cliente: movimentos[0].cliente, 
                                            pagamento: pagar[0].id,
                                            disponivel: pagar[0].disponivel, 
                                            vencimento: Date.today().addDays(dias),
                                            correcao: Date.today().addDays(dias),
                                            valor : ( valor*percentual)/100,
                                            pago:'N'  }

                        
                        financeiroDao.salvar(lancamento, function(error, result){

                            pagar[0].recebimento = new Date();
                           
                            pagarDao.salvar(pagar[0], function(error, result){});   
                        });                          
                    }
                    
                    connection.end(); 
                    res.redirect('/pdv');
                    
                } else {

                    var separacao = parcelas[0].split('DD');
                    var dias      = separacao[0];
                    var percentual= separacao[1].replace('%','');
                    
                    var valor = pagar[0].pago;
                        
                        
                    if( percentual.indexOf(',') >=0 ) {
                        percentual = percentual.replace(',', '.')
                    }

                    var lancamento = { 
                                        data: new Date(), 
                                        cliente: movimentos[0].cliente, 
                                        pagamento: pagar[0].id,
                                        vencimento: Date.today().addDays(dias),
                                        correcao: Date.today().addDays(dias),
                                        disponivel: pagar[0].disponivel,
                                        valor : ( valor*percentual )/100, 
                                        pago:'N' 
                                    }
                    
                    financeiroDao.salvar(lancamento, function(error, result){
                        pagar[0].recebimento = new Date();                            
                        pagarDao.salvar(pagar[0], function(error, result){
                            connection.end(); 
                            res.redirect('/pdv');
                        });
                    });
                }
            });
        });
    });
}

module.exports.fecha = function( application, req, res ){
    
    this._meuIp = require('ip');        
    var ip = this._meuIp.address();
   // var ipCliente  = req.clientIp.split(':')[3];
    //var net = require('net');
   // var ip = net.isIP(ipNovo)

    if( req.session.usuario == undefined ) {
		res.redirect("/login");
		return;			
    }

    var dadosForms = req.body;
    var empresa = req.session.usuario.emid;

    var connection = application.config.dbConnection();
    var pdvDao = new application.app.models.PdvDAO(connection);
    var caixaDao = new application.app.models.CaixaDAO(connection);
    var movdispo = new application.app.models.MovdispoDAO(connection);
    var financeiroDao = new application.app.models.FinanceiroDAO(connection);
    var funcionarioDao = new application.app.models.FuncionarioDAO(connection);
    var movimentoDao = new application.app.models.MovimentoDAO(connection); 
    var params = {ip: ip, empresa: empresa }
    
    caixaDao.listar( function(error, caixas){
            //Pega o caixa pelo ip da maquina
        var caixa =  caixas.find((it) => { return it.ip === params.ip && it.empresa === params.empresa; });
        
        if( !caixa ) {
            connection.end(); 
            res.render('pdv', { validacao : [{'msg':'Terminal não configurado. Verifique se o ip ' + params.ip + ' encontra-se configurado no cadastro de caixa.'}], pdvs : {}, caixas:{}, sessao: req.session.usuario  });
            return;
        }
        pdvDao.listar(empresa, function(error, pdvs){
            var frenteDeLojaAberto =  pdvs.find((it) => { return it.caixa === caixa.id && it.empresa === caixa.empresa; });

            if( frenteDeLojaAberto ) {
               
                pdvDao.resumoPagamento( frenteDeLojaAberto, function(error, resumoPagamento){

                    funcionarioDao.listar( function(error, funcionarios){
                    
                        var funcionarioDeLojaAberto =  funcionarios.find((it) => { return it.id === frenteDeLojaAberto.operador; });
                                        
                        if( funcionarioDeLojaAberto && funcionarioDeLojaAberto.id == req.session.usuario.fcid) {
                            
                            movimentoDao.listaVendaFechamento(frenteDeLojaAberto.id, function(error, financeiro){
                                
                                frenteDeLojaAberto.fim  = frenteDeLojaAberto.data
                                frenteDeLojaAberto.fimh = dadosForms.fimh

                                for (let index = 0; index < financeiro.length; index++) {
                                    
                                    const element = financeiro[index];
                                    
                                    element.pago = 'S';

                                    financeiroDao.salvar( element, function(error, financeiro){ 
                                        
                                        var movimentacaofinanceira = { data: frenteDeLojaAberto.data, disponivel: element.disponivel, financeiro: element.id, valor: element.valor }

                                        movdispo.salvar( movimentacaofinanceira, function(error, movimentacaofinanceira){});
                                    });
                                }
                                pdvDao.salvar(frenteDeLojaAberto, function(error, pdv){
                                    res.redirect('/pdv')
                                });

                            })
                        } else {
                            connection.end(); 
                            res.render('pdv', { validacao : [{'msg':'O usuário logado não é o operador do caixa. Entre com o operador do caixa ' + funcionarioDeLojaAberto.nome + '.'}], pdvs : {}, caixas:caixa, resumoPagamento:resumoPagamento, sessao: req.session.usuario  });
                        }
                    });
                });
            } else {
                connection.end(); 
                res.render('pdv', { validacao : {}, pdvs :{}, caixas:caixa, resumoPagamento:{},sessao: req.session.usuario  });
            }
        });
    });

}

