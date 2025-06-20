import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@supabase/supabase-js'
import DashboardCards from './components/DashboardCards'
import MonthlyChart from './components/MonthlyChart'
import TransactionTypeChart from './components/TransactionTypeChart'
import TransactionTable from './components/TransactionTable'
import CustomerAccounts from './components/CustomerAccounts'
import TransactionModal from './components/TransactionModal'
import CustomerModal from './components/CustomerModal'

const SUPABASE_URL = "https://urfpnpllldxyfkknvtto.supabase.co"
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZnBucGxsbGR4eWZra252dHRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5ODQ1MTksImV4cCI6MjA2NTU2MDUxOX0.09Frqu3wmbWFDnMnrwnCvHsK4DKW4SADvGg89sDxPw0"

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

function App() {
  const [transactions, setTransactions] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [customerSearchTerm, setCustomerSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('today')
  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [currentTransaction, setCurrentTransaction] = useState(null)
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [currentCustomer, setCurrentCustomer] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load customers with their balance
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select(`*, loans:loans(amount), receipts:receipts(amount)`)
        .order('created_at', { ascending: false })

      if (customersError) throw customersError

      // Calculate balance for each customer
      const customersWithBalance = customers.map(customer => {
        const totalLoans = customer.loans?.reduce((sum, loan) => sum + (loan.amount || 0), 0) || 0
        const totalReceipts = customer.receipts?.reduce((sum, receipt) => sum + (receipt.amount || 0), 0) || 0
        return {
          ...customer,
          balance: totalLoans - totalReceipts
        }
      })

      // Load all transactions in parallel
      const [
        { data: sales, error: salesError },
        { data: loans, error: loansError },
        { data: receipts, error: receiptsError },
        { data: purchases, error: purchasesError },
        { data: expenses, error: expensesError }
      ] = await Promise.all([
        supabase.from('sales').select('*').order('created_at', { ascending: false }),
        supabase.from('loans').select('*').order('created_at', { ascending: false }),
        supabase.from('receipts').select('*').order('created_at', { ascending: false }),
        supabase.from('purchases').select('*').order('created_at', { ascending: false }),
        supabase.from('expenses').select('*').order('created_at', { ascending: false })
      ])

      if (salesError || loansError || receiptsError || purchasesError || expensesError) {
        throw new Error('Error loading transactions')
      }

      // Combine all transactions with customer info
      const allTransactions = [
        ...sales.map(t => ({ ...t, type: 'فروش', customer_id: null })),
        ...loans.map(t => ({ ...t, type: 'وام', customer_id: t.customer_id })),
        ...receipts.map(t => ({ ...t, type: 'دریافت', customer_id: t.customer_id })),
        ...purchases.map(t => ({ ...t, type: 'خرید', customer_id: null })),
        ...expenses.map(t => ({ ...t, type: 'مصرف', customer_id: null }))
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

      setTransactions(allTransactions)
      setCustomers(customersWithBalance)
    } catch (error) {
      console.error('Error loading data:', error)
      alert('خطا در بارگذاری داده‌ها')
    } finally {
      setLoading(false)
    }
  }

  const getShamsiDate = () => {
    const today = new Date()
    const options = { year: 'numeric', month: 'long', day: 'numeric' }
    return today.toLocaleDateString('fa-IR', options)
  }

  const getTodayTransactions = () => {
    const today = new Date().toISOString().split('T')[0]
    return transactions.filter(t => {
      const transactionDate = new Date(t.created_at).toISOString().split('T')[0]
      return transactionDate === today
    })
  }

  const filteredTransactions = useMemo(() => {
    let filtered = activeTab === 'today' ? getTodayTransactions() : [...transactions]
    
    return filtered.filter(t => 
      t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.telegram_username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.amount.toString().includes(searchTerm))
  }, [transactions, searchTerm, activeTab])

  const filteredCustomers = useMemo(() => {
    return customers.filter(customer =>
      customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
      customer.phone?.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
      customer.id.toString().includes(customerSearchTerm)
    )
  }, [customers, customerSearchTerm])

  const handleAddTransaction = () => {
    setCurrentTransaction(null)
    setShowTransactionModal(true)
  }

  const handleEditTransaction = (transaction) => {
    setCurrentTransaction(transaction)
    setShowTransactionModal(true)
  }

  const handleDeleteTransaction = async (id, type) => {
    if (!window.confirm('آیا از حذف این تراکنش مطمئن هستید؟')) return

    try {
      let tableName = ''
      
      switch(type) {
        case 'فروش': tableName = 'sales'; break
        case 'وام': tableName = 'loans'; break
        case 'دریافت': tableName = 'receipts'; break
        case 'خرید': tableName = 'purchases'; break
        case 'مصرف': tableName = 'expenses'; break
        default: throw new Error('نوع تراکنش نامعتبر')
      }
      
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      loadData()
    } catch (error) {
      console.error('Error deleting transaction:', error)
      alert('خطا در حذف تراکنش')
    }
  }

  const handleSaveTransaction = async (transactionData) => {
  try {
    let tableName = '';
    let dataToSave = { ...transactionData };
    
    // حذف فیلدهای اضافی که ممکن است باعث خطا شوند
    delete dataToSave.type;
    delete dataToSave.id;

    switch(transactionData.type) {
      case 'فروش': tableName = 'sales'; break;
      case 'وام': 
        tableName = 'loans'; 
        // تبدیل customer_id به عدد
        dataToSave.customer_id = parseInt(dataToSave.customer_id);
        break;
      case 'دریافت': 
        tableName = 'receipts'; 
        dataToSave.customer_id = parseInt(dataToSave.customer_id);
        break;
      case 'خرید': tableName = 'purchases'; break;
      case 'مصرف': tableName = 'expenses'; break;
      default: throw new Error('نوع تراکنش نامعتبر');
    }
    
    if (!dataToSave.customer_id) {
      delete dataToSave.customer_id;
    }
    
    if (transactionData.id) {
      const { error } = await supabase
        .from(tableName)
        .update(dataToSave)
        .eq('id', transactionData.id);
      
      if (error) throw error;
    } else {
      dataToSave.created_at = new Date().toISOString();
      const { error } = await supabase
        .from(tableName)
        .insert([dataToSave]);
      
      if (error) throw error;
    }
    
    loadData();
    setShowTransactionModal(false);
  } catch (error) {
    console.error('Error saving transaction:', error);
    alert(`خطا در ذخیره تراکنش: ${error.message}`);
  }
};

  const handleAddCustomer = () => {
    setCurrentCustomer(null)
    setShowCustomerModal(true)
  }

  const handleEditCustomer = (customer) => {
    setCurrentCustomer(customer)
    setShowCustomerModal(true)
  }

  const handleDeleteCustomer = async (id) => {
    if (!window.confirm('آیا از حذف این مشتری مطمئن هستید؟ تمام تراکنش‌های مرتبط نیز حذف خواهند شد.')) return

    try {
      await supabase
        .from('loans')
        .delete()
        .eq('customer_id', id)
      
      await supabase
        .from('receipts')
        .delete()
        .eq('customer_id', id)
      
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      loadData()
    } catch (error) {
      console.error('Error deleting customer:', error)
      alert('خطا در حذف مشتری')
    }
  }
  const handleSaveCustomer = async (customerData) => {
  try {
    if (customerData.id) {
      // ویرایش مشتری موجود
      const { error } = await supabase
        .from('customers')
        .update(customerData)
        .eq('id', customerData.id)
      
      if (error) throw error
    } else {
      // ایجاد مشتری جدید
      customerData.created_at = new Date().toISOString()
      
      const { error } = await supabase
        .from('customers')
        .insert([customerData])
      
      if (error) throw error
    }
    
    loadData()
    setShowCustomerModal(false)
  } catch (error) {
    console.error('Error saving customer:', error)
    alert('خطا در ذخیره مشتری')
  }
}

  if (loading) {
    return <div className="text-center py-5">در حال بارگذاری...</div>
  }

  return (
    <div className="container-fluid" dir="rtl">
      <nav className="navbar navbar-dark bg-primary">
        <div className="container-fluid">
          <span className="navbar-brand mb-0 h1">
            <i className="bi bi-graph-up"></i> سیستم مدیریت مالی
          </span>
          <div className="text-white">{getShamsiDate()}</div>
        </div>
      </nav>

      <ul className="nav nav-tabs mt-3">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'today' ? 'active' : ''}`}
            onClick={() => setActiveTab('today')}
          >
            تراکنش‌های امروز
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            تمام تراکنش‌ها
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'customers' ? 'active' : ''}`}
            onClick={() => setActiveTab('customers')}
          >
            حساب مشتریان
          </button>
        </li>
      </ul>

      {activeTab === 'customers' ? (
        <div className="mt-4">
          <div className="card mb-3">
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="جستجوی مشتریان (نام، تلفن یا شناسه)"
                    value={customerSearchTerm}
                    onChange={(e) => setCustomerSearchTerm(e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <button 
                    className="btn btn-primary float-start"
                    onClick={handleAddCustomer}
                  >
                    <i className="bi bi-plus"></i> مشتری جدید
                  </button>
                </div>
              </div>
            </div>
          </div>
          <CustomerAccounts 
            customers={filteredCustomers} 
            onEdit={handleEditCustomer}
            onDelete={handleDeleteCustomer}
          />
        </div>
      ) : (
        <>
          <DashboardCards transactions={transactions} customers={customers} />
          
          <div className="row mt-4">
            <div className="col-md-6">
              <MonthlyChart transactions={activeTab === 'today' ? getTodayTransactions() : transactions} />
            </div>
            <div className="col-md-6">
              <TransactionTypeChart transactions={activeTab === 'today' ? getTodayTransactions() : transactions} />
            </div>
          </div>

          <div className="row mt-4">
            <div className="col-12">
              <div className="card mb-3">
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-4">
                      <button 
                        className="btn btn-primary"
                        onClick={handleAddTransaction}
                      >
                        <i className="bi bi-plus"></i> تراکنش جدید
                      </button>
                    </div>
                    <div className="col-md-8">
                      <label className="form-label">جستجو</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="جستجو..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <TransactionTable 
                transactions={filteredTransactions}
                onEdit={handleEditTransaction}
                onDelete={(id, type) => handleDeleteTransaction(id, type)}
              />
            </div>
          </div>
        </>
      )}

      <TransactionModal
        show={showTransactionModal}
        onHide={() => setShowTransactionModal(false)}
        transaction={currentTransaction}
        customers={customers}
        onSave={handleSaveTransaction}
      />

      <CustomerModal
        show={showCustomerModal}
        onHide={() => setShowCustomerModal(false)}
        customer={currentCustomer}
        onSave={handleSaveCustomer}
      />
    </div>
  )
}

export default App