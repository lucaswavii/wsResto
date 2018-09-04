function PdvDAO( connection ){
	this._connection = connection; 
}

PdvDAO.prototype.listar = function(empresa, callback) {
	this._connection.query('select * from PDV where fim is null and empresa = ? ', empresa, callback);	
}

PdvDAO.prototype.resumoPagamento = function(pdv, callback) {

	var sql  = " Select distinct cast('Recebido' as char(20)) as status, condpagamento.nome as condicao, count( movimento.cliente) as atendidos, sum(pagamento.pago) as total from PAGAMENTO pagamento " 
	sql  	+= " inner join MOVIMENTO movimento on ( movimento.id = pagamento.movimento ) " 
	sql  	+= " inner join PDV pdv on ( pdv.id = movimento.pdv ) "
	sql  	+= " inner join CONDPAGAMENTO condpagamento on ( condpagamento.id = pagamento.condpagamento ) "
	sql  	+= " where pagamento.recebimento is not null and pdv.id = ? " 
	sql  	+= " group by condpagamento.nome "
	sql  	+= " union "
	sql  	+= " select distinct cast('Aberto' as char(20)) as status, condpagamento.nome as condicao, count( movimento.cliente) as atendidos, sum(pagamento.pago) as total from PAGAMENTO pagamento "
	sql  	+= " inner join MOVIMENTO movimento on ( movimento.id = pagamento.movimento ) " 
	sql  	+= " inner join PDV pdv on ( pdv.id = movimento.pdv ) "
	sql  	+= " inner join CONDPAGAMENTO condpagamento on ( condpagamento.id = pagamento.condpagamento ) " 
	sql  	+= " where pagamento.recebimento is null and pdv.id = ? " 
	sql  	+= " group by condpagamento.nome " 
		
	this._connection.query(sql,[ pdv.id, pdv.id], callback);	
}

PdvDAO.prototype.recebiveisPdv = function(pdv, callback) {
	
	var sql  = " select movimento.id, pagamento.id as pagamento, pagamento.condpagamento, mesa.id as idMesa, cliente.nome as cliente, condpagamento.nome, mesa.nome as mesa, funcionario.nome as atendente, (select distinct sum(item.quantidade) as total from ITEM item where item.movimento = movimento.id and item.cancelamento is null ) as total, pagamento.pago as valor, pagamento.troco as troco from PAGAMENTO pagamento "
	sql  	+= " inner join MOVIMENTO movimento on ( movimento.id = pagamento.movimento ) "
	sql  	+= " inner join PDV pdv on ( pdv.id = movimento.pdv ) "
	sql  	+= " inner join CONDPAGAMENTO condpagamento on ( condpagamento.id = pagamento.condpagamento ) "
	sql  	+= " inner join MESA mesa on ( mesa.id = movimento.mesa ) "
	sql  	+= " inner join FUNCIONARIO funcionario on ( funcionario.id = movimento.atendente and movimento.fim is not null ) "
	sql  	+= " inner join CLIENTE cliente on ( cliente.id = movimento.cliente ) " 
	sql  	+= " where pagamento.recebimento is null and movimento.pdv = ? "
	sql  	+= " order by mesa.nome "

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
