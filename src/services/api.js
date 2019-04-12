import axios from 'axios';

const api = axios.create({
  baseURL: 'https://rocketbox-back.herokuapp.com'
});

export default api;