import { useState, useEffect } from 'react'
import { Modal, Form, Button } from 'react-bootstrap'

export default function CustomerModal({ show, onHide, customer, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    details: '',
    unique_id: ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // تابع تولید شناسه منحصر به فرد
  const generateUniqueId = () => {
    const timestamp = Date.now().toString().slice(-4)
    const randomNum = Math.floor(1000 + Math.random() * 9000)
    return `CUST-${timestamp}-${randomNum}`
  }

  useEffect(() => {
    if (customer) {
      // حالت ویرایش مشتری موجود
      setFormData({
        name: customer.name,
        phone: customer.phone || '',
        details: customer.details || '',
        unique_id: customer.unique_id || ''
      })
    } else {
      // حالت ایجاد مشتری جدید
      setFormData({
        name: '',
        phone: '',
        details: '',
        unique_id: generateUniqueId() // تولید خودکار شناسه
      })
    }
  }, [customer])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // اعتبارسنجی ساده
    if (!formData.name.trim()) {
      setError('نام مشتری الزامی است')
      setLoading(false)
      return
    }

    try {
      await onSave(formData)
      onHide()
    } catch (err) {
      setError('خطا در ذخیره مشتری')
      console.error('Error saving customer:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{customer ? 'ویرایش مشتری' : 'مشتری جدید'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <div className="alert alert-danger">{error}</div>}

          <Form.Group className="mb-3">
            <Form.Label>نام مشتری *</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>شماره تلفن</Form.Label>
            <Form.Control
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>شناسه منحصر به فرد</Form.Label>
            <Form.Control
              type="text"
              name="unique_id"
              value={formData.unique_id}
              onChange={handleChange}
              readOnly={!!customer} // غیرقابل ویرایش در حالت ویرایش
              required
            />
            {!customer && (
              <Form.Text className="text-muted">
                این شناسه به صورت خودکار تولید شده است
              </Form.Text>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>جزئیات اضافی</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="details"
              value={formData.details}
              onChange={handleChange}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            انصراف
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'در حال ذخیره...' : 'ذخیره'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}