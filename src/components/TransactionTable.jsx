export default function TransactionTable({
  transactions,
  onEdit,
  onDelete
}) {
  const getBadgeClass = (type) => {
    switch(type) {
      case 'فروش': return 'bg-success'
      case 'وام': return 'bg-warning text-dark'
      case 'دریافت': return 'bg-primary'
      case 'خرید': return 'bg-info text-dark'
      case 'مصرف': return 'bg-danger'
      default: return 'bg-secondary'
    }
  }

  return (
    <div className="card">
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>شناسه</th>
                <th>نوع</th>
                <th>مبلغ</th>
                <th>توضیحات</th>
                <th>تاریخ</th>
                <th>کاربر</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? (
                transactions.map(transaction => (
                  <tr key={transaction.id}>
                    <td>{transaction.id}</td>
                    <td>
                      <span className={`badge ${getBadgeClass(transaction.type)}`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td>{transaction.amount.toLocaleString('fa-IR')} افغانی</td>
                    <td>{transaction.description || '-'}</td>
                    <td>{transaction.shamsi_date || new Date(transaction.created_at).toLocaleDateString('fa-IR')}</td>
                    <td>{transaction.telegram_username || 'ندارد'}</td>
                    <td>
                      <button 
                        className="btn btn-sm btn-outline-primary mb-1 ms-2"
                        onClick={() => onEdit(transaction)}
                      >
                        ویرایش
                      </button>
                      <button 
                        className="btn btn-sm btn-outline-danger mb-1"
                        onClick={() => onDelete(transaction.id, transaction.type)}
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">تراکنشی یافت نشد</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}