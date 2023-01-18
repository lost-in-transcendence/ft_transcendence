import {useEffect, useRef } from 'react';

//custom hook outside the component to detect unmount
export default function useIsMounted()
{
    const isMounted = useRef(false)
    useEffect(() => 
    {
        isMounted.current = true
        return () => 
        {
            isMounted.current = false
        }
    }, [])
    return () => isMounted.current
}