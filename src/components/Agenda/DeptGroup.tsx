import React from 'react'
import EventCell from './EventCell'
import Event from 'src/models/Event'
import Calendar from 'src/models/Calendar'
import List from './List'
import style from './style.scss'

type AgendaItem = {
  calendar: Calendar
  event: Event
}
type departmentEventObj = {
  events: AgendaItem[]
  dept: string
}

const DeptGroup = ({ events, dept }: departmentEventObj) => {
  return (
    <div>
      <div className={style.deptCard}>
        <h4 className={style.deptHeader}>{dept}</h4>
        <hr className={style.divider} />
        <List>
          {events.map(({ calendar, event }) => (
            <EventCell key={event.id} calendar={calendar} event={event} />
          ))}
        </List>
      </div>
    </div>
  )
}
export default DeptGroup
