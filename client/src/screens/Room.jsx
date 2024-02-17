import { useEffect, useCallback, useState } from "react";
import ReactPlayer from "react-player";
import peer from "../service/peer";
import { useSocket } from "../context/SocketProvider";

export const Room = () => {

    const socket = useSocket();
    const [remoteSocketId, setRemoteSocketId] = useState(null);
    const [myStream, setMyStream] = useState();
    const [remoteStream, setRemoteStream] = useState();

    const handleJoined = useCallback(({ email, id }) => {
        console.log(`User Joined`, email, id);
        setRemoteSocketId(id);
    }, []);




    const handleCall = useCallback(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
        });
        const offer = await peer.getOffer();
        socket.emit("user:call", { to: remoteSocketId, offer });
        setMyStream(stream);
        console.log(`Calling`, remoteSocketId, offer);
    }, [remoteSocketId, socket]);


    const handleIncommingCall = useCallback(
        async ({ from, offer }) => {
            setRemoteSocketId(from);
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: true,
            });
            setMyStream(stream);
            console.log(`Incoming Call`, from, offer);
            const ans = await peer.getAnswer(offer);
            socket.emit("call:accepted", { to: from, ans });
        },
        [socket]
    );


    const sendStreams = useCallback(() => {
        const senders = peer.peer.getSenders();

        myStream.getTracks().forEach(track => {
            const existingSender = senders.find(sender => sender.track === track);
            if (existingSender) {
                existingSender.replaceTrack(track);
            } else {
                peer.peer.addTrack(track, myStream);
            }
        });
    }, [myStream]);


    const handleCallAccepted = useCallback(({ from, ans }) => {
        peer.setLocalDescription(ans);
        console.log("Call Accepted!");
        sendStreams();
    },
        [sendStreams]
    );

    const handleNegoNeeded = useCallback(async () => {
        const offer = await peer.getOffer();
        socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
    }, [remoteSocketId, socket]);

    useEffect(() => {
        peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
        return () => {
            peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
        };
    }, [handleNegoNeeded]);

    const handleNegoNeedIncomming = useCallback(
        async ({ from, offer }) => {
            const ans = await peer.getAnswer(offer);
            socket.emit("peer:nego:done", { to: from, ans });
        },
        [socket]
    );

    const handleNegoNeedFinal = useCallback(async ({ ans }) => {
        await peer.setLocalDescription(ans);
    }, []);



    useEffect(() => {
        peer.peer.addEventListener('track', async ev => {
            const remoteStream = ev.streams;
            console.log(remoteStream[0]);
            setRemoteStream(remoteStream[0]);
        });
    }, []);



    useEffect(() => {
        socket.on('user:joined', handleJoined);
        socket.on("incoming:call", handleIncommingCall);
        socket.on("call:accepted", handleCallAccepted)
        socket.on("peer:nego:needed", handleNegoNeedIncomming);
        socket.on("peer:nego:final", handleNegoNeedFinal);

        return () => {
            socket.off('user:joined', handleJoined);
            socket.off("incoming:call", handleIncommingCall);
            socket.off("call:accepted", handleCallAccepted)
            socket.off("peer:nego:needed", handleNegoNeedIncomming);
            socket.off("peer:nego:final", handleNegoNeedFinal);
        };
    }, [socket, handleJoined, handleIncommingCall, handleCallAccepted, handleNegoNeedIncomming, handleNegoNeedFinal]);


    return (


        <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="p-8 bg-gray-100 rounded shadow-md w-full max-w-xl">
                <h1 className="text-4xl mb-4">Room</h1>
                <h4 className="text-lg mb-4">
                    {remoteSocketId ? "Connected" : "No one in the room"}
                </h4>
                {myStream && (
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-2"
                        onClick={sendStreams}
                    >
                        Send Stream
                    </button>
                )}
                {remoteSocketId && (
                    <button
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-4"
                        onClick={handleCall}
                    >
                        Call
                    </button>
                )}

                {myStream && (
                    <div className="mb-4">
                        <h1 className="text-xl mb-2">My Stream</h1>
                        <ReactPlayer
                            playing
                            muted
                            height="300px"
                            width="300px"
                            url={myStream}
                        />
                    </div>
                )}

                {remoteStream && (
                    <div className="mb-4">
                        <h1 className="text-xl mb-2">Remote Stream</h1>
                        <ReactPlayer
                            playing
                            muted
                            height="200px"
                            width="200px"
                            url={remoteStream}
                        />
                    </div>
                )}
            </div>
        </div>

    );
}