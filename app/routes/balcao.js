module.exports = function(application){
    
    application.get('/inicia/:_id', function(req, res){
        application.app.controllers.balcao.novo(application, req, res);
    });
    
}