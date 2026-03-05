import React, { useState } from 'react';
import { Users, TrendingUp, Link as LinkIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { CardHeader, Card } from './ui/Card';

interface CoupleViewProps {
    currentUser: any;
    partnerProfile: any;
    onUpdatePartnerEmail: (email: string) => Promise<void>;
    coupleTotalIncome: number;
    suggestedLeoPercent: number;
    suggestedCrisPercent: number;
    forecastData: Array<{
        month: string;
        fixed: number;
        variable: number;
        total: number;
        income: number;
    }>;
    formatCurrency: (value: number) => string;
    monthName: (m: string) => string;
}

export function CoupleView({
    currentUser,
    partnerProfile,
    onUpdatePartnerEmail,
    coupleTotalIncome,
    suggestedLeoPercent,
    suggestedCrisPercent,
    forecastData,
    formatCurrency,
    monthName,
}: CoupleViewProps) {
    const [editingEmail, setEditingEmail] = useState(false);
    const [emailInput, setEmailInput] = useState(currentUser?.partner_email || '');

    const handleUpdateEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        await onUpdatePartnerEmail(emailInput);
        setEditingEmail(false);
    };

    return (
        <section className="couple-view animate-fade-in">
            <Card style={{ marginBottom: '24px' }}>
                <CardHeader>
                    <h2>Equidade & Configurações</h2>
                    <Users className="accent-icon" />
                </CardHeader>

                <div className="partner-linking-section" style={{ marginBottom: '24px', padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <LinkIcon size={18} className="accent-icon" />
                            <h3 style={{ fontSize: '1rem' }}>Vincular Parceiro</h3>
                        </div>
                        {partnerProfile ? (
                            <span className="status-pill success" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <CheckCircle2 size={12} /> Conectado a {partnerProfile.name}
                            </span>
                        ) : currentUser?.partner_email ? (
                            <span className="status-pill neutral" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <AlertCircle size={12} /> Pendente: {currentUser.partner_email}
                            </span>
                        ) : (
                            <span className="status-pill danger">Não vinculado</span>
                        )}
                    </div>

                    {editingEmail ? (
                        <form onSubmit={handleUpdateEmail} style={{ display: 'flex', gap: '8px' }}>
                            <input
                                type="email"
                                value={emailInput}
                                onChange={(e) => setEmailInput(e.target.value)}
                                placeholder="email.do.parceiro@exemplo.com"
                                style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white' }}
                            />
                            <button type="submit" className="btn-save" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>Salvar</button>
                            <button type="button" onClick={() => setEditingEmail(false)} className="btn-cancel" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>Cancelar</button>
                        </form>
                    ) : (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                {currentUser?.partner_email ? `Parceiro: ${currentUser.partner_email}` : 'Vincule o e-mail do seu parceiro para automatizar a equidade.'}
                            </p>
                            <button onClick={() => setEditingEmail(true)} className="action-btn edit" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Alterar</button>
                        </div>
                    )}
                </div>

                <div className="equity-details">
                    <p>
                        A divisão sugerida pela IA baseada na renda total de {formatCurrency(coupleTotalIncome)} é de{' '}
                        {suggestedLeoPercent.toFixed(0)}% para você e {suggestedCrisPercent.toFixed(0)}% para seu parceiro.
                    </p>
                    <div className="equity-visualizer" style={{ marginTop: '20px' }}>
                        <div className="equity-bar">
                            <div
                                className="equity-fill p1"
                                style={{ width: `${suggestedLeoPercent}%`, background: 'var(--accent-primary)' }}
                            >
                                <span className="label">Você ({suggestedLeoPercent.toFixed(0)}%)</span>
                            </div>
                            <div
                                className="equity-fill p2"
                                style={{ width: `${suggestedCrisPercent}%`, background: 'var(--accent-secondary)' }}
                            >
                                <span className="label">Parceiro ({suggestedCrisPercent.toFixed(0)}%)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            <Card className="animate-fade-in">
                <CardHeader>
                    <div className="title-stack">
                        <h2>Previsão de Gastos Compartilhados (12 Meses)</h2>
                        <p className="subtitle">Visão antecipada para planejamento familiar</p>
                    </div>
                    <TrendingUp className="accent-icon" />
                </CardHeader>

                <div className="forecast-table-container">
                    <table className="forecast-table">
                        <thead>
                            <tr>
                                <th>Mês</th>
                                <th>Fixos</th>
                                <th>Variáveis/Parcelas</th>
                                <th>Total Previsto</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {forecastData.map((item) => {
                                const isOver = item.income > 0 && item.total > item.income;
                                return (
                                    <tr key={item.month}>
                                        <td className="month-name">
                                            {monthName(item.month)} {item.month.split('-')[0]}
                                        </td>
                                        <td>{formatCurrency(item.fixed)}</td>
                                        <td>{formatCurrency(item.variable)}</td>
                                        <td className="total-cell">{formatCurrency(item.total)}</td>
                                        <td>
                                            {item.income > 0 ? (
                                                <span className={`status-pill ${isOver ? 'danger' : 'success'}`}>
                                                    {isOver ? 'Déficit' : 'OK'}
                                                </span>
                                            ) : (
                                                <span className="status-pill neutral">Sem Renda Info</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>
        </section>
    );
}
