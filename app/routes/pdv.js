module.exports = function(application){
    
    application.post('/aberturaCaixa', function(req, res){
        application.app.controllers.pdv.abre(application, req, res);
    });

    application.post('/fechamentoCaixa', function(req, res){
        application.app.controllers.pdv.fecha(application, req, res);
    });

}