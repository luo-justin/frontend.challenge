import React, { ReactElement, useEffect, useState } from 'react'

import runEvery from 'lib/runEvery'
import useAccount from 'lib/useAccount'
import AccountContext from 'src/context/accountContext'

import Agenda from './Agenda'

const REAL_TIME_UPDATES_INTERVAL = 10000

const Application = (): ReactElement => {
  const [account, refreshAccount] = useAccount()

  const refreshAccontAttempt = async () => {
    try {
      await refreshAccount()
    } catch (e) {
      // alert('Error refreshing account.')
    }
  }

  useEffect(() => runEvery(REAL_TIME_UPDATES_INTERVAL, refreshAccontAttempt))

  return (
    <AccountContext.Provider value={account}>
      <Agenda />
    </AccountContext.Provider>
  )
}

export default Application
