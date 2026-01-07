import { useEffect, useState } from 'react';

export  function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [typedText, setTypedText] = useState('');
  const [progress, setProgress] = useState(0);

  const loadingText = "Loading Gaurav's Universe...";

  useEffect(() => {
    let index = 0;

    const typingInterval = setInterval(() => {
      index++;
      setTypedText(loadingText.slice(0, index));
      setProgress(Math.round((index / loadingText.length) * 100));

      if (index === loadingText.length) {
        clearInterval(typingInterval);
        setTimeout(() => setIsLoading(false), 500); // optional small delay
      }
    }, 120); // typing speed

    return () => clearInterval(typingInterval);
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-hidden">
      
      {/* Background Blurred Text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <h1 className="text-[90px] font-black text-blue-500/10 blur-xl animate-pulse">
          GAURAV
        </h1>
      </div>

      <div className="text-center relative z-10">

        {/* Spinning Rings */}
        <div className="relative w-44 h-44 mx-auto mb-6">
          <div className="absolute inset-0 border-8 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <div
            className="absolute inset-4 border-8 border-blue-600 border-t-transparent rounded-full animate-spin"
            style={{ animationDirection: "reverse", animationDuration: "1.2s" }}
          ></div>
          <img
            src="pdf/photo.jpeg"   // <-- Change to your image path
            alt="Loading"
            className="absolute inset-0 w-28 h-28 m-auto rounded-full object-cover shadow-xl"
          />
        </div>

        {/* Typing Effect Text with subtle glow */}
        <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-3 tracking-wide relative inline-block">
          <span className="relative drop-shadow-[0_0_10px_white]">
            {typedText}
          </span>
          <span className="animate-pulse">|</span>
        </p>

        {/* Progress Percentage aligned with typing */}
        <h2 className="text-3xl font-extrabold text-white mt-2">{progress}%</h2>

        {/* Bouncing Dots */}
        <div className="flex gap-2 justify-center mt-4">
          <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>

      </div>
    </div>
  );
}
