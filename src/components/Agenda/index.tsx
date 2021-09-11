import React, {
  ReactElement,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { DateTime } from 'luxon'
import greeting from 'lib/greeting'
import Calendar from 'src/models/Calendar'
import Event from 'src/models/Event'
import AccountContext from 'src/context/accountContext'
import List from './List'
import EventCell from './EventCell'
import style from './style.scss'
import runEvery from 'lib/runEvery'

type AgendaItem = {
  calendar: Calendar
  event: Event
}

const compareByDateTime = (a: AgendaItem, b: AgendaItem) =>
  a.event.date.diff(b.event.date).valueOf()

/**
 * Agenda component
 * Displays greeting (depending on time of day)
 * and list of calendar events
 */

const Agenda = (): ReactElement => {
  const account = useContext(AccountContext)
  const [hour, setHour] = useState(DateTime.local().second)
  const [selected, setSelected] = useState('all')
  // This function is triggered when the select changes
  const selectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value
    setSelected(value)
  }

  useEffect(
    () =>
      runEvery(1000, () => {
        setHour(DateTime.local().second)
      }),
    [],
  )
  const filterByCalendar = useMemo(
    () => (calendars: Calendar[]) => {
      if (selected === 'all') return calendars
      return calendars.filter((item) => selected == item.id)
    },
    [selected],
  )
  const events: AgendaItem[] = useMemo(
    () =>
      filterByCalendar(account.calendars)
        .flatMap((calendar) =>
          calendar.events.map((event) => ({ calendar, event })),
        )
        .sort(compareByDateTime),
    [account.calendars, filterByCalendar],
  )

  const title = useMemo(() => greeting(hour), [hour])

  return (
    <div className={style.outer}>
      <div className={style.container}>
        <div className={style.header}>
          <span className={style.title}>{title}</span>
          <div className={style.container}>
            <select onChange={selectChange} className={style.select}>
              <option key="all">all</option>
              {account.calendars.map((item: Calendar) => {
                return <option key={item.id}>{item.id}</option>
              })}
            </select>
          </div>
        </div>

        <List>
          {events.map(({ calendar, event }) => (
            <EventCell key={event.id} calendar={calendar} event={event} />
          ))}
        </List>
      </div>
    </div>
  )
}

export default Agenda
