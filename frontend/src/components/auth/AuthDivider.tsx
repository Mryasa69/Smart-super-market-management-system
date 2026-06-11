export function AuthDivider() {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-gray-200" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-white px-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Or continue with
        </span>
      </div>
    </div>
  );
}
