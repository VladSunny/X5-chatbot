import { useEffect, useState } from 'react'
import { useLocation, Link } from 'react-router-dom';

function Header() {

  return (
    <>
      <div className="z-10 top-0 w-full sticky">
        <div className='navbar bg-base-200 flex flex-row justify-around items-center w-full py-5 select-none'>
            <div className='flex flex-row justify-center items-center rounded-2xl p-5 space-x-2 md:space-x-5'>
              <Link to="/">
                <img src="/CapyPay.png" className="h-12 md:h-30" />
              </Link>
              <i className=' text-xs md:text-4xl'>Копи-плати</i>
            </div>
        </div>

      </div>
    </>
  )
}

export default Header
