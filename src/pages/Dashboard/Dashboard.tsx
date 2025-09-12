import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import { GrMoney } from 'react-icons/gr'
import { BiSolidBuildingHouse } from 'react-icons/bi'
import { FaBuildingUser } from 'react-icons/fa6'
import 'react-circular-progressbar/dist/styles.css'
import { revenueByRoom, employeePerfTrend, employeeTable, goldPriceToday } from '../../data/dashboard'

export default function Dashboard() {
  const kpi = 75
  return (
    <div>
      {/* Header */}
      <h1 className='text-3xl font-bold text-gray-800 mb-6'>Manager Dashboard</h1>

      {/* Top summary cards */}
      <div className='grid gap-6 md:grid-cols-3'>
        <div className='rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100'>
          <div className='flex items-center gap-4'>
            <div className='rounded-xl bg-blue-100 p-3'>
              <GrMoney />
            </div>
            <div>
              <p className='text-sm text-slate-500'>Total Revenue</p>
              <p className='text-2xl font-semibold'>$45,000</p>
            </div>
          </div>
        </div>

        <div className='rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100'>
          <div className='flex items-center gap-4'>
            <div className='rounded-xl bg-indigo-100 p-3'>
              <BiSolidBuildingHouse />
            </div>
            <div>
              <p className='text-sm text-slate-500'>Rooms</p>
              <p className='text-2xl font-semibold'>120</p>
            </div>
          </div>
        </div>

        <div className='rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100'>
          <div className='flex items-center gap-4'>
            <div className='rounded-xl bg-emerald-100 p-3'>
              <FaBuildingUser />
            </div>
            <div>
              <p className='text-sm text-slate-500'>Employees</p>
              <p className='text-2xl font-semibold'>25</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className='mt-6 grid gap-6 lg:grid-cols-3'>
        {/* Left column */}
        <div className='space-y-6 lg:col-span-2'>
          <div className='rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100'>
            <h2 className='mb-4 text-sm font-semibold text-slate-700'>Revenue by Room</h2>
            <div className='h-72 w-full'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={revenueByRoom} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray='2 2 ' />
                  <XAxis dataKey='name' />
                  <YAxis tickFormatter={(v) => `$${v / 1000}k`} />
                  <Tooltip formatter={(v) => [`$${v.toLocaleString()}`, 'Revenue']} />
                  <Bar dataKey='revenue' radius={[6, 6, 0, 0]} barSize={30} fill='#ffc200ff' />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className='rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100'>
            <h2 className='mb-4 text-sm font-semibold text-slate-700'>Employee Performance</h2>
            <div className='h-64 w-full'>
              <ResponsiveContainer width='100%' height='100%'>
                <AreaChart data={employeePerfTrend} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id='area' x1='0' y1='0' x2='0' y2='1'>
                      <stop offset='5%' stopColor='#3b82f6' stopOpacity={0.25} />
                      <stop offset='95%' stopColor='#3b82f6' stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='room' />
                  <YAxis />
                  <Tooltip />
                  <Area type='monotone' dataKey='score' fill='url(#area)' stroke='#3b82f6' strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className='space-y-6'>
          <div className='rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100'>
            <h2 className='mb-4 text-sm font-semibold text-slate-700'>Employee Performance</h2>
            <div className='space-y-3'>
              {employeeTable.map((e) => (
                <div key={e.name} className='flex items-center justify-between'>
                  <span className='text-sm'>{e.name}</span>
                  <span className='text-sm font-medium'>${e.amount.toLocaleString()}</span>
                </div>
              ))}

              <div className='mx-auto mt-6 w-40'>
                <CircularProgressbar
                  value={kpi}
                  text={`${kpi}%`}
                  styles={buildStyles({
                    pathColor: '#0ea5e9',
                    trailColor: '#e2e8f0',
                    textColor: '#0f172a',
                    textSize: '16px'
                  })}
                />
                <p className='mt-2 text-center text-xs text-slate-500'>KPI</p>
              </div>
            </div>
          </div>

          <div className='rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100'>
            <h2 className='mb-4 text-sm font-semibold text-slate-700'>Gold Price Today</h2>
            <div className='mb-3 text-3xl font-semibold'>$2,360</div>
            <div className='h-44 w-full'>
              <ResponsiveContainer width='100%' height='100%'>
                <LineChart data={goldPriceToday} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='time' />
                  <YAxis domain={[2280, 2420]} />
                  <Tooltip />
                  <Line type='monotone' dataKey='price' dot={false} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
