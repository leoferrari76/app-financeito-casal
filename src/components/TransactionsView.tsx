import React from 'react';
import { Pencil, Trash2, X } from 'lucide-react';

interface TransactionsViewProps {
    isExpense: boolean;
    setIsExpense: (val: boolean) => void;
    isShared: boolean;
    setIsShared: (val: boolean) => void;
    formData: any;
    setFormData: (data: any) => void;
    categories: string[];
    showNewCategoryInput: boolean;
    setShowNewCategoryInput: (val: boolean) => void;
    newCategoryName: string;
    setNewCategoryName: (val: string) => void;
    handleAddCategory: () => void;
    handleSubmit: (e: React.FormEvent) => void;
    editingId: number | null;
    cancelEdit: () => void;
    visibleTransactions: any[];
    handleEdit: (tx: any) => void;
    handleDelete: (id: number) => void;
    formatCurrency: (value: number) => string;
    currentUser: any;
}

export function TransactionsView({
    isExpense,
    setIsExpense,
    isShared,
    setIsShared,
    formData,
    setFormData,
    categories,
    showNewCategoryInput,
    setShowNewCategoryInput,
    newCategoryName,
    setNewCategoryName,
    handleAddCategory,
    handleSubmit,
    editingId,
    cancelEdit,
    visibleTransactions,
    handleEdit,
    handleDelete,
    formatCurrency,
    currentUser,
}: TransactionsViewProps) {
    return (
        <section className="transactions-view animate-fade-in">
            <div className="form-container glass-panel">
                <div className="form-toggle">
                    <button className={isExpense ? 'active' : ''} onClick={() => setIsExpense(true)}>
                        Gasto
                    </button>
                    <button className={!isExpense ? 'active' : ''} onClick={() => setIsExpense(false)}>
                        Ganho
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="transaction-form">
                    <div className="form-group">
                        <label>Valor</label>
                        <input
                            type="number"
                            placeholder="R$ 0,00"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Categoria</label>
                        <div className="select-with-add">
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                required
                            >
                                <option value="">Selecionar...</option>
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                            <button
                                type="button"
                                onClick={() => setShowNewCategoryInput(!showNewCategoryInput)}
                                className="btn-add-cat"
                            >
                                +
                            </button>
                        </div>
                        {showNewCategoryInput && (
                            <div className="new-cat-input">
                                <input
                                    type="text"
                                    placeholder="Nova categoria..."
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                />
                                <button type="button" onClick={handleAddCategory}>
                                    OK
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Data</label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group scope-toggle">
                        <label>Quem paga?</label>
                        <div className="toggle-container">
                            <button
                                type="button"
                                className={isShared ? 'active' : ''}
                                onClick={() => setIsShared(true)}
                            >
                                Compartilhado (Casal)
                            </button>
                            <button
                                type="button"
                                className={!isShared ? 'active' : ''}
                                onClick={() => setIsShared(false)}
                            >
                                Privado (Só eu)
                            </button>
                        </div>
                    </div>

                    {isExpense && (
                        <div className="form-group expense-type-toggle animate-fade-in">
                            <label>Tipo de Gasto</label>
                            <div className="toggle-container">
                                <button
                                    type="button"
                                    className={formData.expenseType === 'fixed' ? 'active' : ''}
                                    onClick={() => setFormData({ ...formData, expenseType: 'fixed' })}
                                >
                                    Fixo
                                </button>
                                <button
                                    type="button"
                                    className={formData.expenseType === 'variable' ? 'active' : ''}
                                    onClick={() => setFormData({ ...formData, expenseType: 'variable' })}
                                >
                                    Variável
                                </button>
                            </div>
                        </div>
                    )}

                    {isExpense && (
                        <>
                            <div className="form-group checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={formData.isCreditCard}
                                        onChange={(e) => setFormData({ ...formData, isCreditCard: e.target.checked })}
                                    />{' '}
                                    Cartão de Crédito
                                </label>
                            </div>

                            {formData.isCreditCard && (
                                <div className="credit-details">
                                    <div className="form-group">
                                        <label>Parcelas</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="48"
                                            value={formData.installments}
                                            onChange={(e) => setFormData({ ...formData, installments: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Início do Gasto</label>
                                        <input
                                            type="date"
                                            value={formData.startDate}
                                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    <div className="form-actions-row">
                        <button type="submit" className="btn-save">
                            {editingId ? 'Atualizar Transação' : 'Salvar Transação'}
                        </button>
                        {editingId && (
                            <button type="button" className="btn-cancel" onClick={cancelEdit}>
                                <X size={16} /> Cancelar
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="recent-list glass-panel">
                <div className="list-header-actions">
                    <h3>Suas Transações & Compartilhadas</h3>
                </div>
                <div className="tx-list">
                    {visibleTransactions.length === 0 ? (
                        <p className="empty-msg">Nenhuma transação registrada ainda.</p>
                    ) : (
                        visibleTransactions.map((tx) => (
                            <div key={tx.id} className={`tx-item ${tx.type}`}>
                                <div className="tx-main">
                                    <div className="tx-header-row">
                                        <span className="tx-cat">{tx.category}</span>
                                        <span className={`tx-scope-tag ${tx.scope.toLowerCase()}`}>
                                            {tx.scope === 'SHARED' ? 'Casal' : 'Privado'}
                                        </span>
                                        {tx.type === 'expense' && (
                                            <span className={`tx-type-tag ${tx.expenseType || 'variable'}`}>
                                                {tx.expenseType === 'fixed' ? 'Fixo' : 'Variável'}
                                            </span>
                                        )}
                                    </div>
                                    <span className="tx-date">
                                        {tx.date} • {tx.owner_id === currentUser.id ? currentUser.name : 'Outros'}
                                    </span>
                                </div>
                                <div className="tx-details">
                                    <div className="tx-actions">
                                        <button className="action-btn edit" onClick={() => handleEdit(tx)} title="Editar">
                                            <Pencil size={14} />
                                        </button>
                                        <button className="action-btn delete" onClick={() => handleDelete(tx.id)} title="Excluir">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                    <span className="tx-amount">
                                        {tx.type === 'expense' ? '-' : '+'} {formatCurrency(Number(tx.amount))}
                                    </span>
                                    {tx.is_credit_card && <span className="tx-card-info">{tx.installments}x no cartão</span>}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}
