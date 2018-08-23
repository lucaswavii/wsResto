function EmpresaDAO( connection ){
	this._connection = connection; 
}

EmpresaDAO.prototype.listar = function( callback) {
	this._connection.query('select * from EMPRESA order by id', callback);	
}

EmpresaDAO.prototype.salvar = function( empresa, callback) {	
	if( !empresa.id ) {
		this._connection.query('insert into EMPRESA set ?', empresa, callback);
	} else {
		this._connection.query('update EMPRESA set ? where id = ?', [ empresa, empresa.id], callback);	
	}
}

EmpresaDAO.prototype.editar = function( id, callback) {
	this._connection.query('select * from EMPRESA where id = ?', id, callback);
}

EmpresaDAO.prototype.excluir = function( id, callback) {
	this._connection.query('delete from EMPRESA where id = ?', id, callback);	
}

module.exports = function(){
	return EmpresaDAO;
};
