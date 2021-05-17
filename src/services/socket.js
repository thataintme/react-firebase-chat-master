
import io from "socket.io-client";
//import config from '../config'

const ENDPOINT = "http://localhost:2000";
const socket = io(ENDPOINT);

export default socket