import React from 'react';
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    Target,
    BrainCircuit,
    ArrowUpRight,
    ArrowDownRight,
    PieChart
} from 'lucide-react';
import { Card, CardHeader } from './ui/Card';

interface DashboardProps {
    currentUser: any;
    selectedMonth: string;
    setSelectedMonth: (month: string) => void;
    monthlyStats: Record<string, { shared: number; mine: number; others: number }>;
    formatCurrency: (value: number) => string;
    monthName: (m: string) => string;
    totalSharedAllTime: number;
    last3Months: string[];
    coupleTotalIncome: number;
    currentMonthTotal: number;
    currentMonthFixed: number;
    currentMonthVariable: number;
    fixedPercent: number;
    variablePercent: number;
    myIncomeActual: number;
    myAvailable: number;
    mMinePercent: number;
    mOthersPercent: number;
    suggestedMinePercent: number;
    suggestedPartnerPercent: number;
}

export function Dashboard({
    currentUser,
    selectedMonth,
    setSelectedMonth,
    monthlyStats,
    formatCurrency,
    monthName,
    totalSharedAllTime,
    last3Months,
    coupleTotalIncome,
    currentMonthTotal,
    currentMonthFixed,
    currentMonthVariable,
    fixedPercent,
    variablePercent,
    myIncomeActual,
    myAvailable,
    mMinePercent,
    mOthersPercent,
    suggestedMinePercent,
    suggestedPartnerPercent,
}: DashboardProps) {
    return (
        <div className="dashboard-grid animate-fade-in">
            <Card>
                <CardHeader>
                    <div className="title-with-icon">
                        <Wallet className="accent-icon" />
                        <div className="title-stack">
                            <h2>Visão Geral (Mês)</h2>
                            <select
                                className="month-select"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                            >
                                {Object.keys(monthlyStats).sort().reverse().map(m => (
                                    <option key={m} value={m}>{monthName(m)} {m.split('-')[0]}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </CardHeader>
                <div className="balance-info">
                    <span className="amount">{formatCurrency(currentMonthTotal)}</span>
                    <span className="subtitle">Total de Gastos Compartilhados</span>
                </div>
                <div className="chart-container">
                    {last3Months.map(m => (
                        <div key={m} className="chart-bar-group">
                            <div className="bar-wrapper">
                                <div
                                    className="chart-bar"
                                    style={{
                                        height: `${(monthlyStats[m]?.shared || 0) / (Math.max(...Object.values(monthlyStats).map(s => s.shared), 1) || 1) * 100}%`
                                    }}
                                ></div>
                            </div>
                            <span className="bar-label">{monthName(m)}</span>
                        </div>
                    ))}
                </div>
            </Card>

            <Card className="ai-card">
                <CardHeader>
                    <div className="title-with-icon">
                        <BrainCircuit className="accent-icon" />
                        <h2>Copilot Insights</h2>
                    </div>
                    <span className="badge">Beta</span>
                </CardHeader>
                <div className="equity-visualizer">
                    <div className="message">
                        A renda total do casal este mês é de <strong>{formatCurrency(coupleTotalIncome)}</strong>.
                        A equidade ideal sugerida é <strong>{suggestedMinePercent.toFixed(0)} / {suggestedPartnerPercent.toFixed(0)}</strong>.
                    </div>
                    <div className="equity-bar">
                        <div className="equity-fill" style={{ width: `${suggestedMinePercent}%`, background: 'var(--accent-primary)' }}>
                            {suggestedMinePercent.toFixed(0)}%
                        </div>
                        <div className="equity-fill" style={{ width: `${suggestedPartnerPercent}%`, background: 'var(--accent-secondary)' }}>
                            {suggestedPartnerPercent.toFixed(0)}%
                        </div>
                    </div>
                    <p className="subtitle" style={{ fontSize: '0.75rem', marginTop: '4px' }}>Divisão ideal sugerida baseada em renda</p>
                </div>
                <button className="btn-ai">Pedir revisão de gastos</button>
            </Card>

            <Card>
                <CardHeader>
                    <div className="title-with-icon">
                        <Target className="accent-icon" />
                        <h2>Minha Saúde</h2>
                    </div>
                </CardHeader>
                <div className="income-split">
                    <div className="stat">
                        <span className="subtitle">Ganhos</span>
                        <span className="amount small">{formatCurrency(myIncomeActual)}</span>
                    </div>
                    <div className="stat">
                        <span className="subtitle">Livre</span>
                        <span className="amount small" style={{ color: myAvailable < 0 ? '#ef4444' : '#10b981' }}>
                            {formatCurrency(myAvailable)}
                        </span>
                    </div>
                </div>
                <div className="breakdown-stats mt-12">
                    <div className="stat-item">
                        <div className="dot fixed"></div>
                        <div className="stat-info">
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <p>Gastos Fixos</p>
                                <span>{fixedPercent.toFixed(0)}%</span>
                            </div>
                            <div className="mini-progress">
                                <div className="fill fixed" style={{ width: `${fixedPercent}%` }}></div>
                            </div>
                        </div>
                    </div>
                    <div className="stat-item">
                        <div className="dot variable"></div>
                        <div className="stat-info">
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <p>Variáveis</p>
                                <span>{variablePercent.toFixed(0)}%</span>
                            </div>
                            <div className="mini-progress">
                                <div className="fill variable" style={{ width: `${variablePercent}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Comparative Column (Full Width in grid) */}
            <Card style={{ gridColumn: 'span 3' }}>
                <CardHeader>
                    <div className="title-with-icon">
                        <PieChart className="accent-icon" />
                        <h2>Comparativo de Gastos e Equidade Real</h2>
                    </div>
                </CardHeader>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center' }}>
                    <div>
                        <p className="subtitle" style={{ marginBottom: '16px' }}>Quem gastou mais esse mês (Shared)?</p>
                        <div className="equity-bar" style={{ height: '32px' }}>
                            <div className="equity-fill" style={{ width: `${mMinePercent}%`, background: 'var(--accent-primary)' }}>
                                Você ({mMinePercent.toFixed(0)}%)
                            </div>
                            <div className="equity-fill" style={{ width: `${mOthersPercent}%`, background: '#10b981' }}>
                                Parceiro ({mOthersPercent.toFixed(0)}%)
                            </div>
                        </div>
                        <p className="subtitle" style={{ fontSize: '0.8rem', marginTop: '8px' }}>
                            {mMinePercent > suggestedMinePercent
                                ? "⚠️ Você está contribuindo com uma fatia maior que a sugerida."
                                : "✅ Sua contribuição está dentro ou abaixo da fatia sugerida."}
                        </p>
                    </div>

                    <div className="income-split">
                        <div className="stat">
                            <span className="subtitle">Média de Gastos Mensais</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span className="amount small">{formatCurrency(currentMonthTotal)}</span>
                                <TrendingDown size={16} style={{ color: '#ef4444' }} />
                            </div>
                        </div>
                        <div className="stat">
                            <span className="subtitle">Total Compartilhado Acumulado</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span className="amount small">{formatCurrency(totalSharedAllTime)}</span>
                                <ArrowUpRight size={16} style={{ color: '#10b981' }} />
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
