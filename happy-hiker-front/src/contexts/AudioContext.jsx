// useRef = a way to create a mutable reference that persists for the life of the component -
// survives re-renders - updating does not cause a re-render
// how used here audioRef holds an instance of an HTMLAudioElement. 
// You can then update properties on this object (like src or volume) without affecting the component's rendering process
import React, { createContext, useState, useRef, useEffect } from "react";

// have to call the create context to create our audio context
export const AudioContext = createContext()

export const AudioProvider = ({ children }) => {
    // AudioProvider creates a context for managing audio playback throughout the app.
    // We create a reference to the audio element using useRef.
    // The 'new Audio()' call is a built-in browser constructor that creates an HTMLAudioElement, 
    // much like using 'new Image()' to create an image element. 
    // useRef stores this element in a mutable object (audioRef) that persists across re-renders without triggering them.
    const audioRef = useRef(new Audio())    

    //state for tracking whether audio is playing
    const [isPlaying, setIsPlaying] = useState(false)

    //state to check for stored volume or set it 
    const [volume, setVolume] = useState(() => {
        const savedVolume = localStorage.getItem("audioVolume")
        return savedVolume ? Number(savedVolume) : 50
    })

    //Hard-coded list of audio URLS saved in our S3 cloud instance
    const audioList = [
        "https://happyhiker-audio.s3.us-east-2.amazonaws.com/Breathe+in+confidence%2C+exhale+doubt.mp3",
        "https://happyhiker-audio.s3.us-east-2.amazonaws.com/Check+in+with+yourself.+How+does+your+body+feel++What%E2%80%99s+your+energy+level.mp3",
        "https://happyhiker-audio.s3.us-east-2.amazonaws.com/Count+how+many+different+sounds+you+hear.mp3",
        "https://happyhiker-audio.s3.us-east-2.amazonaws.com/Every+step+forward+is+an+accomplishment.+Celebrate+your+progress.mp3",
        "https://happyhiker-audio.s3.us-east-2.amazonaws.com/Find+five+different+shades+of+green.mp3",
        "https://happyhiker-audio.s3.us-east-2.amazonaws.com/Focus+on+a+single+leaf+or+flower.+What+tiny+details+stand+out.mp3",
        "https://happyhiker-audio.s3.us-east-2.amazonaws.com/How+is+your+self-talk+right+now+Are+you+being+kind+to+yourself.mp3",
        "https://happyhiker-audio.s3.us-east-2.amazonaws.com/How%E2%80%99s+your+pace+Are+you+rushing%2C+or+are+you+enjoying+the+journey.mp3",
        "https://happyhiker-audio.s3.us-east-2.amazonaws.com/If+the+trail+gets+tough%2C+slow+down+and+enjoy+the+moment.+There's+no+rush.mp3",
        "https://happyhiker-audio.s3.us-east-2.amazonaws.com/Look+around+you.+Nature+is+always+changing%2C+just+like+life.+Embrace+the+journey.mp3",
        "https://happyhiker-audio.s3.us-east-2.amazonaws.com/Look+at+the+sunlight.+How+does+it+filter+through+the+trees++What+patterns+does+it+create.mp3",
        "https://happyhiker-audio.s3.us-east-2.amazonaws.com/Look+for+something+heart-shaped+in+nature.+A+leaf%2C+a+rock%2C+or+a+cloud.mp3",
        "https://happyhiker-audio.s3.us-east-2.amazonaws.com/Look+up!+What+patterns+do+you+see+in+the+trees+or+sky.mp3",
        "https://happyhiker-audio.s3.us-east-2.amazonaws.com/Name+one+thing+you%E2%80%99re+grateful+for+right+now.+Big+or+small.mp3",
        "https://happyhiker-audio.s3.us-east-2.amazonaws.com/Notice+and+name+5+colors+you+see.mp3",
        "https://happyhiker-audio.s3.us-east-2.amazonaws.com/Notice+something+small.+A+tiny+insect%2C+a+dewdrop%2C+or+a+hidden+mushroom.mp3",
        "https://happyhiker-audio.s3.us-east-2.amazonaws.com/Notice+the+textures+around+you.+The+roughness+of+bark%2C+the+smoothness+of+a+rock%2C+or+the+softness+of+moss.mp3",
        "https://happyhiker-audio.s3.us-east-2.amazonaws.com/Notice+your+thoughts.+Are+they+rushing++Are+they+calm++Let+them+come+and+go+like+clouds.mp3",
        "https://happyhiker-audio.s3.us-east-2.amazonaws.com/Observe+your+breath.+Is+it+deep+or+shallow++Fast+or+slow++Take+a+moment+to+slow+it+down.mp3",
        "https://happyhiker-audio.s3.us-east-2.amazonaws.com/Pause+here.+Take+a+deep+breath+and+notice+the+sounds+around+you.mp3",
        "https://happyhiker-audio.s3.us-east-2.amazonaws.com/Smile%2C+even+if+no+one+is+around.+Notice+how+it+makes+you+feel.mp3",
        "https://happyhiker-audio.s3.us-east-2.amazonaws.com/Stand+still+for+a+moment.+Feel+the+earth+beneath+your+feet.+You+are+grounded+and+supported.mp3",
        "https://happyhiker-audio.s3.us-east-2.amazonaws.com/Stop+and+close+your+eyes+for+10+seconds.+What+sensations+do+you+feel++The+warmth+of+the+sun++A+cool+breeze.mp3",
        "https://happyhiker-audio.s3.us-east-2.amazonaws.com/Take+a+deep+breath+and+exhale+slowly.+Let+go+of+any+tension+as+you+breathe+out.mp3",
        "https://happyhiker-audio.s3.us-east-2.amazonaws.com/Take+a+moment+to+stretch+and+notice+how+your+body+feels.mp3",
        "https://happyhiker-audio.s3.us-east-2.amazonaws.com/Touch+the+earth.+Pick+up+a+rock%2C+feel+the+soil%2C+or+let+water+run+through+your+fingers.mp3",
        "https://happyhiker-audio.s3.us-east-2.amazonaws.com/Watch+how+the+wind+moves.+Notice+the+sway+of+trees%2C+the+ripples+on+a+lake%2C+or+the+way+grass+bends.mp3",
        "https://happyhiker-audio.s3.us-east-2.amazonaws.com/Take+a+deep+breath.+What+scents+are+in+the+air++Can+you+smell+pine%2C+earth%2C+or+fresh+rain.mp3",
        "https://happyhiker-audio.s3.us-east-2.amazonaws.com/What%E2%80%99s+your+pace++Are+you+moving+quickly+or+slowly++Try+matching+your+pace+to+your+breath.mp3",
        "https://happyhiker-audio.s3.us-east-2.amazonaws.com/You%E2%80%99ve+already+come+this+far.+Keep+going%E2%80%94your+journey+is+unfolding+beautifully.mp3",
    ]

    // [volume] means anytime the volume is changed - 
    useEffect(() => {
        // stores current volume value in browsers local storage under audioVolume
        localStorage.setItem("audioVolume", volume)
        // check to see if one is set before it tries to update
        if (audioRef.current) {
            audioRef.current.volume = volume / 100
        }
    }, [volume])

    //function to pick random audio file from our list
    const getRandomAudio = () => {
        //  Math.floor() rounds number to nearest integer - ensures whole number
        //  Math.random() returns a random decimal between 0 and 1 (calling Math.random() * audioList.length = scales the number between 0 and length of list)
        const randomIndex = Math.floor(Math.random() * audioList.length)
        // returns the slected element from the list
        return audioList[randomIndex]
    }

    const playAudio = () => {
        // calls our randomizer to pick a file from the list - the URL is stored in the randomAudop var
        const randomAudio = getRandomAudio()
        // audioRef.current refers to the HTMLAudioElement we created by using useRef(new Audio())
        // by setting the src to randomAudio it tells the browser which audio file to display
        audioRef.current.src = randomAudio
        // load the file
        audioRef.current.load()
        // play the file
        audioRef.current.play()
        setIsPlaying(true)
    }

    const stopAudio = () => {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
        setIsPlaying(false)
    }
    return ( 
        // provider is special component provided by react allows us to pass down data
        <AudioContext.Provider
            value ={{
                isPlaying,
                volume,
                setVolume,
                playAudio,
                stopAudio,
                audioRef,
            }}
        >
            {/* this prop lets any react elements nested inside to have access to the context data */}
            {children}
        </AudioContext.Provider>
    )
}