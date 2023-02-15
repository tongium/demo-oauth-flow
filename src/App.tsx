import type { Component } from 'solid-js';
import logo from './logo.svg';
import styles from './App.module.css';
import CryptoJS from 'crypto-js'

const baseURL = import.meta.env.VITE_BASE_URL || "http://localhost:3000"
const authURL = "https://auth-qa.finnomena.com"
const authClientID = "bacon"
const callbackURL = baseURL
const scopes = "openid offline"

const randomString = (length: number) => {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

const loginURL = (): string => {
  const challenge = randomString(43)
  const state = randomString(9)
  localStorage.setItem("auth.challenge", challenge)
  localStorage.setItem("auth.state", state)

  const codeChallenge = CryptoJS.SHA256(challenge).toString(CryptoJS.enc.Base64url)
  return `${authURL}/oauth2/auth?client_id=${authClientID}&redirect_uri=${encodeURIComponent(callbackURL)}&state=${state}&response_type=code&scope=${encodeURIComponent(scopes)}&code_challenge=${codeChallenge}&code_challenge_method=S256`
}

const params = new URLSearchParams(window.location.search)
if (params.has('code')) {
  try {
    const challenge = localStorage.getItem("auth.challenge")

    const data = []
    data.push('code=' + params.get('code'))
    data.push('client_id=' + authClientID)
    data.push('code_verifier=' + challenge)
    data.push('redirect_uri=' + callbackURL)
    data.push('grant_type=' + 'authorization_code')

    const resp = await fetch(`${authURL}/oauth2/token`, {
      method: 'POST',
      body: data.join('&'),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
    })

    const payload = await resp.json()
    localStorage.setItem("auth.access_token", payload.access_token)
    localStorage.setItem("auth.id_token", payload.id_token)
    localStorage.setItem("auth.refresh_token", payload.refresh_token)
    localStorage.setItem("auth.token_type", payload.token_type)
  } catch (err) {
    console.error(err)
  } finally {
    location.href = baseURL
  }
}

let isLogin = false
let userinfo = {
  sub: ""
}

const accessToken = localStorage.getItem("auth.access_token")
if (accessToken) {
  try {
    const tokenType = localStorage.getItem("auth.token_type")
    const resp = await fetch(`${authURL}/userinfo`, {
      method: 'GET',
      headers: {
        'Authorization': `${tokenType} ${accessToken}`,
      },
    })

    if (resp.status < 400) {
      isLogin = true
    }

    userinfo = await resp.json()
  } catch (err) {
    console.error(err)
  }
}

const logout = () => {
  localStorage.removeItem("auth.access_token")
  localStorage.removeItem("auth.id_token")
  localStorage.removeItem("auth.refresh_token")
  localStorage.removeItem("auth.token_type")
  localStorage.removeItem("auth.challenge")
  localStorage.removeItem("auth.state")
  location.href = baseURL
}

const App: Component = () => {
  return (
    <div class={styles.App}>
      {isLogin ? (
        <div>
          <header class={styles.header}>
            You are connected with FINNOMENA
            <div>
              ID: {userinfo.sub}
            </div>
            <div>
              (inspect local storage auth.* to get more infomation)
            </div>
            <div>
              <button onClick={logout}>Disconect</button>
            </div>
          </header>
        </div>
      ) : (
        <div>
          <header class={styles.header}>
            <img src={logo} class={styles.logo} alt="logo" />
            <p>
              Landing Page
            </p>
            <a
              class={styles.link}
              href={loginURL()}
            >
              Connect to FINNOMENA
            </a>
          </header>
        </div>
      )}
    </div >
  );
};

export default App;
