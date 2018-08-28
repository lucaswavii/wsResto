function MovidispoDAO( connection ){
	this._connection = connection; 
}

MovidispoDAO.prototype.listar = function( callback) {
	this._connection.query('select * from MOVDISPO order by id', callback);	
}

MovidispoDAO.prototype.salvar = function( movdispo, callback) {	
	if( !movdispo.id ) {
		this._connection.query('insert into MOVDISPO set ?', movdispo, callback);
	} else {
		this._connection.query('update MOVDISPO set ? where id = ?', [ movdispo, movdispo.id], callback);	
	}
}

MovidispoDAO.prototype.editar = function( id, callback) {
	this._connection.query('select * from MOVDISPO where id = ?', id, callback);
}

MovidispoDAO.prototype.excluir = function( id, callback) {
	this._connection.query('delete from MOVDISPO where id = ?', id, callback);	
}

module.exports = function(){
	return MovidispoDAO;
};
