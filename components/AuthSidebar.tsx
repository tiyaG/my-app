export default function AuthSidebar() {
  return (
    <div className="hidden lg:flex w-1/2 bg-pink-600 text-white p-12 flex-col justify-center items-center">
      <div className="max-w-md text-center">
        <h1 className="text-5xl font-bold mb-6 tracking-tight">EmpowerHer Now</h1>
        <p className="text-xl text-pink-100 leading-relaxed">
          Join a community of women rising together. Access your portal, 
          connect with mentors, and grow your future.
        </p>
      </div>
      
      {/* Decorative element or logo placeholder */}
      <div className="mt-12 w-24 h-1 border-t-2 border-pink-300 opacity-50"></div>
    </div>
  );
}