import React from 'react'
import { useAuth } from '../hook/useAuth'
import { useEffect } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router'

const EmailVerification = () => {

    const [data,setData] = useState(null)
    const [error, setError] = useState(null)

    const navigate = useNavigate()


    const { handleEmailVerify } = useAuth()

    useEffect(()=>{
        const verify = async () =>{

            const token = new URLSearchParams(window.location.search).get("token")

            try{
                const response = await handleEmailVerify(token)
                console.log("api response", response)
                setData(response)
            } catch(err){
                setError(err.response?.data?.message || "Verification failed")
            }
        }

        verify()
    },[])

  return (
    <section className='min-h-screen bg-zinc-950 px-4 py-10 text-zinc-100 sm:px-6 lg:px-8'>
        <div className='mx-auto flex min-h-[85vh] w-full max-w-5xl items-center justify-center'>
            {!data && !error && <h1>Verifying...</h1>}


            {data && <h1>{data.message}</h1>}

            
            {/* {error && <h1 className="text-red-500">{error}</h1>} */}
            <button onClick={() => navigate("/login")}>
                Go to Login
            </button>
        </div>
    </section>
  )
}

export default EmailVerification