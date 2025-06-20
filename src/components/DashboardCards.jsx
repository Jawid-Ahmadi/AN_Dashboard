export default function DashboardCards({ transactions, customers }) {
  const totalSales = transactions
    .filter(t => t.type === 'فروش')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalLoans = transactions
    .filter(t => t.type === 'وام')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalReceipts = transactions
    .filter(t => t.type === 'دریافت')
    .reduce((sum, t) => sum + t.amount, 0)

  const customerDebt = customers.reduce((sum, c) => sum + (c.balance > 0 ? c.balance : 0), 0)

  return (
    <div className="row mt-4">
      <div className="col-md-3">
        <div className="card bg-info text-white">
          <div className="card-body">
            <h5 className="card-title">تعداد مشتریان</h5>
            <h2 className="card-text">{customers.length}</h2>
          </div>
        </div>
      </div>
      <div className="col-md-3">
        <div className="card bg-success text-white">
          <div className="card-body">
            <h5 className="card-title">مجموع فروش</h5>
            <h2 className="card-text">{totalSales.toLocaleString('fa-IR')} افغانی</h2>
          </div>
        </div>
      </div>
      <div className="col-md-3">
        <div className="card bg-warning text-dark">
          <div className="card-body">
            <h5 className="card-title">مجموع وام‌ها</h5>
            <h2 className="card-text">{totalLoans.toLocaleString('fa-IR')} افغانی</h2>
          </div>
        </div>
      </div>
      <div className="col-md-3">
        <div className="card bg-danger text-white">
          <div className="card-body">
            <h5 className="card-title">بدهی مشتریان</h5>
            <h2 className="card-text">{customerDebt.toLocaleString('fa-IR')} افغانی</h2>
          </div>
        </div>
      </div>
    </div>
  )
}