import { useState, useEffect } from 'react'
import { Modal, Form, Button } from 'react-bootstrap'

export default function TransactionModal({ show, onHide, transaction, customers, onSave }) {
  const [formData, setFormData] = useState({
    type: 'فروش',
    amount: '',
    description: '',
    shamsi_date: '',
    customer_id: '',
    telegram_username: ''
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (transaction) {
      setFormData({
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description || '',
        shamsi_date: transaction.shamsi_date || new Date(transaction.created_at).toLocaleDateString('fa-IR'),
        customer_id: transaction.customer_id || '',
        telegram_username: transaction.telegram_username || ''
      })
    } else {
      setFormData({
        type: 'فروش',
        amount: '',
        description: '',
        shamsi_date: new Date().toLocaleDateString('fa-IR'),
        customer_id: '',
        telegram_username: ''
      })
    }
    setErrors({})
  }, [transaction])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.amount || isNaN(formData.amount)) {
      newErrors.amount = 'مبلغ معتبر وارد کنید'
    }
    
    if ((formData.type === 'وام' || formData.type === 'دریافت') && !formData.customer_id) {
      newErrors.customer_id = 'انتخاب مشتری الزامی است'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    const dataToSave = {
      ...formData,
      amount: parseFloat(formData.amount),
      customer_id: formData.customer_id ? parseInt(formData.customer_id) : null
    }

    if (transaction) {
      dataToSave.id = transaction.id
    }

    onSave(dataToSave)
  }

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{transaction ? 'ویرایش تراکنش' : 'تراکنش جدید'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>نوع تراکنش</Form.Label>
            <Form.Select 
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="فروش">فروش</option>
              <option value="وام">وام</option>
              <option value="دریافت">دریافت</option>
              <option value="خرید">خرید</option>
              <option value="مصرف">مصرف</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>مبلغ (افغانی)</Form.Label>
            <Form.Control
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              isInvalid={!!errors.amount}
              required
            />
            <Form.Control.Feedback type="invalid">
              {errors.amount}
            </Form.Control.Feedback>
          </Form.Group>

          {(formData.type === 'وام' || formData.type === 'دریافت') && (
            <Form.Group className="mb-3">
              <Form.Label>مشتری</Form.Label>
              <Form.Select
                name="customer_id"
                value={formData.customer_id}
                onChange={handleChange}
                isInvalid={!!errors.customer_id}
                required
              >
                <option value="">انتخاب مشتری</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} ({customer.phone || 'بدون تلفن'})
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors.customer_id}
              </Form.Control.Feedback>
            </Form.Group>
          )}

          <Form.Group className="mb-3">
            <Form.Label>توضیحات</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>تاریخ (شمسی)</Form.Label>
            <Form.Control
              type="text"
              name="shamsi_date"
              value={formData.shamsi_date}
              onChange={handleChange}
              placeholder="مثال: 1402/05/15"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>نام کاربری تلگرام (اختیاری)</Form.Label>
            <Form.Control
              type="text"
              name="telegram_username"
              value={formData.telegram_username}
              onChange={handleChange}
              placeholder="مثال: username"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            انصراف
          </Button>
          <Button variant="primary" type="submit">
            ذخیره
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}