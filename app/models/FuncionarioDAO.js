function FuncionarioDAO( connection ){
	this._connection = connection; 
}

FuncionarioDAO.prototype.listar = function( callback) {
	this._connection.query('select * from FUNCIONARIO order by id', callback);	
}

FuncionarioDAO.prototype.salvar = function( funcionario, callback) {	
	if( !funcionario.id ) {
		this._connection.query('insert into FUNCIONARIO set ?', funcionario, callback);
	} else {
		this._connection.query('update FUNCIONARIO set ? where id = ?', [ funcionario, funcionario.id], callback);	
	}
}

FuncionarioDAO.prototype.editar = function( id, callback) {
	this._connection.query('select * from FUNCIONARIO where id = ?', id, callback);
}

FuncionarioDAO.prototype.excluir = function( id, callback) {
	this._connection.query('delete from FUNCIONARIO where id = ?', id, callback);	
}

module.exports = function(){
	return FuncionarioDAO;
};
