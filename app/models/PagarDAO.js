function PagarDAO( connection ){
	this._connection = connection; 
}

PagarDAO.prototype.listar = function( movimento, callback) {
	this._connection.query('select * from PAGAMENTO where movimento = ? order by id', movimento, callback);	
}

PagarDAO.prototype.salvar = function( pagamento, callback) {	
	if( !pagamento.id ) {
		this._connection.query('insert into PAGAMENTO set ?', pagamento, callback);
	} else {
		this._connection.query('update PAGAMENTO set ? where id = ?', [ pagamento, pagamento.id], callback);	
	}
}

PagarDAO.prototype.editar = function( id, callback) {
	this._connection.query('select * from PAGAMENTO where id = ?', id, callback);
}

PagarDAO.prototype.excluir = function( id, callback) {
	this._connection.query('delete from PAGAMENTO where id = ?', id, callback);	
}

module.exports = function(){
	return PagarDAO;
};
