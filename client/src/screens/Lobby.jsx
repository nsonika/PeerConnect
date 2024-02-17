import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketProvider';

export const Lobby = () => {
    const [email, setEmail] = useState('');
    const [room, setRoom] = useState('');

    const socket = useSocket();
    const navigate = useNavigate();

    console.log(socket);

    const handleSubmit = useCallback(
        (e) => {
            e.preventDefault();
            // console.log({ email, room });
            socket.emit('room:joined', { email, room });
        },
        [email, room, socket]
    );

    const handleJoin = useCallback((data) => {
        const { email, room } = data;
        navigate(`/room/${room}`);
    }, [navigate]);

    useEffect(() => {

        socket.on('room:joined', handleJoin);
        return () => {
            socket.off('room:joined', handleJoin);
        };
    }, [socket, handleJoin]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="p-8 bg-gray-100 rounded shadow-md w-full max-w-md">
                <h1 className="text-4xl mb-4">Lobby</h1>
                <div className="form">
                    <form onSubmit={handleSubmit} className="mb-4">
                        <label className="block mb-2">
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-2 border rounded"
                            />
                        </label>
                        <label className="block mb-2">
                            <input
                                type="text"
                                name="room"
                                placeholder="Room"
                                value={room}
                                onChange={(e) => setRoom(e.target.value)}
                                className="w-full p-2 border rounded"
                            />
                        </label>
                        <input
                            type="submit"
                            value="Join"
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer"
                        />
                    </form>
                </div>
            </div>
        </div>

    );
};
