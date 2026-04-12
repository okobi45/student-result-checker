import axios from 'axios';

const client = axios.create({
    baseURL: 'http://loalhost:3000',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});


export default client;