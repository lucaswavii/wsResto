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
    var params = {ip: ip, empresa: empresa }
    
    caixaDao.listar( function(error, caixas){
            //Pega o caixa pelo ip da maquina
        var caixa =  caixas.find((it) => { return it.ip === params.ip && it.empresa === params.empresa; });
        if( !caixa ) {
            connection.end(); 
            res.render('pdv', { validacao : [{'msg':'Terminal não configurado. Verifique se o ip ' + params.ip + ' encontra-se configurado no cadastro de caixa.'}], pdvs : {}, caixas:{}, sessao: req.session.usuario  });
            return;
        }
            connection.end(); 
            res.render('pdv', { validacao : {}, pdvs : {}, caixas:caixa, sessao: req.session.usuario  });
    });

}
