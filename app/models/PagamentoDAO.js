function PagamentoDAO( connection ){
	this._connection = connection; 
}

PagamentoDAO.prototype.listar = function( callback) {
	this._connection.query('select * from CONDPAGAMENTO order by id', callback);	
}

PagamentoDAO.prototype.salvar = function( pagamento, callback) {	
	if( !pagamento.id ) {
		this._connection.query('insert into CONDPAGAMENTO set ?', pagamento, callback);
	} else {
		this._connection.query('update CONDPAGAMENTO set ? where id = ?', [ pagamento, pagamento.id], callback);	
	}
}

PagamentoDAO.prototype.editar = function( id, callback) {
	this._connection.query('select * from CONDPAGAMENTO where id = ?', id, callback);
}

PagamentoDAO.prototype.excluir = function( id, callback) {
	this._connection.query('delete from CONDPAGAMENTO where id = ?', id, callback);	
}

module.exports = function(){
	return PagamentoDAO;
};
