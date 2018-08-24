module.exports = function(application){
    
    application.get('/pagamentoNovo', function(req, res){
        application.app.controllers.pagamento.novo(application, req, res);
    });

    application.get('/pagamentoEditar/:_id', function(req, res){
        application.app.controllers.pagamento.editar(application, req, res);
    });

    application.get('/pagamentoExcluir/:_id', function(req, res){
        application.app.controllers.pagamento.excluir(application, req, res);
    });

    application.post('/pagamentoSalvar', function(req, res){
        application.app.controllers.pagamento.salvar(application, req, res);
    });
}