import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="py-12 text-center">
      <h1 className="text-2xl font-bold">404</h1>
      <Link to="/" className="text-blue-600 underline">
        Home
      </Link>
    </div>
  )
}
