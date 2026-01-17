/**
 * LoanAccountDetailView Component
 *
 * Comprehensive view of a loan account including stats, 
 * progress and payment history.
 */

'use client';

import { ILoanAccount, LoanAccountStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Landmark,
    TrendingUp,
    IndianRupee,
    ArrowLeft,
    Pencil,
    Trash2,
    Clock,
    CheckCircle2,
    AlertCircle,
    LayoutDashboard,
    History
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { InterestPaymentList } from './interest-payment-list';
import { Button } from '@/components/ui/button';
import { useDeleteLoanAccount } from '@/lib/hooks/use-loan-accounts';
import { useRouter } from 'next/navigation';

interface LoanAccountDetailViewProps {
    loan: ILoanAccount;
}

export function LoanAccountDetailView({ loan }: LoanAccountDetailViewProps) {
    const router = useRouter();
    const deleteMutation = useDeleteLoanAccount();

    const paidPercentage = (loan.totalPrincipalPaid / loan.principalAmount) * 100;

    const statusInfo = {
        [LoanAccountStatus.ACTIVE]: { color: 'text-success bg-success/10 border-success/20', icon: CheckCircle2, label: 'Active' },
        [LoanAccountStatus.CLOSED]: { color: 'text-muted-foreground bg-muted border-border', icon: Clock, label: 'Closed' },
        [LoanAccountStatus.DEFAULTED]: { color: 'text-destructive bg-destructive/10 border-destructive/20', icon: AlertCircle, label: 'Defaulted' },
    };

    const currentStatus = statusInfo[loan.status];

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this loan account? This will not delete associated payments.')) {
            await deleteMutation.mutateAsync(loan._id.toString());
            router.push('/loan-accounts');
        }
    };

    // Calculate dates to display
    const startDate = loan.startDate ? format(new Date(loan.startDate), 'dd MMM yyyy') : 'N/A';
    const endDate = loan.endDate ? format(new Date(loan.endDate), 'dd MMM yyyy') : null;

    return (
        <div className="space-y-6">
            {/* Header / Navigation */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <Link href="/loan-accounts" className="group inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors mb-2">
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        Back to Loan Accounts
                    </Link>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight">{loan.bankName}</h1>
                        <Badge className={cn('font-bold', currentStatus.color)}>
                            <currentStatus.icon className="mr-1.5 h-3.5 w-3.5" />
                            {currentStatus.label}
                        </Badge>
                    </div>
                    <p className="text-muted-foreground font-medium flex items-center gap-2">
                        <span className="font-mono">{loan.accountNumber}</span>
                        <span>•</span>
                        <span>{loan.loanType}</span>
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" asChild className="h-9 rounded-lg px-4 font-bold border-border/40 hover:bg-muted/50">
                        <Link href={`/loan-accounts/${loan._id}/edit`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Loan
                        </Link>
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDelete}
                        className="h-9 rounded-lg px-4 font-bold bg-destructive/90 hover:bg-destructive shadow-lg shadow-destructive/20"
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="h-14 p-1.5 bg-muted/40 backdrop-blur-xl border border-border/40 rounded-2xl shadow-inner mb-8 px-1.5 gap-1.5 w-full sm:w-auto">
                    <TabsTrigger
                        value="overview"
                        className="h-full px-8 rounded-xl font-bold transition-all data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-lg gap-2"
                    >
                        <LayoutDashboard className="h-4 w-4" /> Overview
                    </TabsTrigger>
                    <TabsTrigger
                        value="payments"
                        className="h-full px-8 rounded-xl font-bold transition-all data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-lg gap-2"
                    >
                        <History className="h-4 w-4" /> Payment History
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-0 ring-offset-background focus-visible:outline-none space-y-8 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
                    {/* Stats Overview */}
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            title="Outstanding"
                            value={`₹${loan.outstandingAmount.toLocaleString('en-IN')}`}
                            description={`of ₹${loan.principalAmount.toLocaleString('en-IN')}`}
                            icon={Landmark}
                            color="primary"
                        />
                        <StatCard
                            title="Interest Rate"
                            value={`${loan.interestRate}%`}
                            description="Annualized rate"
                            icon={TrendingUp}
                            color="amber"
                        />
                        <StatCard
                            title="EMI Amount"
                            value={loan.emiAmount ? `₹${loan.emiAmount.toLocaleString('en-IN')}` : 'N/A'}
                            description="Monthly repayment"
                            icon={IndianRupee}
                            color="indigo"
                        />
                        <StatCard
                            title="Total Interest Paid"
                            value={`₹${loan.totalInterestPaid.toLocaleString('en-IN')}`}
                            description="So far"
                            icon={CheckCircle2}
                            color="success"
                        />
                    </div>

                    {/* Repayment Progress */}
                    <Card className="border-border/50 bg-card/40 backdrop-blur-xl shadow-sm rounded-2xl overflow-hidden group">
                        <CardHeader className="border-b border-border/10 p-6 py-4">
                            <CardTitle className="text-base font-extrabold tracking-tight flex items-center gap-2 uppercase text-muted-foreground/70">
                                <Clock className="h-4 w-4 text-primary" />
                                Repayment Progress
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-8 space-y-6">
                            <div className="space-y-3">
                                <div className="flex items-end justify-between">
                                    <div>
                                        <div className="text-4xl font-black text-foreground">
                                            {Math.round(paidPercentage)}%
                                        </div>
                                        <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                            Principal Repaid
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-semibold text-muted-foreground">Outstanding Principal</div>
                                        <div className="text-2xl font-bold text-foreground">₹{loan.outstandingAmount.toLocaleString('en-IN')}</div>
                                    </div>
                                </div>

                                <Progress value={paidPercentage} className="h-4 bg-muted shadow-inner rounded-full" />
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-border/20">
                                <div className="space-y-1">
                                    <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Paid Principal</div>
                                    <div className="text-sm font-bold text-success">₹{loan.totalPrincipalPaid.toLocaleString('en-IN')}</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Original Amount</div>
                                    <div className="text-sm font-bold text-foreground">₹{loan.principalAmount.toLocaleString('en-IN')}</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Start Date</div>
                                    <div className="text-sm font-bold text-muted-foreground">{startDate}</div>
                                </div>
                                {endDate && (
                                    <div className="space-y-1">
                                        <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">End Date</div>
                                        <div className="text-sm font-bold text-muted-foreground">{endDate}</div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="payments" className="mt-0 ring-offset-background focus-visible:outline-none animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
                    <Card className="border-border/50 bg-card/20 rounded-2xl shadow-xl overflow-hidden min-h-[500px]">
                        <CardHeader className="py-6 border-b border-border/10 bg-muted/20">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2 text-foreground">
                                        <IndianRupee className="h-5 w-5 text-amber-500" />
                                        Payment History
                                    </CardTitle>
                                    <CardDescription>Track all interest and principal repayments</CardDescription>
                                </div>
                                <Button variant="default" size="sm" asChild className="h-9 px-4 rounded-lg font-bold shadow-lg shadow-primary/20">
                                    <Link href={`/interest-payments/new?loanAccountId=${loan._id}`}>
                                        <IndianRupee className="mr-2 h-3.5 w-3.5" />
                                        Record Payment
                                    </Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 [&>div>div:first-child]:hidden [&_div[class*='rounded-2xl']]:border-0 [&_div[class*='rounded-2xl']]:shadow-none [&_div[class*='rounded-2xl']]:bg-transparent">
                            <InterestPaymentList loanAccountId={loan._id.toString()} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function StatCard({ title, value, description, icon: Icon, color }: any) {
    const colors: any = {
        primary: 'bg-primary/10 text-primary border-primary/20',
        amber: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
        indigo: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
        success: 'bg-success/10 text-success border-success/20',
    };

    return (
        <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-lg group hover:border-primary/20 transition-all duration-300">
            <CardContent className="p-6">
                <div className="flex items-center gap-4">
                    <div className={cn('h-12 w-12 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500', colors[color])}>
                        <Icon className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">{title}</p>
                        <h3 className="text-2xl font-black tracking-tight">{value}</h3>
                        <p className="text-xs font-semibold text-muted-foreground mt-0.5">{description}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
