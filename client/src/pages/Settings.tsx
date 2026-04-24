import React, { useState, useEffect } from 'react';
import { useAuth, User } from '@/context/AuthContext';
import { userAPI, testAPI, TransactionData, SubscriptionResponse } from '@/lib/api';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { 
    User as UserIcon, 
    Shield, 
    CreditCard, 
    Mail, 
    Phone, 
    KeyRound, 
    AlertTriangle,
    Loader2,
    History,
    FileText,
    X
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export default function Settings() {
    const { user, setUser, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'billing' | 'history'>('profile');

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            
            <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
                <div className="flex flex-col md:flex-row gap-8">
                    
                    {/* Sidebar */}
                    <aside className="w-full md:w-64 shrink-0">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 overflow-hidden">
                            <nav className="flex flex-col space-y-1">
                                <button
                                    onClick={() => setActiveTab('profile')}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                                        activeTab === 'profile' 
                                            ? 'bg-blue-50 text-[#1A5DC8]' 
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                                >
                                    <UserIcon className="w-5 h-5" />
                                    Personal Profile
                                </button>
                                <button
                                    onClick={() => setActiveTab('security')}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                                        activeTab === 'security' 
                                            ? 'bg-blue-50 text-[#1A5DC8]' 
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                                >
                                    <Shield className="w-5 h-5" />
                                    Security & Account
                                </button>
                                <button
                                    onClick={() => setActiveTab('billing')}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                                        activeTab === 'billing' 
                                            ? 'bg-blue-50 text-[#1A5DC8]' 
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                                >
                                    <CreditCard className="w-5 h-5" />
                                    Billing & Subscription
                                </button>
                                <button
                                    onClick={() => setActiveTab('history')}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                                        activeTab === 'history' 
                                            ? 'bg-blue-50 text-[#1A5DC8]' 
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                                >
                                    <History className="w-5 h-5" />
                                    Test History
                                </button>
                            </nav>
                        </div>
                    </aside>

                    {/* Content Area */}
                    <div className="flex-1">
                        {activeTab === 'profile' && <ProfileTab user={user!} setUser={setUser} />}
                        {activeTab === 'security' && <SecurityTab user={user!} setUser={setUser} logout={logout} navigate={navigate} />}
                        {activeTab === 'billing' && <BillingTab />}
                        {activeTab === 'history' && <TestHistoryTab navigate={navigate} />}
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
}

// ==========================================
// PROFILE TAB
// ==========================================
function ProfileTab({ user, setUser }: { user: User, setUser: (u: User) => void }) {
    const [name, setName] = useState(user.name || '');
    const [phone, setPhone] = useState(user.phone || '');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        
        try {
            const res = await userAPI.updateProfile({ name, phone });
            if (res.success && res.data) {
                // IMPORTANT: update context so navbar reflects new name instantly
                setUser({ ...user, ...res.data } as User);
                setMessage({ type: 'success', text: 'Profile updated successfully.' });
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to update profile.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Personal Profile</h2>
            
            {message.text && (
                <div className={`p-4 mb-6 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <UserIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="pl-10 block w-full rounded-lg border border-gray-300 py-2.5 px-3 text-gray-900 focus:ring-[#1A5DC8] focus:border-[#1A5DC8] sm:text-sm"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number (Optional)</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Phone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="pl-10 block w-full rounded-lg border border-gray-300 py-2.5 px-3 text-gray-900 focus:ring-[#1A5DC8] focus:border-[#1A5DC8] sm:text-sm"
                            placeholder="+91 9876543210"
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex justify-center items-center px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#1A5DC8] hover:bg-[#0D3E8E] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}

// ==========================================
// SECURITY TAB
// ==========================================
function SecurityTab({ user, setUser, logout, navigate }: { user: User, setUser: (u: User) => void, logout: () => Promise<void>, navigate: any }) {
    
    // Email Form State
    const [newEmail, setNewEmail] = useState(user.email || '');
    const [emailPassword, setEmailPassword] = useState('');
    const [emailLoading, setEmailLoading] = useState(false);
    const [emailMessage, setEmailMessage] = useState({ type: '', text: '' });

    // Password Form State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [passLoading, setPassLoading] = useState(false);
    const [passMessage, setPassMessage] = useState({ type: '', text: '' });

    // Account Deletion State
    const [deleteLoading, setDeleteLoading] = useState(false);

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setEmailLoading(true);
        setEmailMessage({ type: '', text: '' });
        
        try {
            const res = await userAPI.changeEmail({ newEmail, currentPassword: emailPassword });
            if (res.success && res.data) {
                setUser({ ...user, ...res.data } as User);
                setEmailMessage({ type: 'success', text: 'Email updated successfully.' });
                setEmailPassword('');
            }
        } catch (error: any) {
            setEmailMessage({ type: 'error', text: error.message || 'Failed to update email.' });
        } finally {
            setEmailLoading(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPassLoading(true);
        setPassMessage({ type: '', text: '' });
        
        try {
            const res = await userAPI.changePassword({ currentPassword, newPassword });
            if (res.success) {
                setPassMessage({ type: 'success', text: 'Password updated. Logging you out...' });
                // Need to log them out to kill old sessions
                setTimeout(async () => {
                    await logout();
                    navigate('/sign-in');
                }, 1500);
            }
        } catch (error: any) {
            setPassMessage({ type: 'error', text: error.message || 'Failed to update password.' });
        } finally {
            setPassLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm("Are you entirely sure you want to deactivate your account? This action will lock your access.")) {
            return;
        }
        setDeleteLoading(true);
        try {
            const res = await userAPI.deleteAccount();
            if (res.success) {
                await logout();
                navigate('/');
            }
        } catch (error) {
            alert('Failed to deactivate account.');
        } finally {
            setDeleteLoading(false);
        }
    }

    return (
        <div className="space-y-8">
            {/* Email Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Email Address</h2>
                
                {emailMessage.text && (
                    <div className={`p-4 mb-6 rounded-lg text-sm ${emailMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {emailMessage.text}
                    </div>
                )}

                <form onSubmit={handleEmailSubmit} className="space-y-5 max-w-md">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Email</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                className="pl-10 block w-full rounded-lg border border-gray-300 py-2.5 px-3 text-gray-900 focus:ring-[#1A5DC8] focus:border-[#1A5DC8] sm:text-sm"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Password (to verify)</label>
                        <input
                            type="password"
                            value={emailPassword}
                            onChange={(e) => setEmailPassword(e.target.value)}
                            className="block w-full rounded-lg border border-gray-300 py-2.5 px-3 text-gray-900 focus:ring-[#1A5DC8] focus:border-[#1A5DC8] sm:text-sm"
                            required
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={emailLoading}
                            className="flex justify-center items-center px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {emailLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Email'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Password Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Change Password</h2>
                
                {passMessage.text && (
                    <div className={`p-4 mb-6 rounded-lg text-sm ${passMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {passMessage.text}
                    </div>
                )}

                <form onSubmit={handlePasswordSubmit} className="space-y-5 max-w-md">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="block w-full rounded-lg border border-gray-300 py-2.5 px-3 text-gray-900 focus:ring-[#1A5DC8] focus:border-[#1A5DC8] sm:text-sm"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <KeyRound className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="pl-10 block w-full rounded-lg border border-gray-300 py-2.5 px-3 text-gray-900 focus:ring-[#1A5DC8] focus:border-[#1A5DC8] sm:text-sm"
                                required
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={passLoading}
                            className="flex justify-center items-center px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#1A5DC8] hover:bg-[#0D3E8E] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {passLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Change Password'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 rounded-xl shadow-sm border border-red-100 p-6 sm:p-8">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-red-900 mb-2">Deactivate Account</h2>
                        <p className="text-red-700 text-sm mb-4">
                            Deactivating your account will lock your access. Your past test attempts and data will remain for our records, but you won't be able to log in anymore.
                        </p>
                        <button
                            onClick={handleDeleteAccount}
                            disabled={deleteLoading}
                            className="inline-flex items-center px-4 py-2.5 border border-red-200 rounded-lg shadow-sm text-sm font-medium text-red-600 bg-white hover:bg-red-50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {deleteLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Deactivate Account'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ==========================================
// BILLING TAB
// ==========================================
function BillingTab() {
    const [sub, setSub] = useState<SubscriptionResponse | null>(null);
    const [transactions, setTransactions] = useState<TransactionData[]>([]);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [subRes, transRes] = await Promise.all([
                userAPI.getSubscription(),
                userAPI.getTransactions()
            ]);
            
            if (subRes.success && subRes.data) {
                setSub(subRes.data);
            }
            if (transRes.success && transRes.data) {
                setTransactions(transRes.data.transactions);
                setNextCursor(transRes.data.pagination.nextCursor);
                setHasMore(transRes.data.pagination.hasMore);
            }
        } catch (error) {
            console.error("Failed to load billing data", error);
        } finally {
            setLoading(false);
        }
    };

    const loadMoreTransactions = async () => {
        if (!nextCursor) return;
        setLoadingMore(true);
        try {
            const transRes = await userAPI.getTransactions(nextCursor);
            if (transRes.success && transRes.data) {
                setTransactions(prev => [...prev, ...transRes.data!.transactions]);
                setNextCursor(transRes.data.pagination.nextCursor);
                setHasMore(transRes.data.pagination.hasMore);
            }
        } catch (error) {
            console.error("Failed to load more transactions", error);
        } finally {
            setLoadingMore(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 text-[#1A5DC8] animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Current Plan */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Current Plan</h2>
                <div className="flex items-center justify-between p-5 border border-gray-200 rounded-lg bg-gray-50">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-semibold text-gray-900">{sub?.plan || 'FREE'} PLAN</span>
                            {sub?.isActive ? (
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Active
                                </span>
                            ) : (
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    Inactive
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                            Joined {new Date(sub?.joinedAt || Date.now()).toLocaleDateString()}
                        </p>
                    </div>
                    {sub?.plan === 'FREE' && (
                        <a
                            href="/pricing"
                            className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#FF6B00] hover:bg-[#E55A00] transition-colors"
                        >
                            Upgrade Now
                        </a>
                    )}
                </div>
            </div>

            {/* Transactions History */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Transaction History</h2>
                
                {transactions.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                        No transactions found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference ID</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {transactions.map((tx) => (
                                    <tr key={tx._id}>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(tx.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            ₹{(tx.amount)}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                tx.status === 'SUCCESS' ? 'bg-green-100 text-green-800' : 
                                                tx.status === 'FAILED' ? 'bg-red-100 text-red-800' : 
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {tx.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 font-mono text-xs">
                                            {tx.paymentId || tx.orderId || 'N/A'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {hasMore && (
                    <div className="mt-6 flex justify-center">
                        <button
                            onClick={loadMoreTransactions}
                            disabled={loadingMore}
                            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                            {loadingMore && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Load More
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ==========================================
// TEST HISTORY TAB
// ==========================================
function TestHistoryTab({ navigate }: { navigate: any }) {
    const [attempts, setAttempts] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);

    useEffect(() => {
        fetchHistory(page);
    }, [page]);

    const fetchHistory = async (p: number) => {
        setLoading(true);
        try {
            const res = await testAPI.getUserAttempts({ page: p, limit: 10 });
            if (res.success && res.data) {
                setAttempts(res.data.attempts);
                setStats(res.data.stats);
                setTotalPages(res.data.pagination.totalPages);
            }
        } catch (error) {
            console.error("Failed to load test history", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading && attempts.length === 0) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 text-[#1A5DC8] animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Stats Header */}
            {stats && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
                        <p className="text-sm font-medium text-gray-500 mb-1">Total Attempts</p>
                        <p className="text-3xl font-bold text-[#1A5DC8]">{stats.totalAttempts}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
                        <p className="text-sm font-medium text-gray-500 mb-1">Average Score</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.averageScore}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
                        <p className="text-sm font-medium text-gray-500 mb-1">Best Score</p>
                        <p className="text-3xl font-bold text-green-600">{stats.bestScore}</p>
                    </div>
                </div>
            )}

            {/* List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Attempt History</h2>
                
                {attempts.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                        You have not attempted any tests yet.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {attempts.map((attempt) => (
                            <div key={attempt._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                <div className="mb-4 sm:mb-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold text-gray-900">{attempt.testId?.title || 'Unknown Test'}</h3>
                                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${attempt.status === 'SUBMITTED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {attempt.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        Started on {new Date(attempt.startedAt).toLocaleString()}
                                    </p>
                                    {attempt.status === 'SUBMITTED' && (
                                        <p className="text-sm font-medium text-gray-700 mt-1">
                                            Score: {attempt.finalScore}
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    {attempt.status === 'SUBMITTED' && (
                                        <Link
                                            to={`/result?testId=${attempt.testId?._id}&attemptId=${attempt._id}`}
                                            className="px-4 py-2 bg-[#1A5DC8] text-white text-sm font-medium rounded-lg shadow hover:bg-[#0D3E8E] transition"
                                        >
                                            Full Result
                                        </Link>
                                    )}
                                    <button
                                        onClick={() => setSelectedAttemptId(attempt._id)}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
                                    >
                                        Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="mt-6 flex justify-between items-center border-t border-gray-100 pt-6">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* Details Modal */}
            {selectedAttemptId && (
                <AttemptDetailsModal
                    attemptId={selectedAttemptId}
                    onClose={() => setSelectedAttemptId(null)}
                />
            )}
        </div>
    );
}

function AttemptDetailsModal({ attemptId, onClose }: { attemptId: string, onClose: () => void }) {
    const [loading, setLoading] = useState(true);
    const [attempt, setAttempt] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAttempt = async () => {
            try {
                const res = await userAPI.getAttemptById(attemptId);
                if (res.success && res.data) {
                    setAttempt(res.data.attempt);
                }
            } catch (err: any) {
                setError(err.message || 'Failed to load details.');
            } finally {
                setLoading(false);
            }
        };
        fetchAttempt();
    }, [attemptId]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                        <FileText className="w-5 h-5 text-[#1A5DC8]" />
                        Attempt Overview
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
                
                <div className="p-6">
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="w-6 h-6 text-[#1A5DC8] animate-spin" />
                        </div>
                    ) : error ? (
                        <div className="text-red-600 bg-red-50 p-4 rounded-lg text-sm">{error}</div>
                    ) : attempt ? (
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-500">Test Title</p>
                                <p className="font-semibold text-gray-900">{attempt.testId?.title}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Status</p>
                                    <p className="font-medium text-gray-900">{attempt.status}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Final Score</p>
                                    <p className={`font-bold ${attempt.status === 'SUBMITTED' ? 'text-[#1A5DC8]' : 'text-gray-400'}`}>
                                        {attempt.status === 'SUBMITTED' ? attempt.finalScore : 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Started</p>
                                    <p className="text-sm text-gray-900 font-medium">{new Date(attempt.startedAt).toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Submitted</p>
                                    <p className="text-sm text-gray-900 font-medium">
                                        {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleString() : 'Not yet submitted'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
                
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm font-medium transition-colors">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
