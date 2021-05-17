import React, { useEffect, useRef, useState } from 'react';
import './App.css';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/analytics';

import {BrowserRouter, Switch, Route, useParams, Link, Redirect} from 'react-router-dom';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import useLocalStorage from './hooks/useLocaStorage';

import socket from './services/socket';
import aes256 from 'aes256';


firebase.initializeApp({
  apiKey: "AIzaSyDlZ3lau-4mVu9upxehozUC7bNIs83GNmI",
  authDomain: "acschat-ea681.firebaseapp.com",
  projectId: "acschat-ea681",
  storageBucket: "acschat-ea681.appspot.com",
  messagingSenderId: "544409209642",
  appId: "1:544409209642:web:6214a15348169c9956ac53",
  measurementId: "G-51WN41WWXZ"
})

const auth = firebase.auth();
const firestore = firebase.firestore();
const analytics = firebase.analytics();
var aesKey;
var cipher = aes256.createCipher('This is default key');


function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>Chat with us💬</h1>
        <SignOut />
      </header>

      <section>
        {user ? <BrowserRouter>
                  <Switch>
                    <Route path='/:dbname'>
                      <ChatRoom />
                    </Route>

                    <Route path='/'>
                      <RoomSelect />
                    </Route>
                  </Switch>
                </BrowserRouter>
                : <SignIn />}
      </section>

    </div>
  );
}

function SignIn() {

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  


  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
      <p>Click here to generate key</p>
      
    </>
  )
}



function SignOut() {
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function RoomSelect() {
  return <Redirect to={auth.currentUser.email} />

  const [room,setRoom] = useState("");
  return (
    <div>
      <h3>
      Enter Room ID {auth.currentUser.email}
      </h3>
      <form>
        <input value={room} onChange={(e) => setRoom(e.target.value)} />

        <Link to={"/"+room}>
          <button className>
            Join room
          </button>
        </Link>
      </form>
    </div>
  )
}


function ChatRoom() {
  const dummy = useRef();

  const {dbname} = useParams();
  const messagesRef = firestore.collection(dbname);
  const query = messagesRef.orderBy('createdAt');
  const [messages] = useCollectionData(query, { idField: 'id' });
  const [formValue, setFormValue] = useState('');

  const [KEY, setKEY] = useLocalStorage("KEY")

  useEffect(() => {
    if(!KEY)
    {
      setKEY(Math.random());
    }
    // USE THE KEY HERE
    console.log(KEY);
  }, [KEY])

  useEffect(() => {
    console.log('useEffect()')
    socket.on("getKey", data => {
      console.log(data);
      aesKey = data;
    });
  },[]);


  const sendMessage = async (e) => {
    e.preventDefault();
    /*if(messages.length == 0) 
    {
      usersRef.add({
        email: auth.currentUser.email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        name: auth.currentUser.name
      })
    }*/

    const { uid, photoURL } = auth.currentUser;
    if(messages.length == 0) 
    {
      await firestore.collection("_users").doc(auth.currentUser.email).set({
        email: auth.currentUser.email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        status: "https://lh3.googleusercontent.com/ZqtOV3QlnuiYt-xaV1hmIgM6iseu_3HIQ1bLfhAYvuyS9UedF0Gs0hFeJq_dbkxLxVjUv6FcYt6pR2W-kTu-iucLF3GyRFKM-_ZLc5H5EI7-x3YL-6A5V8MgNbrU13fO45e_MLCKF76W7AL_pdjSIU-YERA7QflRZKcRBg2XhOET5SGwqlqNUlm1NkeuFpDw_E4JbbS8SlfehjxlAT1euN9VlK313KF85cMU04um7zKxIOgOxAMCI2JtU-CK70ac9IYIKcUxgTSCSI1Xxu_j_11tohIFf7rUqqotHqT56AvklcWXiQJdZW9OYM2_W_3wwcdbutPH3j6xsSTIBz9PHg132lN06HYbl9qqc15bzKJaqPpg4zt_hHNSI-lwjjhmYMZftC85rQpaPbI5eTL7YCxNwKrBZCM1d9mcF0n8L3F9KRuXv8JbZRq03meZM7ddgnWZ8vDwwcn9mqUJ2VGmstcCcIuekSK6QL7WC3NFmrZyPPj1S3vhUKTA1cBDrLwRcg3LQrTOlyKA9LYZLVYTG1XJzAkVRPzzSixs60AUmuzbYe7QSf6dgVceRs1AOlDXi9KL3whd0GMFYfJbwBqotrRhcRC4QeyGALTLYxsfgyoOXLgP62UM-nx5PlPX6xwDQfSOset1QPmvMI9h9uWCrg7dkeaeunPsVOpEV1v8DJfQ5zrAyl0-GCqJk9NqMq1blp53L1JXtkgeYX57y0QO1qqa=s500-no?authuser=1",
        photoURL: auth.currentUser.photoURL
      })
    }

    await messagesRef.add({
      uname: auth.currentUser.displayName,
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  if (dbname != auth.currentUser.email)
  {
    return <Redirect to={auth.currentUser.email} />
  }

  return (<>
    <main>

      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

      <span ref={dummy}></span>

    </main>

    <form onSubmit={sendMessage}>

      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Type message here" />

      <button type="submit" disabled={!formValue}>➤ Send</button>

    </form>
  </>)
}


function ChatMessage(props) {
  const { uname, text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (<>

    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://photos.app.goo.gl/mJHTe74MuLibh4Po6'} />
        <div className={'usernamedisplay'}>
          <p className={'unam'}>{uname}</p>
          <p>{text}</p>
        </div>
    </div>
  </>)
}


export default App;
