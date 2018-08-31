module.exports = function(application){
    
    application.get('/item/:_id', function(req, res){
        application.app.controllers.item.atendimento(application, req, res);
    });

    application.post('/incluirItem/:_id', function(req, res){
        application.app.controllers.item.incluirItem(application, req, res);
    });

    application.post('/pagamentoMesa/:_id', function(req, res){
        application.app.controllers.item.pagamentoMesa(application, req, res);
    });

    application.get('/cancelarPagamentoMesa/:_id', function(req, res){
        application.app.controllers.item.cancelarPagamentoMesa(application, req, res);
    });

    application.post('/fechamentoMesa/:_id', function(req, res){
        application.app.controllers.item.fechamentoMesa(application, req, res);
    });
}