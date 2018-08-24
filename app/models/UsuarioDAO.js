function UsuarioDAO( connection ){
	this._connection = connection; 
}

UsuarioDAO.prototype.login = function( usuario, callback) {
	
	var sql = 	' SELECT usuario.id, usuario.nome, grupo.id as gpid, grupo.nome as gpnome, funcionario.id as fcid, funcionario.nome as fcnome, empresa.id as emid, empresa.nome as emnome ' 
	sql += 		' FROM USUARIO usuario '
	sql += 		' inner join GRUPO grupo on ( grupo.id = usuario.grupo ) '
	sql += 		' inner join FUNCIONARIO funcionario on ( funcionario.id = usuario.funcionario ) '
	sql += 		' inner join EMPRESA empresa on ( empresa.id = usuario.empresa )'
	sql += 		' where usuario.nome = ? and usuario.senha = ? '
	
	this._connection.query(sql, [ usuario.nome, usuario.senha], callback);	
}

UsuarioDAO.prototype.listar = function( callback) {
	this._connection.query('select * from USUARIO order by id', callback);	
}

UsuarioDAO.prototype.salvar = function( usuario, callback) {	
	if( !usuario.id ) {
		this._connection.query('insert into USUARIO set ?', usuario, callback);
	} else {
		this._connection.query('update USUARIO set ? where id = ?', [ usuario, usuario.id], callback);	
	}
}

UsuarioDAO.prototype.editar = function( id, callback) {
	this._connection.query('select * from USUARIO where id = ?', id, callback);
}

UsuarioDAO.prototype.excluir = function( id, callback) {
	this._connection.query('delete from USUARIO where id = ?', id, callback);	
}

module.exports = function(){
	return UsuarioDAO;
};
