module.exports = function(application){
    
    application.post('/abreVendaMesa', function(req, res){
        application.app.controllers.salao.abreVendaMesa(application, req, res);
    });

    application.post('/atendeMesa', function(req, res){
        application.app.controllers.salao.atendeMesa(application, req, res);
    });
    
   
}