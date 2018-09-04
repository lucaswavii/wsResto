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

module.exports.atendeMesa = function( application, req, res ){
    var dadosForms = req.body;
 
    if( req.session.usuario == undefined ) {
        res.redirect("/login");
        return;			
    }
   
    res.redirect("/item/" + dadosForms.mesa ); 
}

module.exports.transferirMesa = function( application, req, res ){

    var dadosForms = req.body;
 
    if( req.session.usuario == undefined ) {
        res.redirect("/login");
        return;			
    }

    function leftPad(value, totalWidth, paddingChar) { 
        var length = totalWidth - value.toString().length + 1; 
        return Array(length).join(paddingChar || '0') + value; 
    };

    var connection = application.config.dbConnection();
    var movimentoDao = new application.app.models.MovimentoDAO(connection);
    var itemDao = new application.app.models.ItemDAO(connection);

    if ( dadosForms.origem != dadosForms.destino ) {
       
        movimentoDao.editar( dadosForms.origem , function(error, origem ){

            movimentoDao.editar( dadosForms.destino , function(error, destino ){
                
                movimentoOrigem = origem[0];
                movimentoDestino = destino[0]; 
                
                movimentoOrigem.fim = new Date();
                movimentoOrigem.fimh =  leftPad(movimentoOrigem.fim.getHours(),2) + ":" + leftPad(movimentoOrigem.fim.getMinutes(),2);
                
                itemDao.listar(movimentoOrigem.id, function(error, itens){
                    
                    for (let index = 0; index < itens.length; index++) {
                        const element = itens[index];
                        element.movimento = movimentoDestino.id;
                        itemDao.salvar(element, function(error, result){});
                    }

                    movimentoDao.salvar( movimentoOrigem, function(error, result ){
                        connection.end();
                        res.redirect("/salao");
                    });
                });
            });
        });
    } else {
        req.flash('errorMessage', 'Não podemos transferir itens para mesma mesa.')
        res.redirect('/salao')
    }

}