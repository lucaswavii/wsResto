module.exports = function(application){
    
    application.post('/abreVendaMesa', function(req, res){
        application.app.controllers.salao.abreVendaMesa(application, req, res);
    });
    
   
}