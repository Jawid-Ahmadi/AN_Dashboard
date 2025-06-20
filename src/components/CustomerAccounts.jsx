import { useState } from 'react'
import { Button, Modal } from 'react-bootstrap'

export default function CustomerAccounts({ customers, onEdit, onDelete }) {
  console.log(customers)
  const [showIdModal, setShowIdModal] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleShowIdModal = (customer) => {
    setSelectedCustomer(customer)
    setShowIdModal(true)
  }

  const handleCloseIdModal = () => {
    setShowIdModal(false)
    setSelectedCustomer(null)
  }

  const handleResetPassword = async () => {
    if (!selectedCustomer) return
    
    setLoading(true)
    setMessage('')
    
    try {
      // بازنشانی رمز عبور به شناسه منحصر به فرد
      const { error } = await supabase.auth.admin.updateUserById(
        selectedCustomer.auth_id, // نیاز به ذخیره auth_id در جدول customers دارید
        { password: selectedCustomer.uniqe_id }
      )

      if (error) throw error
      
      setMessage('رمز عبور با موفقیت بازنشانی شد')
    } catch (error) {
      console.error('Error resetting password:', error)
      setMessage(`خطا در بازنشانی رمز عبور: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setMessage('شناسه کپی شد')
    setTimeout(() => setMessage(''), 2000)
  }

  return (
    <>
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5>حساب مشتریان</h5>
          <div>
            <small className="text-muted">
              تعداد مشتریان: {customers.length}
            </small>
          </div>
        </div>
        <div className="card-body">
          {message && (
            <div className={`alert ${message.includes('خطا') ? 'alert-danger' : 'alert-success'}`}>
              {message}
            </div>
          )}

          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>#</th>
                  <th>شناسه منحصر به فرد</th>
                  <th>نام مشتری</th>
                  <th>تلفن</th>
                  <th>موجودی</th>
                  <th>جزئیات</th>
                  <th>عملیات</th>
                </tr>
              </thead>
              <tbody>
                {customers.length > 0 ? (
                  customers.map((customer, index) => (
                    <tr key={customer.id}>
                      <td>{index + 1}</td>
                      <td>
                        <code>{customer.unique_id}</code>
                        <button
                          className="btn btn-sm btn-outline-secondary me-2"
                          onClick={() => copyToClipboard(customer.uniqe_id)}
                          title="کپی شناسه"
                        >
                          <i className="bi bi-clipboard">کپی شناسه</i>
                        </button>
                      </td>
                      <td>{customer.name}</td>
                      <td>{customer.phone || '-'}</td>
                      <td className={customer.balance > 0 ? 'text-danger' : 'text-success'}>
                        {Math.abs(customer.balance).toLocaleString('fa-IR')} افغانی
                        {customer.balance > 0 ? ' (قرض دار)' : ' (قرض بار)'}
                      </td>
                      <td>{customer.details || '-'}</td>
                      <td>
                        <div className="d-flex">
                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => onEdit(customer)}
                            title="ویرایش"
                          >
                            <i className="bi bi-pencil">ویرایش</i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger me-2"
                            onClick={() => onDelete(customer.id)}
                            title="حذف"
                          >
                            <i className="bi bi-trash">حذف</i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-warning me-2"
                            onClick={() => handleShowIdModal(customer)}
                            title="مدیریت شناسه"
                          >
                            <i className="bi bi-key">مدیریت شناسه</i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center">
                      مشتری یافت نشد
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* مودال مدیریت شناسه */}
      <Modal show={showIdModal} onHide={handleCloseIdModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>مدیریت شناسه مشتری</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCustomer && (
            <div>
              <div className="mb-3">
                <h6>مشتری: {selectedCustomer.name}</h6>
                <p>تلفن: {selectedCustomer.phone || 'ندارد'}</p>
              </div>

              <div className="input-group mb-3">
                <input
                  type="text"
                  className="form-control"
                  value={selectedCustomer.unique_id}
                  readOnly
                  disabled
                />
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => copyToClipboard(selectedCustomer.uniqe_id)}
                >
                  کپی شناسه
                </button>
              </div>

              <div className="alert alert-info">
                <p>
                  <strong>راهنمای ورود مشتری:</strong><br />
                  شناسه: <code>{selectedCustomer.uniqe_id}</code><br />
                  رمز عبور اولیه: همان شناسه می‌باشد
                </p>
              </div>

              {message && (
                <div className={`alert ${message.includes('خطا') ? 'alert-danger' : 'alert-success'}`}>
                  {message}
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseIdModal}>
            بستن
          </Button>
          <Button 
            variant="warning" 
            onClick={handleResetPassword}
            disabled={loading}
          >
            {loading ? 'در حال پردازش...' : 'بازنشانی رمز عبور'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}