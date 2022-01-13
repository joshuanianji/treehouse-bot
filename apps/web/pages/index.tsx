import Head from 'next/head'

export default function Home() {
    return (
        <div className="w-full min-h-screen flex flex-col space-y-8 justify-center items-center h-screen" >
            <h1 className="text-4xl font-extrabold">Poopoo Bot Home</h1>
            <img src="squat.png" className="w-1/5 h-auto" alt="Omniman Squat" />
        </div >
    )
}
