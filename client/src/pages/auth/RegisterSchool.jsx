import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { CheckCircle2, GraduationCap } from 'lucide-react'
import { registerSchool } from '../../api/auth.js'
import { getErrorMessage } from '../../api/axios.js'

export default function RegisterSchool() {
  const [submitted, setSubmitted] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm()

  const onSubmit = async (values) => {
    try {
      await registerSchool(values)
      setSubmitted(true)
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="card max-w-md text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={30} />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Request submitted</h2>
          <p className="mt-2 text-sm text-gray-500">
            Your school registration has been received and is pending Super Admin approval. You'll be able to log
            in once it's approved.
          </p>
          <Link to="/login" className="btn-primary mt-5 inline-flex">
            Back to login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-xl">
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-600 text-white">
            <GraduationCap size={26} />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Register your school</h1>
          <p className="mt-1 text-sm text-gray-500">Submit your details for Super Admin approval</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-5">
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">School details</h3>
            <div className="space-y-4">
              <div>
                <label className="label">School name</label>
                <input className="input" {...register('schoolName', { required: 'School name is required' })} />
                {errors.schoolName && <p className="error-text">{errors.schoolName.message}</p>}
              </div>
              <div>
                <label className="label">School address</label>
                <input className="input" {...register('schoolAddress', { required: 'Address is required' })} />
                {errors.schoolAddress && <p className="error-text">{errors.schoolAddress.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">School phone</label>
                  <input className="input" {...register('schoolPhone', { required: 'Phone is required' })} />
                  {errors.schoolPhone && <p className="error-text">{errors.schoolPhone.message}</p>}
                </div>
                <div>
                  <label className="label">School email</label>
                  <input type="email" className="input" {...register('schoolEmail', { required: 'Email is required' })} />
                  {errors.schoolEmail && <p className="error-text">{errors.schoolEmail.message}</p>}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">Admin details</h3>
            <div className="space-y-4">
              <div>
                <label className="label">Admin name</label>
                <input className="input" {...register('adminName', { required: 'Admin name is required' })} />
                {errors.adminName && <p className="error-text">{errors.adminName.message}</p>}
              </div>
              <div>
                <label className="label">Admin email</label>
                <input type="email" className="input" {...register('adminEmail', { required: 'Admin email is required' })} />
                {errors.adminEmail && <p className="error-text">{errors.adminEmail.message}</p>}
              </div>
              <div>
                <label className="label">Admin password</label>
                <input
                  type="password"
                  className="input"
                  {...register('adminPassword', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'At least 6 characters' },
                  })}
                />
                {errors.adminPassword && <p className="error-text">{errors.adminPassword.message}</p>}
              </div>
            </div>
          </div>

          <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting…' : 'Submit registration'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-accent-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
