function ItemDAO( connection ){
	this._connection = connection; 
}

ItemDAO.prototype.listar = function( movimento, callback) {
	this._connection.query('select * from ITEM where movimento = ? order by id',movimento, callback);	
}

ItemDAO.prototype.salvar = function( item, callback) {	
	if( !item.id ) {
		this._connection.query('insert into ITEM set ?', item, callback);
	} else {
		this._connection.query('update ITEM set ? where id = ?', [ item, item.id], callback);	
	}
}

ItemDAO.prototype.editar = function( id, callback) {
	this._connection.query('select * from ITEM where id = ?', id, callback);
}

ItemDAO.prototype.excluir = function( id, callback) {
	this._connection.query('delete from ITEM where id = ?', id, callback);	
}

ItemDAO.prototype.cancelarTodaVenda = function( movimento, callback) {	
	this._connection.query('update ITEM set cancelamento = ?, cancelador = ?, total = ? where movimento = ?', [ movimento.data, movimento.atendente, 0, movimento.id ], callback);	
}

module.exports = function(){
	return ItemDAO;
};
