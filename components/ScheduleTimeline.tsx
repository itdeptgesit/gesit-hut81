import clsx from "clsx";

const schedules = [
  {
    date: "11",
    month: "AGU",
    dayName: "Selasa",
    title: "Babak Kualifikasi",
    subtitle: "Badminton Tournament",
    detail: "2 Lapangan · 17.00–18.00",
    color: "navy",
  },
  {
    date: "12",
    month: "AGU",
    dayName: "Rabu",
    title: "Babak Kualifikasi",
    subtitle: "Badminton Tournament",
    detail: "1 Lapangan · 17.00–18.00",
    color: "navy",
  },
  {
    date: "13",
    month: "AGU",
    dayName: "Kamis",
    title: "Grand Final",
    subtitle: "Badminton Tournament",
    detail: "3 Final · 17.00–19.00",
    color: "navy",
  },
  {
    date: "19",
    month: "AGU",
    dayName: "Rabu",
    title: "Puncak Acara",
    subtitle: "Fun Games Day",
    detail: "Yel-Yel · Costume · Potluck",
    color: "red",
  },
];

export default function ScheduleTimeline() {
  return (
    <div className="w-full">
      {/* Desktop Horizontal Timeline */}
      <div className="hidden md:flex flex-row justify-between relative pt-8 pb-4">
        {/* Connector line */}
        <div className="absolute top-[44px] left-[5%] right-[5%] h-0.5 bg-border -z-10" />

        {schedules.map((item, idx) => (
          <div key={idx} className="flex flex-col items-center flex-1 relative px-2">
            {/* Date bubble */}
            <div
              className={clsx(
                "w-11 h-11 rounded-full flex flex-col items-center justify-center text-white font-bold shadow-md mb-6 shrink-0",
                item.color === "red"
                  ? "bg-primary shadow-primary/30"
                  : "bg-navy shadow-navy/30"
              )}
            >
              <span className="text-base leading-none">{item.date}</span>
            </div>

            <div className="text-center">
              <span className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-0.5">
                {item.dayName}, {item.month} 2026
              </span>
              <h4
                className={clsx(
                  "font-heading font-bold text-lg mb-0.5",
                  item.color === "red" ? "text-primary" : "text-navy"
                )}
              >
                {item.title}
              </h4>
              <p className="text-sm text-muted">{item.subtitle}</p>
              <p className="text-[11px] text-muted/60 mt-1 font-medium">{item.detail}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Vertical Timeline */}
      <div className="md:hidden flex flex-col gap-5 relative ml-5 border-l-2 border-border pl-8 py-2">
        {schedules.map((item, idx) => (
          <div key={idx} className="relative">
            {/* Bubble */}
            <div
              className={clsx(
                "absolute -left-[49px] top-3 w-9 h-9 rounded-full flex items-center justify-center text-white font-bold shadow-md text-sm",
                item.color === "red"
                  ? "bg-primary shadow-primary/30"
                  : "bg-navy shadow-navy/30"
              )}
            >
              {item.date}
            </div>

            <div className="bg-white p-5 rounded-2xl border border-border shadow-sm">
              <span className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-1">
                {item.dayName}, {item.date} {item.month} 2026
              </span>
              <h4
                className={clsx(
                  "font-heading font-bold text-lg mb-0.5",
                  item.color === "red" ? "text-primary" : "text-navy"
                )}
              >
                {item.title}
              </h4>
              <p className="text-sm text-muted">{item.subtitle}</p>
              <p className="text-xs text-muted/60 mt-1 font-medium">{item.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
