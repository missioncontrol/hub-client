import React, { PureComponent } from 'react'
import Link from 'next/link'
import Router from 'next/router'
import { Head, Button } from '../components'
import { post, get } from 'axios'

const isClientSide = typeof window !== 'undefined'

export default class About extends PureComponent {

  static async getInitialProps() {
    const d = new Date()
    const n = d.getDate()
    const year = d.getFullYear()
    let dates = []

    for (var i = 0; i < 5; i++) {
      dates.push(year + '-' + (d.getMonth() + 1) + '-' + (n + i))
    }

    const times = [6, 8, 10]
    
    const apiHost = process.env.API_HOST || 'http://localhost:3000'
    const username = process.env.HUB_USER || ''
    const password = process.env.HUB_PASSWORD || ''

    const reqOpts = isClientSide ? { withCredentials: true } : { auth: { username, password } }

    return {
      apiHost,
      username,
      password,
      reqOpts,
      times,
      dates
    }
  }

  constructor () {
    super()

    this.state = {
      dates: null,
      times: null
    }
  }

  componentDidMount () {
    const { apiHost, reqOpts } = this.props
    // we need the packages if we come directly to /schedule
    get(apiHost + '/doorman/packages', reqOpts)
  }

  saveDate = ({ target }) => {
    const { value } = target

    this.setState(() => {
      return {
        date: value
      }
    })
  }

  saveTime = ({ target }) => {
    const { value } = target

    this.setState(() => {
      return {
        time: value
      }
    })
  }

  submit = () => {
    const { apiHost, reqOpts } = this.props
    let { time, date } = this.state

    time = time ? time : this.props.times[0]
    date = date ? date : this.props.dates[0]

    const reqData = Object.assign({}, {data: {time, date}}, reqOpts)
    console.log(reqData)

    return post(apiHost + '/doorman/schedule', reqData)
      .then(res => Router.push({pathname: '/finish', query: { error: false }}))
      .catch(err => {
        console.log(err.response.data)
        Router.push({pathname: '/finish', query: { error: true, message: err.response.data }})
      })

  }

  render () {
    const { times, dates } = this.props

    return (
      <div className='container'>
        <Head title='Schedule' />

        <div className='hero'>
          <div className='title'>Schedule</div>

          <select onChange={this.saveDate}>
            {
              dates.map((v, index) => <option key={index} value={v}>{v}</option>)
            }
          </select>

          <br />

          <select onChange={this.saveTime}>
            {
              times.map((v, index) => <option key={index} value={v}>{`${v}pm - ${v + 2}pm`}</option>)
            }
          </select>

          <br />

          <div onClick={this.submit}>
            <Button />
          </div>
        </div>

        <style jsx>{`
          .container {
            height: 100%;
            width: 100%;
          }

          .hero {
            width: 100%;
            color: #333;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
          }

          .title {
            width: 100%;
            padding: 1rem 0;
            font-weight: 600;
            line-height: 1.15;
            font-size: 2.8rem;
            text-align: center;
          }

          .title, .description {
            text-align: center;
          }

          select {
            font-size: 1.6rem;
            width: 15rem;
            cursor: pointer;
            height: 4rem;
          }
        `}</style>
      </div>
    )
  }
}
