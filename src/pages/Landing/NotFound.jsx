export default function NotFound() {
  return (
    <div className="flex justify-center items-center w-full min-h-screen">
      <div className="text-center">
        <p className="text-6xl font-semibold text-red-600">404</p>
        <h1 className="mt-4 text-text-xxl2 font-semibold tracking-tight text-balance text-gray-900 sm:text-text-xxl2">
          Page not found
        </h1>
        <p className="mt-6 text-text-xxl2 font-medium text-pretty text-gray-500 sm:text-xl/8">
          Sorry, we couldn’t find the page you’re looking for.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <a
            href="/"
            className="rounded-md bg-button-primary px-3.5 py-2.5 text-base font-semibold text-white shadow-xs hover:bg-button-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Go back home
          </a>
          <a href="/support" className="text-base font-semibold text-gray-900">
            Contact support <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </div>
    </div>
  );
}
