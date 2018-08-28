function FinanceiroDAO( connection ){
	this._connection = connection; 
}

FinanceiroDAO.prototype.listar = function( callback) {
	this._connection.query('select * from FINANCEIRO order by id', callback);	
}

FinanceiroDAO.prototype.salvar = function( financeiro, callback) {	
	if( !financeiro.id ) {
		this._connection.query('insert into FINANCEIRO set ?', financeiro, callback);
	} else {
		this._connection.query('update FINANCEIRO set ? where id = ?', [ financeiro, financeiro.id], callback);	
	}
}

FinanceiroDAO.prototype.editar = function( id, callback) {
	this._connection.query('select * from FINANCEIRO where id = ?', id, callback);
}

FinanceiroDAO.prototype.excluir = function( id, callback) {
	this._connection.query('delete from FINANCEIRO where id = ?', id, callback);	
}

module.exports = function(){
	return FinanceiroDAO;
};
