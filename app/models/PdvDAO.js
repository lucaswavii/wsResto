function PdvDAO( connection ){
	this._connection = connection; 
}

PdvDAO.prototype.listar = function(callback) {
	this._connection.query('select * from PDV where fim is null', callback);	
}

PdvDAO.prototype.resumoPagamento = function(pdv, callback) {

	var sql  = 'select distinct condpagamento.nome as condicao, sum(pagamento.pago) as total from PAGAMENTO pagamento '
	sql 	+= ' inner join MOVIMENTO movimento on ( movimento.id = pagamento.movimento ) '
	sql 	+= ' inner join PDV pdv on ( pdv.id = movimento.pdv ) '
	sql 	+= ' inner join CONDPAGAMENTO condpagamento on ( condpagamento.id = pagamento.condpagamento ) '
	sql 	+= ' where pdv.id = ?'
	sql 	+= ' group by condpagamento.nome'
	
	this._connection.query(sql, pdv.id, callback);	
}

PdvDAO.prototype.salvar = function( pdv, callback) {	
	if( !pdv.id ) {
		this._connection.query('insert into PDV set ?', pdv, callback);
	} else {
		this._connection.query('update PDV set ? where id = ?', [ pdv, pdv.id], callback);	
	}
}

PdvDAO.prototype.editar = function( id, callback) {
	this._connection.query('select * from PDV where id = ?', id, callback);
}

PdvDAO.prototype.excluir = function( id, callback) {
	this._connection.query('delete from PDV where id = ?', id, callback);	
}

module.exports = function(){
	return PdvDAO;
};
