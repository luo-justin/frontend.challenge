import React, {
  ReactElement,
  useContext,
  useEffect,
  useMemo,
  useState,
  MouseEvent,
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
import DeptGroup from './DeptGroup'

type AgendaItem = {
  calendar: Calendar
  event: Event
}

type DeptObj = {
  [key: string]: AgendaItem[]
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
  const [hour, setHour] = useState(DateTime.local().hour)
  const [selected, setSelected] = useState('all')
  const [departmentToggled, setDepartmentToggled] = useState(false)

  const selectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value
    setSelected(value)
  }

  useEffect(
    () =>
      runEvery(1000, () => {
        setHour(DateTime.local().hour)
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

  const renderCalendarFilters = () => {
    return [
      account.calendars.map((item: Calendar) => {
        return <option key={item.id}>{item.id}</option>
      }),
    ]
  }

  const renderList = () => {
    return (
      <List>
        {events.map(({ calendar, event }) => (
          <EventCell key={event.id} calendar={calendar} event={event} />
        ))}
      </List>
    )
  }

  const renderDepartmentView = () => {
    const deptObj: DeptObj = {}
    events.map((item) => {
      const department = item.event.department
      if (!department || department === undefined) {
        deptObj['Default']
          ? deptObj['Default'].push(item)
          : (deptObj['Default'] = [item])
      } else {
        deptObj[department]
          ? deptObj[department].push(item)
          : (deptObj[department] = [item])
      }
    })

    const noDepartmentArray = events.filter(
      (item) => item.event.department === undefined,
    )
    const deptsArray = []
    for (const dept in deptObj) {
      if (dept === 'Default') {
        deptsArray.push(
          <DeptGroup events={noDepartmentArray} dept={'No Department'} />,
        )
        continue
      }
      const deptEvents = events.filter((item) => item.event.department === dept)
      deptsArray.push(<DeptGroup events={deptEvents} dept={dept} />)
    }

    return deptsArray
  }

  const toggleDepartment = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setDepartmentToggled(!departmentToggled)
  }

  const title = useMemo(() => greeting(hour), [hour])
  return (
    <div className={style.outer}>
      <div className={style.container}>
        <div className={style.header}>
          <span className={style.title}>{title}</span>
          <div className={style.container}>
            <select onChange={selectChange} className={style.select}>
              <option key="all">all</option>
              {account && account.calendars && renderCalendarFilters()}
            </select>
            <button
              className={style.toggleButton}
              type="button"
              onClick={toggleDepartment}
            >
              {departmentToggled ? 'Toggle by Department' : 'View All'}
            </button>
          </div>
        </div>
        {departmentToggled ? renderList() : renderDepartmentView()}
      </div>
    </div>
  )
}

export default Agenda
