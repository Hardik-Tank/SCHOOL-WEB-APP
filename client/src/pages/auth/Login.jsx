import { useForm } from 'react-hook-form'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { GraduationCap } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { getErrorMessage } from '../../api/axios.js'

const roleHome = {
  super_admin: '/super-admin',
  school_admin: '/school-admin',
  teacher: '/teacher',
  student: '/student',
}

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm()

  const onSubmit = async (values) => {
    try {
      const user = await login(values.email, values.password)
      const from = location.state?.from || roleHome[user.role] || '/'
      navigate(from, { replace: true })
      toast.success(`Welcome back, ${user.name}`)
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-600 text-white">
            <GraduationCap size={26} />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">School ERP</h1>
          <p className="mt-1 text-sm text-gray-500">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4">
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              placeholder="you@school.com"
              {...register('email', { required: 'Email is required' })}
            />
            {errors.email && <p className="error-text">{errors.email.message}</p>}
          </div>
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              className="input"
              placeholder="••••••••"
              {...register('password', { required: 'Password is required' })}
            />
            {errors.password && <p className="error-text">{errors.password.message}</p>}
          </div>
          <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          Registering a new school?{' '}
          <Link to="/register-school" className="font-medium text-accent-600 hover:underline">
            Request access
          </Link>
        </p>
      </div>
    </div>
  )
}
