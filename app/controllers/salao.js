module.exports.index = function( application, req, res ){
    
    if( req.session.usuario == undefined ) {
		res.redirect("/login");
		return;			
    }

    var empresa = req.session.usuario.emid;

    var connection = application.config.dbConnection();
    var movimentoDao = new application.app.models.MovimentoDAO(connection);
    var clienteDao = new application.app.models.ClienteDAO(connection);
    var funcionarioDao = new application.app.models.FuncionarioDAO(connection);
    var pdvDao = new application.app.models.PdvDAO(connection);
    var caixaDao = new application.app.models.CaixaDAO(connection);

    pdvDao.listar(empresa, function(error, pdvs){
        
        caixaDao.listar( function(error, caixas){
            
            clienteDao.listar(function(error, clientes){

                funcionarioDao.listar(function(error, funcionarios){
                
                    movimentoDao.listaMesasSalao( empresa, function(error, mesas){

                        res.render('salao', { validacao :{}, pdvs:pdvs, caixas:caixas,  mesas:mesas, clientes:clientes, funcionarios:funcionarios, sessao:req.session.usuario  });
                        return;
                    });
                });
            });
        });
    })       
    
}


module.exports.abreVendaMesa = function( application, req, res ){
    
    var dadosForms = req.body;
 
    if( req.session.usuario == undefined ) {
        res.redirect("/login");
        return;			
    }

    var connection = application.config.dbConnection();
    var movimentoDao = new application.app.models.MovimentoDAO(connection);

    movimentoDao.salvar( dadosForms, function(error, movimentos){
        connection.end();
        res.redirect("/salao");
    });  
};