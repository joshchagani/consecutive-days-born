import React, { useState, useEffect } from "react";
import moment from "moment";

import "./App.css";

function App() {
  const [timeZonesApi, setTimeZonesApi] = useState([]);
  const [userSelectedTimeZone, setUserSelectedTimeZone] = useState("");
  const [userDay, setUserDay] = useState("");
  const [userMonth, setUserMonth] = useState("");
  const [userYear, setUserYear] = useState("");
  const [userTime, setUserTime] = useState("");
  const [born, setBorn] = useState([""]);

  const allTimeZones = [
    "-12:00",
    "-11:00",
    "-10:00",
    "-09:30",
    "-09:00",
    "-08:00",
    "-07:00",
    "-06:00",
    "-05:00",
    "-04:00",
    "-03:30",
    "-03:00",
    "-02:00",
    "-01:00",
    "+00:00",
    "+01:00",
    "+02:00",
    "+03:00",
    "+03:30",
    "+04:00",
    "+04:30",
    "+05:00",
    "+05:30",
    "+05:45",
    "+06:00",
    "+06:30",
    "+07:00",
    "+08:00",
    "+08:45",
    "+09:00",
    "+09:30",
    "+10:00",
    "+10:30",
    "+11:00",
    "+12:00",
    "+12:45",
    "+13:00",
    "+14:00"
  ];

  useEffect(() => {
    const fetchTimeZones = async () => {
      try {
        const fetchData = await fetch("http://worldtimeapi.org/api/timezone");
        const jsonData = await fetchData.json();
        setTimeZonesApi(jsonData);
      } catch (err) {}
    };
    fetchTimeZones();
  }, []);

  useEffect(() => {
    setUserSelectedTimeZone(timeZonesApi[0]);
  }, [timeZonesApi]);

  const getUtcOffset = async () => {
    try {
      const fetchData = await fetch(
        `http://worldtimeapi.org/api/timezone/${userSelectedTimeZone}`
      );
      return await fetchData.json();
    } catch (err) {}
  };

  const parseHours = obj => {
    const numberWithoutSign = obj.substring(1);
    const [hours, minutes] = numberWithoutSign.split(":");
    return {
      minutes,
      hours
    };
  };

  const timeCalculator = (t1, t2) => {
    const t1Obj = parseHours(t1);
    const t2Obj = parseHours(t2);
    const t1Minutes = parseInt(t1Obj.hours) * 60 + parseInt(t1Obj.minutes);
    const t2Minutes = parseInt(t2Obj.hours) * 60 + parseInt(t2Obj.minutes);
    return Math.abs(t1Minutes - t2Minutes);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const utc = await getUtcOffset();

    const formatDate = `${userYear}-${userMonth}-${userDay}T${userTime}${utc.utc_offset}`;
    const startDate = moment(formatDate)
      .utc()
      .valueOf();
    console.log("startDate", startDate);
    const epoch = [];
    let x;

    allTimeZones.forEach((zone, i) => {
      if (utc.utc_offset === zone) {
        x = i;
      }
    });

    for (let i = 0; i < x; i++) {
      const subtract = timeCalculator(allTimeZones[i], utc.utc_offset);
      epoch.push(
        moment(startDate)
          .subtract(moment.duration(subtract, "minutes"))
          .format("LL")
      );
    }
    for (let i = x + 1; i < allTimeZones.length; i++) {
      const add = timeCalculator(utc.utc_offset, allTimeZones[i]);
      epoch.push(
        moment(startDate)
          .add(moment.duration(add, "minutes"))
          .format("LL")
      );
    }

    const datesBorn = epoch.map(ep => {
      console.log(ep);
      return ep;
    });

    const dateSet = new Set([...datesBorn]);

    setBorn(Array.from(dateSet));
  };

  return (
    <div className="App">
      <br />
      <input
        type="text"
        id="day"
        placeholder="Day (19)"
        value={userDay}
        onChange={e => {
          setUserDay(e.target.value);
        }}
      />
      <input
        type="text"
        id="month"
        placeholder="Month (06)"
        value={userMonth}
        onChange={e => {
          setUserMonth(e.target.value);
        }}
      />
      <input
        type="text"
        id="year"
        placeholder="Year (1978)"
        value={userYear}
        onChange={e => {
          setUserYear(e.target.value);
        }}
      />
      <input
        type="text"
        id="time"
        placeholder="Time (24/hr clock)"
        value={userTime}
        onChange={e => {
          setUserTime(e.target.value);
        }}
      />
      <select
        onChange={e => {
          setUserSelectedTimeZone(e.target.value);
        }}
      >
        {timeZonesApi.map((zone, i) => (
          <option value={zone} key={i}>
            {zone}
          </option>
        ))}
      </select>
      <button id="submit" onClick={handleSubmit}>
        Submit
      </button>
      <div>
        <br />
        In the whole world, you were consecutively born on these days:
        <span id="days">
          {born.map((day, i) => (
            <p key={i}>{day}</p>
          ))}
        </span>
      </div>
    </div>
  );
}

export default App;
