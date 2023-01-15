import { useEffect, useState } from "react";

export function CountDownTimer({deadline, className = "flex justify-center"} : {deadline: Date, className: string})
{
//   const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  function getTime () 
  {
    const time = deadline.getTime() - Date.now();

    // setDays(Math.floor(time / (1000 * 60 * 60 * 24)));
    setHours(Math.floor((time / (1000 * 60 * 60)) % 24));
    setMinutes(Math.floor((time / 1000 / 60) % 60));
    setSeconds(Math.floor((time / 1000) % 60));
  };

  useEffect(() => {
    const interval = setInterval(() => getTime(), 1000);

    return () => clearInterval(interval);
  }, [deadline]);

  return (
    <div className={className}>
        <p>{hours < 10 ? "0" + hours : hours}</p>
        <span>:</span>
    	<p>{minutes < 10 ? "0" + minutes : minutes}</p>
        <span>:</span>
        <p>{seconds < 10 ? "0" + seconds : seconds}</p>
    </div>
  );
};