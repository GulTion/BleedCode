import React from 'react';

// Helper function to get color based on count
const getColor = (count) => {
  if (count === 0) return 'bg-gray-700/80'; // Base color for no activity
  if (count <= 2) return 'bg-emerald-800'; // Low activity
  if (count <= 5) return 'bg-emerald-600'; // Medium activity
  if (count <= 8) return 'bg-emerald-500'; // High activity
  return 'bg-emerald-400'; // Very high activity
};

// Helper function to format date for tooltip
const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

const ActivityGraph = ({ data }) => {
  const weeks = [];
  const daysInYear = 365; // Approximate
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - daysInYear);

  // Create a map for quick lookup: 'YYYY-MM-DD' -> count
  const dataMap = new Map();
  data?.forEach(item => {
    // Ensure date is in 'YYYY-MM-DD' format for consistency
    const dateKey = new Date(item.date).toISOString().split('T')[0];
    dataMap.set(dateKey, item.count);
  });

  // Calculate the day of the week for the start date (0=Sun, 6=Sat)
  const startDayOfWeek = startDate.getDay();

  // Calculate the total number of cells needed (including potential padding at the start)
  // We need enough columns to cover 52/53 weeks. Let's aim for 53 columns.
  const totalCells = 53 * 7;
  const daysToDisplay = Array.from({ length: totalCells });

  // Populate the days array with date strings and counts
  for (let i = 0; i < totalCells; i++) {
      const currentDate = new Date(startDate);
      // Adjust day based on the starting offset and current index
      currentDate.setDate(startDate.getDate() - startDayOfWeek + i);

      // Only consider dates within the rough one-year window ending today
      if (currentDate <= today) {
          const dateKey = currentDate.toISOString().split('T')[0];
          const count = dataMap.get(dateKey) || 0;
          daysToDisplay[i] = { date: dateKey, count };
      } else {
           daysToDisplay[i] = null; // Days in the future or excess padding
      }
  }


  // Group days into weeks (columns)
  for (let i = 0; i < 53; i++) { // 53 columns for weeks
    weeks.push(daysToDisplay.slice(i * 7, (i + 1) * 7));
  }

  // Month Labels (Approximate placement)
  const monthLabels = [
    { name: 'Apr', week: 0 }, // Adjust these based on actual start month if needed
    { name: 'May', week: 4 },
    { name: 'Jun', week: 8 },
    { name: 'Jul', week: 13 },
    { name: 'Aug', week: 17 },
    { name: 'Sep', week: 22 },
    { name: 'Oct', week: 26 },
    { name: 'Nov', week: 30 },
    { name: 'Dec', week: 35 },
    { name: 'Jan', week: 39 },
    { name: 'Feb', week: 44 },
    { name: 'Mar', week: 48 },
  ];


  return (
    <div className="bg-gray-800/60 p-4 sm:p-6 rounded-lg shadow-md overflow-x-auto">
        {/* Month Labels */}
       <div className="flex mb-2 text-xs text-gray-400" style={{ paddingLeft: '2.5rem' /* Align with grid */ }}>
         {monthLabels.map((month, index) => (
           <div
             key={month.name}
             className="w-full text-center"
             style={{ minWidth: `${4 * 0.875}rem` /* Approx 4 weeks * square width + gap */ }} // Adjust spacing dynamically if needed
           >
             {month.name}
           </div>
         ))}
       </div>

        <div className="flex space-x-1">
            {/* Day Labels */}
            <div className="flex flex-col justify-between text-xs text-gray-400 pr-2 pt-1 pb-1" style={{height: `${7*0.875 + 6*0.25}rem` /* 7 squares high + 6 gaps */}}>
                 <span>Mon</span>
                 <span>Wed</span>
                 <span>Fri</span>
            </div>

            {/* Grid */}
            <div className="grid grid-flow-col" style={{ gridTemplateRows: 'repeat(7, minmax(0, 1fr))', gap: '3px' }}>
             {weeks.map((week, weekIndex) => (
                <div key={`week-${weekIndex}`} className="grid grid-rows-7" style={{ gap: '3px' }}>
                    {week.map((day, dayIndex) => {
                        const key = `day-${weekIndex}-${dayIndex}`;
                        if (!day) {
                             // Render an empty placeholder if day is null (future/padding)
                             return <div key={key} className="w-3 h-3 sm:w-3.5 sm:h-3.5 bg-gray-800/50 rounded-sm"></div>;
                        }
                        const color = getColor(day.count);
                        const tooltip = `${day.count} contributions on ${formatDate(day.date)}`;
                        return (
                            <div
                                key={key}
                                className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${color} rounded-sm cursor-default`}
                                title={tooltip} // Simple tooltip on hover
                            ></div>
                        );
                    })}
                </div>
            ))}
            </div>
        </div>

         {/* Legend */}
         <div className="flex justify-end items-center mt-3 space-x-2 text-xs text-gray-400">
             <span>Less</span>
             <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 bg-gray-700/80 rounded-sm"></div>
             <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 bg-emerald-800 rounded-sm"></div>
             <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 bg-emerald-600 rounded-sm"></div>
             <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 bg-emerald-500 rounded-sm"></div>
             <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 bg-emerald-400 rounded-sm"></div>
             <span>More</span>
         </div>
    </div>
  );
};

export default ActivityGraph;