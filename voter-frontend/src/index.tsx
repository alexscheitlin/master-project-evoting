import { library } from '@fortawesome/fontawesome-svg-core'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { faClipboard, faCube, faFileContract, faFileInvoice } from '@fortawesome/free-solid-svg-icons'
import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import './index.css'

library.add(fab, faFileContract, faCube, faFileInvoice, faClipboard)

ReactDOM.render(<App />, document.getElementById('root'))
