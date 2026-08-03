export default function AccessDenied() {
  return (
    <div className="flex justify-center items-center w-full min-h-screen">
      <div className="text-center">
        <p className="text-base font-semibold text-red-600">403</p>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-balance text-gray-900 sm:text-7xl">
          Access Denied
        </h1>
        <p className="mt-6 text-xl font-medium text-pretty text-gray-500 sm:text-xl/8">
          You don’t have permission to view this page.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <a
            href="/"
            className="rounded-md bg-button-primary px-3.5 py-2.5 text-lg font-semibold text-white shadow-xs hover:bg-button-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Go back home
          </a>
          <a href="/support" className="text-lg font-semibold text-gray-900">
            Contact support <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </div>
    </div>
  );
}
