import { useNavigate } from "react-router-dom";

export function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/alerts");
  };

  return (
    <div className="flex h-screen w-full font-sans overflow-hidden">

      <div className="hidden md:flex w-1/2 items-center justify-center bg-white p-10">
        <div className="flex flex-col items-center">
          <div className="h-[30vw] w-[30vw] max-w-[500px] max-h-[500px] rounded-full 
                        bg-blue-500 shadow-2xl flex items-center justify-center transition-all duration-500">
          </div>
        </div>
      </div>

      <div className="flex w-full md:w-1/2 items-start justify-start bg-blue-500 pt-[15vh] px-6 md:pl-19">
        
        <div className="w-full max-w-[738px]">
          <h1 className="mb-7 text-4xl md:text-5xl lg:text-5xl font-semibold text-white tracking-tight">
            Login
          </h1>
          
          <form onSubmit={handleLogin} className="space-y-9">

            <div className="flex flex-col">
              <label className="block text-xl md:text-xl font-semibold text-white mb-3">
                Username:
              </label>
              <input
                required
                type="text"
                className="w-full md:h-12 rounded-xl p-4 shadow-xl focus:ring-2 
                focus:ring-blue-300 outline-none text-gray-800 bg-white transition-all"
              />
            </div>

            <div className="flex flex-col">
              <label className="block text-xl md:text-xl font-semibold text-white mb-3">
                Password:
              </label>
              <input
                required
                type="password"
                className="w-full md:h-12 rounded-xl p-4 shadow-xl focus:ring-2 
                focus:ring-blue-300 outline-none text-gray-800 bg-white transition-all text-lg"
              />
            </div>
            <button
              type="submit"
              className="w-full md:h-12 rounded-xl bg-lime-200 font-bold
            text-gray-800 shadow-lg text-xl mt-5 hover:bg-lime-300 transition-colors"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;