export default function XPProgressBar({ totalXP }) {
    const level = Math.floor(totalXP / 100) + 1;
    const xpIntoLevel = totalXP % 100;
    const progress = (xpIntoLevel / 100) * 100;
  
    return (
      <div className="w-full max-w-md mx-auto">
        <p className="text-yellow-800 font-bold mb-1 text-center">
          Nivel {level} – {xpIntoLevel}/100 XP
        </p>
        <div className="w-full bg-gray-300 rounded-2xl h-6 shadow-inner">
          <div
            className="bg-yellow-500 h-6 rounded-2xl transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    );
  }
  