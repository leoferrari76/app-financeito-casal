import { useState } from 'react'
import { LayoutDashboard, Wallet, BrainCircuit, Users, Settings, TrendingUp, ShieldAlert } from 'lucide-react'

function App() {
    const [currentUser, setCurrentUser] = useState<any>(null)
    const [activeTab, setActiveTab] = useState('dashboard')
    const [transactions, setTransactions] = useState<any[]>([])
    const [categories, setCategories] = useState(['Moradia', 'Alimentação', 'Transporte', 'Lazer', 'Saúde'])
    const [showNewCategoryInput, setShowNewCategoryInput] = useState(false)
    const [newCategoryName, setNewCategoryName] = useState('')
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)) // YYYY-MM

    // Form State
    const [isExpense, setIsExpense] = useState(true)
    const [isShared, setIsShared] = useState(true)
    const [formData, setFormData] = useState({
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        isCreditCard: false,
        installments: '1',
        startDate: new Date().toISOString().split('T')[0],
    })

    const users = [
        { id: 'leo', name: 'Leonardo', color: 'var(--accent-primary)', avatar: 'L' },
        { id: 'cris', name: 'Cristiane', color: 'var(--accent-secondary)', avatar: 'C' }
    ]

    const handleAddCategory = () => {
        if (newCategoryName && !categories.includes(newCategoryName)) {
            setCategories([...categories, newCategoryName])
            setFormData({ ...formData, category: newCategoryName })
            setNewCategoryName('')
            setShowNewCategoryInput(false)
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const newTx = {
            ...formData,
            id: Date.now(),
            type: isExpense ? 'expense' : 'income',
            ownerId: currentUser.id,
            scope: isShared ? 'SHARED' : 'PRIVATE'
        }
        setTransactions([newTx, ...transactions])
        alert('Transação adicionada com sucesso!')
    }

    if (!currentUser) {
        return (
            <div className="auth-screen animate-fade-in">
                <div className="auth-card glass-panel">
                    <BrainCircuit className="logo-icon large" />
                    <h1>Bem-vindo ao EquiFinance IA</h1>
                    <p>Selecione seu perfil para entrar</p>
                    <div className="user-selector">
                        {users.map(user => (
                            <div
                                key={user.id}
                                className="user-pill"
                                style={{ '--user-color': user.color } as any}
                                onClick={() => setCurrentUser(user)}
                            >
                                <div className="avatar">{user.avatar}</div>
                                <span>{user.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <style>{`
          .auth-screen {
            height: 100vh;
            width: 100vw;
            display: flex;
            align-items: center;
            justify-content: center;
            background: radial-gradient(circle at center, #1a1a2e 0%, #0d0d12 100%);
          }
          .auth-card {
            padding: 48px;
            text-align: center;
            display: flex;
            flex-direction: column;
            gap: 24px;
            max-width: 400px;
          }
          .logo-icon.large { width: 64px; height: 64px; margin: 0 auto; color: var(--accent-primary); }
          .user-selector { display: flex; gap: 20px; margin-top: 12px; }
          .user-pill {
            flex: 1;
            padding: 24px;
            background: rgba(255,255,255,0.03);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            cursor: pointer;
            transition: all 0.3s;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
          }
          .user-pill:hover {
            border-color: var(--user-color);
            background: rgba(255,255,255,0.06);
            transform: translateY(-5px);
          }
          .avatar {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: var(--user-color);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 1.2rem;
            color: white;
          }
        `}</style>
            </div>
        )
    }

    const visibleTransactions = transactions.filter(tx =>
        tx.scope === 'SHARED' || tx.ownerId === currentUser.id
    )

    const sharedExpenses = transactions.filter(tx => tx.scope === 'SHARED' && tx.type === 'expense')
    const totalShared = sharedExpenses.reduce((acc, tx) => acc + Number(tx.amount), 0)
    const leoShared = sharedExpenses.filter(tx => tx.ownerId === 'leo').reduce((acc, tx) => acc + Number(tx.amount), 0)
    const crisShared = sharedExpenses.filter(tx => tx.ownerId === 'cris').reduce((acc, tx) => acc + Number(tx.amount), 0)

    const leoPercent = totalShared > 0 ? (leoShared / totalShared) * 100 : 50
    const crisPercent = totalShared > 0 ? (crisShared / totalShared) * 100 : 50

    // Monthly Data Logic
    const getMonthlyStats = () => {
        const stats: Record<string, { shared: number, leo: number, cris: number }> = {}
        transactions.forEach(tx => {
            const m = tx.date.slice(0, 7)
            if (!stats[m]) stats[m] = { shared: 0, leo: 0, cris: 0 }

            if (tx.type === 'expense') {
                if (tx.scope === 'SHARED') stats[m].shared += Number(tx.amount)
                else if (tx.ownerId === 'leo') stats[m].leo += Number(tx.amount)
                else if (tx.ownerId === 'cris') stats[m].cris += Number(tx.amount)
            }
        })
        return stats
    }

    const monthlyStats = getMonthlyStats()
    const last3Months = Array.from({ length: 3 }, (_, i) => {
        const d = new Date()
        d.setMonth(d.getMonth() - i)
        return d.toISOString().slice(0, 7)
    }).reverse()

    const currentMonthTxs = transactions.filter(tx => tx.date.startsWith(selectedMonth))

    // Income Calculations (Visible to both)
    const coupleTotalIncome = transactions
        .filter(tx => tx.type === 'income' && tx.date.startsWith(selectedMonth))
        .reduce((acc, tx) => acc + Number(tx.amount), 0)

    const myIncome = currentMonthTxs
        .filter(tx => tx.type === 'income' && tx.ownerId === currentUser.id)
        .reduce((acc, tx) => acc + Number(tx.amount), 0)

    const currentMonthShared = currentMonthTxs.filter(tx => tx.scope === 'SHARED' && tx.type === 'expense')
    const currentMonthTotal = currentMonthShared.reduce((acc, tx) => acc + Number(tx.amount), 0)
    const currentMonthLeo = currentMonthShared.filter(tx => tx.ownerId === 'leo').reduce((acc, tx) => acc + Number(tx.amount), 0)
    const currentMonthCris = currentMonthShared.filter(tx => tx.ownerId === 'cris').reduce((acc, tx) => acc + Number(tx.amount), 0)

    const mLeoPercent = currentMonthTotal > 0 ? (currentMonthLeo / currentMonthTotal) * 100 : 50
    const mCrisPercent = currentMonthTotal > 0 ? (currentMonthCris / currentMonthTotal) * 100 : 50

    const monthName = (m: string) => {
        const [year, month] = m.split('-')
        return new Date(Number(year), Number(month) - 1).toLocaleString('pt-BR', { month: 'short' })
    }

    const totalSharedAllTime = transactions
        .filter(tx => tx.scope === 'SHARED' && tx.type === 'expense')
        .reduce((acc, tx) => acc + Number(tx.amount), 0)

    return (
        <div className="layout-root">
            {/* Sidebar */}
            <nav className="sidebar glass-panel">
                <div className="logo">
                    <BrainCircuit className="logo-icon" />
                    <span>EquiFinance IA</span>
                </div>
                <div className="nav-items">
                    <NavItem icon={<LayoutDashboard />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                    <NavItem icon={<Users />} label="Casal" active={activeTab === 'couple'} onClick={() => setActiveTab('couple')} />
                    <NavItem icon={<Wallet />} label="Transações" active={activeTab === 'transactions'} onClick={() => setActiveTab('transactions')} />
                    <NavItem icon={<TrendingUp />} label="Simulador" active={activeTab === 'simulator'} onClick={() => setActiveTab('simulator')} />
                </div>
                <div className="nav-footer">
                    <div className="current-profile" onClick={() => setCurrentUser(null)}>
                        <div className="avatar mini" style={{ background: currentUser.color }}>{currentUser.avatar}</div>
                        <div className="profile-info">
                            <span>{currentUser.name}</span>
                            <p>Sair</p>
                        </div>
                    </div>
                    <NavItem icon={<Settings />} label="Configurações" />
                </div>
            </nav>

            {/* Main Content */}
            <main className="content">
                <header className="header">
                    <h1>{activeTab === 'dashboard' ? `Olá, ${currentUser.name}` : 'Gerenciar Transações'}</h1>
                    <div className="ai-status">
                        <span className="pulse"></span> Copilot Ativo
                    </div>
                </header>

                {activeTab === 'dashboard' ? (
                    <section className="dashboard-grid">
                        {/* Shared Equity Card */}
                        <div className="card glass-panel animate-fade-in" style={{ gridColumn: 'span 2' }}>
                            <div className="card-header">
                                <div className="title-stack">
                                    <h2>Equidade de Gastos Compartilhada</h2>
                                    <select
                                        className="month-select"
                                        value={selectedMonth}
                                        onChange={(e) => setSelectedMonth(e.target.value)}
                                    >
                                        {[...new Set([selectedMonth, ...Object.keys(monthlyStats)])].sort().reverse().map(m => (
                                            <option key={m} value={m}>{monthName(m)} / {m.split('-')[0]}</option>
                                        ))}
                                    </select>
                                </div>
                                <span className="badge">Mês: R$ {currentMonthTotal.toFixed(2)}</span>
                            </div>
                            <div className="equity-visualizer">
                                <div className="equity-bar">
                                    <div className="equity-fill p1" style={{ width: `${mLeoPercent}%`, background: 'var(--accent-primary)' }}>
                                        <span className="label">Leo ({mLeoPercent.toFixed(0)}%)</span>
                                    </div>
                                    <div className="equity-fill p2" style={{ width: `${mCrisPercent}%`, background: 'var(--accent-secondary)' }}>
                                        <span className="label">Cris ({mCrisPercent.toFixed(0)}%)</span>
                                    </div>
                                </div>
                                <p className="description">
                                    Total acumulado (todos os meses): R$ {totalSharedAllTime.toFixed(2)}
                                </p>
                            </div>
                        </div>

                        {/* Comparative Monthly Chart */}
                        <div className="card glass-panel animate-fade-in" style={{ gridColumn: 'span 1' }}>
                            <div className="card-header">
                                <h2>Histórico Comparativo</h2>
                                <TrendingUp className="status-icon" size={16} />
                            </div>
                            <div className="chart-container multi-bar">
                                {(() => {
                                    const allVals = last3Months.flatMap(m => {
                                        const s = monthlyStats[m] || { shared: 0, leo: 0, cris: 0 }
                                        return [s.shared, s.leo, s.cris]
                                    })
                                    const maxVal = Math.max(...allVals, 1)

                                    return last3Months.map(m => {
                                        const s = monthlyStats[m] || { shared: 0, leo: 0, cris: 0 }
                                        return (
                                            <div key={m} className="chart-bar-group">
                                                <div className="bar-trio">
                                                    <div className="bar-wrapper mini" title={`Leo Privado: R$ ${s.leo.toFixed(2)}`}>
                                                        <div className="chart-bar leo-v" style={{ height: `${(s.leo / maxVal) * 100}%` }}></div>
                                                    </div>
                                                    <div className="bar-wrapper mini" title={`Cris Privada: R$ ${s.cris.toFixed(2)}`}>
                                                        <div className="chart-bar cris-v" style={{ height: `${(s.cris / maxVal) * 100}%` }}></div>
                                                    </div>
                                                    <div className="bar-wrapper mini" title={`Compartilhado: R$ ${s.shared.toFixed(2)}`}>
                                                        <div className="chart-bar shared-v" style={{ height: `${(s.shared / maxVal) * 100}%` }}></div>
                                                    </div>
                                                </div>
                                                <span className="bar-label">{monthName(m)}</span>
                                            </div>
                                        )
                                    })
                                })()}
                            </div>
                            <div className="chart-legend">
                                <span className="leg-item"><i className="dot leo"></i> Leo</span>
                                <span className="leg-item"><i className="dot cris"></i> Cris</span>
                                <span className="leg-item"><i className="dot shared"></i> Casal</span>
                            </div>
                        </div>

                        {/* Shared Gains Card */}
                        <div className="card glass-panel ai-card animate-fade-in">
                            <div className="card-header">
                                <div className="title-with-icon">
                                    <TrendingUp className="accent-icon" />
                                    <h2>Renda Total do Casal</h2>
                                </div>
                            </div>
                            <div className="balance-info">
                                <span className="amount">R$ {coupleTotalIncome.toFixed(2)}</span>
                                <span className="subtitle">Soma de rendas (visível aos dois)</span>
                            </div>
                        </div>

                        {/* Personal Budget Card */}
                        <div className="card glass-panel animate-fade-in">
                            <div className="card-header">
                                <h2>Seu Orçamento ({currentUser.name})</h2>
                                <ShieldAlert className="privacy-icon" />
                            </div>
                            <div className="balance-info">
                                <div className="income-split">
                                    <div>
                                        <p className="subtitle">Seus Ganhos</p>
                                        <span className="amount small">R$ {myIncome.toFixed(2)}</span>
                                    </div>
                                    <div>
                                        <p className="subtitle">Disponível</p>
                                        <span className="amount small">R$ 1.250,00</span>
                                    </div>
                                </div>
                                <span className="subtitle mt-12">Somente você vê seus detalhes privados</span>
                            </div>
                        </div>
                    </section>
                ) : activeTab === 'couple' ? (
                    <section className="couple-view animate-fade-in">
                        <div className="card glass-panel">
                            <div className="card-header">
                                <h2>Equidade & Configurações</h2>
                                <Users className="accent-icon" />
                            </div>
                            <div className="equity-details">
                                <p>A divisão sugerida pela IA baseada na renda total de R$ {coupleTotalIncome.toFixed(2)} é de 60% para Leonardo e 40% para Cristiane.</p>
                                <div className="equity-visualizer" style={{ marginTop: '20px' }}>
                                    <div className="equity-bar">
                                        <div className="equity-fill p1" style={{ width: '60%', background: 'var(--accent-primary)' }}>
                                            <span className="label">Leo (60%)</span>
                                        </div>
                                        <div className="equity-fill p2" style={{ width: '40%', background: 'var(--accent-secondary)' }}>
                                            <span className="label">Cris (40%)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                ) : (
                    <section className="transactions-view animate-fade-in">
                        <div className="form-container glass-panel">
                            <div className="form-toggle">
                                <button
                                    className={isExpense ? 'active' : ''}
                                    onClick={() => setIsExpense(true)}
                                >Gasto</button>
                                <button
                                    className={!isExpense ? 'active' : ''}
                                    onClick={() => setIsExpense(false)}
                                >Ganho</button>
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
                                            {categories.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                        <button type="button" onClick={() => setShowNewCategoryInput(!showNewCategoryInput)} className="btn-add-cat">+</button>
                                    </div>
                                    {showNewCategoryInput && (
                                        <div className="new-cat-input">
                                            <input
                                                type="text"
                                                placeholder="Nova categoria..."
                                                value={newCategoryName}
                                                onChange={(e) => setNewCategoryName(e.target.value)}
                                            />
                                            <button type="button" onClick={handleAddCategory}>OK</button>
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
                                        >Compartilhado (Casal)</button>
                                        <button
                                            type="button"
                                            className={!isShared ? 'active' : ''}
                                            onClick={() => setIsShared(false)}
                                        >Privado (Só eu)</button>
                                    </div>
                                </div>

                                {isExpense && (
                                    <>
                                        <div className="form-group checkbox-group">
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.isCreditCard}
                                                    onChange={(e) => setFormData({ ...formData, isCreditCard: e.target.checked })}
                                                /> Cartão de Crédito
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

                                <button type="submit" className="btn-save">Salvar Transação</button>
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
                                    visibleTransactions.map(tx => (
                                        <div key={tx.id} className={`tx-item ${tx.type}`}>
                                            <div className="tx-main">
                                                <div className="tx-header-row">
                                                    <span className="tx-cat">{tx.category}</span>
                                                    <span className={`tx-scope-tag ${tx.scope.toLowerCase()}`}>
                                                        {tx.scope === 'SHARED' ? 'Casal' : 'Privado'}
                                                    </span>
                                                </div>
                                                <span className="tx-date">{tx.date} • {tx.ownerId === 'leo' ? 'Leo' : 'Cris'}</span>
                                            </div>
                                            <div className="tx-details">
                                                <span className="tx-amount">
                                                    {tx.type === 'expense' ? '-' : '+'} R$ {tx.amount}
                                                </span>
                                                {tx.isCreditCard && (
                                                    <span className="tx-card-info">{tx.installments}x no cartão</span>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </section>
                )}
            </main>

            <style>{`
        /* Previous Styles */
        .layout-root { display: flex; width: 100%; padding: 24px; gap: 24px; }
        .sidebar { width: 260px; display: flex; flex-direction: column; padding: 32px 16px; position: relative; }
        .logo { display: flex; align-items: center; gap: 12px; font-weight: 700; font-size: 1.2rem; margin-bottom: 48px; color: var(--accent-primary); }
        .logo-icon { width: 32px; height: 32px; }
        .nav-items { flex: 1; display: flex; flex-direction: column; gap: 8px; }
        .nav-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 12px; color: var(--text-secondary); cursor: pointer; transition: all 0.2s; }
        .nav-item.active { background: rgba(255, 255, 255, 0.05); color: var(--text-primary); }
        .nav-item:hover { background: rgba(255, 255, 255, 0.08); }
        .content { flex: 1; display: flex; flex-direction: column; gap: 32px; }
        .header { display: flex; justify-content: space-between; align-items: center; }
        .ai-status { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; color: var(--accent-secondary); background: rgba(139, 92, 246, 0.1); padding: 6px 12px; border-radius: 20px; }
        .pulse { width: 8px; height: 8px; background: var(--accent-secondary); border-radius: 50%; box-shadow: 0 0 8px var(--accent-secondary); animation: pulse 2s infinite; }
        @keyframes pulse { 0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.7); } 70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(139, 92, 246, 0); } 100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(139, 92, 246, 0); } }
        .dashboard-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .card { padding: 24px; display: flex; flex-direction: column; gap: 20px; }
        .card-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .card-header h2 { font-size: 1.1rem; font-weight: 500; }
        .badge { font-size: 0.75rem; background: rgba(255,255,255,0.1); padding: 4px 8px; border-radius: 6px; }
        .equity-visualizer { display: flex; flex-direction: column; gap: 16px; }
        .equity-bar { height: 48px; border-radius: 12px; overflow: hidden; display: flex; background: rgba(255,255,255,0.05); }
        .equity-fill { display: flex; align-items: center; padding: 0 16px; font-size: 0.85rem; color: white; font-weight: 600; }
        .ai-card { border-color: rgba(139, 92, 246, 0.3); }
        .title-with-icon { display: flex; align-items: center; gap: 12px; }
        .accent-icon { color: var(--accent-secondary); }
        .message { padding: 16px; background: rgba(255,255,255,0.03); border-radius: 12px; font-size: 0.95rem; line-height: 1.5; margin-bottom: 12px; border-left: 3px solid var(--accent-secondary); }
        .message.alert { border-left-color: #f59e0b; color: #f59e0b; background: rgba(245, 158, 11, 0.05); }
        .btn-ai { background: var(--accent-secondary); color: white; border: none; padding: 12px; border-radius: 10px; font-weight: 600; cursor: pointer; margin-top: auto; }
        .balance-info { display: flex; flex-direction: column; gap: 4px; }
        .amount { font-size: 2rem; font-weight: 700; color: var(--accent-primary); }
        .subtitle { color: var(--text-secondary); font-size: 0.9rem; }

        /* Multi-user Styles */
        .current-profile { display: flex; align-items: center; gap: 12px; padding: 16px; background: rgba(255,255,255,0.03); border-radius: 12px; margin-bottom: 12px; cursor: pointer; transition: all 0.2s; }
        .current-profile:hover { background: rgba(255,255,255,0.07); }
        .avatar.mini { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 700; color: white; }
        .profile-info span { font-size: 0.9rem; font-weight: 600; display: block; }
        .profile-info p { font-size: 0.7rem; color: var(--text-secondary); }

        .scope-toggle .toggle-container { display: flex; background: rgba(255,255,255,0.05); padding: 4px; border-radius: 10px; gap: 4px; }
        .scope-toggle button { flex: 1; padding: 8px; border: none; background: transparent; color: var(--text-secondary); cursor: pointer; border-radius: 8px; font-size: 0.85rem; }
        .scope-toggle button.active { background: var(--panel-bg); color: var(--text-primary); }

        .tx-header-row { display: flex; align-items: center; gap: 8px; }
        .tx-scope-tag { font-size: 0.65rem; padding: 2px 6px; border-radius: 4px; font-weight: 700; text-transform: uppercase; }
        .tx-scope-tag.shared { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
        .tx-scope-tag.private { background: rgba(161, 161, 170, 0.1); color: #a1a1aa; }

        /* Transactions Layout */
        .transactions-view { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .form-container { padding: 32px; display: flex; flex-direction: column; gap: 24px; }
        .form-toggle { display: flex; background: rgba(255,255,255,0.05); padding: 4px; border-radius: 12px; }
        .form-toggle button { flex: 1; padding: 10px; border: none; background: transparent; color: var(--text-secondary); border-radius: 10px; cursor: pointer; font-weight: 600; }
        .form-toggle button.active { background: var(--panel-bg); color: var(--text-primary); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
        
        .transaction-form { display: flex; flex-direction: column; gap: 20px; }
        .form-group { display: flex; flex-direction: column; gap: 8px; }
        .form-group label { font-size: 0.9rem; color: var(--text-secondary); }
        .form-group input, .form-group select { 
          background: rgba(255,255,255,0.05); border: 1px solid var(--border-color); color: white; padding: 12px; border-radius: 10px; font-size: 1rem;
        }
        .select-with-add { display: flex; gap: 8px; }
        .select-with-add select { flex: 1; }
        .btn-add-cat { background: rgba(255,255,255,0.1); border: none; color: white; padding: 0 16px; border-radius: 10px; cursor: pointer; }
        .new-cat-input { display: flex; gap: 8px; }
        .new-cat-input input { flex: 1; }
        .new-cat-input button { background: var(--accent-primary); border: none; color: white; padding: 0 12px; border-radius: 8px; }

        .checkbox-group label { display: flex; align-items: center; gap: 10px; cursor: pointer; }
        .credit-details { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding: 16px; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px dashed var(--border-color); }

        .btn-save { background: var(--accent-primary); color: white; border: none; padding: 16px; border-radius: 12px; font-weight: 700; font-size: 1.1rem; cursor: pointer; margin-top: 12px; transition: transform 0.2s; }
        .btn-save:hover { transform: translateY(-2px); }

        .recent-list { padding: 24px; display: flex; flex-direction: column; gap: 20px; }
        .tx-list { display: flex; flex-direction: column; gap: 12px; }
        .tx-item { padding: 16px; background: rgba(255,255,255,0.03); border-radius: 12px; display: flex; justify-content: space-between; align-items: center; border-left: 4px solid transparent; }
        .tx-item.expense { border-left-color: #ef4444; }
        .tx-item.income { border-left-color: var(--accent-primary); }
        .tx-main { display: flex; flex-direction: column; }
        .tx-cat { font-weight: 600; }
        .tx-date { font-size: 0.8rem; color: var(--text-secondary); }
        .tx-details { text-align: right; display: flex; flex-direction: column; }
        .tx-amount { font-weight: 700; font-size: 1.1rem; }
        .tx-card-info { font-size: 0.75rem; color: var(--accent-secondary); }
        .empty-msg { color: var(--text-secondary); text-align: center; padding: 40px; }

        .title-stack { display: flex; flex-direction: column; gap: 4px; }
        .month-select { 
          background: rgba(255,255,255,0.05); border: none; color: var(--text-secondary); 
          font-size: 0.8rem; padding: 4px 8px; border-radius: 4px; cursor: pointer; outline: none;
        }
        .chart-container { display: flex; align-items: flex-end; justify-content: space-around; height: 120px; padding-top: 20px; }
        .chart-bar-group { display: flex; flex-direction: column; align-items: center; gap: 8px; flex: 1; }
        .bar-wrapper { width: 30px; height: 100px; display: flex; align-items: flex-end; background: rgba(255,255,255,0.03); border-radius: 4px; overflow: hidden; }
        .chart-bar { width: 100%; background: linear-gradient(to top, var(--accent-primary), var(--accent-secondary)); border-radius: 4px 4px 0 0; transition: height 0.3s ease; }
        .bar-label { font-size: 0.75rem; color: var(--text-secondary); text-transform: capitalize; }
        .status-icon { color: var(--accent-secondary); }

        .permission-settings { display: flex; flex-direction: column; gap: 24px; padding: 12px 0; }
        .permission-item { display: flex; justify-content: space-between; align-items: center; padding: 20px; background: rgba(255,255,255,0.03); border-radius: 16px; border: 1px solid var(--border-color); }
        .perm-info h3 { font-size: 1rem; margin-bottom: 4px; }
        .perm-info p { font-size: 0.85rem; color: var(--text-secondary); }
        .user-auth-status { display: flex; align-items: center; gap: 12px; font-size: 0.9rem; }
        .btn-toggle { padding: 8px 16px; border-radius: 20px; border: 1px solid var(--border-color); background: transparent; color: var(--text-secondary); cursor: pointer; transition: all 0.2s; }
        .btn-toggle.active { background: var(--accent-primary); border-color: var(--accent-primary); color: white; }
        .permission-alert { display: flex; align-items: center; gap: 12px; padding: 16px; background: rgba(59, 130, 246, 0.05); border-radius: 12px; font-size: 0.9rem; color: #3b82f6; }
        
        .list-header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .partner-toggle { font-size: 0.85rem; color: var(--text-secondary); }
        .switch-label { display: flex; align-items: center; gap: 8px; cursor: pointer; }

        .income-split { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .amount.small { font-size: 1.4rem; }
        .mt-12 { margin-top: 12px; }

        .bar-trio { display: flex; gap: 4px; height: 100px; align-items: flex-end; }
        .bar-wrapper.mini { width: 10px; height: 100%; display: flex; align-items: flex-end; background: rgba(255,255,255,0.03); border-radius: 2px; }
        .chart-bar.leo-v { background: var(--accent-primary); }
        .chart-bar.cris-v { background: #10b981; }
        .chart-bar.shared-v { background: var(--accent-secondary); }
        .chart-legend { display: flex; justify-content: center; gap: 16px; margin-top: 16px; font-size: 0.75rem; color: var(--text-secondary); }
        .leg-item { display: flex; align-items: center; gap: 6px; }
        .dot { width: 8px; height: 8px; border-radius: 2px; }
        .dot.leo { background: var(--accent-primary); }
        .dot.cris { background: #10b981; }
        .dot.shared { background: var(--accent-secondary); }
      `}</style>
        </div>
    );
}

function NavItem({ icon, label, active, onClick }: any) {
    return (
        <div className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}>
            {icon}
            <span>{label}</span>
        </div>
    )
}

export default App
