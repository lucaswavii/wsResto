function MovimentoDAO( connection ){
	this._connection = connection; 
}

MovimentoDAO.prototype.listaVendaBalcao = function( pdv, callback) {
	this._connection.query('select * from MOVIMENTO where pdv = ? and fim is null and mesa is null order by id', pdv, callback);	
}

MovimentoDAO.prototype.listaVendaFechamento = function( pdv, callback) {
	
	var sql = " SELECT financeiro.* FROM FINANCEIRO financeiro "
	sql += " inner join PAGAMENTO pagamento on ( pagamento.id = financeiro.pagamento ) "
	sql += " inner join MOVIMENTO movimento on ( movimento.id = pagamento.movimento ) "
	sql += " where financeiro.pago = 'N' and movimento.pdv = ? "

	this._connection.query(sql, pdv, callback);	
}

MovimentoDAO.prototype.listaMesasSalao = function( empresa, callback) {

	var sql = " SELECT  ( CASE WHEN (select distinct count(*) from PAGAMENTO pagamento where pagamento.movimento = movimento.id) > 0 THEN 'Negociando' when movimento.id > 0 then 'Ocupada' else 'Livre' end) as situacao, mesa.id as mesa, mesa.nome as mesanome, movimento.id as cupom, sum( item.total) as total "
	sql += " FROM MESA mesa "
	sql += " left outer join MOVIMENTO movimento on ( movimento.mesa = mesa.id and movimento.fim is null) "
	sql += " left outer join ITEM item on ( item.movimento = movimento.id ) "
	sql += " where mesa.empresa = ? "
	sql += " group by mesa.id, mesa.nome, movimento.id "

	this._connection.query(sql, empresa, callback);	
}

MovimentoDAO.prototype.listar = function( callback) {
	this._connection.query('select * from MOVIMENTO order by id', callback);	
}

MovimentoDAO.prototype.salvar = function( movimento, callback) {	
	if( !movimento.id ) {
		this._connection.query('insert into MOVIMENTO set ?', movimento, callback);
	} else {
		this._connection.query('update MOVIMENTO set ? where id = ?', [ movimento, movimento.id], callback);	
	}
}

MovimentoDAO.prototype.editar = function( id, callback) {
	this._connection.query('select * from MOVIMENTO where id = ?', id, callback);
}

MovimentoDAO.prototype.excluir = function( id, callback) {
	this._connection.query('delete from MOVIMENTO where id = ?', id, callback);	
}

module.exports = function(){
	return MovimentoDAO;
};
