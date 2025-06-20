import { Pie } from 'react-chartjs-2'
import { Chart as ChartJS } from 'chart.js/auto'

export default function TransactionTypeChart({ transactions }) {
  const sales = transactions.filter(t => t.type === 'فروش').length
  const loans = transactions.filter(t => t.type === 'وام').length
  const receipts = transactions.filter(t => t.type === 'دریافت').length
  const purchases = transactions.filter(t => t.type === 'خرید').length
  const expenses = transactions.filter(t => t.type === 'مصرف').length

  const data = {
    labels: ['فروش', 'وام', 'دریافت', 'خرید', 'مصرف'],
    datasets: [{
      data: [sales, loans, receipts, purchases, expenses],
      backgroundColor: [
        'rgba(40, 167, 69, 0.7)',
        'rgba(255, 193, 7, 0.7)',
        'rgba(13, 110, 253, 0.7)',
        'rgba(111, 66, 193, 0.7)',
        'rgba(220, 53, 69, 0.7)'
      ],
      borderColor: [
        'rgba(40, 167, 69, 1)',
        'rgba(255, 193, 7, 1)',
        'rgba(13, 110, 253, 1)',
        'rgba(111, 66, 193, 1)',
        'rgba(220, 53, 69, 1)'
      ],
      borderWidth: 1
    }]
  }

  const options = {
    responsive: true
  }

  return (
    <div className="card">
      <div className="card-header">
        <h5>نوع تراکنش‌ها</h5>
      </div>
      <div className="card-body">
        <Pie data={data} options={options} />
      </div>
    </div>
  )
}