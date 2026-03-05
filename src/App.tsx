import { useState, useEffect } from 'react'
import { BrainCircuit } from 'lucide-react'
import { supabase } from './supabaseClient'

// Components
import { Sidebar } from './components/Sidebar'
import { Dashboard } from './components/Dashboard'
import { CoupleView } from './components/CoupleView'
import { TransactionsView } from './components/TransactionsView'

function App() {
    const [session, setSession] = useState<any>(null)
    const [currentUser, setCurrentUser] = useState<any>(null)
    const [partnerProfile, setPartnerProfile] = useState<any>(null)
    const [partnerIncome, setPartnerIncome] = useState(0)
    const [activeTab, setActiveTab] = useState('dashboard')
    const [transactions, setTransactions] = useState<any[]>([])
    const [categories, setCategories] = useState<string[]>([])
    const [showNewCategoryInput, setShowNewCategoryInput] = useState(false)
    const [newCategoryName, setNewCategoryName] = useState('')
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
    const [editingId, setEditingId] = useState<number | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const init = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()
                setSession(session)
                if (session) await fetchProfile(session.user.id)
            } catch (err) {
                console.error('Initialization error:', err)
            } finally {
                setLoading(false)
            }
        }
        init()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            if (session) fetchProfile(session.user.id)
            else {
                setCurrentUser(null)
                setPartnerProfile(null)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    useEffect(() => {
        if (session) {
            fetchTransactions()
            fetchCategories()
        }
    }, [session])

    useEffect(() => {
        if (currentUser?.partner_email) {
            fetchPartnerData(currentUser.partner_email)
        } else {
            setPartnerProfile(null)
            setPartnerIncome(0)
        }
    }, [currentUser, selectedMonth]) // Re-fetch partner income if month changes

    const fetchProfile = async (userId: string) => {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()
        if (error) console.error('Error fetching profile:', error)
        else setCurrentUser(data)
    }

    const fetchPartnerData = async (email: string) => {
        // Fetch partner profile
        const { data: profile, error: pError } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', email)
            .single()

        if (pError) {
            console.error('Error fetching partner profile:', pError)
            setPartnerProfile(null)
            return
        }

        setPartnerProfile(profile)

        // Fetch partner income for the selected month
        const { data: pIncome, error: iError } = await supabase
            .from('transactions')
            .select('amount')
            .eq('owner_id', profile.id)
            .eq('type', 'income')
            .like('date', `${selectedMonth}%`)

        if (iError) {
            console.error('Error fetching partner income:', iError)
        } else {
            const total = pIncome.reduce((acc, tx) => acc + Number(tx.amount), 0)
            setPartnerIncome(total)
        }
    }

    const updatePartnerEmail = async (email: string) => {
        if (!currentUser) return
        const { error } = await supabase
            .from('profiles')
            .update({ partner_email: email })
            .eq('id', currentUser.id)

        if (error) alert('Erro ao atualizar: ' + error.message)
        else fetchProfile(currentUser.id)
    }

    const fetchTransactions = async () => {
        const { data, error } = await supabase.from('transactions').select('*').order('date', { ascending: false })
        if (error) console.error('Error fetching transactions:', error)
        else setTransactions(data || [])
    }

    const fetchCategories = async () => {
        const { data, error } = await supabase.from('categories').select('name')
        if (error) console.error('Error fetching categories:', error)
        else setCategories((data || []).map(c => c.name))
    }

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
        expenseType: 'variable',
    })

    const handleAddCategory = async () => {
        if (newCategoryName && !categories.includes(newCategoryName)) {
            const { error } = await supabase.from('categories').insert([{ name: newCategoryName }])
            if (error) alert('Erro ao adicionar categoria: ' + error.message)
            else {
                setCategories([...categories, newCategoryName])
                setFormData({ ...formData, category: newCategoryName })
                setNewCategoryName('')
                setShowNewCategoryInput(false)
            }
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const txData: any = {
            amount: Number(formData.amount),
            category: formData.category,
            date: formData.date,
            type: isExpense ? 'expense' : 'income',
            scope: isShared ? 'SHARED' : 'PRIVATE',
            owner_id: currentUser.id,
            expense_type: isExpense ? formData.expenseType : null,
            is_credit_card: isExpense ? formData.isCreditCard : false,
            installments: (isExpense && formData.isCreditCard) ? Number(formData.installments) : 1,
            start_date: (isExpense && formData.isCreditCard) ? formData.startDate : formData.date,
        }

        if (editingId) {
            const { error } = await supabase.from('transactions').update(txData).eq('id', editingId)
            if (error) alert('Erro ao atualizar: ' + error.message)
            else {
                setEditingId(null)
                alert('Transação atualizada com sucesso!')
                fetchTransactions()
            }
        } else {
            const { error } = await supabase.from('transactions').insert([txData])
            if (error) alert('Erro ao salvar: ' + error.message)
            else {
                alert('Transação adicionada com sucesso!')
                fetchTransactions()
            }
        }

        // Reset
        setFormData({
            amount: '',
            category: '',
            date: new Date().toISOString().split('T')[0],
            isCreditCard: false,
            installments: '1',
            startDate: new Date().toISOString().split('T')[0],
            expenseType: 'variable',
        })
    }

    const handleDelete = async (id: number) => {
        if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
            const { error } = await supabase.from('transactions').delete().eq('id', id)
            if (error) alert('Erro ao excluir: ' + error.message)
            else fetchTransactions()
        }
    }

    const handleEdit = (tx: any) => {
        setEditingId(tx.id)
        setIsExpense(tx.type === 'expense')
        setIsShared(tx.scope === 'SHARED')
        setFormData({
            amount: tx.amount.toString(),
            category: tx.category,
            date: tx.date,
            isCreditCard: tx.is_credit_card || false,
            installments: tx.installments?.toString() || '1',
            startDate: tx.start_date || tx.date,
            expenseType: tx.expense_type || 'variable',
        })
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
    }

    const monthName = (m: string) => {
        if (!m || typeof m !== 'string' || !m.includes('-')) return m
        const [year, month] = m.split('-')
        return new Date(Number(year), Number(month) - 1).toLocaleString('pt-BR', { month: 'short' })
    }

    if (loading) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                background: '#0d0d12'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <BrainCircuit className="logo-icon large pulse" style={{ margin: '0 auto 20px', display: 'block' }} />
                    <p>Carregando seu Copilot...</p>
                </div>
            </div>
        )
    }

    if (!session || !currentUser) {
        return (
            <div className="auth-screen animate-fade-in">
                <div className="auth-card glass-panel">
                    <BrainCircuit className="logo-icon large" />
                    <h1>EquiFinance IA</h1>
                    <p>Entre ou crie sua conta para começar</p>
                    <form className="auth-form" onSubmit={async (e) => {
                        e.preventDefault()
                        const target = e.target as any
                        const email = target.email.value
                        const password = target.password.value
                        const name = target.name?.value
                        const isSignUp = target.submit.value === 'signup'

                        if (isSignUp) {
                            const { error } = await supabase.auth.signUp({
                                email, password,
                                options: { data: { name: name || email.split('@')[0], avatar_url: '?', color: 'var(--accent-primary)' } }
                            })
                            if (error) alert(error.message)
                            else alert('Verifique seu e-mail para confirmar o cadastro!')
                        } else {
                            const { error } = await supabase.auth.signInWithPassword({ email, password })
                            if (error) alert(error.message)
                        }
                    }}>
                        <div className="form-group">
                            <label>E-mail</label>
                            <input name="email" type="email" required placeholder="seu@email.com" />
                        </div>
                        <div className="form-group">
                            <label>Senha</label>
                            <input name="password" type="password" required placeholder="••••••••" />
                        </div>
                        <div className="form-actions-column">
                            <button type="submit" name="submit" value="signin" className="btn-save">Entrar</button>
                            <div className="form-group signup-extra">
                                <label>Nome (apenas para cadastro)</label>
                                <input name="name" type="text" placeholder="Seu nome" />
                                <button type="submit" name="submit" value="signup" className="btn-cancel">Cadastrar</button>
                            </div>
                            <button
                                type="button"
                                className="btn-demo"
                                style={{
                                    marginTop: '24px',
                                    background: 'transparent',
                                    border: '1px dashed var(--accent-secondary)',
                                    color: 'var(--accent-secondary)',
                                    padding: '12px',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem'
                                }}
                                onClick={() => {
                                    const mockUser = {
                                        id: '123',
                                        name: 'Visitante',
                                        email: 'visitante@example.com',
                                        avatar_url: '?',
                                        color: 'var(--accent-primary)',
                                        partner_email: 'parceiro@demo.com'
                                    };
                                    setSession({ user: mockUser });
                                    setCurrentUser(mockUser);
                                    setPartnerProfile({
                                        id: '456',
                                        name: 'Parceiro Demo',
                                        email: 'parceiro@demo.com',
                                        color: 'var(--accent-secondary)'
                                    });
                                    setPartnerIncome(4000);
                                    setTransactions([
                                        { id: 1, amount: 200, category: 'Mercado', date: new Date().toISOString().slice(0, 10), type: 'expense', scope: 'SHARED', owner_id: '123' },
                                        { id: 2, amount: 5000, category: 'Salário', date: new Date().toISOString().slice(0, 10), type: 'income', scope: 'PRIVATE', owner_id: '123' }
                                    ]);
                                    setLoading(false);
                                }}
                            >
                                Entrar como Convidado (Demo)
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )
    }

    // Derived State for Shared Logic
    const currentMonthTxs = transactions.filter(tx => tx.date.startsWith(selectedMonth))
    const currentMonthShared = currentMonthTxs.filter(tx => tx.scope === 'SHARED' && tx.type === 'expense')
    const currentMonthTotal = currentMonthShared.reduce((acc, tx) => acc + Number(tx.amount), 0)
    const myCurrentMonthShared = currentMonthShared.filter(tx => tx.owner_id === currentUser.id).reduce((acc, tx) => acc + Number(tx.amount), 0)
    const mMinePercent = currentMonthTotal > 0 ? (myCurrentMonthShared / currentMonthTotal) * 100 : 50
    const mOthersPercent = 100 - mMinePercent

    const totalSharedAllTime = transactions.filter(tx => tx.scope === 'SHARED' && tx.type === 'expense').reduce((acc, tx) => acc + Number(tx.amount), 0)

    const monthlyStats = (() => {
        const stats: Record<string, { shared: number, mine: number, others: number }> = {}
        transactions.forEach(tx => {
            if (!tx.date) return
            const m = tx.date.slice(0, 7)
            if (!stats[m]) stats[m] = { shared: 0, mine: 0, others: 0 }
            if (tx.type === 'expense') {
                if (tx.scope === 'SHARED') stats[m].shared += Number(tx.amount)
                else if (tx.owner_id === currentUser.id) stats[m].mine += Number(tx.amount)
                else stats[m].others += Number(tx.amount)
            }
        })
        return stats
    })()

    const last3Months = Array.from({ length: 3 }, (_, i) => {
        const d = new Date()
        d.setMonth(d.getMonth() - i)
        return d.toISOString().slice(0, 7)
    }).reverse()

    const myIncomeActual = currentMonthTxs.filter(tx => tx.type === 'income' && tx.owner_id === currentUser.id).reduce((acc, tx) => acc + Number(tx.amount), 0)
    const coupleTotalIncome = myIncomeActual + partnerIncome

    // Real suggested percents based on income
    const suggestedMinePercent = coupleTotalIncome > 0 ? (myIncomeActual / coupleTotalIncome) * 100 : 50
    const suggestedPartnerPercent = 100 - suggestedMinePercent

    const currentMonthFixed = currentMonthTxs.filter(tx => tx.type === 'expense' && tx.expense_type === 'fixed').reduce((acc, tx) => acc + Number(tx.amount), 0)
    const currentMonthVariable = currentMonthTxs.filter(tx => tx.type === 'expense' && (tx.expense_type === 'variable' || !tx.expense_type)).reduce((acc, tx) => acc + Number(tx.amount), 0)

    const myPrivateExpenses = currentMonthTxs.filter(tx => tx.type === 'expense' && tx.scope === 'PRIVATE' && tx.owner_id === currentUser.id).reduce((acc, tx) => acc + Number(tx.amount), 0)
    const mySharedShare = (currentMonthTotal * suggestedMinePercent) / 100
    const myAvailable = myIncomeActual - myPrivateExpenses - mySharedShare

    const fixedPercent = (currentMonthFixed + currentMonthVariable) > 0 ? (currentMonthFixed / (currentMonthFixed + currentMonthVariable)) * 100 : 0
    const variablePercent = 100 - fixedPercent

    const forecastData = (() => {
        const forecast = []
        const now = new Date()
        for (let i = 0; i < 12; i++) {
            const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
            const monthStr = d.toISOString().slice(0, 7)
            let fixed = 0, variable = 0, income = 0

            transactions.forEach(tx => {
                const amount = Number(tx.amount)
                if (tx.scope !== 'SHARED') return
                if (tx.type === 'income') { if (tx.date.startsWith(monthStr)) income += amount }
                else {
                    if (tx.expense_type === 'fixed') fixed += amount
                    else if (tx.is_credit_card) {
                        const installments = Number(tx.installments) || 1
                        const startDate = new Date(tx.start_date || tx.date)
                        const startMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1)
                        const diffMonths = (d.getFullYear() - startMonth.getFullYear()) * 12 + (d.getMonth() - startMonth.getMonth())
                        if (diffMonths >= 0 && diffMonths < installments) variable += amount / installments
                    } else { if (tx.date.startsWith(monthStr)) variable += amount }
                }
            })
            forecast.push({ month: monthStr, fixed, variable, total: fixed + variable, income })
        }
        return forecast
    })()

    const visibleTransactions = transactions.filter(tx => tx.scope === 'SHARED' || tx.owner_id === currentUser.id)

    return (
        <div className="layout-root">
            <Sidebar
                currentUser={currentUser}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onLogout={() => supabase.auth.signOut()}
            />

            <main className="content">
                <header className="header">
                    <h1>{activeTab === 'dashboard' ? `Olá, ${currentUser.name}` :
                        activeTab === 'couple' ? 'Visão do Casal' :
                            activeTab === 'transactions' ? 'Gerenciar Transações' : 'Simulador IA'}</h1>
                    <div className="ai-status">
                        <span className="pulse"></span> Copilot Ativo
                    </div>
                </header>

                {activeTab === 'dashboard' && (
                    <Dashboard
                        currentUser={currentUser}
                        selectedMonth={selectedMonth}
                        setSelectedMonth={setSelectedMonth}
                        monthlyStats={monthlyStats}
                        formatCurrency={formatCurrency}
                        monthName={monthName}
                        totalSharedAllTime={totalSharedAllTime}
                        last3Months={last3Months}
                        coupleTotalIncome={coupleTotalIncome}
                        currentMonthTotal={currentMonthTotal}
                        currentMonthFixed={currentMonthFixed}
                        currentMonthVariable={currentMonthVariable}
                        fixedPercent={fixedPercent}
                        variablePercent={variablePercent}
                        myIncomeActual={myIncomeActual}
                        myAvailable={myAvailable}
                        mMinePercent={mMinePercent}
                        mOthersPercent={mOthersPercent}
                        suggestedMinePercent={suggestedMinePercent}
                        suggestedPartnerPercent={suggestedPartnerPercent}
                    />
                )}

                {activeTab === 'couple' && (
                    <CoupleView
                        currentUser={currentUser}
                        partnerProfile={partnerProfile}
                        onUpdatePartnerEmail={updatePartnerEmail}
                        coupleTotalIncome={coupleTotalIncome}
                        suggestedLeoPercent={suggestedMinePercent}
                        suggestedCrisPercent={suggestedPartnerPercent}
                        forecastData={forecastData}
                        formatCurrency={formatCurrency}
                        monthName={monthName}
                    />
                )}

                {activeTab === 'transactions' && (
                    <TransactionsView
                        isExpense={isExpense}
                        setIsExpense={setIsExpense}
                        isShared={isShared}
                        setIsShared={setIsShared}
                        formData={formData}
                        setFormData={setFormData}
                        categories={categories}
                        showNewCategoryInput={showNewCategoryInput}
                        setShowNewCategoryInput={setShowNewCategoryInput}
                        newCategoryName={newCategoryName}
                        setNewCategoryName={setNewCategoryName}
                        handleAddCategory={handleAddCategory}
                        handleSubmit={handleSubmit}
                        editingId={editingId}
                        cancelEdit={() => setEditingId(null)}
                        visibleTransactions={visibleTransactions}
                        handleEdit={handleEdit}
                        handleDelete={handleDelete}
                        formatCurrency={formatCurrency}
                        currentUser={currentUser}
                    />
                )}

                {activeTab === 'simulator' && (
                    <div className="card glass-panel animate-fade-in">
                        <h2>Simulador de Impacto IA</h2>
                        <p className="subtitle">Em breve: Consulte o Copilot antes de grandes compras.</p>
                    </div>
                )}
            </main>
        </div>
    )
}

export default App
