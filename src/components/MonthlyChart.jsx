import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS } from 'chart.js/auto'

export default function MonthlyChart({ transactions }) {
  const monthlyData = {}
  
  transactions.forEach(t => {
    const month = t.shamsi_date.split('/')[1]
    if (!monthlyData[month]) {
      monthlyData[month] = { sales: 0, loans: 0 }
    }
    
    if (t.type === 'فروش') {
      monthlyData[month].sales += t.amount
    } else {
      monthlyData[month].loans += t.amount
    }
  })

  const labels = Object.keys(monthlyData).sort().map(m => `ماه ${m}`)
  const sales = Object.values(monthlyData).map(d => d.sales)
  const loans = Object.values(monthlyData).map(d => d.loans)

  const data = {
    labels,
    datasets: [
      {
        label: 'فروش',
        data: sales,
        backgroundColor: 'rgba(40, 167, 69, 0.7)',
        borderColor: 'rgba(40, 167, 69, 1)',
        borderWidth: 1
      },
      {
        label: 'قرض',
        data: loans,
        backgroundColor: 'rgba(255, 193, 7, 0.7)',
        borderColor: 'rgba(255, 193, 7, 1)',
        borderWidth: 1
      }
    ]
  }

  const options = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <h5>آمار ماهانه</h5>
      </div>
      <div className="card-body">
        <Bar data={data} options={options} />
      </div>
    </div>
  )
}