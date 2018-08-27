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
    var connection = application.config.dbConnection();
    var produtoDao = new application.app.models.ProdutoDAO(connection);
    var categoriaDao = new application.app.models.CategoriaDAO(connection);

    categoriaDao.listar(function(error, categorias){
      produtoDao.listar(function(error, produtos){
        res.render('balcao', { validacao :{}, pdvs : {}, balcao:{}, categorias: categorias, produtos:produtos, sessao: req.session.usuario  });
        return;
      });
    });

}