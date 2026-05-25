import {useEffect, useState } from 'react';

export default function Home() {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {loadRooms();}, []); // load room list when page is first loaded 

  async function loadRooms() {
    const response = await fetch('http://localhost:8080/rooms', {credentials: 'include'});
    const data = await response.json();
    setRooms(data);
  }

  async function createRoom() {
    const response = await fetch('http://localhost:8080/create-room',{ method: 'POST', credentials: 'include'});

    const data = await response.json();
    window.location.href = '/room/' + data.roomId;
  }

  return (
    <div>
      <h1>Chatrooms</h1>

      <button onClick={createRoom}>  Create Room </button>
      <br /> <br />

      {
        rooms.map((room) => (
            <div    className="room"  key={room.roomId}
                    onClick={() => { window.location.href = '/room/' + room.roomId;}}>
            {room.roomId}
            </div>

        ))
      }

    </div>
  );
}
