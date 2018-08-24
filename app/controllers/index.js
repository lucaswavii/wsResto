module.exports.index = function( application, req, res ){
    
    if( req.session.usuario == undefined ) {
		res.redirect("/login");
		return;			
    }
    
    res.render('index', { validacao : {}, sessao: req.session.usuario  });
    return;	
}
