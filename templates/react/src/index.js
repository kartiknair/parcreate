import React from 'react'
import ReactDom from 'react-dom'
import './index.css'

const App = () => (
    <main>
        <h1>Hello React + Parcel</h1>
        <p>
            Welcome to your <a href="https://reactjs.org">React</a> project,
            bootstrapped with <a href="https://parceljs.org">Parcel</a>
        </p>
    </main>
)

ReactDom.render(<App />, document.getElementById('root'))
