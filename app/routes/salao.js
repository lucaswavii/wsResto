module.exports = function(application){
    
    application.post('/abreVendaBalcao/:_id', function(req, res){
        application.app.controllers.balcao.abreVendaBalcao(application, req, res);
    });
    
    application.post('/incluirItemPorEan/:_id', function(req, res){
        application.app.controllers.balcao.incluirItemPorEan(application, req, res);
    });

    application.get('/cancelarVendas/:_id', function(req, res){
        application.app.controllers.balcao.cancelarVendas(application, req, res);
    });

    application.post('/pagamentoVendas/:_id', function(req, res){
        application.app.controllers.balcao.pagamentoVendas(application, req, res);
    });
    
    application.get('/cancelarPagamentoVendas/:_id', function(req, res){
        application.app.controllers.balcao.cancelarPagamentoVendas(application, req, res);
    });

    application.get('/finalizarVendas/:_id', function(req, res){
        application.app.controllers.balcao.finalizarVendas(application, req, res);
    });
}